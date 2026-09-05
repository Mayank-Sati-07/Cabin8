import { useState } from 'react';

export default function AmountInput({ value, onChange, currency = '₹', placeholder = '0.00', className = '', ...props }) {
  const [displayValue, setDisplayValue] = useState(value != null ? String(value) : '');

  const handleChange = (e) => {
    const raw = e.target.value;
    if (raw === '' || /^\d*\.?\d{0,2}$/.test(raw)) {
      setDisplayValue(raw);
      onChange?.(raw === '' ? 0 : parseFloat(raw));
    }
  };

  const handleBlur = () => {
    const num = parseFloat(displayValue) || 0;
    setDisplayValue(num.toFixed(2));
    onChange?.(num);
  };

  return (
    <div className={`amount-input-wrapper ${className}`}>
      <span className="currency-symbol" aria-hidden="true">{currency}</span>
      <input
        type="text"
        inputMode="decimal"
        className="form-input"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
}
