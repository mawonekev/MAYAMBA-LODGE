'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import GuestNavbar from '@/components/GuestNavbar';
import GuestFooter from '@/components/GuestFooter';
import RefusalCard from '@/components/RefusalCard';

interface AvailableRoom {
  id: string;
  name: string;
  description: string;
  features: string[];
  photos: { id: string; url: string; caption: string | null }[];
  pricePerNight: number;
  currency: string;
  totalPrice: number;
  nights: number;
  roomsAvailable: number;
  isTestData: boolean;
}

export default function AvailabilityPage() {
  // Default to today and 2 days out
  const today = new Date().toISOString().split('T')[0];
  const nextTwoDays = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(nextTwoDays);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<AvailableRoom[]>([]);
  const [isMiss, setIsMiss] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setIsMiss(false);

    try {
      const res = await fetch(`/api/guest/availability?dateFrom=${dateFrom}&dateTo=${dateTo}`);
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to check availability.');
        setResults([]);
        setSearched(true);
      } else {
        setResults(data.results || []);
        setIsMiss(data.miss || false);
        setSearched(true);
      }
    } catch {
      setErrorMessage('Network error while checking room availability.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GuestNavbar />

      <main className="container" style={{ flex: 1, padding: '2.5rem 1rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
              Functional Requirement 1
            </span>
            <h1 style={{ marginBottom: '0.5rem' }}>Search Room Availability</h1>
            <p>
              Select your stay dates to check verified real-time room availability directly from Mayamba Lodge records.
            </p>
          </div>

          {/* Search Card */}
          <div className="card" style={{ marginBottom: '2.5rem' }}>
            <form onSubmit={handleSearch}>
              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="dateFrom" className="form-label">
                    Check-In Date
                  </label>
                  <input
                    type="date"
                    id="dateFrom"
                    className="form-input"
                    value={dateFrom}
                    min={today}
                    onChange={(e) => setDateFrom(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dateTo" className="form-label">
                    Check-Out Date
                  </label>
                  <input
                    type="date"
                    id="dateTo"
                    className="form-input"
                    value={dateTo}
                    min={dateFrom || today}
                    onChange={(e) => setDateTo(e.target.value)}
                    required
                  />
                </div>
              </div>

              {errorMessage && (
                <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={loading}
                id="search-availability-submit"
              >
                {loading ? 'Querying Lodge Records...' : 'Check Availability'}
              </button>
            </form>
          </div>

          {/* Results Display */}
          {searched && (
            <div>
              {isMiss ? (
                <div>
                  <div
                    className="card"
                    style={{
                      textAlign: 'center',
                      padding: '2rem',
                      marginBottom: '1.5rem',
                      borderColor: 'var(--warning)',
                    }}
                  >
                    <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>
                      🏜️
                    </span>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>
                      No Rooms Available For Selected Dates
                    </h2>
                    <p style={{ maxWidth: '540px', margin: '0 auto 1.5rem' }}>
                      All chalets are currently committed between {dateFrom} and {dateTo}.
                      This search miss has been recorded for our reservations team.
                    </p>
                  </div>

                  {/* PRD Section 6 Refusal Handoff */}
                  <RefusalCard
                    reason="records_silent"
                    message="All chalets are currently occupied for the dates you requested. Please contact our direct reservations desk to check for possible waitlist openings or alternative dates."
                  />
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <h2>Available Accommodations ({results.length})</h2>
                    <span className="badge badge-success">Live Inventory Confirmed</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {results.map((room) => {
                      const photoUrl =
                        room.photos[0]?.url ||
                        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';

                      return (
                        <div key={room.id} className="card" style={{ padding: '1.5rem' }}>
                          <div className="grid-2" style={{ gap: '1.5rem', alignItems: 'center' }}>
                            <div
                              style={{
                                height: '220px',
                                backgroundImage: `url(${photoUrl})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                borderRadius: 'var(--radius-md)',
                              }}
                            />

                            <div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'flex-start',
                                  marginBottom: '0.5rem',
                                }}
                              >
                                <h3>{room.name}</h3>
                                <span className="badge badge-gold">
                                  {room.roomsAvailable} room{room.roomsAvailable > 1 ? 's' : ''} free
                                </span>
                              </div>

                              <p
                                style={{
                                  fontSize: '0.88rem',
                                  marginBottom: '1rem',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {room.description}
                              </p>

                              <div style={{ marginBottom: '1.25rem' }}>
                                <div
                                  style={{
                                    fontSize: '1.3rem',
                                    fontWeight: '700',
                                    color: 'var(--gold-primary)',
                                  }}
                                >
                                  {room.currency} {room.totalPrice.toFixed(2)}
                                  <span
                                    style={{
                                      fontSize: '0.85rem',
                                      fontWeight: 'normal',
                                      color: 'var(--text-muted)',
                                    }}
                                  >
                                    {' '}
                                    total for {room.nights} night{room.nights > 1 ? 's' : ''} ({room.currency} {room.pricePerNight.toFixed(2)} / night)
                                  </span>
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <Link
                                  href={`/guest/booking/checkout?roomTypeId=${room.id}&stayDateFrom=${dateFrom}&stayDateTo=${dateTo}`}
                                  className="btn btn-primary"
                                  id={`book-now-${room.id}`}
                                >
                                  Reserve & Pay Now →
                                </Link>
                                <Link
                                  href={`/guest/rooms/${room.id}`}
                                  className="btn btn-secondary"
                                  id={`view-details-${room.id}`}
                                >
                                  Chalet Details
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
