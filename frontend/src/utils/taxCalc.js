import { roundTo } from './currency';

export function calculateTax(amount, taxRate = 0) {
  return roundTo(amount * (taxRate / 100));
}

export function calculateLineTotal(quantity, unitPrice, taxRate = 0) {
  const subtotal = roundTo(quantity * unitPrice);
  const tax = calculateTax(subtotal, taxRate);
  return { subtotal, tax, total: roundTo(subtotal + tax) };
}

export function calculateOrderTotals(lines) {
  let subtotal = 0;
  let totalTax = 0;
  lines.forEach(line => {
    const lineCalc = calculateLineTotal(line.quantity || 0, line.unit_price || 0, line.tax_rate || 0);
    subtotal += lineCalc.subtotal;
    totalTax += lineCalc.tax;
  });
  return {
    subtotal: roundTo(subtotal),
    totalTax: roundTo(totalTax),
    grandTotal: roundTo(subtotal + totalTax),
  };
}
