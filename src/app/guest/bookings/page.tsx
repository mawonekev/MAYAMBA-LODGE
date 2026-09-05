'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import GuestNavbar from '@/components/GuestNavbar';
import GuestFooter from '@/components/GuestFooter';
import RefusalCard from '@/components/RefusalCard';

interface BookingItem {
  id: string;
  confirmationCode: string;
  status: string;
  stayDateFrom: string;
  stayDateTo: string;
  isTestData: boolean;
  roomType: {
    id: string;
    name: string;
    photo: string | null;
  };
  payment: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    flutterwaveRef: string | null;
  } | null;
}

export default function BookingsHistoryPage() {
  const [guest, setGuest] = useState<{ id: string; phoneNumber: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [confirmationCodeSearch, setConfirmationCodeSearch] = useState('');
  const [stayDateSearch, setStayDateSearch] = useState('');
  const [refusalInfo, setRefusalInfo] = useState<{
    whatsappNumber: string;
    reservationsEmail: string;
    message: string;
  } | null>(null);

  // Check auth
  useEffect(() => {
    fetch('/api/guest/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated && d.guest) {
          setGuest(d.guest);
          loadBookings();
        } else {
          setGuest(null);
        }
      })
      .finally(() => setCheckingAuth(false));
  }, []);

  const loadBookings = async (code = '', date = '') => {
    setLoadingBookings(true);
    setRefusalInfo(null);
    try {
      const params = new URLSearchParams();
      if (code.trim()) params.set('confirmationCode', code.trim());
      if (date.trim()) params.set('stayDate', date.trim());

      const res = await fetch(`/api/guest/bookings?${params.toString()}`);
      const data = await res.json();

      if (data.refusal) {
        setRefusalInfo(data.refusal);
        setBookings([]);
      } else {
        setBookings(data.bookings || []);
      }
    } catch {
      alert('Error fetching bookings history.');
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadBookings(confirmationCodeSearch, stayDateSearch);
  };

  const handleClearSearch = () => {
    setConfirmationCodeSearch('');
    setStayDateSearch('');
    loadBookings('', '');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GuestNavbar />

      <main className="container" style={{ flex: 1, padding: '2.5rem 1rem' }}>
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
              Functional Requirement 5
            </span>
            <h1 style={{ marginBottom: '0.5rem' }}>My Reservation History</h1>
            <p>
              Verified booking status lookup by confirmation code or date of stay (strictly scoped to your account).
            </p>
          </div>

          {checkingAuth ? (
            <div className="card">Verifying guest credentials...</div>
          ) : !guest ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>🔒</span>
              <h2 style={{ marginBottom: '0.5rem' }}>Sign In Required</h2>
              <p style={{ maxWidth: '480px', margin: '0 auto 1.5rem' }}>
                To protect guest privacy, reservations can only be viewed by the signed-in account that created them.
              </p>
              <Link href="/guest/auth" className="btn btn-primary btn-lg" id="bookings-signin-btn">
                Sign In With Phone Number
              </Link>
            </div>
          ) : (
            <div>
              {/* Search / Filter Card */}
              <div className="card" style={{ marginBottom: '2rem' }}>
                <form onSubmit={handleSearchSubmit}>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Search by Confirmation Code</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. MYB-8X2K9A"
                        value={confirmationCodeSearch}
                        onChange={(e) => setConfirmationCodeSearch(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Filter by Date of Stay</label>
                      <input
                        type="date"
                        className="form-input"
                        value={stayDateSearch}
                        onChange={(e) => setStayDateSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      id="filter-bookings-btn"
                    >
                      Filter Bookings
                    </button>
                    {(confirmationCodeSearch || stayDateSearch) && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="btn btn-secondary btn-sm"
                      >
                        Clear Filter
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Refusal notification for cross-guest lookup */}
              {refusalInfo && (
                <div style={{ marginBottom: '2rem' }}>
                  <RefusalCard
                    reason="refund_or_dispute"
                    message={refusalInfo.message}
                    whatsappNumber={refusalInfo.whatsappNumber}
                    reservationsEmail={refusalInfo.reservationsEmail}
                  />
                </div>
              )}

              {/* Bookings List */}
              {loadingBookings ? (
                <div className="card">Loading your reservations...</div>
              ) : bookings.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
                  <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📋</span>
                  <h3 style={{ marginBottom: '0.5rem' }}>No Bookings Found</h3>
                  <p style={{ marginBottom: '1.25rem' }}>
                    No reservations matched your query for this phone number ({guest.phoneNumber}).
                  </p>
                  <Link href="/guest/availability" className="btn btn-primary btn-sm">
                    Search Room Availability
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {bookings.map((b) => (
                    <div key={b.id} className="card">
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '1rem',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                            Confirmation Code
                          </div>
                          <div
                            style={{
                              fontFamily: 'monospace',
                              fontSize: '1.3rem',
                              fontWeight: '700',
                              color: '#fff',
                            }}
                          >
                            {b.confirmationCode}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <span
                            className={`badge ${
                              b.status === 'confirmed' ? 'badge-success' : 'badge-danger'
                            }`}
                          >
                            {b.status}
                          </span>
                          <span
                            className={`badge ${
                              b.payment?.status === 'paid'
                                ? 'badge-success'
                                : b.payment?.status === 'not_paid'
                                ? 'badge-danger'
                                : 'badge-warning'
                            }`}
                          >
                            Payment: {b.payment?.status || 'not_paid'}
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: '1rem',
                          borderTop: '1px solid var(--border-subtle)',
                          paddingTop: '0.75rem',
                          marginBottom: '1rem',
                          fontSize: '0.9rem',
                        }}
                      >
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Chalet:</span>
                          <div style={{ fontWeight: '600' }}>{b.roomType.name}</div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Dates of Stay:</span>
                          <div style={{ fontWeight: '600' }}>
                            {new Date(b.stayDateFrom).toLocaleDateString()} –{' '}
                            {new Date(b.stayDateTo).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Amount:</span>
                          <div style={{ fontWeight: '700', color: 'var(--gold-primary)' }}>
                            {b.payment?.currency} {b.payment?.amount?.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <Link
                          href={`/guest/payment/${b.id}`}
                          className="btn btn-secondary btn-sm"
                          id={`view-booking-${b.id}`}
                        >
                          View Receipt / Status Details →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <GuestFooter />
    </div>
  );
}
