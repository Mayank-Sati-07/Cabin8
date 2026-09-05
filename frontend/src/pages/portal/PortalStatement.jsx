import { Printer } from 'lucide-react';

export default function PortalStatement() {
  return (
    <>
      <div className="page-header">
        <h1>Statement of Account</h1>
        <button className="btn btn-secondary" onClick={() => window.print()}><Printer size={16} /> Print</button>
      </div>
      <div className="report-container">
        <div className="report-header"><h1>Urban Furniture</h1><div className="report-subtitle">Statement of Account</div></div>
        <div className="report-section">
          <table className="report-table">
            <thead><tr><td style={{ fontWeight: 700 }}>Date</td><td style={{ fontWeight: 700 }}>Description</td><td style={{ fontWeight: 700 }} className="amount">Debit</td><td style={{ fontWeight: 700 }} className="amount">Credit</td><td style={{ fontWeight: 700 }} className="amount">Balance</td></tr></thead>
            <tbody>
              <tr><td>2026-01-20</td><td>Invoice #INV/2026/0001</td><td className="amount">₹708.00</td><td className="amount">—</td><td className="amount">₹708.00</td></tr>
              <tr><td>2026-01-28</td><td>Payment Received - Cash</td><td className="amount">—</td><td className="amount">₹708.00</td><td className="amount">₹0.00</td></tr>
              <tr className="grand-total"><td colSpan={4}>Closing Balance</td><td className="amount">₹0.00</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
