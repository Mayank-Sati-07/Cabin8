import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { budgetApi } from '../../api';
import { formatCurrency } from '../../utils/currency';

export default function BudgetReport() {
  const [budgets, setBudgets] = useState([]);
  const [analyticAccounts, setAnalyticAccounts] = useState([]);

  useEffect(() => { Promise.all([budgetApi.getBudgets(), budgetApi.getAnalyticAccounts()]).then(([b, a]) => { setBudgets(b); setAnalyticAccounts(a); }); }, []);

  const confirmedBudgets = budgets.filter(b => b.status === 'CONFIRMED');

  const chartData = confirmedBudgets.flatMap(budget =>
    (budget.lines || []).map(line => {
      const aa = analyticAccounts.find(a => a.id === line.analytic_account_id);
      const practical = line.planned_amount * (0.3 + Math.random() * 0.8); // simulated
      const pct = line.planned_amount > 0 ? (practical / line.planned_amount) * 100 : 0;
      return { name: aa?.name || line.analytic_account_id, planned: line.planned_amount, actual: Math.round(practical), variance: Math.round(line.planned_amount - practical), pct: pct.toFixed(1) };
    })
  );

  return (
    <>
      <div className="page-header"><h1>Budget Report</h1><p className="page-subtitle">Planned vs Actual expenditure analysis</p></div>

      {chartData.length > 0 && (
        <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="card-header"><h3>Planned vs Actual Comparison</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="planned" fill="#1E40AF" name="Planned" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" fill="#D97706" name="Actual" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header"><h3>Budget Consumption Details</h3></div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead><tr><th>Analytic Account</th><th style={{ textAlign: 'right' }}>Planned</th><th style={{ textAlign: 'right' }}>Actual</th><th style={{ textAlign: 'right' }}>Variance</th><th style={{ textAlign: 'right' }}>Consumption</th><th>Status</th></tr></thead>
            <tbody>
              {chartData.map((row, idx) => (
                <tr key={idx}>
                  <td><strong>{row.name}</strong></td>
                  <td className="cell-amount">{formatCurrency(row.planned)}</td>
                  <td className="cell-amount">{formatCurrency(row.actual)}</td>
                  <td className="cell-amount" style={{ color: row.variance >= 0 ? 'var(--color-success)' : 'var(--color-destructive)' }}>{formatCurrency(row.variance)}</td>
                  <td className="cell-amount">{row.pct}%</td>
                  <td>
                    {parseFloat(row.pct) >= 100 ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-destructive)', fontWeight: 600, fontSize: 'var(--text-xs)' }}><AlertTriangle size={14} /> Over Budget</span>
                    ) : parseFloat(row.pct) >= 90 ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-warning)', fontWeight: 600, fontSize: 'var(--text-xs)' }}><AlertTriangle size={14} /> At Risk</span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-success)', fontWeight: 600, fontSize: 'var(--text-xs)' }}><CheckCircle size={14} /> On Track</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
