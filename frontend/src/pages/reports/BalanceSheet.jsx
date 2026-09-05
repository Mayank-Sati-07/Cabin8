import { useState, useEffect } from 'react';
import { Printer, CheckCircle, XCircle } from 'lucide-react';
import { reportsApi } from '../../api';
import { formatCurrency } from '../../utils/currency';

export default function BalanceSheet() {
  const [data, setData] = useState(null);
  const [asOf, setAsOf] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => { reportsApi.getBalanceSheet({ asOfDate: asOf }).then(setData); }, [asOf]);

  if (!data) return <p>Loading...</p>;

  const totalLiabilitiesAndCapital = data.liabilities.total + data.capital.total;

  return (
    <>
      <div className="page-header">
        <h1>Balance Sheet</h1>
        <div className="page-header-actions">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ marginBottom: 2 }}>As of Date</label>
            <input type="date" className="form-input" value={asOf} onChange={e => setAsOf(e.target.value)} style={{ width: 160 }} />
          </div>
          <button className="btn btn-secondary" onClick={() => window.print()}><Printer size={16} /> Print / PDF</button>
        </div>
      </div>

      <div className={`balance-check ${data.balanced ? 'balanced' : 'unbalanced'}`}>
        {data.balanced ? <CheckCircle size={20} /> : <XCircle size={20} />}
        {data.balanced ? 'Assets = Liabilities + Capital — Balance Sheet is balanced' : 'Warning: Balance Sheet is NOT balanced'}
      </div>

      <div className="report-container">
        <div className="report-header">
          <h1>Cabin8</h1>
          <div className="report-subtitle">Balance Sheet — As of {asOf}</div>
        </div>

        <div className="report-section">
          <h2>Assets</h2>
          <table className="report-table">
            <tbody>
              {data.assets.accounts.map(acct => (
                <tr key={acct.id}><td className="indent-1">{acct.name}</td><td className="amount">{formatCurrency(acct.balance)}</td></tr>
              ))}
              <tr className="subtotal"><td>Total Assets</td><td className="amount">{formatCurrency(data.assets.total)}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="report-section">
          <h2>Liabilities</h2>
          <table className="report-table">
            <tbody>
              {data.liabilities.accounts.map(acct => (
                <tr key={acct.id}><td className="indent-1">{acct.name}</td><td className="amount">{formatCurrency(acct.balance)}</td></tr>
              ))}
              <tr className="subtotal"><td>Total Liabilities</td><td className="amount">{formatCurrency(data.liabilities.total)}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="report-section">
          <h2>Capital</h2>
          <table className="report-table">
            <tbody>
              {data.capital.accounts.map(acct => (
                <tr key={acct.id}><td className="indent-1">{acct.name}</td><td className="amount">{formatCurrency(acct.balance)}</td></tr>
              ))}
              <tr className="subtotal"><td>Total Capital</td><td className="amount">{formatCurrency(data.capital.total)}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="report-section">
          <table className="report-table">
            <tbody>
              <tr className="grand-total"><td>Total Liabilities + Capital</td><td className="amount">{formatCurrency(totalLiabilitiesAndCapital)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
