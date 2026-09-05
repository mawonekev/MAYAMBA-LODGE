'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import GuestNavbar from '@/components/GuestNavbar';
import GuestFooter from '@/components/GuestFooter';
import RefusalCard from '@/components/RefusalCard';

interface BookingRecord {
  id: string;
  confirmationCode: string;
  status: string;
  stayDateFrom: string;
  stayDateTo: string;
  isTestData: boolean;
  roomType: {
    id: string;
    name: string;
    description: string;
  };
  payment: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    flutterwaveRef: string | null;
  } | null;
}

export default function PaymentStatusPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = use(params);
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [refusalInfo, setRefusalInfo] = useState<{
    whatsappNumber: string;
    reservationsEmail: string;
    message: string;
  } | null>(null);
  const [showDisputeRefusal, setShowDisputeRefusal] = useState(false);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetch(`/api/guest/bookings/${bookingId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.booking) {
          setBooking(data.booking);
        } else if (data.refusal) {
          setRefusalInfo(data.refusal);
        }
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handleSimulatePayment = async (outcome: 'paid' | 'failed' | 'unclear') => {
    if (!booking?.payment?.id) return;
    setSimulating(true);
    try {
      const res = await fetch(`/api/guest/payments/${booking.payment.id}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome }),
      });
      const data = await res.json();
      if (data.payment) {
        setBooking((prev) =>
          prev
            ? {
                ...prev,
                status: outcome === 'paid' ? 'confirmed' : prev.status,
                payment: {
                  ...prev.payment!,
                  status: data.payment.status,
                  flutterwaveRef: data.payment.flutterwaveRef,
                },
              }
            : null
        );
      }
    } catch {
      alert('Error updating payment status.');
    } finally {
      setSimulating(false);
    }
  };

  const handleTriggerDisputeRefusal = async () => {
    try {
      const res = await fetch('/api/guest/refusal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'refund_or_dispute',
          message: `Guest inquiry regarding payment or refund for booking ${booking?.confirmationCode}`,
        }),
      });
      const data = await res.json();
      setRefusalInfo(data);
      setShowDisputeRefusal(true);
    } catch {
      setShowDisputeRefusal(true);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GuestNavbar />

      <main className="container" style={{ flex: 1, padding: '2.5rem 1rem' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          {loading ? (
            <div className="card">Loading reservation and payment records...</div>
          ) : refusalInfo && !booking ? (
            <RefusalCard
              reason="records_silent"
              message={refusalInfo.message}
              whatsappNumber={refusalInfo.whatsappNumber}
              reservationsEmail={refusalInfo.reservationsEmail}
            />
          ) : booking ? (
            <div>
              {/* Header Status */}
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
                  FR-4 Payment & Confirmation
                </span>
                <h1 style={{ marginBottom: '0.5rem' }}>
                  {booking.payment?.status === 'paid'
                    ? 'Reservation Confirmed & Paid'
                    : 'Payment Status'}
                </h1>
                <p>Official Mayamba Lodge verified booking record.</p>
              </div>

              {/* Confirmation Code Card */}
              <div
                className="card"
                style={{
                  textAlign: 'center',
                  padding: '2rem',
                  marginBottom: '2rem',
                  border: '1px solid var(--border-gold)',
                  background: 'linear-gradient(180deg, #18221b 0%, #121814 100%)',
                }}
              >
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--gold-light)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '0.5rem',
                  }}
                >
                  Confirmation Code
                </div>
                <div
                  style={{
                    fontSize: '2.4rem',
                    fontFamily: 'monospace',
                    fontWeight: '700',
                    letterSpacing: '0.08em',
                    color: '#fff',
                    marginBottom: '1rem',
                  }}
                  id="booking-confirmation-code"
                >
                  {booking.confirmationCode}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span
                    className={`badge ${
                      booking.status === 'confirmed' ? 'badge-success' : 'badge-danger'
                    }`}
                  >
                    Booking {booking.status}
                  </span>

                  <span
                    className={`badge ${
                      booking.payment?.status === 'paid'
                        ? 'badge-success'
                        : booking.payment?.status === 'not_paid'
                        ? 'badge-danger'
                        : 'badge-warning'
                    }`}
                  >
                    Payment: {booking.payment?.status || 'not_paid'}
                  </span>

                  {booking.isTestData && (
                    <span className="badge badge-gold">Demonstration Pilot Record</span>
                  )}
                </div>
              </div>

              {/* Booking Details Card */}
              <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--gold-light)' }}>
                  Reservation Overview
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.95rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Chalet:</span>
                    <span style={{ fontWeight: '600' }}>{booking.roomType.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Check-In:</span>
                    <span style={{ fontWeight: '600' }}>
                      {new Date(booking.stayDateFrom).toLocaleDateString()} (from 14:00)
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Check-Out:</span>
                    <span style={{ fontWeight: '600' }}>
                      {new Date(booking.stayDateTo).toLocaleDateString()} (by 10:00)
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
                    <span style={{ fontWeight: '700', color: 'var(--gold-primary)' }}>
                      {booking.payment?.currency} {booking.payment?.amount?.toFixed(2)}
                    </span>
                  </div>
                  {booking.payment?.flutterwaveRef && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Flutterwave Ref:</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {booking.payment.flutterwaveRef}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Actions / Simulation in Test Mode */}
              {booking.payment?.status !== 'paid' && (
                <div className="card" style={{ marginBottom: '2rem', borderColor: 'var(--warning)' }}>
                  <h3 style={{ color: 'var(--warning)', marginBottom: '0.5rem' }}>
                    Payment Processing / Test Simulator
                  </h3>
                  <p style={{ fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                    In production, Flutterwave Webhook securely marks this payment as &quot;paid&quot;.
                    During this pilot run, you can simulate payment completion:
                  </p>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleSimulatePayment('paid')}
                      disabled={simulating}
                      className="btn btn-primary"
                      id="simulate-payment-success-btn"
                    >
                      {simulating ? 'Processing...' : 'Simulate Payment Success (Paid)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulatePayment('failed')}
                      disabled={simulating}
                      className="btn btn-secondary"
                    >
                      Simulate Failure
                    </button>
                  </div>
                </div>
              )}

              {/* Refusal & Dispute Policy Handler */}
              <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>Dispute or Refund Inquiry</h3>
                <p style={{ fontSize: '0.88rem', marginBottom: '1rem' }}>
                  Have questions regarding payment discrepancies or cancellation terms?
                  Our system adheres to strict refusal rules and routes all refund questions directly to human reservations staff.
                </p>

                {!showDisputeRefusal ? (
                  <button
                    type="button"
                    onClick={handleTriggerDisputeRefusal}
                    className="btn btn-outline-gold btn-sm"
                    id="trigger-dispute-refusal-btn"
                  >
                    Inquire About Refund or Dispute (PRD Section 6 Refusal)
                  </button>
                ) : (
                  <RefusalCard
                    reason="refund_or_dispute"
                    message="Refund requests, payment disputes, and individual billing adjustments cannot be settled automatically and are handled directly by Mayamba Lodge reservations personnel."
                    whatsappNumber={refusalInfo?.whatsappNumber}
                    reservationsEmail={refusalInfo?.reservationsEmail}
                  />
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <Link href="/guest/bookings" className="btn btn-secondary">
                  View All My Bookings (FR-5)
                </Link>
                <Link href="/" className="btn btn-primary">
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <div>Booking not found.</div>
          )}
        </div>
      </main>

      <GuestFooter />
    </div>
  );
}
