import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { calculateLineTotal, calculateOrderTotals } from '../utils/taxCalc';

export default function LineItemEditor({ lines, onChange, products = [], analyticAccounts = [], readOnly = false, taxSummary = null }) {
  const handleAddLine = () => {
    const newLine = { id: Date.now().toString(), productId: '', analyticAccountId: '', qty: 1, unitPrice: 0 };
    onChange([...lines, newLine]);
  };

  const handleUpdateLine = (idx, field, value) => {
    const updated = lines.map((line, i) => {
      if (i !== idx) return line;
      const newLine = { ...line, [field]: value };
      if (field === 'productId') {
        const product = products.find(p => String(p.id) === String(value));
        if (product) newLine.unitPrice = product.cost ?? product.salesPrice ?? 0;
      }
      return newLine;
    });
    onChange(updated);
  };

  const handleRemoveLine = (idx) => {
    onChange(lines.filter((_, i) => i !== idx));
  };

  const totals = calculateOrderTotals(lines);

  return (
    <div>
      <div className="data-table-wrapper">
        <table className="line-item-table">
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Product</th>
              <th style={{ width: '20%' }}>Analytic Account</th>
              <th style={{ width: '10%' }}>Qty</th>
              <th style={{ width: '14%' }}>Unit Price</th>
              {taxSummary && <th style={{ width: '8%' }}>GST %</th>}
              {taxSummary && <th style={{ width: '11%' }} className="col-amount">Tax</th>}
              <th style={{ width: '15%' }} className="col-amount">Total</th>
              {!readOnly && <th style={{ width: '7%' }}></th>}
            </tr>
          </thead>
          <tbody>
            {lines.map((line, idx) => {
              const total = line.total != null ? line.total : calculateLineTotal(line.qty || 0, line.unitPrice || 0);
              return (
                <tr key={line.id || idx}>
                  <td>
                    {readOnly ? (
                      <span>{line.product?.name || products.find(p => String(p.id) === String(line.productId))?.name || '—'}</span>
                    ) : (
                      <select
                        value={line.productId}
                        onChange={(e) => handleUpdateLine(idx, 'productId', e.target.value)}
                      >
                        <option value="">Select product</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td>
                    {readOnly ? (
                      <span>{line.analyticAccount?.name || analyticAccounts.find(a => String(a.id) === String(line.analyticAccountId))?.name || '—'}</span>
                    ) : (
                      <select
                        value={line.analyticAccountId || ''}
                        onChange={(e) => handleUpdateLine(idx, 'analyticAccountId', e.target.value)}
                      >
                        <option value="">None</option>
                        {analyticAccounts.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td>
                    {readOnly ? line.qty : (
                      <input
                        type="number"
                        min="0"
                        value={line.qty}
                        onChange={(e) => handleUpdateLine(idx, 'qty', parseFloat(e.target.value) || 0)}
                        style={{ width: '70px' }}
                      />
                    )}
                  </td>
                  <td>
                    {readOnly ? formatCurrency(line.unitPrice) : (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.unitPrice}
                        onChange={(e) => handleUpdateLine(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    )}
                  </td>
                  {taxSummary && <td>{line.gstRate || 0}%</td>}
                  {taxSummary && <td className="col-amount">{formatCurrency((line.cgstAmount || 0) + (line.sgstAmount || 0) + (line.igstAmount || 0))}</td>}
                  <td className="col-amount">{formatCurrency(total)}</td>
                  {!readOnly && (
                    <td>
                      <button className="remove-btn" onClick={() => handleRemoveLine(idx)} aria-label="Remove line" type="button">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!readOnly && (
        <button className="line-item-add" onClick={handleAddLine} type="button">
          <Plus size={16} /> Add a line
        </button>
      )}

      <div className="line-item-totals">
        {taxSummary ? (
          <>
            <div className="total-row"><span className="total-label">Subtotal</span><span className="total-value">{formatCurrency(taxSummary.subTotal)}</span></div>
            {taxSummary.cgstAmount > 0 && <div className="total-row"><span className="total-label">CGST</span><span className="total-value">{formatCurrency(taxSummary.cgstAmount)}</span></div>}
            {taxSummary.sgstAmount > 0 && <div className="total-row"><span className="total-label">SGST</span><span className="total-value">{formatCurrency(taxSummary.sgstAmount)}</span></div>}
            {taxSummary.igstAmount > 0 && <div className="total-row"><span className="total-label">IGST</span><span className="total-value">{formatCurrency(taxSummary.igstAmount)}</span></div>}
            <div className="total-row grand"><span className="total-label">Total</span><span className="total-value">{formatCurrency(taxSummary.totalAmount)}</span></div>
          </>
        ) : (
          <div className="total-row grand">
            <span className="total-label">Total</span>
            <span className="total-value">{formatCurrency(totals.grandTotal)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
