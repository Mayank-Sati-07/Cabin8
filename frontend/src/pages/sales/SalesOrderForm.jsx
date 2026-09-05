import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Receipt } from 'lucide-react';
import LineItemEditor from '../../components/LineItemEditor';
import StatusBadge from '../../components/StatusBadge';
import { salesApi, contactsApi, productsApi, analyticAccountsApi } from '../../api';

const today = () => new Date().toISOString().split('T')[0];

export default function SalesOrderForm() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [products, setProducts] = useState([]);
  const [analyticAccounts, setAnalyticAccounts] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ customerId: '', date: today(), status: 'DRAFT', lines: [] });

  useEffect(() => {
    Promise.all([contactsApi.getAll(), productsApi.getAll(), analyticAccountsApi.getAll()])
      .then(([c, p, a]) => { setContacts(c); setProducts(p); setAnalyticAccounts(a); });
    if (!isNew) salesApi.getOrder(id).then(o => o && setForm({ ...o, date: o.date.split('T')[0] }));
  }, [id, isNew]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      customerId: parseInt(form.customerId),
      date: form.date,
      lines: form.lines.map(l => ({
        productId: parseInt(l.productId),
        analyticAccountId: l.analyticAccountId ? parseInt(l.analyticAccountId) : null,
        qty: parseFloat(l.qty),
        unitPrice: parseFloat(l.unitPrice),
      })),
    };
    try {
      if (isNew) {
        const created = await salesApi.createOrder(payload);
        navigate(`/sales/orders/${created.id}`);
      } else {
        await salesApi.updateOrder(id, payload);
        navigate('/sales/orders');
      }
    } catch (err) {
      setError(err.message || 'Could not save sales order');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = async () => {
    try {
      await salesApi.confirmOrder(id);
      navigate('/sales/orders');
    } catch (err) {
      setError(err.message || 'Could not confirm order');
    }
  };

  const handleCreateInvoice = async () => {
    const invoiceRef = window.prompt('Invoice reference (optional)') || '';
    try {
      const invoice = await salesApi.createInvoice(id, { invoiceRef: invoiceRef || null });
      navigate(`/sales/invoices/${invoice.id}`);
    } catch (err) {
      setError(err.message || 'Could not create invoice');
    }
  };

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/sales/orders')}><ArrowLeft size={20} /></button>
          <h1>{isNew ? 'New Sales Order' : form.soNumber}</h1>
          {!isNew && <StatusBadge status={form.status} />}
        </div>
        {!isNew && form.status === 'DRAFT' && (
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={handleConfirm}><Check size={16} /> Confirm</button>
          </div>
        )}
        {!isNew && form.status === 'CONFIRMED' && !form.customerInvoices?.length && (
          <div className="page-header-actions">
            <button className="btn btn-accent" onClick={handleCreateInvoice}><Receipt size={16} /> Create Invoice</button>
          </div>
        )}
      </div>

      <div className="card"><div className="card-body">
        {error && <div className="form-error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Customer <span className="required">*</span></label>
              <select className="form-select" value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))} required disabled={!isNew && form.status !== 'DRAFT'}>
                <option value="">Select customer</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Order Date</label><input type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} disabled={!isNew && form.status !== 'DRAFT'} /></div>
          </div>
          <h3 style={{ margin: 'var(--space-5) 0 var(--space-3)' }}>Order Lines</h3>
          <LineItemEditor
            lines={form.lines}
            onChange={(lines) => setForm(f => ({ ...f, lines }))}
            products={products}
            analyticAccounts={analyticAccounts}
            readOnly={!isNew && form.status !== 'DRAFT'}
          />
          {(isNew || form.status === 'DRAFT') && (
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/sales/orders')}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{isNew ? 'Create SO' : 'Save'}</button>
            </div>
          )}
        </form>
      </div></div>
    </>
  );
}
