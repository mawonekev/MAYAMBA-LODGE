'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import GuestNavbar from '@/components/GuestNavbar';
import GuestFooter from '@/components/GuestFooter';

export default function ContentFlagPage() {
  const [guest, setGuest] = useState<{ id: string; phoneNumber: string } | null>(null);
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState<{
    flagId: string;
    message: string;
    createdAt: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/guest/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated && d.guest) {
          setGuest(d.guest);
          setPhone(d.guest.phoneNumber);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/guest/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          phoneNumber: phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit flag.');
      } else {
        setConfirmation({
          flagId: data.flagId,
          message: data.message,
          createdAt: data.createdAt,
        });
        setDescription('');
      }
    } catch {
      setError('Connection error while submitting flag.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GuestNavbar />

      <main className="container" style={{ flex: 1, padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
              Functional Requirement 7
            </span>
            <h1 style={{ marginBottom: '0.5rem' }}>Report Inaccurate Content</h1>
            <p>
              Does an amenity, operating schedule, or rate description look inaccurate? Submit a content flag directly to Mayamba Lodge front desk staff for immediate verification.
            </p>
          </div>

          {confirmation ? (
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '2.5rem 1.5rem',
                border: '1px solid var(--border-gold)',
                background: 'linear-gradient(180deg, #18221b 0%, #121814 100%)',
              }}
            >
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>
                📬
              </span>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: '#fff' }}>
                Flag Received by Front Desk
              </h2>
              <p style={{ maxWidth: '480px', margin: '0 auto 1.5rem', color: 'var(--text-main)' }}>
                {confirmation.message}
              </p>

              <div
                style={{
                  background: '#0d120f',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  maxWidth: '380px',
                  margin: '0 auto 1.5rem',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Flag Reference ID:</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--gold-light)' }}>
                    {confirmation.flagId}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Status:</span>
                  <span className="badge badge-gold">Open for Review</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setConfirmation(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Submit Another Report
                </button>
                <Link href="/" className="btn btn-primary btn-sm">
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <div className="card">
              <form onSubmit={handleSubmit}>
                {!guest && (
                  <div className="form-group">
                    <label className="form-label">Your Mobile Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+263771234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      id="flag-phone-input"
                    />
                    <small style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                      Required so staff can link your feedback to a guest record.
                    </small>
                  </div>
                )}

                {guest && (
                  <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-success">Signed In</span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      Submitting as {guest.phoneNumber}
                    </span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">
                    Describe What Looks Wrong or Needs Correction
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={5}
                    placeholder="e.g. The check-out time stated on the chalet description conflicts with the restaurant breakfast hours, or a feature is listed incorrectly..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    id="flag-description-input"
                  />
                </div>

                {error && (
                  <div
                    style={{
                      color: 'var(--danger)',
                      marginBottom: '1rem',
                      fontSize: '0.88rem',
                    }}
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-block btn-lg"
                  id="flag-submit-btn"
                >
                  {submitting ? 'Submitting to Front Desk...' : 'Submit Content Flag (FR-7)'}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      <GuestFooter />
    </div>
  );
}
