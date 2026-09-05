import { useAuth } from './useAuth';
import { ROLES } from '../constants/roles';

export function usePermission() {
  const { user } = useAuth();

  const isAdmin = user?.role === ROLES.ADMIN;
  const isAccountant = user?.role === ROLES.ACCOUNTANT;
  const isPortalUser = user?.role === ROLES.USER;
  const isInternal = isAdmin || isAccountant;

  const canAccess = (requiredRoles) => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return requiredRoles.includes(user?.role);
  };

  return { isAdmin, isAccountant, isPortalUser, isInternal, canAccess, role: user?.role };
}
