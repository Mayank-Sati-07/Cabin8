import { usePermission } from '../hooks/usePermission';

export default function ProtectedRoute({ children, roles }) {
  const { canAccess } = usePermission();
  // Open demo — always render. Role check is informational only.
  if (roles && !canAccess(roles)) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h3>Access Restricted</h3>
          <p>You do not have permission to view this page. Switch to an authorized role to access it.</p>
        </div>
      </div>
    );
  }
  return children;
}
