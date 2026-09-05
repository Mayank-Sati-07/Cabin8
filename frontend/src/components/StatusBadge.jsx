import { getStatusClassName } from '../utils/statusColors';

export default function StatusBadge({ status }) {
  if (!status) return null;
  const className = getStatusClassName(status);
  const label = status.replace(/_/g, ' ');
  return (
    <span className={`status-badge ${className}`}>
      <span className="badge-dot" aria-hidden="true" />
      {label}
    </span>
  );
}
