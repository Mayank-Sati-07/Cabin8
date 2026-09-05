import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, List, LayoutGrid } from 'lucide-react';
import DataTable from '../../components/DataTable';
import KanbanBoard from '../../components/KanbanBoard';
import StatusBadge from '../../components/StatusBadge';
import { contactsApi } from '../../api';

export default function ContactList() {
  const [contacts, setContacts] = useState([]);
  const [view, setView] = useState('list');
  const [typeFilter, setTypeFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => { contactsApi.getAll().then(setContacts); }, []);

  const filtered = typeFilter ? contacts.filter(c => c.type === typeFilter || c.type === 'BOTH') : contacts;

  const columns = [
    { key: 'name', label: 'Name', accessor: 'name', render: (row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div className="kanban-card-avatar" style={{ width: 32, height: 32, fontSize: 'var(--text-sm)' }}>{row.name.charAt(0)}</div>
        <strong>{row.name}</strong>
      </div>
    )},
    { key: 'type', label: 'Type', accessor: 'type', render: (row) => <span className={`type-badge ${row.type.toLowerCase()}`}>{row.type}</span> },
    { key: 'email', label: 'Email', accessor: 'email' },
    { key: 'mobile', label: 'Phone', accessor: 'mobile' },
    { key: 'city', label: 'City', accessor: 'city' },
    { key: 'actions', label: '', sortable: false, width: '80px', render: (row) => (
      <button className="btn btn-sm btn-ghost" onClick={(e) => { e.stopPropagation(); navigate(`/contacts/${row.id}`); }}>Edit</button>
    )},
  ];

  const renderCard = (contact) => (
    <div className="kanban-card" onClick={() => navigate(`/contacts/${contact.id}`)}>
      <div className="kanban-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div className="kanban-card-avatar">{contact.name.charAt(0)}</div>
          <div>
            <div className="kanban-card-title">{contact.name}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted-foreground)' }}>{contact.email}</div>
          </div>
        </div>
        <span className={`type-badge ${contact.type.toLowerCase()}`}>{contact.type}</span>
      </div>
      <div className="kanban-card-body">
        <div className="card-row"><span>Phone</span><span>{contact.mobile}</span></div>
        <div className="card-row"><span>City</span><span>{contact.city}</span></div>
      </div>
    </div>
  );

  const filterBtns = (
    <>
      {['', 'CUSTOMER', 'VENDOR', 'BOTH'].map(t => (
        <button key={t} className={`filter-chip ${typeFilter === t ? 'active' : ''}`} onClick={() => setTypeFilter(t)}>
          {t || 'All'}
        </button>
      ))}
    </>
  );

  return (
    <>
      <div className="page-header">
        <div><h1>Contacts</h1><p className="page-subtitle">Manage customers, vendors, and partners</p></div>
        <div className="page-header-actions">
          <div className="view-toggle">
            <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><List size={16} /> List</button>
            <button className={view === 'kanban' ? 'active' : ''} onClick={() => setView('kanban')}><LayoutGrid size={16} /> Kanban</button>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/contacts/new')}><Plus size={16} /> New Contact</button>
        </div>
      </div>
      {view === 'list' ? (
        <DataTable columns={columns} data={filtered} onRowClick={(row) => navigate(`/contacts/${row.id}`)} searchPlaceholder="Search contacts..." actions={filterBtns} />
      ) : (
        <>
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>{filterBtns}</div>
          <KanbanBoard items={filtered} renderCard={renderCard} />
        </>
      )}
    </>
  );
}
