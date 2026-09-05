import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, List, LayoutGrid } from 'lucide-react';
import DataTable from '../../components/DataTable';
import KanbanBoard from '../../components/KanbanBoard';
import StatusBadge from '../../components/StatusBadge';
import { budgetApi } from '../../api';
import { formatCurrency } from '../../utils/currency';

export default function BudgetList() {
  const [budgets, setBudgets] = useState([]);
  const [view, setView] = useState('list');
  const navigate = useNavigate();
  useEffect(() => { budgetApi.getBudgets().then(setBudgets); }, []);

  const columns = [
    { key: 'name', label: 'Budget', accessor: 'name', render: (r) => <strong>{r.name}</strong> },
    { key: 'period', label: 'Period', accessor: 'period' },
    { key: 'dates', label: 'Date Range', render: (r) => `${r.start_date} → ${r.end_date}` },
    { key: 'planned', label: 'Total Planned', className: 'cell-amount', render: (r) => formatCurrency(r.lines?.reduce((s, l) => s + l.planned_amount, 0) || 0) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'actions', label: '', sortable: false, width: '80px', render: (r) => <button className="btn btn-sm btn-ghost" onClick={e => { e.stopPropagation(); navigate(`/budgets/${r.id}`); }}>View</button> },
  ];

  const renderCard = (budget) => (
    <div className="kanban-card" onClick={() => navigate(`/budgets/${budget.id}`)}>
      <div className="kanban-card-header"><div className="kanban-card-title">{budget.name}</div><StatusBadge status={budget.status} /></div>
      <div className="kanban-card-body">
        <div className="card-row"><span>Period</span><span>{budget.period}</span></div>
        <div className="card-row"><span>Range</span><span>{budget.start_date} → {budget.end_date}</span></div>
        <div className="card-row"><span>Total Planned</span><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatCurrency(budget.lines?.reduce((s, l) => s + l.planned_amount, 0) || 0)}</span></div>
      </div>
    </div>
  );

  return (
    <>
      <div className="page-header">
        <h1>Budgets</h1>
        <div className="page-header-actions">
          <div className="view-toggle">
            <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><List size={16} /> List</button>
            <button className={view === 'kanban' ? 'active' : ''} onClick={() => setView('kanban')}><LayoutGrid size={16} /> Kanban</button>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/budgets/new')}><Plus size={16} /> New Budget</button>
        </div>
      </div>
      {view === 'list' ? <DataTable columns={columns} data={budgets} onRowClick={(r) => navigate(`/budgets/${r.id}`)} /> : <KanbanBoard items={budgets} renderCard={renderCard} />}
    </>
  );
}
