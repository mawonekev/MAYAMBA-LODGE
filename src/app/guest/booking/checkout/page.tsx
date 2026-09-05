'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import GuestNavbar from '@/components/GuestNavbar';
import GuestFooter from '@/components/GuestFooter';
import RefusalCard from '@/components/RefusalCard';

interface RoomTypeData {
  id: string;
  name: string;
  description: string;
  features: string[];
  currentRate: {
    pricePerNight: number;
    currency: string;
  } | null;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const roomTypeId = searchParams.get('roomTypeId') || '';
  const stayDateFrom = searchParams.get('stayDateFrom') || '';
  const stayDateTo = searchParams.get('stayDateTo') || '';

  const [guest, setGuest] = useState<{ id: string; phoneNumber: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [room, setRoom] = useState<RoomTypeData | null>(null);
  const [loadingRoom, setLoadingRoom] = useState(true);

  // Inline auth state for unauthenticated guests
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'otp'>('signin');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Booking execution state
  const [processingBooking, setProcessingBooking] = useState(false);
  const [bookingError, setBookingError] = useState<{ error?: string; message?: string } | null>(null);

  // Check guest auth
  useEffect(() => {
    fetch('/api/guest/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated && d.guest) {
          setGuest(d.guest);
        } else {
          setGuest(null);
        }
      })
      .finally(() => setCheckingAuth(false));
  }, []);

  // Fetch room details
  useEffect(() => {
    if (!roomTypeId) return;
    fetch(`/api/guest/rooms/${roomTypeId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.roomType) setRoom(d.roomType);
      })
      .finally(() => setLoadingRoom(false));
  }, [roomTypeId]);

  // Handle inline sign-in
  const handleInlineSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/guest/auth/signin-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Failed to sign in.');
      } else {
        setGuest(data.guest);
      }
    } catch {
      setAuthError('Connection error.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle inline sign-up
  const handleInlineSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/guest/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Failed to sign up.');
      } else {
        setGuest(data.guest);
      }
    } catch {
      setAuthError('Connection error.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/guest/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Failed to send OTP.');
      } else {
        setOtpSent(true);
        if (data.devCode) {
          setOtpCode(data.devCode);
        }
      }
    } catch {
      setAuthError('Connection error.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/guest/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone, code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Invalid code.');
      } else {
        setGuest(data.guest);
      }
    } catch {
      setAuthError('Connection error.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Booking & Payment Initiation
  const handleConfirmAndPay = async (simulate: boolean = false) => {
    setProcessingBooking(true);
    setBookingError(null);

    try {
      const res = await fetch('/api/guest/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomTypeId,
          stayDateFrom,
          stayDateTo,
          paymentMethod: simulate ? 'test_simulate' : 'flutterwave',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setBookingError({
          error: data.error,
          message: data.message || 'Unable to complete reservation.',
        });
      } else {
        // Navigate to payment confirmation screen
        router.push(`/guest/payment/${data.booking.id}`);
      }
    } catch {
      setBookingError({
        error: 'network_error',
        message: 'Network error occurred while reserving room.',
      });
    } finally {
      setProcessingBooking(false);
    }
  };

  if (!roomTypeId || !stayDateFrom || !stayDateTo) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <h2>Incomplete Booking Request</h2>
        <p style={{ margin: '1rem 0' }}>Please select dates from the availability calendar.</p>
        <Link href="/guest/availability" className="btn btn-primary">
          Open Availability Search
        </Link>
      </div>
    );
  }

  // Calculate nights
  const dFrom = new Date(stayDateFrom);
  const dTo = new Date(stayDateTo);
  const nights = Math.max(1, Math.round((dTo.getTime() - dFrom.getTime()) / (1000 * 60 * 60 * 24)));
  const pricePerNight = room?.currentRate?.pricePerNight || 0;
  const currency = room?.currentRate?.currency || 'USD';
  const totalPrice = pricePerNight * nights;

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
          FR-4 Atomic Booking & Payment
        </span>
        <h1>Reserve Your Chalet</h1>
        <p>Review dates, lock in your guaranteed rate, and proceed to payment.</p>
      </div>

      <div className="grid-2" style={{ gap: '2rem', alignItems: 'start' }}>
        {/* Booking Summary Card */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--gold-light)' }}>Stay Summary</h3>
          {loadingRoom ? (
            <p>Loading chalet pricing...</p>
          ) : room ? (
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', marginBottom: '0.25rem' }}>
                {room.name}
              </div>
              <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>{room.description}</p>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Check-In:</span>
                  <span style={{ fontWeight: '600' }}>{stayDateFrom}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Check-Out:</span>
                  <span style={{ fontWeight: '600' }}>{stayDateTo}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Duration:</span>
                  <span style={{ fontWeight: '600' }}>{nights} night{nights > 1 ? 's' : ''}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Rate per night:</span>
                  <span style={{ fontWeight: '600' }}>{currency} {pricePerNight.toFixed(2)}</span>
                </div>
              </div>

              <div
                style={{
                  borderTop: '2px solid var(--border-gold)',
                  paddingTop: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>Total Amount Due:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--gold-primary)' }}>
                  {currency} {totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <p>Room record not found.</p>
          )}
        </div>

        {/* Guest Authentication & Checkout Action */}
        <div>
          {checkingAuth ? (
            <div className="card">Checking guest account...</div>
          ) : guest ? (
            <div className="card" style={{ border: '1px solid var(--border-gold)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span className="badge badge-success">Signed In</span>
                <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{guest.phoneNumber}</span>
              </div>

              <p style={{ fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                Your reservation will be created under your phone number. Availability will be atomically re-verified in real time.
              </p>

              {bookingError && (
                <div style={{ marginBottom: '1.25rem' }}>
                  {bookingError.error === 'room_no_longer_available' ? (
                    <RefusalCard
                      reason="records_silent"
                      message="This room type became fully booked at the exact moment of payment. As guaranteed by PRD FR-4, your card has not been charged."
                    />
                  ) : (
                    <div className="badge badge-danger" style={{ width: '100%', padding: '0.75rem' }}>
                      {bookingError.message}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => handleConfirmAndPay(true)}
                  disabled={processingBooking}
                  className="btn btn-primary btn-block btn-lg"
                  id="checkout-confirm-pay-btn"
                >
                  {processingBooking ? 'Locking In Reservation...' : 'Lock In & Pay (Test Demonstration)'}
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmAndPay(false)}
                  disabled={processingBooking}
                  className="btn btn-secondary btn-block"
                  id="checkout-flutterwave-btn"
                >
                  Pay via Flutterwave Gateway (Live)
                </button>
              </div>
            </div>
          ) : (
            /* Inline Sign In / Sign Up Form */
            <div className="card" style={{ border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${authMode === 'signin' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => { setAuthMode('signin'); setAuthError(''); }}
                >
                  Password Sign In
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${authMode === 'otp' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => { setAuthMode('otp'); setAuthError(''); }}
                >
                  SMS One-Time Code
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${authMode === 'signup' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                >
                  New Guest Sign Up
                </button>
              </div>

              {authError && (
                <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  {authError}
                </div>
              )}

              {authMode === 'signin' && (
                <form onSubmit={handleInlineSignIn}>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+263771234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
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
                    />
                  </div>
                  <button type="submit" disabled={authLoading} className="btn btn-primary btn-block">
                    {authLoading ? 'Signing In...' : 'Sign In & Continue'}
                  </button>
                </form>
              )}

              {authMode === 'signup' && (
                <form onSubmit={handleInlineSignUp}>
                  <div className="form-group">
                    <label className="form-label">Mobile Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+263771234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Choose Password (min 6 chars)</label>
                    <input
                      type="password"
                      className="form-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" disabled={authLoading} className="btn btn-primary btn-block">
                    {authLoading ? 'Creating Account...' : 'Create Account & Continue'}
                  </button>
                </form>
              )}

              {authMode === 'otp' && (
                <div>
                  {!otpSent ? (
                    <form onSubmit={handleSendOtp}>
                      <div className="form-group">
                        <label className="form-label">Mobile Phone Number</label>
                        <input
                          type="tel"
                          className="form-input"
                          placeholder="+263771234567"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />
                      </div>
                      <button type="submit" disabled={authLoading} className="btn btn-primary btn-block">
                        {authLoading ? 'Sending SMS...' : 'Send SMS Verification Code'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp}>
                      <p style={{ fontSize: '0.85rem', marginBottom: '1rem', color: 'var(--gold-light)' }}>
                        SMS code sent to {phone}. Check console or phone.
                      </p>
                      <div className="form-group">
                        <label className="form-label">6-Digit Code</label>
                        <input
                          type="text"
                          className="form-input"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          required
                        />
                      </div>
                      <button type="submit" disabled={authLoading} className="btn btn-primary btn-block">
                        {authLoading ? 'Verifying...' : 'Verify Code & Continue'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GuestNavbar />
      <main className="container" style={{ flex: 1, padding: '2.5rem 1rem' }}>
        <Suspense fallback={<div className="card">Loading checkout parameters...</div>}>
          <CheckoutContent />
        </Suspense>
      </main>
      <GuestFooter />
    </div>
  );
}
