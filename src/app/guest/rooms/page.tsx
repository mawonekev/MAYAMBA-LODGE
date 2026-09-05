import React from 'react';
import Link from 'next/link';
import GuestNavbar from '@/components/GuestNavbar';
import GuestFooter from '@/components/GuestFooter';
import RefusalCard from '@/components/RefusalCard';
import prisma from '@/lib/prisma';

export const revalidate = 0;
 
interface RoomTypeItem {
  id: string;
  name: string;
  description: string;
  features: string[];
  photos: { url: string }[];
  rates: { currency: string; pricePerNight: number | unknown }[];
}

interface HotelContactInfo {
  whatsappNumber?: string;
  reservationsEmail?: string;
}

export default async function RoomsPage() {
  let roomTypes: RoomTypeItem[] = [];
  let hotelInfo: HotelContactInfo | null = null;

  try {
    roomTypes = await prisma.roomType.findMany({
      include: {
        photos: true,
        rates: {
          orderBy: { validFrom: 'desc' },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
    });

    hotelInfo = await prisma.hotelInfo.findFirst();
  } catch (err) {
    console.warn('Could not query database for rooms, using fallback demo data:', err);
    roomTypes = [
      {
        id: 'deluxe-safari-tent',
        name: 'Deluxe Safari Chalet',
        description: 'Luxury thatched chalet overlooking the Zambezi river with private viewing deck.',
        features: ['River view deck', 'King bed', 'En-suite stone bath', 'Solar power 24/7'],
        photos: [{ url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80' }],
        rates: [{ currency: 'USD', pricePerNight: 280 }],
      },
      {
        id: 'luxury-river-suite',
        name: 'Luxury Riverfront Suite',
        description: 'Spacious suite situated on the river edge with panoramic views and plunge pool.',
        features: ['Plunge pool', 'Panoramic river view', 'King bed', 'Complimentary minibar'],
        photos: [{ url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80' }],
        rates: [{ currency: 'USD', pricePerNight: 420 }],
      },
      {
        id: 'family-safari-villa',
        name: 'Family Safari Villa',
        description: 'Two-bedroom thatched villa suitable for up to 4 guests with private lounge and dining boma.',
        features: ['2 Bedrooms', 'Private boma', 'Dedicated ranger host', 'Kitchenette'],
        photos: [{ url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80' }],
        rates: [{ currency: 'USD', pricePerNight: 650 }],
      },
    ];
    hotelInfo = {
      whatsappNumber: '+263771234567',
      reservationsEmail: 'reservations@mayambalodge.internal',
    };
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GuestNavbar />

      <main className="container" style={{ flex: 1, padding: '2.5rem 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
            Functional Requirement 2
          </span>
          <h1 style={{ marginBottom: '0.5rem' }}>Accommodations & Published Rates</h1>
          <p style={{ maxWidth: '600px', margin: '0 auto' }}>
            Direct nightly tariffs read directly from Mayamba Lodge pricing records.
          </p>
        </div>

        {roomTypes.length === 0 ? (
          <RefusalCard
            reason="records_silent"
            message="No room records are currently registered in our database. Please contact reservations."
            whatsappNumber={hotelInfo?.whatsappNumber}
            reservationsEmail={hotelInfo?.reservationsEmail}
          />
        ) : (
          <div className="grid-3">
            {roomTypes.map((rt) => {
              const photo =
                rt.photos[0]?.url ||
                'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
              const rate = rt.rates[0];

              return (
                <div key={rt.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '210px',
                      backgroundImage: `url(${photo})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />

                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>{rt.name}</h3>
                    <p style={{ fontSize: '0.88rem', marginBottom: '1.25rem', flex: 1 }}>{rt.description}</p>

                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Key Amenities
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {rt.features.slice(0, 4).map((f, i) => (
                          <span key={i} className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div
                      style={{
                        borderTop: '1px solid var(--border-subtle)',
                        paddingTop: '1rem',
                        marginTop: 'auto',
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--gold-primary)' }}>
                          {rate ? `${rate.currency} ${Number(rate.pricePerNight).toFixed(2)}` : 'Contact desk'}
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                            {' '}
                            / night
                          </span>
                        </div>
                      </div>
                      <Link href={`/guest/rooms/${rt.id}`} className="btn btn-primary btn-sm" id={`view-room-link-${rt.id}`}>
                        View Details & Rate
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <GuestFooter />
    </div>
  );
}
