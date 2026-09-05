'use client';

import React, { useEffect, useState } from 'react';
import StaffNavbar from '@/components/StaffNavbar';

interface FlagItem {
  id: string;
  description: string;
  status: string;
  createdAt: string;
  guestPhone: string;
  guestId: string;
}

export default function StaffFlagsPage() {
  const [flags, setFlags] = useState<FlagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadFlags = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/staff/flags');
      const data = await res.json();
      if (data.flags) setFlags(data.flags);
    } catch {
      alert('Failed to load content flags.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlags();
  }, []);

  const handleToggleStatus = async (flag: FlagItem) => {
    const nextStatus = flag.status === 'open' ? 'resolved' : 'open';
    setUpdatingId(flag.id);
    try {
      const res = await fetch(`/api/staff/flags/${flag.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setFlags((prev) =>
          prev.map((f) => (f.id === flag.id ? { ...f, status: nextStatus } : f))
        );
      }
    } catch {
      alert('Error updating flag status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const openCount = flags.filter((f) => f.status === 'open').length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0b100d' }}>
      <StaffNavbar />

      <main className="container" style={{ flex: 1, padding: '2.5rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
              FR-12 Staff Requirement
            </span>
            <h1 style={{ fontSize: '1.8rem' }}>Content Flag Review</h1>
            <p>Staff reviews guest reports of inaccurate content and marks them resolved once corrected.</p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-warning" style={{ fontSize: '0.85rem' }}>
              {openCount} Open Flag{openCount !== 1 ? 's' : ''}
            </span>
            <span className="badge badge-success" style={{ fontSize: '0.85rem' }}>
              {flags.length - openCount} Resolved
            </span>
          </div>
        </div>

        {loading ? (
          <div className="card">Loading reported content flags...</div>
        ) : flags.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>✨</span>
            <h3>No Content Flags Submitted</h3>
            <p style={{ marginTop: '0.5rem' }}>No inaccuracies have been reported by guests.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {flags.map((flag) => (
              <div
                key={flag.id}
                className="card"
                style={{
                  borderLeft: flag.status === 'open' ? '4px solid var(--warning)' : '4px solid var(--success)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      Reported by {flag.guestPhone} on {new Date(flag.createdAt).toLocaleString()}
                    </span>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ID: {flag.id}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className={`badge ${flag.status === 'open' ? 'badge-warning' : 'badge-success'}`}>
                      {flag.status.toUpperCase()}
                    </span>

                    <button
                      type="button"
                      disabled={updatingId === flag.id}
                      onClick={() => handleToggleStatus(flag)}
                      className={`btn btn-sm ${flag.status === 'open' ? 'btn-primary' : 'btn-secondary'}`}
                      id={`toggle-flag-${flag.id}`}
                    >
                      {updatingId === flag.id
                        ? 'Updating...'
                        : flag.status === 'open'
                        ? 'Mark as Resolved ✔'
                        : 'Re-open Flag'}
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    background: '#0a0e0b',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    color: '#fff',
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                  }}
                >
                  &quot;{flag.description}&quot;
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
