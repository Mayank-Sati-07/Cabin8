import { useState, useEffect } from 'react';
import { Printer } from 'lucide-react';
import { portalApi } from '../../api';
import { formatCurrency } from '../../utils/currency';

export default function PortalStatement() {
  const [statement, setStatement] = useState(null);

  useEffect(() => { portalApi.getStatement().then(setStatement); }, []);

  if (!statement) return <p>Loading...</p>;

  const rows = [
    ...statement.invoices.map(i => ({ date: i.invoiceDate, description: `Invoice ${i.invoiceNumber}`, debit: i.totalAmount, credit: 0 })),
    ...statement.payments.map(p => ({ date: p.date, description: `Payment Received - ${p.method}`, debit: 0, credit: p.amount })),
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  const withBalance = rows.reduce((acc, r) => {
    const balance = (acc.length ? acc[acc.length - 1].balance : 0) + r.debit - r.credit;
    acc.push({ ...r, balance });
    return acc;
  }, []);

  return (
    <>
      <div className="page-header">
        <h1>Statement of Account</h1>
        <button className="btn btn-secondary" onClick={() => window.print()}><Printer size={16} /> Print</button>
      </div>
      <div className="report-container">
        <div className="report-header"><h1>Cabin8</h1><div className="report-subtitle">Statement of Account</div></div>
        <div className="report-section">
          <table className="report-table">
            <thead><tr><td style={{ fontWeight: 700 }}>Date</td><td style={{ fontWeight: 700 }}>Description</td><td style={{ fontWeight: 700 }} className="amount">Debit</td><td style={{ fontWeight: 700 }} className="amount">Credit</td><td style={{ fontWeight: 700 }} className="amount">Balance</td></tr></thead>
            <tbody>
              {withBalance.map((row, idx) => (
                <tr key={idx}>
                  <td>{new Date(row.date).toLocaleDateString()}</td>
                  <td>{row.description}</td>
                  <td className="amount">{row.debit ? formatCurrency(row.debit) : '—'}</td>
                  <td className="amount">{row.credit ? formatCurrency(row.credit) : '—'}</td>
                  <td className="amount">{formatCurrency(row.balance)}</td>
                </tr>
              ))}
              <tr className="grand-total"><td colSpan={4}>Closing Balance</td><td className="amount">{formatCurrency(statement.summary.totalOutstanding)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
