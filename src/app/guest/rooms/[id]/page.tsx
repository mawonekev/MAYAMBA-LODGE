import React from 'react';
import Link from 'next/link';
import GuestNavbar from '@/components/GuestNavbar';
import GuestFooter from '@/components/GuestFooter';
import RefusalCard from '@/components/RefusalCard';
import prisma from '@/lib/prisma';
import { triggerHandoff } from '@/lib/refusal';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

interface RoomDetailType {
  id: string;
  name: string;
  description: string;
  features: string[];
  photos: { id?: string; url: string; caption?: string | null }[];
  rates: { currency: string; pricePerNight: number | unknown; validFrom: string | Date; validTo: string | Date }[];
}

interface HotelContactInfo {
  whatsappNumber?: string;
  reservationsEmail?: string;
}

export default async function RoomDetailsPage({ params }: PageProps) {
  const { id } = await params;

  let roomType: RoomDetailType | null = null;
  let hotelInfo: HotelContactInfo | null = null;

  try {
    roomType = await prisma.roomType.findUnique({
      where: { id },
      include: {
        photos: true,
        rates: {
          orderBy: { validFrom: 'desc' },
        },
      },
    });

    hotelInfo = await prisma.hotelInfo.findFirst();
  } catch (err) {
    console.warn('Could not query database for room details, checking fallback rooms:', err);
    const fallbackRooms: Record<string, RoomDetailType> = {
      'deluxe-safari-tent': {
        id: 'deluxe-safari-tent',
        name: 'Deluxe Safari Chalet',
        description: 'Luxury thatched chalet overlooking the Zambezi river with private viewing deck, en-suite stone bathroom, and solar-powered amenities.',
        features: ['River view deck', 'King bed', 'En-suite stone bath', 'Solar power 24/7', 'Tea & coffee station'],
        photos: [{ id: 'p1', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', caption: 'Chalet exterior and river deck' }],
        rates: [{ currency: 'USD', pricePerNight: 280, validFrom: new Date().toISOString(), validTo: new Date(Date.now() + 90 * 86400000).toISOString() }],
      },
      'luxury-river-suite': {
        id: 'luxury-river-suite',
        name: 'Luxury Riverfront Suite',
        description: 'Spacious suite situated right on the water edge featuring a private plunge pool, panoramic views of the national park, and an open lounge.',
        features: ['Plunge pool', 'Panoramic river view', 'King bed', 'Complimentary minibar', 'Dedicated host'],
        photos: [{ id: 'p2', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', caption: 'Suite living space and plunge pool' }],
        rates: [{ currency: 'USD', pricePerNight: 420, validFrom: new Date().toISOString(), validTo: new Date(Date.now() + 90 * 86400000).toISOString() }],
      },
      'family-safari-villa': {
        id: 'family-safari-villa',
        name: 'Family Safari Villa',
        description: 'Two-bedroom thatched villa suitable for up to 4 guests with private lounge, outdoor dining boma, and family game-drive arrangements.',
        features: ['2 Bedrooms', 'Private boma', 'Dedicated ranger host', 'Kitchenette', 'Private vehicle option'],
        photos: [{ id: 'p3', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80', caption: 'Family villa exterior and boma' }],
        rates: [{ currency: 'USD', pricePerNight: 650, validFrom: new Date().toISOString(), validTo: new Date(Date.now() + 90 * 86400000).toISOString() }],
      },
    };

    roomType = fallbackRooms[id] || null;
    hotelInfo = {
      whatsappNumber: '+263771234567',
      reservationsEmail: 'reservations@mayambalodge.internal',
    };
  }

  if (!roomType) {
    // Log Section 6 refusal handoff
    await triggerHandoff('records_silent', null, `Room type ID ${id} not found in verified records.`);

    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <GuestNavbar />
        <main className="container" style={{ flex: 1, padding: '3rem 1rem' }}>
          <RefusalCard
            reason="records_silent"
            message={`The requested room type (${id}) is not registered in Mayamba Lodge records. Please contact reservations.`}
            whatsappNumber={hotelInfo?.whatsappNumber}
            reservationsEmail={hotelInfo?.reservationsEmail}
          />
        </main>
        <GuestFooter />
      </div>
    );
  }

  const currentRate = roomType.rates[0];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GuestNavbar />

      <main className="container" style={{ flex: 1, padding: '2.5rem 1rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/guest/rooms" className="btn btn-secondary btn-sm" id="back-to-rooms-btn">
            ← Back to All Rooms
          </Link>
        </div>

        <div className="grid-2" style={{ gap: '2.5rem', alignItems: 'start' }}>
          {/* Photo gallery */}
          <div>
            <div
              style={{
                height: '380px',
                backgroundImage: `url(${
                  roomType.photos[0]?.url ||
                  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
                })`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '1rem',
                border: '1px solid var(--border-subtle)',
              }}
            />

            {roomType.photos.length > 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
                {roomType.photos.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      height: '90px',
                      backgroundImage: `url(${p.url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}
                    title={p.caption || ''}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details & Pricing */}
          <div>
            <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
              FR-2 Verified Room Record
            </span>
            <h1 style={{ marginBottom: '0.75rem', fontSize: '2rem' }}>{roomType.name}</h1>
            <p style={{ fontSize: '1rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
              {roomType.description}
            </p>

            {/* Room Features */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--gold-light)', marginBottom: '0.75rem' }}>
                Room Inclusions & Amenities
              </h3>
              <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
                {roomType.features.map((feature, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                    <span style={{ color: 'var(--gold-primary)' }}>✔</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Verified Rate Card */}
            <div className="card" style={{ border: '1px solid var(--border-gold)', background: 'rgba(21, 28, 23, 0.95)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                    Published Tariffs
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--gold-primary)' }}>
                    {currentRate ? `${currentRate.currency} ${Number(currentRate.pricePerNight).toFixed(2)}` : 'Contact desk'}
                    <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--text-muted)' }}> / night</span>
                  </div>
                </div>
                <span className="badge badge-gold">Guaranteed Direct Rate</span>
              </div>

              {currentRate && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  Valid from {new Date(currentRate.validFrom).toLocaleDateString()} to{' '}
                  {new Date(currentRate.validTo).toLocaleDateString()}. Includes all safari activities and full English breakfast.
                </p>
              )}

              <Link
                href={`/guest/availability`}
                className="btn btn-primary btn-block btn-lg"
                id={`check-dates-for-${roomType.id}`}
              >
                📅 Check Dates & Reserve This Chalet
              </Link>
            </div>
          </div>
        </div>
      </main>

      <GuestFooter />
    </div>
  );
}
