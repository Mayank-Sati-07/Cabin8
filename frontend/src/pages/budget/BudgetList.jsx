import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, List, LayoutGrid } from 'lucide-react';
import DataTable from '../../components/DataTable';
import KanbanBoard from '../../components/KanbanBoard';
import StatusBadge from '../../components/StatusBadge';
import { budgetsApi } from '../../api';
import { formatCurrency } from '../../utils/currency';

export default function BudgetList() {
  const [budgets, setBudgets] = useState([]);
  const [view, setView] = useState('list');
  const navigate = useNavigate();
  useEffect(() => { budgetsApi.getAll().then(setBudgets); }, []);

  const columns = [
    { key: 'name', label: 'Budget', accessor: 'name', render: (r) => <strong>{r.name}</strong> },
    { key: 'analytic', label: 'Analytic Account', render: (r) => r.analyticAccount?.name || '—' },
    { key: 'responsible', label: 'Responsible', render: (r) => r.responsible?.name || '—' },
    { key: 'dates', label: 'Date Range', render: (r) => `${new Date(r.startDate).toLocaleDateString()} → ${new Date(r.endDate).toLocaleDateString()}` },
    { key: 'committed', label: 'Committed', className: 'cell-amount', render: (r) => formatCurrency(r.committedAmount) },
    { key: 'achieved', label: 'Achieved %', className: 'cell-amount', render: (r) => `${r.achievedPercent ?? 0}%` },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'actions', label: '', sortable: false, width: '80px', render: (r) => <button className="btn btn-sm btn-ghost" onClick={e => { e.stopPropagation(); navigate(`/budgets/${r.id}`); }}>View</button> },
  ];

  const renderCard = (budget) => (
    <div className="kanban-card" onClick={() => navigate(`/budgets/${budget.id}`)}>
      <div className="kanban-card-header"><div className="kanban-card-title">{budget.name}</div><StatusBadge status={budget.status} /></div>
      <div className="kanban-card-body">
        <div className="card-row"><span>Analytic Account</span><span>{budget.analyticAccount?.name || '—'}</span></div>
        <div className="card-row"><span>Range</span><span>{new Date(budget.startDate).toLocaleDateString()} → {new Date(budget.endDate).toLocaleDateString()}</span></div>
        <div className="card-row"><span>Committed</span><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatCurrency(budget.committedAmount)}</span></div>
        <div className="card-row"><span>Achieved</span><span>{budget.achievedPercent ?? 0}%</span></div>
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
