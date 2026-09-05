'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StaffLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/staff/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid staff credentials.');
      } else {
        router.push('/staff');
      }
    } catch {
      setError('Connection error while logging into staff admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#090d0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            className="brand-symbol"
            style={{ width: '48px', height: '48px', fontSize: '1.4rem', margin: '0 auto 1rem' }}
          >
            M
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>Staff Admin Portal</h1>
          <p style={{ fontSize: '0.88rem' }}>
            Authorized front desk and lodge operations personnel only.
          </p>
        </div>

        <div className="card" style={{ border: '1px solid var(--border-gold)', padding: '2rem' }}>
          {error && (
            <div
              style={{
                background: 'var(--danger-bg)',
                border: '1px solid rgba(217, 83, 79, 0.3)',
                color: '#ff8585',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Staff Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                id="staff-username-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                id="staff-password-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block btn-lg"
              id="staff-login-submit"
            >
              {loading ? 'Authenticating Staff...' : 'Sign In to Admin Panel'}
            </button>
          </form>

          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              color: 'var(--text-dim)',
              textAlign: 'center',
            }}
          >
            Demonstration Credentials: Username: <strong>admin</strong> | Password: <strong>admin123</strong>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
          <Link href="/" style={{ color: 'var(--text-muted)' }}>
            ← Return to Guest Facing App
          </Link>
        </div>
      </div>
    </div>
  );
}
