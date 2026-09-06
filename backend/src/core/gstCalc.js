function roundTo(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

// Splits GST on a taxable amount into CGST+SGST (same state as company)
// or IGST (different state / state unknown on either side).
function calculateLineGst({ taxableAmount, gstRate, partnerState, companyState }) {
  const totalTax = roundTo((taxableAmount || 0) * (gstRate || 0) / 100);
  const sameState = !!partnerState && !!companyState &&
    partnerState.trim().toLowerCase() === companyState.trim().toLowerCase();

  if (sameState) {
    const cgstAmount = roundTo(totalTax / 2);
    return { cgstAmount, sgstAmount: roundTo(totalTax - cgstAmount), igstAmount: 0 };
  }
  return { cgstAmount: 0, sgstAmount: 0, igstAmount: totalTax };
}

module.exports = { roundTo, calculateLineGst };
