import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { calculateLineTotal, calculateOrderTotals } from '../utils/taxCalc';

export default function LineItemEditor({ lines, onChange, products = [], readOnly = false }) {
  const handleAddLine = () => {
    const newLine = {
      id: Date.now().toString(),
      product_id: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      tax_rate: 18,
    };
    onChange([...lines, newLine]);
  };

  const handleUpdateLine = (idx, field, value) => {
    const updated = lines.map((line, i) => {
      if (i !== idx) return line;
      const newLine = { ...line, [field]: value };
      if (field === 'product_id') {
        const product = products.find(p => p.id === value);
        if (product) {
          newLine.description = product.name;
          newLine.unit_price = product.cost_price || product.sales_price || 0;
        }
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
              <th style={{ width: '20%' }}>Description</th>
              <th style={{ width: '10%' }}>Qty</th>
              <th style={{ width: '14%' }}>Unit Price</th>
              <th style={{ width: '10%' }}>Tax %</th>
              <th style={{ width: '14%' }} className="col-amount">Subtotal</th>
              {!readOnly && <th style={{ width: '7%' }}></th>}
            </tr>
          </thead>
          <tbody>
            {lines.map((line, idx) => {
              const calc = calculateLineTotal(line.quantity || 0, line.unit_price || 0, line.tax_rate || 0);
              return (
                <tr key={line.id || idx}>
                  <td>
                    {readOnly ? (
                      <span>{products.find(p => p.id === line.product_id)?.name || line.description}</span>
                    ) : (
                      <select
                        value={line.product_id}
                        onChange={(e) => handleUpdateLine(idx, 'product_id', e.target.value)}
                      >
                        <option value="">Select product</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td>
                    {readOnly ? line.description : (
                      <input
                        type="text"
                        value={line.description}
                        onChange={(e) => handleUpdateLine(idx, 'description', e.target.value)}
                        placeholder="Description"
                      />
                    )}
                  </td>
                  <td>
                    {readOnly ? line.quantity : (
                      <input
                        type="number"
                        min="0"
                        value={line.quantity}
                        onChange={(e) => handleUpdateLine(idx, 'quantity', parseFloat(e.target.value) || 0)}
                        style={{ width: '70px' }}
                      />
                    )}
                  </td>
                  <td>
                    {readOnly ? formatCurrency(line.unit_price) : (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.unit_price}
                        onChange={(e) => handleUpdateLine(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                      />
                    )}
                  </td>
                  <td>
                    {readOnly ? `${line.tax_rate}%` : (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={line.tax_rate}
                        onChange={(e) => handleUpdateLine(idx, 'tax_rate', parseFloat(e.target.value) || 0)}
                        style={{ width: '60px' }}
                      />
                    )}
                  </td>
                  <td className="col-amount">{formatCurrency(calc.subtotal)}</td>
                  {!readOnly && (
                    <td>
                      <button className="remove-btn" onClick={() => handleRemoveLine(idx)} aria-label="Remove line">
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
        <div className="total-row">
          <span className="total-label">Subtotal</span>
          <span className="total-value">{formatCurrency(totals.subtotal)}</span>
        </div>
        <div className="total-row">
          <span className="total-label">Tax</span>
          <span className="total-value">{formatCurrency(totals.totalTax)}</span>
        </div>
        <div className="total-row grand">
          <span className="total-label">Total</span>
          <span className="total-value">{formatCurrency(totals.grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}
