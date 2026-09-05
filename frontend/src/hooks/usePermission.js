import { useAuth } from './useAuth';
import { ROLES } from '../constants/roles';

export function usePermission() {
  const { user } = useAuth();

  const isAdmin = user?.role === ROLES.ADMIN;
  const isAccountant = user?.role === ROLES.INVOICING_USER;
  const isContact = user?.role === ROLES.CONTACT;
  const isInternal = isAdmin || isAccountant;

  const canAccess = (requiredRoles) => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return requiredRoles.includes(user?.role);
  };

  return { isAdmin, isAccountant, isContact, isInternal, canAccess, role: user?.role };
}
