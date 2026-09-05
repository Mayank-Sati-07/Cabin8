import { roundTo } from './currency';

export function calculateLineTotal(qty, unitPrice) {
  return roundTo((qty || 0) * (unitPrice || 0));
}

export function calculateOrderTotals(lines = []) {
  const grandTotal = lines.reduce((sum, line) => {
    if (line.total != null) return sum + line.total;
    return sum + calculateLineTotal(line.qty, line.unitPrice);
  }, 0);
  return { grandTotal: roundTo(grandTotal) };
}
