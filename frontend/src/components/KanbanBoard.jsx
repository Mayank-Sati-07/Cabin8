export default function KanbanBoard({ items = [], renderCard, emptyMessage = 'No items to display' }) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <h3>{emptyMessage}</h3>
      </div>
    );
  }
  return (
    <div className="kanban-grid">
      {items.map((item, idx) => (
        <div key={item.id || idx}>
          {renderCard(item)}
        </div>
      ))}
    </div>
  );
}
