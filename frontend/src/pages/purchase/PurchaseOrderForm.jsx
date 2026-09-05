import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, FileText } from 'lucide-react';
import LineItemEditor from '../../components/LineItemEditor';
import StatusBadge from '../../components/StatusBadge';
import { purchaseApi, contactsApi, productsApi, analyticAccountsApi } from '../../api';

const today = () => new Date().toISOString().split('T')[0];

export default function PurchaseOrderForm() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [products, setProducts] = useState([]);
  const [analyticAccounts, setAnalyticAccounts] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ vendorId: '', date: today(), status: 'DRAFT', lines: [] });

  useEffect(() => {
    Promise.all([contactsApi.getAll(), productsApi.getAll(), analyticAccountsApi.getAll()])
      .then(([c, p, a]) => { setContacts(c); setProducts(p); setAnalyticAccounts(a); });
    if (!isNew) purchaseApi.getOrder(id).then(o => o && setForm({ ...o, date: o.date.split('T')[0] }));
  }, [id, isNew]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      vendorId: parseInt(form.vendorId),
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
        const created = await purchaseApi.createOrder(payload);
        navigate(`/purchase/orders/${created.id}`);
      } else {
        await purchaseApi.updateOrder(id, payload);
        navigate('/purchase/orders');
      }
    } catch (err) {
      setError(err.message || 'Could not save purchase order');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = async () => {
    try {
      await purchaseApi.confirmOrder(id);
      navigate('/purchase/orders');
    } catch (err) {
      setError(err.message || 'Could not confirm order');
    }
  };

  const handleCreateBill = async () => {
    const vendorBillNo = window.prompt('Vendor bill reference number (optional)') || '';
    try {
      const bill = await purchaseApi.createBill(id, { vendorBillNo: vendorBillNo || null });
      navigate(`/purchase/bills/${bill.id}`);
    } catch (err) {
      setError(err.message || 'Could not create bill');
    }
  };

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/purchase/orders')}><ArrowLeft size={20} /></button>
          <h1>{isNew ? 'New Purchase Order' : form.poNumber}</h1>
          {!isNew && <StatusBadge status={form.status} />}
        </div>
        {!isNew && form.status === 'DRAFT' && (
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={handleConfirm}><Check size={16} /> Confirm</button>
          </div>
        )}
        {!isNew && form.status === 'CONFIRMED' && !form.vendorBills?.length && (
          <div className="page-header-actions">
            <button className="btn btn-accent" onClick={handleCreateBill}><FileText size={16} /> Create Bill</button>
          </div>
        )}
      </div>

      <div className="card"><div className="card-body">
        {error && <div className="form-error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Vendor <span className="required">*</span></label>
              <select className="form-select" value={form.vendorId} onChange={e => setForm(f => ({ ...f, vendorId: e.target.value }))} required disabled={!isNew && form.status !== 'DRAFT'}>
                <option value="">Select vendor</option>
                {contacts.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
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
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/purchase/orders')}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{isNew ? 'Create PO' : 'Save'}</button>
            </div>
          )}
        </form>
      </div></div>
    </>
  );
}
