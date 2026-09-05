'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GuestNavbar from '@/components/GuestNavbar';
import GuestFooter from '@/components/GuestFooter';

export default function GuestAuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<'signin_password' | 'signin_otp' | 'signup'>('signin_password');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/guest/auth/signin-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to sign in.');
      } else {
        router.push('/guest/bookings');
      }
    } catch {
      setError('Connection error while signing in.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/guest/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to sign up.');
      } else {
        router.push('/guest/bookings');
      }
    } catch {
      setError('Connection error while creating account.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/guest/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send SMS code.');
      } else {
        setOtpSent(true);
        setSuccessMsg(data.message || 'Verification code sent.');
        if (data.devCode) {
          setDevCode(data.devCode);
          setOtpCode(data.devCode);
        }
      }
    } catch {
      setError('Connection error while requesting code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/guest/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid verification code.');
      } else {
        router.push('/guest/bookings');
      }
    } catch {
      setError('Connection error while verifying code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GuestNavbar />

      <main className="container" style={{ flex: 1, padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '460px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
              Functional Requirement 6
            </span>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Guest Portal</h1>
            <p>Access your reservations and manage stays at Mayamba Lodge.</p>
          </div>

          <div className="card">
            {/* Mode selection tabs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '0.35rem',
                marginBottom: '1.5rem',
                background: '#0e1410',
                padding: '0.3rem',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <button
                type="button"
                className={`btn btn-sm ${mode === 'signin_password' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.2rem' }}
                onClick={() => { setMode('signin_password'); setError(''); }}
              >
                Password
              </button>
              <button
                type="button"
                className={`btn btn-sm ${mode === 'signin_otp' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.2rem' }}
                onClick={() => { setMode('signin_otp'); setError(''); }}
              >
                SMS Code
              </button>
              <button
                type="button"
                className={`btn btn-sm ${mode === 'signup' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.2rem' }}
                onClick={() => { setMode('signup'); setError(''); }}
              >
                Register
              </button>
            </div>

            {error && (
              <div
                style={{
                  background: 'var(--danger-bg)',
                  border: '1px solid rgba(217, 83, 79, 0.3)',
                  color: '#ff8585',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  fontSize: '0.88rem',
                }}
              >
                {error}
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  background: 'var(--success-bg)',
                  border: '1px solid rgba(56, 176, 0, 0.3)',
                  color: '#80ed99',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  fontSize: '0.88rem',
                }}
              >
                {successMsg}
              </div>
            )}

            {/* Mode 1: Sign in with Password */}
            {mode === 'signin_password' && (
              <form onSubmit={handlePasswordSignIn}>
                <div className="form-group">
                  <label className="form-label">Mobile Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+263771234567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    id="guest-phone-input"
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
                    id="guest-password-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-block btn-lg"
                  id="guest-signin-submit"
                >
                  {loading ? 'Signing In...' : 'Sign In With Password'}
                </button>
              </form>
            )}

            {/* Mode 2: SMS One-Time Code */}
            {mode === 'signin_otp' && (
              <div>
                {!otpSent ? (
                  <form onSubmit={handleSendOtp}>
                    <div className="form-group">
                      <label className="form-label">Mobile Phone Number</label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="+263771234567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        id="guest-otp-phone-input"
                      />
                      <small style={{ display: 'block', marginTop: '0.35rem', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                        A 6-digit one-time code will be dispatched to this number.
                      </small>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary btn-block btn-lg"
                      id="guest-send-otp-submit"
                    >
                      {loading ? 'Sending SMS Code...' : 'Send SMS One-Time Code'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp}>
                    <div className="form-group">
                      <label className="form-label">Enter 6-Digit SMS Code</label>
                      <input
                        type="text"
                        className="form-input"
                        maxLength={6}
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        required
                        id="guest-otp-code-input"
                      />
                      {devCode && (
                        <div style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: 'var(--gold-light)' }}>
                          Dev helper: Code logged to terminal is <strong>{devCode}</strong>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary btn-block btn-lg"
                      id="guest-verify-otp-submit"
                    >
                      {loading ? 'Verifying Code...' : 'Verify Code & Sign In'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="btn btn-secondary btn-block btn-sm"
                      style={{ marginTop: '0.75rem' }}
                    >
                      Resend Code / Change Phone
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Mode 3: New Guest Registration */}
            {mode === 'signup' && (
              <form onSubmit={handlePasswordSignUp}>
                <div className="form-group">
                  <label className="form-label">Mobile Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+263771234567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    id="guest-signup-phone-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Create Password (min 6 characters)</label>
                  <input
                    type="password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    id="guest-signup-password-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-block btn-lg"
                  id="guest-signup-submit"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-dim)' }}>Are you a lodge staff member? </span>
            <Link href="/staff/login" style={{ color: 'var(--gold-light)', fontWeight: '600' }}>
              Staff Admin Portal →
            </Link>
          </div>
        </div>
      </main>

      <GuestFooter />
    </div>
  );
}
