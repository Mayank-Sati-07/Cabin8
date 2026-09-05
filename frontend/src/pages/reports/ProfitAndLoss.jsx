import { useState, useEffect } from 'react';
import { Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { reportsApi } from '../../api';
import { formatCurrency } from '../../utils/currency';

export default function ProfitAndLoss() {
  const [data, setData] = useState(null);
  const [year, setYear] = useState(String(new Date().getFullYear()));

  useEffect(() => { reportsApi.getProfitAndLoss({ year }).then(setData); }, [year]);

  if (!data) return <p>Loading...</p>;

  const chartData = [
    { name: 'Income', value: data.income.total },
    { name: 'Expenses', value: data.expenses.total },
    { name: 'Net Profit', value: data.netProfit },
  ];

  return (
    <>
      <div className="page-header">
        <h1>Profit & Loss Statement</h1>
        <div className="page-header-actions">
          <select className="form-select" style={{ width: 120 }} value={year} onChange={e => setYear(e.target.value)}>
            {[0, 1, 2].map(offset => {
              const y = new Date().getFullYear() - offset;
              return <option key={y} value={y}>FY {y}</option>;
            })}
          </select>
          <button className="btn btn-secondary" onClick={() => window.print()}><Printer size={16} /> Print / PDF</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
        <div className="report-container">
          <div className="report-header">
            <h1>Cabin8</h1>
            <div className="report-subtitle">Profit & Loss Statement — Fiscal Year {year}</div>
          </div>

          <div className="report-section">
            <h2>Income</h2>
            <table className="report-table">
              <tbody>
                {data.income.accounts.map((item) => (
                  <tr key={item.id}><td className="indent-1">{item.name}</td><td className="amount">{formatCurrency(item.balance)}</td></tr>
                ))}
                <tr className="subtotal"><td>Total Income</td><td className="amount">{formatCurrency(data.income.total)}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="report-section">
            <h2>Expenses</h2>
            <table className="report-table">
              <tbody>
                {data.expenses.accounts.map((item) => (
                  <tr key={item.id}><td className="indent-1">{item.name}</td><td className="amount">{formatCurrency(item.balance)}</td></tr>
                ))}
                <tr className="subtotal"><td>Total Expenses</td><td className="amount">{formatCurrency(data.expenses.total)}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="report-section">
            <table className="report-table">
              <tbody>
                <tr className="grand-total"><td>Net Profit / (Loss)</td><td className="amount" style={{ color: data.netProfit >= 0 ? 'var(--color-success)' : 'var(--color-destructive)' }}>{formatCurrency(data.netProfit)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Visual Breakdown</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#38bdf8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
