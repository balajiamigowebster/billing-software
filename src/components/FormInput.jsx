import React from 'react';

export default function FormInput({ label, id, error, ...props }) {
  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">{label}</label>
      <div className="input-wrapper">
        <input id={id} className="form-input" {...props} />
      </div>
      {error && <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 500, marginTop: '2px' }}>{error}</span>}
    </div>
  );
}
