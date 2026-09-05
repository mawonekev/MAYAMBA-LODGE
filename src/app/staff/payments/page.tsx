'use client';

import React, { useEffect, useState } from 'react';
import StaffNavbar from '@/components/StaffNavbar';

interface BookingPaymentItem {
  id: string;
  confirmationCode: string;
  status: string;
  stayDateFrom: string;
  stayDateTo: string;
  guestPhone: string;
  roomTypeName: string;
  payment: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    flutterwaveRef: string | null;
    createdAt: string;
  } | null;
}

export default function StaffPaymentsPage() {
  const [bookings, setBookings] = useState<BookingPaymentItem[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const url =
        statusFilter !== 'all'
          ? `/api/staff/payments?status=${statusFilter}`
          : '/api/staff/payments';
      const res = await fetch(url);
      const data = await res.json();
      if (data.bookings) setBookings(data.bookings);
    } catch {
      alert('Failed to load payment records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [statusFilter]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0b100d' }}>
      <StaffNavbar />

      <main className="container" style={{ flex: 1, padding: '2.5rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
              FR-13 Staff Requirement
            </span>
            <h1 style={{ fontSize: '1.8rem' }}>Payment Status View</h1>
            <p>Staff audits payment clearance per booking, transaction totals, and Flutterwave reference tokens.</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status Filter:</span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.4rem 0.8rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              id="payment-status-filter"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="not_paid">Not Paid</option>
              <option value="unclear_pending_review">Unclear / Pending Review</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="card">Loading payment records...</div>
        ) : bookings.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>💳</span>
            <h3>No Bookings Found</h3>
            <p style={{ marginTop: '0.5rem' }}>No records matched the selected status filter.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#0e1410', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '0.85rem 1rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Confirmation</th>
                  <th style={{ padding: '0.85rem 1rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Guest Phone</th>
                  <th style={{ padding: '0.85rem 1rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Chalet & Dates</th>
                  <th style={{ padding: '0.85rem 1rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Amount</th>
                  <th style={{ padding: '0.85rem 1rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Payment Status</th>
                  <th style={{ padding: '0.85rem 1rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Flutterwave Ref</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#fff' }}>
                        {b.confirmationCode}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '500' }}>
                      {b.guestPhone}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: '600' }}>{b.roomTypeName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {new Date(b.stayDateFrom).toLocaleDateString()} – {new Date(b.stayDateTo).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {b.payment ? (
                        <span style={{ fontWeight: '700', color: 'var(--gold-primary)' }}>
                          {b.payment.currency} {b.payment.amount.toFixed(2)}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-dim)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {b.payment ? (
                        <span
                          className={`badge ${
                            b.payment.status === 'paid'
                              ? 'badge-success'
                              : b.payment.status === 'not_paid'
                              ? 'badge-danger'
                              : 'badge-warning'
                          }`}
                        >
                          {b.payment.status}
                        </span>
                      ) : (
                        <span className="badge badge-danger">Unbilled</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      {b.payment?.flutterwaveRef || 'None (Pending Gateway)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
