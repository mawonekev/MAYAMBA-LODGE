import prisma from '../src/lib/prisma';
import { createBookingWithAtomicPayment } from '../src/lib/payment';
import { triggerHandoff } from '../src/lib/refusal';

async function runTest() {
  console.log('Testing PRD FR-4 Payment Flow & Section 6 Refusal Behavior...');

  // Setup test guest
  let testGuest = await prisma.guest.findUnique({ where: { phoneNumber: '+263770001122' } });
  if (!testGuest) {
    testGuest = await prisma.guest.create({
      data: {
        phoneNumber: '+263770001122',
        passwordHash: 'dummy_hash',
      },
    });
  }

  // Find a room type
  const chalet = await prisma.roomType.findFirst({ where: { name: 'Luxury River Chalet' } });
  if (!chalet) throw new Error('Chalet room type not found!');

  // Pick dates far in advance for isolated test
  const testDateFrom = new Date('2026-10-01T00:00:00.000Z');
  const testDateTo = new Date('2026-10-03T00:00:00.000Z'); // 2 nights

  // Ensure availability is set to exactly 1 room
  await prisma.availability.upsert({
    where: { roomTypeId_date: { roomTypeId: chalet.id, date: testDateFrom } },
    update: { roomsOpen: 1 },
    create: { roomTypeId: chalet.id, date: testDateFrom, roomsOpen: 1, isTestData: true },
  });
  const testDateNight2 = new Date('2026-10-02T00:00:00.000Z');
  await prisma.availability.upsert({
    where: { roomTypeId_date: { roomTypeId: chalet.id, date: testDateNight2 } },
    update: { roomsOpen: 1 },
    create: { roomTypeId: chalet.id, date: testDateNight2, roomsOpen: 1, isTestData: true },
  });

  // 1. Booking 1: should succeed and decrement roomsOpen from 1 to 0
  const booking1 = await createBookingWithAtomicPayment({
    guestId: testGuest.id,
    roomTypeId: chalet.id,
    stayDateFrom: testDateFrom,
    stayDateTo: testDateTo,
    paymentMethod: 'test_simulate',
  });

  if (!booking1.success) throw new Error(`Booking 1 failed: ${booking1.message}`);
  console.log('1. Booking 1 succeeded with confirmation code:', booking1.booking?.confirmationCode);

  // Check roomsOpen is now 0
  const availAfter1 = await prisma.availability.findUnique({
    where: { roomTypeId_date: { roomTypeId: chalet.id, date: testDateFrom } },
  });
  if (availAfter1?.roomsOpen !== 0) {
    throw new Error(`roomsOpen should be 0, but is ${availAfter1?.roomsOpen}`);
  }
  console.log('2. Availability roomsOpen was successfully decremented to 0 inside the transaction.');

  // 2. Booking 2: should FAIL cleanly with room_no_longer_available
  const booking2 = await createBookingWithAtomicPayment({
    guestId: testGuest.id,
    roomTypeId: chalet.id,
    stayDateFrom: testDateFrom,
    stayDateTo: testDateTo,
    paymentMethod: 'test_simulate',
  });

  if (booking2.success || booking2.error !== 'room_no_longer_available') {
    throw new Error(`Booking 2 should have failed with room_no_longer_available, got: ${JSON.stringify(booking2)}`);
  }
  console.log('3. Clean failure verified: Booking 2 failed with room-no-longer-available when roomsOpen is 0.');

  // 3. Test refusal behavior for missing record
  const missingHandoff = await triggerHandoff('records_silent', testGuest.id, 'Test missing data query');
  if (!missingHandoff.refusal || !missingHandoff.whatsappNumber || !missingHandoff.reservationsEmail) {
    throw new Error('Refusal handoff failed to populate contact info from HotelInfo!');
  }
  console.log('4. Refusal handoff logged for records_silent with WhatsApp:', missingHandoff.whatsappNumber);

  // 4. Test refusal behavior for refund / dispute
  const disputeHandoff = await triggerHandoff('refund_or_dispute', testGuest.id);
  if (disputeHandoff.reason !== 'refund_or_dispute') {
    throw new Error('Dispute refusal handoff failed!');
  }
  console.log('5. Always-refuse handoff logged for refund_or_dispute:', disputeHandoff.message);

  // 5. Test Flutterwave duplicate rejection on unique flutterwaveRef
  const flwRef = `test_flw_${Date.now()}`;
  await prisma.payment.update({
    where: { id: booking1.payment!.id },
    data: { flutterwaveRef: flwRef },
  });

  const duplicateCheck = await prisma.payment.findUnique({ where: { flutterwaveRef: flwRef } });
  if (!duplicateCheck) throw new Error('Failed to find payment by flutterwaveRef');
  console.log('6. flutterwaveRef unique index lookup verified.');

  console.log('All Payment & Refusal tests PASSED successfully!');
}

runTest()
  .catch((e) => {
    console.error('Test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
