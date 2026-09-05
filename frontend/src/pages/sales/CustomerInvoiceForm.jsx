import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, CreditCard } from 'lucide-react';
import LineItemEditor from '../../components/LineItemEditor';
import StatusBadge from '../../components/StatusBadge';
import { salesApi, contactsApi, productsApi } from '../../api';

export default function CustomerInvoiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => { Promise.all([salesApi.getInvoice(id), contactsApi.getAll(), productsApi.getAll()]).then(([i, c, p]) => { setInvoice(i); setContacts(c); setProducts(p); }); }, [id]);

  if (!invoice) return <div className="page-container"><p>Loading...</p></div>;

  const handlePost = async () => { await salesApi.updateInvoice(id, { status: 'POSTED' }); navigate('/sales/invoices'); };
  const handlePayment = () => navigate(`/sales/payments/new?invoice_id=${id}`);

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/sales/invoices')}><ArrowLeft size={20} /></button>
          <h1>Invoice: {invoice.id}</h1><StatusBadge status={invoice.status} />
        </div>
        <div className="page-header-actions">
          {invoice.status === 'DRAFT' && <button className="btn btn-primary" onClick={handlePost}><Check size={16} /> Post Invoice</button>}
          {invoice.status === 'POSTED' && <button className="btn btn-accent" onClick={handlePayment}><CreditCard size={16} /> Register Payment</button>}
        </div>
      </div>
      <div className="card"><div className="card-body">
        <div className="form-row">
          <div className="form-group"><label className="form-label">Customer</label><input className="form-input" value={contacts.find(c => c.id === invoice.customer_id)?.name || ''} readOnly /></div>
          <div className="form-group"><label className="form-label">Invoice Date</label><input className="form-input" value={invoice.invoice_date} readOnly /></div>
          <div className="form-group"><label className="form-label">Due Date</label><input className="form-input" value={invoice.due_date || '—'} readOnly /></div>
        </div>
        <h3 style={{ margin: 'var(--space-5) 0 var(--space-3)' }}>Invoice Lines</h3>
        <LineItemEditor lines={invoice.lines || []} onChange={() => {}} products={products} readOnly />
      </div></div>
    </>
  );
}
