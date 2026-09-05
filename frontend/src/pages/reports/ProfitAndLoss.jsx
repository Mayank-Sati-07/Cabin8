import { useState, useEffect } from 'react';
import { Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { reportsApi } from '../../api';
import { formatCurrency } from '../../utils/currency';

export default function ProfitAndLoss() {
  const [data, setData] = useState(null);
  const [year, setYear] = useState('2026');

  useEffect(() => { reportsApi.getProfitAndLoss({ year }).then(setData); }, [year]);

  if (!data) return <p>Loading...</p>;

  const grossProfit = data.totalIncome - data.totalExpenses * 0.7;
  const operatingExpenses = data.totalExpenses * 0.3;
  const netProfit = data.totalIncome - data.totalExpenses;

  const chartData = [
    { name: 'Income', value: data.totalIncome },
    { name: 'COGS', value: data.totalExpenses * 0.7 },
    { name: 'Operating', value: operatingExpenses },
    { name: 'Net Profit', value: netProfit },
  ];

  return (
    <>
      <div className="page-header">
        <h1>Profit & Loss Statement</h1>
        <div className="page-header-actions">
          <select className="form-select" style={{ width: 120 }} value={year} onChange={e => setYear(e.target.value)}>
            <option value="2026">FY 2026</option><option value="2025">FY 2025</option>
          </select>
          <button className="btn btn-secondary" onClick={() => window.print()}><Printer size={16} /> Print / PDF</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
        <div className="report-container">
          <div className="report-header">
            <h1>Urban Furniture</h1>
            <div className="report-subtitle">Profit & Loss Statement — Fiscal Year {year}</div>
          </div>

          <div className="report-section">
            <h2>Operating Income</h2>
            <table className="report-table">
              <tbody>
                {data.income.map((item, i) => (
                  <tr key={i}><td className="indent-1">{item.name}</td><td className="amount">{formatCurrency(item.amount)}</td></tr>
                ))}
                <tr className="subtotal"><td>Total Income</td><td className="amount">{formatCurrency(data.totalIncome)}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="report-section">
            <h2>Cost of Goods Sold</h2>
            <table className="report-table">
              <tbody>
                {data.expenses.map((item, i) => (
                  <tr key={i}><td className="indent-1">{item.name}</td><td className="amount">{formatCurrency(item.amount * 0.7)}</td></tr>
                ))}
                <tr className="subtotal"><td>Gross Profit</td><td className="amount" style={{ color: grossProfit >= 0 ? 'var(--color-success)' : 'var(--color-destructive)' }}>{formatCurrency(grossProfit)}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="report-section">
            <h2>Operating Expenses</h2>
            <table className="report-table">
              <tbody>
                <tr><td className="indent-1">Administrative & Operating</td><td className="amount">{formatCurrency(operatingExpenses)}</td></tr>
                <tr className="grand-total"><td>Net Profit / (Loss)</td><td className="amount" style={{ color: netProfit >= 0 ? 'var(--color-success)' : 'var(--color-destructive)' }}>{formatCurrency(netProfit)}</td></tr>
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
                <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#1E40AF" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
