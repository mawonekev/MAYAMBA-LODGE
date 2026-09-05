import React from 'react';
import Link from 'next/link';
import GuestNavbar from '@/components/GuestNavbar';
import GuestFooter from '@/components/GuestFooter';
import prisma from '@/lib/prisma';

export const revalidate = 0;

export default async function HomePage() {
  const roomTypes = await prisma.roomType.findMany({
    include: {
      photos: { take: 1 },
      rates: {
        orderBy: { validFrom: 'desc' },
        take: 1,
      },
    },
  });

  const hotelInfo = await prisma.hotelInfo.findFirst();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GuestNavbar />

      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <section className="hero">
          <div className="container">
            <div className="hero-subtitle">Authentic Zimbabwean Wilderness</div>
            <h1 className="hero-title">Experience Untamed River Luxury</h1>
            <p className="hero-desc">
              Perched along the scenic riverbank, Mayamba Lodge offers eco-conscious solar-powered
              chalets, private plunge pools, and intimate wildlife encounters.
            </p>

            {/* Quick Availability Action */}
            <div
              className="card"
              style={{
                maxWidth: '650px',
                margin: '0 auto 2.5rem',
                border: '1px solid var(--border-gold)',
                background: 'rgba(21, 28, 23, 0.95)',
              }}
            >
              <h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem', color: 'var(--gold-light)' }}>
                Check Real-Time Room Availability
              </h3>
              <p style={{ fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                Instant live inventory lookup against lodge reservations. No middleman, zero AI estimates.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/guest/availability" className="btn btn-primary btn-lg" id="home-check-dates-btn">
                  📅 Open Availability Calendar
                </Link>
                <Link href="/guest/rooms" className="btn btn-secondary btn-lg" id="home-view-chalets-btn">
                  Browse Chalets & Rates
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Chalets */}
        <section className="container" style={{ padding: '2rem 1rem 4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Private Accommodations</h2>
            <p>Direct rates read straight from lodge pricing records.</p>
          </div>

          <div className="grid-3">
            {roomTypes.map((rt) => {
              const photo = rt.photos[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80';
              const rate = rt.rates[0];

              return (
                <div key={rt.id} className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
                  <div
                    style={{
                      height: '200px',
                      backgroundImage: `url(${photo})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                      }}
                    >
                      <span className="badge badge-gold">Verified Rate</span>
                    </div>
                  </div>

                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{rt.name}</h3>
                    <p style={{ fontSize: '0.88rem', marginBottom: '1rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {rt.description}
                    </p>

                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: 'auto', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>From</span>
                        <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--gold-primary)' }}>
                          {rate ? `${rate.currency} ${Number(rate.pricePerNight).toFixed(2)}` : 'Contact desk'}
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}> / night</span>
                        </div>
                      </div>
                      <Link href={`/guest/rooms/${rt.id}`} className="btn btn-secondary btn-sm" id={`view-room-${rt.id}`}>
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Lodge Information Highlight */}
        {hotelInfo && (
          <section style={{ background: '#111713', borderTop: '1px solid var(--border-subtle)', padding: '3.5rem 0' }}>
            <div className="container">
              <div className="grid-2" style={{ alignItems: 'center' }}>
                <div>
                  <span className="badge badge-gold" style={{ marginBottom: '0.75rem' }}>
                    Lodge Overview
                  </span>
                  <h2 style={{ marginBottom: '1rem' }}>Riverside Dining & Wildlife Sanctuary</h2>
                  <p style={{ marginBottom: '1.25rem', lineHeight: '1.7' }}>
                    {hotelInfo.factSheet}
                  </p>
                  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Check-In</span>
                      <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff' }}>{hotelInfo.checkInTime}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Check-Out</span>
                      <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff' }}>{hotelInfo.checkOutTime}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Restaurant</span>
                      <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff' }}>{hotelInfo.outletName} ({hotelInfo.outletOpenTime} - {hotelInfo.outletCloseTime})</p>
                    </div>
                  </div>
                  <Link href="/guest/hotel-info" className="btn btn-outline-gold" id="home-view-factsheet-btn">
                    Read Complete Fact Sheet
                  </Link>
                </div>

                <div className="card" style={{ border: '1px solid var(--border-gold)' }}>
                  <h3 style={{ color: 'var(--gold-light)', marginBottom: '0.75rem' }}>Direct Reservations Desk</h3>
                  <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Need personal assistance with safari transfers, custom dietary needs, or group itineraries? Contact the reservations team directly.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <a
                      href={`https://wa.me/${hotelInfo.whatsappNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      id="home-whatsapp-btn"
                    >
                      💬 WhatsApp: {hotelInfo.whatsappNumber}
                    </a>
                    <a
                      href={`mailto:${hotelInfo.reservationsEmail}`}
                      className="btn btn-secondary"
                      id="home-email-btn"
                    >
                      ✉️ {hotelInfo.reservationsEmail}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <GuestFooter />
    </div>
  );
}
