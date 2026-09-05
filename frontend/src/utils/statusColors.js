export const STATUS_COLORS = {
  DRAFT:     { bg: 'var(--status-draft-bg)',     color: 'var(--status-draft)',     className: 'draft' },
  CONFIRMED: { bg: 'var(--status-confirmed-bg)', color: 'var(--status-confirmed)', className: 'confirmed' },
  POSTED:    { bg: 'var(--status-posted-bg)',    color: 'var(--status-posted)',    className: 'posted' },
  PAID:      { bg: 'var(--status-paid-bg)',      color: 'var(--status-paid)',      className: 'paid' },
  CANCELLED: { bg: 'var(--status-cancelled-bg)', color: 'var(--status-cancelled)', className: 'cancelled' },
  REVISED:   { bg: 'var(--status-revised-bg)',   color: 'var(--status-revised)',   className: 'revised' },
};

export function getStatusClassName(status) {
  return STATUS_COLORS[status]?.className || 'draft';
}
