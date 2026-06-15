import React from 'react';

export default function FormTextarea({ label, id, error, ...props }) {
  return (
    <div className="form-group full-width">
      <label htmlFor={id} className="form-label">{label}</label>
      <textarea id={id} className="form-textarea" {...props} />
      {error && <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 500, marginTop: '2px' }}>{error}</span>}
    </div>
  );
}
