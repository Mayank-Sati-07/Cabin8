import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, X, FileText } from 'lucide-react';
import LineItemEditor from '../../components/LineItemEditor';
import StatusBadge from '../../components/StatusBadge';
import { purchaseApi, contactsApi, productsApi } from '../../api';

export default function PurchaseOrderForm() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ vendor_id: '', order_date: new Date().toISOString().split('T')[0], expected_date: '', reference: `PO-${Date.now().toString().slice(-4)}`, status: 'DRAFT', lines: [] });

  useEffect(() => {
    Promise.all([
      contactsApi.getAll({ type: 'VENDOR' }),
      productsApi.getAll(),
    ]).then(([c, p]) => { setContacts(c); setProducts(p); });
    if (!isNew) purchaseApi.getOrder(id).then(o => o && setForm(o));
  }, [id, isNew]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isNew) await purchaseApi.createOrder(form);
    else await purchaseApi.updateOrder(id, form);
    navigate('/purchase/orders');
  };

  const handleAction = async (action) => {
    if (action === 'confirm') await purchaseApi.updateOrder(id, { status: 'CONFIRMED' });
    if (action === 'cancel') await purchaseApi.updateOrder(id, { status: 'CANCELLED' });
    if (action === 'bill') {
      await purchaseApi.createBill({ vendor_id: form.vendor_id, po_id: id, bill_date: new Date().toISOString().split('T')[0], due_date: '', vendor_ref: '', lines: form.lines.map(l => ({ ...l, account_id: 'a11' })) });
      await purchaseApi.updateOrder(id, { status: 'BILLED' });
    }
    navigate('/purchase/orders');
  };

  const vendors = contacts.filter(c => c.type === 'VENDOR' || c.type === 'BOTH');

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/purchase/orders')}><ArrowLeft size={20} /></button>
          <h1>{isNew ? 'New Purchase Order' : form.reference}</h1>
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
            <button className="btn btn-accent" onClick={() => handleAction('bill')}><FileText size={16} /> Create Bill</button>
          </div>
        )}
      </div>

      <div className="card"><div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Vendor <span className="required">*</span></label>
              <select className="form-select" value={form.vendor_id} onChange={e => setForm(f => ({ ...f, vendor_id: e.target.value }))} required>
                <option value="">Select vendor</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Order Date</label><input type="date" className="form-input" value={form.order_date} onChange={e => setForm(f => ({ ...f, order_date: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Expected Delivery</label><input type="date" className="form-input" value={form.expected_date} onChange={e => setForm(f => ({ ...f, expected_date: e.target.value }))} /></div>
          </div>

          <h3 style={{ margin: 'var(--space-5) 0 var(--space-3)' }}>Order Lines</h3>
          <LineItemEditor lines={form.lines} onChange={(lines) => setForm(f => ({ ...f, lines }))} products={products.map(p => ({ ...p, cost_price: p.cost_price }))} readOnly={form.status !== 'DRAFT' && !isNew} />

          {(isNew || form.status === 'DRAFT') && (
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/purchase/orders')}>Cancel</button>
              <button type="submit" className="btn btn-primary">{isNew ? 'Create PO' : 'Save'}</button>
            </div>
          )}
        </form>
      </div></div>
    </>
  );
}
