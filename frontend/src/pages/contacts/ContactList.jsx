import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, List, LayoutGrid, Trash2 } from 'lucide-react';
import DataTable from '../../components/DataTable';
import KanbanBoard from '../../components/KanbanBoard';
import { contactsApi } from '../../api';
import { usePermission } from '../../hooks/usePermission';

export default function ContactList() {
  const [contacts, setContacts] = useState([]);
  const [view, setView] = useState('list');
  const navigate = useNavigate();
  const { isAdmin } = usePermission();

  const load = () => contactsApi.getAll().then(setContacts);
  useEffect(() => { load(); }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this contact?')) return;
    try {
      await contactsApi.remove(id);
      load();
    } catch (err) {
      alert(err.message || 'Could not delete contact');
    }
  };

  const columns = [
    { key: 'name', label: 'Name', accessor: 'name', render: (row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div className="kanban-card-avatar" style={{ width: 32, height: 32, fontSize: 'var(--text-sm)' }}>{row.name.charAt(0)}</div>
        <strong>{row.name}</strong>
      </div>
    )},
    { key: 'email', label: 'Email', accessor: 'email' },
    { key: 'phone', label: 'Phone', accessor: 'phone' },
    { key: 'city', label: 'City', accessor: 'city' },
    { key: 'country', label: 'Country', accessor: 'country' },
    { key: 'actions', label: '', sortable: false, width: '120px', render: (row) => (
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <button className="btn btn-sm btn-ghost" onClick={(e) => { e.stopPropagation(); navigate(`/contacts/${row.id}`); }}>Edit</button>
        {isAdmin && <button className="btn btn-sm btn-ghost" onClick={(e) => handleDelete(e, row.id)} aria-label="Delete"><Trash2 size={14} /></button>}
      </div>
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
      </div>
      <div className="kanban-card-body">
        <div className="card-row"><span>Phone</span><span>{contact.phone || '—'}</span></div>
        <div className="card-row"><span>City</span><span>{contact.city || '—'}</span></div>
      </div>
    </div>
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
        <DataTable columns={columns} data={contacts} onRowClick={(row) => navigate(`/contacts/${row.id}`)} searchPlaceholder="Search contacts..." />
      ) : (
        <KanbanBoard items={contacts} renderCard={renderCard} />
      )}
    </>
  );
}
