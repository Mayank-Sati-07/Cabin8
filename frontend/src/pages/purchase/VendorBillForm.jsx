import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, CreditCard } from 'lucide-react';
import LineItemEditor from '../../components/LineItemEditor';
import StatusBadge from '../../components/StatusBadge';
import { purchaseApi, contactsApi, productsApi } from '../../api';

export default function VendorBillForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    Promise.all([purchaseApi.getBill(id), contactsApi.getAll(), productsApi.getAll()]).then(([b, c, p]) => { setBill(b); setContacts(c); setProducts(p); });
  }, [id]);

  if (!bill) return <div className="page-container"><p>Loading...</p></div>;

  const handlePost = async () => {
    await purchaseApi.updateBill(id, { status: 'POSTED' });
    navigate('/purchase/bills');
  };

  const handlePayment = () => navigate(`/purchase/payments/new?bill_id=${id}`);

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/purchase/bills')}><ArrowLeft size={20} /></button>
          <h1>Vendor Bill: {bill.vendor_ref || bill.id}</h1>
          <StatusBadge status={bill.status} />
        </div>
        <div className="page-header-actions">
          {bill.status === 'DRAFT' && <button className="btn btn-primary" onClick={handlePost}><Check size={16} /> Post Bill</button>}
          {bill.status === 'POSTED' && <button className="btn btn-accent" onClick={handlePayment}><CreditCard size={16} /> Register Payment</button>}
        </div>
      </div>
      <div className="card"><div className="card-body">
        <div className="form-row">
          <div className="form-group"><label className="form-label">Vendor</label><input className="form-input" value={contacts.find(c => c.id === bill.vendor_id)?.name || ''} readOnly /></div>
          <div className="form-group"><label className="form-label">Bill Date</label><input className="form-input" value={bill.bill_date} readOnly /></div>
          <div className="form-group"><label className="form-label">Due Date</label><input className="form-input" value={bill.due_date || '—'} readOnly /></div>
        </div>
        <h3 style={{ margin: 'var(--space-5) 0 var(--space-3)' }}>Bill Lines</h3>
        <LineItemEditor lines={bill.lines || []} onChange={() => {}} products={products} readOnly />
      </div></div>
    </>
  );
}
