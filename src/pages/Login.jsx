import React, { useState } from 'react';
import { Stethoscope, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setIsLoading(true);

    // Simulate network authentication delay
    setTimeout(() => {
      if (username.trim() === 'admin' && password.trim() === 'admin') {
        onLoginSuccess();
      } else {
        setError('Invalid username or password.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: 'var(--bg-main)',
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 200,
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '40px 30px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.06)',
        borderRadius: 'var(--radius-lg)',
        gap: '20px',
        animation: 'slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
          <div className="logo-icon" style={{ width: '48px', height: '48px', borderRadius: '12px' }}>
            <Stethoscope size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px' }}>Welcome back</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Sign in to manage your clinic dashboard</p>
          </div>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'hsl(0, 75%, 95%)',
            color: 'hsl(0, 75%, 45%)',
            fontSize: '0.85rem',
            fontWeight: 500,
            border: '1px solid hsl(0, 75%, 90%)'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="form-group" style={{ gap: '6px' }}>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Username</label>
            <div className="input-wrapper">
              <input
                type="text"
                className="form-input"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '44px' }}
                disabled={isLoading}
              />
              <User 
                size={18} 
                color="var(--text-secondary)" 
                style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ gap: '6px' }}>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Password</label>
            <div className="input-wrapper">
              <input
                type="password"
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '44px' }}
                disabled={isLoading}
              />
              <Lock 
                size={18} 
                color="var(--text-secondary)" 
                style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', marginTop: '10px' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <Loader2 size={18} className="animate-spin" /> Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          Demo Credentials: Use <strong style={{ color: 'var(--text-secondary)' }}>admin</strong> / <strong style={{ color: 'var(--text-secondary)' }}>admin</strong>
        </div>
      </div>
    </div>
  );
}
