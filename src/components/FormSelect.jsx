import React from 'react';

export default function FormSelect({ label, id, options = [], error, ...props }) {
  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">{label}</label>
      <div className="select-wrapper">
        <select id={id} className="form-select" {...props}>
          {options.map((opt, i) => (
            <option key={opt.value || i} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error && <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 500, marginTop: '2px' }}>{error}</span>}
    </div>
  );
}
