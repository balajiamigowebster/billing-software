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
    <div 
      className="toast" 
      style={{ 
        borderLeft: type === 'success' ? '4px solid hsl(142, 76%, 36%)' : '4px solid hsl(0, 84%, 60%)' 
      }}
    >
      {type === 'success' ? (
        <CheckCircle2 size={18} color="hsl(142, 76%, 45%)" />
      ) : (
        <AlertCircle size={18} color="hsl(0, 84%, 60%)" />
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
