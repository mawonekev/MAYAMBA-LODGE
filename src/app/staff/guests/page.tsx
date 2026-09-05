'use client';

import React, { useEffect, useState } from 'react';
import StaffNavbar from '@/components/StaffNavbar';

interface GuestItem {
  id: string;
  phoneNumber: string;
  createdAt: string;
  bookingsCount: number;
  flagsCount: number;
}

export default function StaffGuestsPage() {
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/staff/guests')
      .then((res) => res.json())
      .then((data) => {
        if (data.guests) setGuests(data.guests);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredGuests = guests.filter((g) =>
    g.phoneNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0b100d' }}>
      <StaffNavbar />

      <main className="container" style={{ flex: 1, padding: '2.5rem 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
            FR-11 Staff Requirement
          </span>
          <h1 style={{ fontSize: '1.8rem' }}>Guest Sign Up Review</h1>
          <p>Audit registered guest accounts, verification dates, and customer activity.</p>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="search-guests-input"
          />
        </div>

        {loading ? (
          <div className="card">Loading registered guests...</div>
        ) : (
          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#0e1410', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '0.85rem 1rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Guest ID</th>
                  <th style={{ padding: '0.85rem 1rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Mobile Phone</th>
                  <th style={{ padding: '0.85rem 1rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Registered Date</th>
                  <th style={{ padding: '0.85rem 1rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Total Bookings</th>
                  <th style={{ padding: '0.85rem 1rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Content Flags</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No registered guest accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredGuests.map((g) => (
                    <tr key={g.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        {g.id}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: '600', color: '#fff' }}>
                        {g.phoneNumber}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {new Date(g.createdAt).toLocaleDateString()} {new Date(g.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className="badge badge-gold">
                          {g.bookingsCount} booking{g.bookingsCount !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {g.flagsCount > 0 ? (
                          <span className="badge badge-warning">{g.flagsCount} flag{g.flagsCount !== 1 ? 's' : ''}</span>
                        ) : (
                          <span style={{ color: 'var(--text-dim)' }}>0</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
