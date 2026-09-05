export const ROLES = {
  ADMIN: 'ADMIN',
  ACCOUNTANT: 'ACCOUNTANT',
  USER: 'USER',
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.ACCOUNTANT]: 'Accountant',
  [ROLES.USER]: 'Contact (Portal)',
};

export const INTERNAL_ROLES = [ROLES.ADMIN, ROLES.ACCOUNTANT];
