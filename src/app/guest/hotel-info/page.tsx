import React from 'react';
import GuestNavbar from '@/components/GuestNavbar';
import GuestFooter from '@/components/GuestFooter';
import RefusalCard from '@/components/RefusalCard';
import prisma from '@/lib/prisma';
import { triggerHandoff } from '@/lib/refusal';

export const revalidate = 0;

export default async function HotelInfoPage() {
  const hotelInfo = await prisma.hotelInfo.findFirst();
  const photos = await prisma.photo.findMany({
    where: { roomTypeId: null },
  });

  if (!hotelInfo) {
    await triggerHandoff('records_silent', null, 'Hotel information fact sheet is missing.');
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <GuestNavbar />
        <main className="container" style={{ flex: 1, padding: '3rem 1rem' }}>
          <RefusalCard
            reason="records_silent"
            message="Mayamba Lodge fact sheet and schedule records are not currently loaded in the database. Please contact reservations directly."
          />
        </main>
        <GuestFooter />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GuestNavbar />

      <main className="container" style={{ flex: 1, padding: '2.5rem 1rem' }}>
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
              Functional Requirement 3
            </span>
            <h1 style={{ marginBottom: '0.5rem' }}>Lodge Information & Fact Sheet</h1>
            <p>Verified operational schedules, dining times, and property overview.</p>
          </div>

          {/* Schedule Highlights */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🕒</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Check-In Time
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#fff' }}>
                {hotelInfo.checkInTime}
              </div>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🧳</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Check-Out Time
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#fff' }}>
                {hotelInfo.checkOutTime}
              </div>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🍽️</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                {hotelInfo.outletName}
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--gold-primary)' }}>
                {hotelInfo.outletOpenTime} – {hotelInfo.outletCloseTime}
              </div>
            </div>
          </div>

          {/* Fact Sheet Card */}
          <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--gold-light)' }}>
              Mayamba Lodge Fact Sheet
            </h2>
            <div style={{ color: 'var(--text-main)', lineHeight: '1.8', fontSize: '1rem', whiteSpace: 'pre-line' }}>
              {hotelInfo.factSheet}
            </div>
          </div>

          {/* Lodge Photos */}
          {photos.length > 0 && (
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Lodge & River Deck Gallery</h3>
              <div className="grid-2" style={{ gap: '1rem' }}>
                {photos.map((photo) => (
                  <div key={photo.id} style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '240px',
                        backgroundImage: `url(${photo.url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    {photo.caption && (
                      <p style={{ fontSize: '0.8rem', padding: '0.5rem 0', color: 'var(--text-muted)' }}>
                        {photo.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Direct */}
          <div className="card" style={{ border: '1px solid var(--border-gold)' }}>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--gold-light)' }}>Direct Reservations Team</h3>
            <p style={{ marginBottom: '1.25rem' }}>
              All questions regarding special safari arrangements, private transfers, or reservation assistance are handled directly by our front desk team.
            </p>

            <div className="refusal-contact-grid">
              <a
                href={`https://wa.me/${hotelInfo.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="refusal-contact-card"
                id="info-whatsapp-link"
              >
                <span className="refusal-icon">💬</span>
                <div>
                  <div className="refusal-label">WhatsApp Front Desk</div>
                  <div className="refusal-value">{hotelInfo.whatsappNumber}</div>
                </div>
              </a>

              <a
                href={`mailto:${hotelInfo.reservationsEmail}`}
                className="refusal-contact-card"
                id="info-email-link"
              >
                <span className="refusal-icon">✉️</span>
                <div>
                  <div className="refusal-label">Reservations Email</div>
                  <div className="refusal-value">{hotelInfo.reservationsEmail}</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </main>

      <GuestFooter />
    </div>
  );
}
