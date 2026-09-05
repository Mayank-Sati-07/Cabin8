import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { reportsApi } from '../../api';
import { formatCurrency } from '../../utils/currency';

export default function BudgetReport() {
  const [report, setReport] = useState(null);

  useEffect(() => { reportsApi.getBudgetReport().then(setReport); }, []);

  if (!report) return <p>Loading...</p>;

  const chartData = report.budgets.map(b => ({ name: b.name, planned: b.committedAmount, actual: b.achievedAmount }));

  return (
    <>
      <div className="page-header"><h1>Budget Report</h1><p className="page-subtitle">Committed vs Achieved expenditure analysis</p></div>

      {chartData.length > 0 && (
        <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="card-header"><h3>Committed vs Achieved Comparison</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="planned" fill="#38bdf8" name="Committed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" fill="#2dd4bf" name="Achieved" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header"><h3>Budget Consumption Details</h3></div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead><tr><th>Budget</th><th>Analytic Account</th><th>Responsible</th><th style={{ textAlign: 'right' }}>Committed</th><th style={{ textAlign: 'right' }}>Achieved</th><th style={{ textAlign: 'right' }}>Consumption</th><th>Status</th></tr></thead>
            <tbody>
              {report.budgets.map((row) => (
                <tr key={row.id}>
                  <td><strong>{row.name}</strong></td>
                  <td>{row.analyticAccount}</td>
                  <td>{row.responsible}</td>
                  <td className="cell-amount">{formatCurrency(row.committedAmount)}</td>
                  <td className="cell-amount">{formatCurrency(row.achievedAmount)}</td>
                  <td className="cell-amount">{row.achievedPercent}%</td>
                  <td>
                    {row.achievedPercent >= 100 ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-destructive)', fontWeight: 600, fontSize: 'var(--text-xs)' }}><AlertTriangle size={14} /> Over Budget</span>
                    ) : row.achievedPercent >= 90 ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-warning)', fontWeight: 600, fontSize: 'var(--text-xs)' }}><AlertTriangle size={14} /> At Risk</span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-success)', fontWeight: 600, fontSize: 'var(--text-xs)' }}><CheckCircle size={14} /> On Track</span>
                    )}
                  </td>
                </tr>
              ))}
              <tr className="subtotal"><td colSpan={3}>Total</td><td className="cell-amount">{formatCurrency(report.totals.committed)}</td><td className="cell-amount">{formatCurrency(report.totals.achieved)}</td><td colSpan={2}></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
