import { useState, useEffect } from 'react';
import { Printer, CheckCircle, XCircle } from 'lucide-react';
import { reportsApi } from '../../api';
import { formatCurrency } from '../../utils/currency';

export default function BalanceSheet() {
  const [data, setData] = useState(null);
  const [asOf, setAsOf] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => { reportsApi.getBalanceSheet({ as_of: asOf }).then(setData); }, [asOf]);

  if (!data) return <p>Loading...</p>;

  const totalLiabilitiesAndEquity = data.totalLiabilities + data.totalEquity + data.netIncome;

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

      <div className={`balance-check ${data.isBalanced ? 'balanced' : 'unbalanced'}`}>
        {data.isBalanced ? <CheckCircle size={20} /> : <XCircle size={20} />}
        {data.isBalanced ? 'Assets = Liabilities + Equity — Balance Sheet is balanced' : 'Warning: Balance Sheet is NOT balanced'}
      </div>

      <div className="report-container">
        <div className="report-header">
          <h1>Urban Furniture</h1>
          <div className="report-subtitle">Balance Sheet — As of {asOf}</div>
        </div>

        <div className="report-section">
          <h2>Assets</h2>
          <table className="report-table">
            <tbody>
              {data.assets.map(acct => (
                <tr key={acct.id}><td className="indent-1">{acct.account_code} — {acct.account_name}</td><td className="amount">{formatCurrency(acct.balance)}</td></tr>
              ))}
              <tr className="subtotal"><td>Total Assets</td><td className="amount">{formatCurrency(data.totalAssets)}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="report-section">
          <h2>Liabilities</h2>
          <table className="report-table">
            <tbody>
              {data.liabilities.map(acct => (
                <tr key={acct.id}><td className="indent-1">{acct.account_code} — {acct.account_name}</td><td className="amount">{formatCurrency(Math.abs(acct.balance))}</td></tr>
              ))}
              <tr className="subtotal"><td>Total Liabilities</td><td className="amount">{formatCurrency(data.totalLiabilities)}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="report-section">
          <h2>Equity / Capital</h2>
          <table className="report-table">
            <tbody>
              {data.equity.map(acct => (
                <tr key={acct.id}><td className="indent-1">{acct.account_code} — {acct.account_name}</td><td className="amount">{formatCurrency(Math.abs(acct.balance))}</td></tr>
              ))}
              <tr><td className="indent-1">Current Year Net Profit</td><td className="amount">{formatCurrency(data.netIncome)}</td></tr>
              <tr className="subtotal"><td>Total Equity</td><td className="amount">{formatCurrency(data.totalEquity + data.netIncome)}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="report-section">
          <table className="report-table">
            <tbody>
              <tr className="grand-total"><td>Total Liabilities + Equity</td><td className="amount">{formatCurrency(totalLiabilitiesAndEquity)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
