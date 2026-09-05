export function formatCurrency(amount, currency = '₹') {
  if (amount == null || isNaN(amount)) return `${currency}0.00`;
  const num = Number(amount);
  return `${currency}${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function parseCurrency(value) {
  if (!value) return 0;
  const cleaned = String(value).replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}

export function roundTo(num, decimals = 2) {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}
