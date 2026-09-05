import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Mayamba Lodge dummy test data...');

  // 1. Clean existing test data if re-seeding
  await prisma.payment.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.contentFlag.deleteMany({});
  await prisma.otpCode.deleteMany({});
  await prisma.handoff.deleteMany({});
  await prisma.searchMiss.deleteMany({});
  await prisma.availabilitySearchEvent.deleteMany({});
  await prisma.availability.deleteMany({});
  await prisma.rate.deleteMany({});
  await prisma.photo.deleteMany({});
  await prisma.roomType.deleteMany({});
  await prisma.hotelInfo.deleteMany({});

  // 2. HotelInfo (marked isTestData: true)
  const hotelInfo = await prisma.hotelInfo.create({
    data: {
      factSheet:
        'Mayamba Lodge is an exclusive riverside safari sanctuary set along the pristine river bend. Powered 100% by solar energy with battery backup and silent auxiliary generators. Features an infinity pool overlooking the floodplain, a boma fire pit, curated wine cellar, open-air lounge, and a library of African wildlife literature. Activities include guided walking safaris, morning and evening game drives, bird watching excursions, and river boat cruises. All stays include full English breakfast, afternoon tea, and high-speed Wi-Fi in the main lounge.',
      checkInTime: '14:00',
      checkOutTime: '10:00',
      outletOpenTime: '06:30',
      outletCloseTime: '22:00',
      outletName: 'Baobab Terrace Restaurant & River Deck',
      whatsappNumber: '+263771234567',
      reservationsEmail: 'reservations@mayambalodge.internal',
      isTestData: true,
    },
  });
  console.log('Created HotelInfo:', hotelInfo.id);

  // 3. RoomTypes (marked isTestData: true)
  const chalet = await prisma.roomType.create({
    data: {
      name: 'Luxury River Chalet',
      description:
        'A spacious, handcrafted stone and thatch chalet with an expansive private deck hovering over the river. Features a plush king bed with mosquito drapery, handcrafted teak furnishings, a luxury en-suite bathroom with dual vanities, and a private open-air rainfall shower.',
      features: [
        'King-size Bed',
        'Private Riverfront Deck',
        'Outdoor Rainfall Shower',
        'En-suite Deep Soaking Tub',
        'Solar Air Conditioning & Ceiling Fan',
        'Artisanal Coffee & Tea Station',
        'Stocked Minibar',
        'Digital Laptop Safe',
      ],
      isTestData: true,
    },
  });

  const tent = await prisma.roomType.create({
    data: {
      name: 'Executive Safari Suite',
      description:
        'An elevated canvas glamping pavilion set under mature mahogany trees with panoramic savanna vistas. Boasts an expansive timber deck, private plunge pool, outdoor daybed, deep clawfoot bathtub, and panoramic mesh walls for stargazing.',
      features: [
        'King or Twin Beds',
        'Private Plunge Pool',
        'Panoramic Timber Viewing Deck',
        'Freestanding Clawfoot Tub',
        'En-suite Bathroom with Hot Water',
        'Eco-friendly Solar Fans',
        'Private Dining Terrace',
        'Binoculars & Stargazing Map',
      ],
      isTestData: true,
    },
  });

  const villa = await prisma.roomType.create({
    data: {
      name: 'Family Bush Villa',
      description:
        'A private two-bedroom sanctuary ideal for families or small groups. Includes a central open-plan lounge, dining veranda, private boma fire pit, plunge pool, and dedicated butler pantry. Each bedroom has its own private en-suite bathroom.',
      features: [
        '2 En-suite Bedrooms (1 King, 2 Twins)',
        'Central Living & Dining Lounge',
        'Private Boma Fire Pit & Sundowner Deck',
        'Private Family Plunge Pool',
        'Full Air Conditioning in Bedrooms',
        'Butler Pantry & Espresso Bar',
        'Child-friendly safari amenities',
        'Direct savanna garden access',
      ],
      isTestData: true,
    },
  });

  console.log('Created RoomTypes:', chalet.name, tent.name, villa.name);

  // 4. Photos (marked isTestData: true)
  await prisma.photo.createMany({
    data: [
      {
        url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        caption: 'Luxury River Chalet exterior facing the peaceful river bend',
        roomTypeId: chalet.id,
        isTestData: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
        caption: 'Chalet bedroom with king bed and handcrafted teak decor',
        roomTypeId: chalet.id,
        isTestData: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
        caption: 'Private timber deck with uninterrupted river views',
        roomTypeId: chalet.id,
        isTestData: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
        caption: 'Executive Safari Suite canvas pavilion on elevated teak platform',
        roomTypeId: tent.id,
        isTestData: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
        caption: 'Private plunge pool on the safari deck overlooking the bush',
        roomTypeId: tent.id,
        isTestData: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
        caption: 'Family Bush Villa main entrance and surrounding indigenous trees',
        roomTypeId: villa.id,
        isTestData: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        caption: 'Spacious family lounge opening out to the private boma',
        roomTypeId: villa.id,
        isTestData: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
        caption: 'Baobab Terrace dining area under lantern light',
        roomTypeId: null,
        isTestData: true,
      },
    ],
  });

  // 5. Rates (marked isTestData: true)
  // Covered for 2 years (2026-01-01 to 2027-12-31)
  // TODO-DECISION: PRD Section 14 Question 1 lists currency as an open question; defaulting to USD as standard for Zimbabwe safari lodge bookings.
  const validFrom = new Date('2026-01-01T00:00:00.000Z');
  const validTo = new Date('2027-12-31T23:59:59.000Z');

  await prisma.rate.createMany({
    data: [
      {
        roomTypeId: chalet.id,
        pricePerNight: 280.0,
        currency: 'USD',
        validFrom,
        validTo,
        isTestData: true,
      },
      {
        roomTypeId: tent.id,
        pricePerNight: 350.0,
        currency: 'USD',
        validFrom,
        validTo,
        isTestData: true,
      },
      {
        roomTypeId: villa.id,
        pricePerNight: 520.0,
        currency: 'USD',
        validFrom,
        validTo,
        isTestData: true,
      },
    ],
  });

  // 6. Availability (marked isTestData: true)
  // Seed availability for 90 days from today (2026-09-01 to 2026-11-30)
  const startDate = new Date('2026-09-01T00:00:00.000Z');
  const availabilityRows = [];

  for (let i = 0; i < 90; i++) {
    const curDate = new Date(startDate);
    curDate.setUTCDate(startDate.getUTCDate() + i);

    // Chalet: 5 rooms total, open between 2 and 5 (some sold out or near full)
    const chaletOpen = i === 12 || i === 13 ? 0 : (i % 4) + 2;
    // Suite: 4 rooms total
    const tentOpen = i === 20 ? 0 : (i % 3) + 1;
    // Villa: 2 villas total
    const villaOpen = (i % 2) + 1;

    availabilityRows.push(
      {
        roomTypeId: chalet.id,
        date: curDate,
        roomsOpen: chaletOpen,
        isTestData: true,
      },
      {
        roomTypeId: tent.id,
        date: curDate,
        roomsOpen: tentOpen,
        isTestData: true,
      },
      {
        roomTypeId: villa.id,
        date: curDate,
        roomsOpen: villaOpen,
        isTestData: true,
      }
    );
  }

  await prisma.availability.createMany({
    data: availabilityRows,
  });

  // 7. Staff Admin Account (for FR-8 to FR-13)
  const existingStaff = await prisma.staff.findUnique({
    where: { username: 'admin' },
  });
  if (!existingStaff) {
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    await prisma.staff.create({
      data: {
        username: 'admin',
        passwordHash: adminPasswordHash,
        role: 'owner',
      },
    });
    console.log('Created default staff account: admin / admin123');
  }

  console.log('Seeding complete! Database is fully populated with test data.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
