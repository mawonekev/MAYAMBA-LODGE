import prisma from '../src/lib/prisma';

async function main() {
  console.log('\n======================================================');
  console.log('       MAYAMBA LODGE — PRD SECTION 12 SUCCESS METRICS');
  console.log('======================================================\n');

  // 1. Search-to-payment conversion rate
  const searchEventCount = await prisma.availabilitySearchEvent.count();
  const totalBookingsCount = await prisma.booking.count();
  const paidBookingsCount = await prisma.payment.count({ where: { status: 'paid' } });
  const searchMissCount = await prisma.searchMiss.count();

  const conversionRate = searchEventCount > 0 ? (totalBookingsCount / searchEventCount) * 100 : 0;
  const paidConversionRate = searchEventCount > 0 ? (paidBookingsCount / searchEventCount) * 100 : 0;

  console.log('1. SEARCH-TO-PAYMENT CONVERSION RATE:');
  console.log(`   - Total Availability Search Events: ${searchEventCount}`);
  console.log(`   - Search Misses (0 rooms free):    ${searchMissCount}`);
  console.log(`   - Total Bookings Created:          ${totalBookingsCount}`);
  console.log(`   - Paid Bookings:                   ${paidBookingsCount}`);
  console.log(`   - Total Booking Conversion Rate:   ${conversionRate.toFixed(2)}%`);
  console.log(`   - Paid Payment Conversion Rate:    ${paidConversionRate.toFixed(2)}%`);
  console.log('   Why it matters: Directly tests whether seeing the hotel in app makes a guest convert and pay.\n');

  // 2. Count of handed-off questions
  const totalHandoffs = await prisma.handoff.count();
  const handoffsByReason = await prisma.handoff.groupBy({
    by: ['reason'],
    _count: { _all: true },
  });

  console.log('2. COUNT OF HANDED-OFF QUESTIONS:');
  console.log(`   - Total Handoffs to Reservations:  ${totalHandoffs}`);
  handoffsByReason.forEach((item) => {
    console.log(`     * Reason '${item.reason}': ${item._count._all}`);
  });
  console.log('   Why it matters: Shows the gap between what guests need and what records currently answer.\n');

  // 3. Count of abandoned payments
  const abandonedCount = await prisma.payment.count({
    where: { status: { in: ['not_paid', 'unclear_pending_review'] } },
  });
  const notPaidCount = await prisma.payment.count({ where: { status: 'not_paid' } });
  const unclearCount = await prisma.payment.count({ where: { status: 'unclear_pending_review' } });

  console.log('3. COUNT OF ABANDONED PAYMENTS:');
  console.log(`   - Total Abandoned / Incomplete:    ${abandonedCount}`);
  console.log(`     * Status 'not_paid':             ${notPaidCount}`);
  console.log(`     * Status 'unclear_pending_review':${unclearCount}`);
  console.log('   Why it matters: Flags whether the payment flow itself is losing guests.\n');

  // 4. Rate staleness
  const latestRate = await prisma.rate.findFirst({ orderBy: { validFrom: 'desc' } });
  const latestAvail = await prisma.availability.findFirst({ orderBy: { date: 'desc' } });

  const now = new Date();
  const latestRateDate = latestRate ? new Date(latestRate.validFrom) : null;
  const daysSinceRateUpdate = latestRateDate
    ? Math.max(0, Math.floor((now.getTime() - latestRateDate.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  let staleness = 'Fresh';
  if (daysSinceRateUpdate > 30) staleness = 'Attention Needed';
  if (daysSinceRateUpdate > 90) staleness = 'Stale';

  console.log('4. RATE STALENESS:');
  console.log(`   - Latest Rate Start Date:          ${latestRateDate ? latestRateDate.toISOString().split('T')[0] : 'None'}`);
  console.log(`   - Latest Availability Date:        ${latestAvail ? new Date(latestAvail.date).toISOString().split('T')[0] : 'None'}`);
  console.log(`   - Days Since Rate Start:           ${daysSinceRateUpdate} days`);
  console.log(`   - Staleness Evaluation:            [${staleness}]`);
  console.log('   Why it matters: Surfaces risk 2 before it becomes a guest-facing problem.');
  console.log('\n======================================================\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
