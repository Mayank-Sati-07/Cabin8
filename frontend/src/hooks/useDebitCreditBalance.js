import { useState, useCallback, useMemo } from 'react';
import { roundTo } from '../utils/currency';

export function useDebitCreditBalance(initialLines = []) {
  const [lines, setLines] = useState(initialLines);

  const totals = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;
    lines.forEach(line => {
      totalDebit += Number(line.debit) || 0;
      totalCredit += Number(line.credit) || 0;
    });
    return {
      totalDebit: roundTo(totalDebit),
      totalCredit: roundTo(totalCredit),
      difference: roundTo(totalDebit - totalCredit),
      isBalanced: roundTo(totalDebit - totalCredit) === 0 && totalDebit > 0,
    };
  }, [lines]);

  const addLine = useCallback((line) => {
    setLines(prev => [...prev, { ...line, id: Date.now() }]);
  }, []);

  const updateLine = useCallback((id, field, value) => {
    setLines(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  }, []);

  const removeLine = useCallback((id) => {
    setLines(prev => prev.filter(l => l.id !== id));
  }, []);

  return { lines, setLines, totals, addLine, updateLine, removeLine };
}
