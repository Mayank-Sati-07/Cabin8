import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, X, Receipt } from 'lucide-react';
import LineItemEditor from '../../components/LineItemEditor';
import StatusBadge from '../../components/StatusBadge';
import { salesApi, contactsApi, productsApi } from '../../api';

export default function SalesOrderForm() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ customer_id: '', order_date: new Date().toISOString().split('T')[0], expiration_date: '', reference: `SO-${Date.now().toString().slice(-4)}`, status: 'DRAFT', lines: [] });

  useEffect(() => {
    Promise.all([contactsApi.getAll(), productsApi.getAll()]).then(([c, p]) => { setContacts(c); setProducts(p.map(pr => ({ ...pr, cost_price: pr.sales_price }))); });
    if (!isNew) salesApi.getOrder(id).then(o => o && setForm(o));
  }, [id, isNew]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isNew) await salesApi.createOrder(form);
    else await salesApi.updateOrder(id, form);
    navigate('/sales/orders');
  };

  const handleAction = async (action) => {
    if (action === 'confirm') await salesApi.updateOrder(id, { status: 'CONFIRMED' });
    if (action === 'cancel') await salesApi.updateOrder(id, { status: 'CANCELLED' });
    if (action === 'invoice') {
      await salesApi.createInvoice({ customer_id: form.customer_id, so_id: id, invoice_date: new Date().toISOString().split('T')[0], due_date: '', journal_id: 'j1', lines: form.lines.map(l => ({ ...l, account_id: 'a9' })) });
      await salesApi.updateOrder(id, { status: 'INVOICED' });
    }
    navigate('/sales/orders');
  };

  const customers = contacts.filter(c => c.type === 'CUSTOMER' || c.type === 'BOTH');

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/sales/orders')}><ArrowLeft size={20} /></button>
          <h1>{isNew ? 'New Sales Order' : form.reference}</h1>
          {!isNew && <StatusBadge status={form.status} />}
        </div>
        {!isNew && form.status === 'DRAFT' && (
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={() => handleAction('confirm')}><Check size={16} /> Confirm</button>
            <button className="btn btn-destructive" onClick={() => handleAction('cancel')}><X size={16} /> Cancel</button>
          </div>
        )}
        {!isNew && form.status === 'CONFIRMED' && (
          <div className="page-header-actions">
            <button className="btn btn-accent" onClick={() => handleAction('invoice')}><Receipt size={16} /> Create Invoice</button>
          </div>
        )}
      </div>

      <div className="card"><div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Customer <span className="required">*</span></label>
              <select className="form-select" value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))} required>
                <option value="">Select customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Order Date</label><input type="date" className="form-input" value={form.order_date} onChange={e => setForm(f => ({ ...f, order_date: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Expiration Date</label><input type="date" className="form-input" value={form.expiration_date} onChange={e => setForm(f => ({ ...f, expiration_date: e.target.value }))} /></div>
          </div>
          <h3 style={{ margin: 'var(--space-5) 0 var(--space-3)' }}>Order Lines</h3>
          <LineItemEditor lines={form.lines} onChange={(lines) => setForm(f => ({ ...f, lines }))} products={products} readOnly={form.status !== 'DRAFT' && !isNew} />
          {(isNew || form.status === 'DRAFT') && (
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/sales/orders')}>Cancel</button>
              <button type="submit" className="btn btn-primary">{isNew ? 'Create SO' : 'Save'}</button>
            </div>
          )}
        </form>
      </div></div>
    </>
  );
}
