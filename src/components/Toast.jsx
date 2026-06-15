import React, { useEffect } from 'react';
import { CheckCircle2, X, AlertCircle } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="toast">
      {type === 'success' ? (
        <CheckCircle2 size={18} color="#2563eb" />
      ) : (
        <AlertCircle size={18} color="#ef4444" />
      )}
      <div style={{ flexGrow: 1 }}>{message}</div>
      <button 
        onClick={onClose} 
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'var(--text-muted)', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
