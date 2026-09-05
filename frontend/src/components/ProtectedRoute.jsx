import { Navigate } from 'react-router-dom';
import { usePermission } from '../hooks/usePermission';

export default function ProtectedRoute({ children, roles }) {
  const { canAccess, isPortalUser } = usePermission();
  if (roles && !canAccess(roles)) {
    return <Navigate to={isPortalUser ? '/portal' : '/'} replace />;
  }
  return children;
}
