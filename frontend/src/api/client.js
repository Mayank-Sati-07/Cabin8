const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'uf_token';
const USER_KEY = 'uf_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setSession(token, user) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function buildQuery(params) {
  if (!params) return '';
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (entries.length === 0) return '';
  return `?${new URLSearchParams(entries).toString()}`;
}

async function request(path, { method = 'GET', body, params } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}${buildQuery(params)}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  let data = null;
  try { data = await res.json(); } catch { /* no body */ }

  if (!res.ok) {
    if (res.status === 401) {
      clearSession();
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    throw new Error(data?.error || `Request failed (${res.status})`);
  }

  return data;
}

async function postFile(path, file) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${API_URL}${path}`, { method: 'POST', headers, body: form });

  let data = null;
  try { data = await res.json(); } catch { /* no body */ }

  if (!res.ok) {
    if (res.status === 401) {
      clearSession();
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    throw new Error(data?.error || `Request failed (${res.status})`);
  }

  return data;
}

export const api = {
  get: (path, params) => request(path, { method: 'GET', params }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
  postFile,
};
