import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStaffSession } from '@/lib/staff-auth';

/**
 * PRD Section 12: Success Metrics API
 * 1. Search-to-payment conversion rate (Booking count / AvailabilitySearchEvent count)
 * 2. Count of handed-off questions (Handoff rows)
 * 3. Count of abandoned payments (Payment status "not_paid" or "unclear_pending_review")
 * 4. Rate staleness (Time since most recent Rate or Availability row was created/updated)
 */
export async function GET() {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // 1. Search-to-payment conversion rate
    const searchEventCount = await prisma.availabilitySearchEvent.count();
    const totalBookingsCount = await prisma.booking.count();
    const paidBookingsCount = await prisma.payment.count({
      where: { status: 'paid' },
    });
    const searchMissCount = await prisma.searchMiss.count();

    const conversionRate =
      searchEventCount > 0 ? (totalBookingsCount / searchEventCount) * 100 : 0;
    const paidConversionRate =
      searchEventCount > 0 ? (paidBookingsCount / searchEventCount) * 100 : 0;

    // 2. Count of handed-off questions (by reason)
    const totalHandoffs = await prisma.handoff.count();
    const handoffsByReason = await prisma.handoff.groupBy({
      by: ['reason'],
      _count: { _all: true },
    });

    const handoffBreakdown = {
      records_silent: 0,
      refund_or_dispute: 0,
      payment_unclear: 0,
    };
    handoffsByReason.forEach((item) => {
      if (item.reason in handoffBreakdown) {
        handoffBreakdown[item.reason as keyof typeof handoffBreakdown] = item._count._all;
      }
    });

    // 3. Count of abandoned payments (not_paid or unclear_pending_review)
    const abandonedPaymentsCount = await prisma.payment.count({
      where: {
        status: { in: ['not_paid', 'unclear_pending_review'] },
      },
    });
    const notPaidCount = await prisma.payment.count({
      where: { status: 'not_paid' },
    });
    const unclearCount = await prisma.payment.count({
      where: { status: 'unclear_pending_review' },
    });

    // 4. Rate staleness: time since most recent Rate or Availability
    // Find latest rate
    const latestRate = await prisma.rate.findFirst({
      orderBy: { validFrom: 'desc' },
    });

    // Find latest availability
    const latestAvail = await prisma.availability.findFirst({
      orderBy: { date: 'desc' },
    });

    // Calculate staleness
    // Since Rate model doesn't have updatedAt, we check validFrom/validTo and date of records
    const now = new Date();
    const latestRateDate = latestRate ? new Date(latestRate.validFrom) : null;
    const daysSinceRateUpdate = latestRateDate
      ? Math.max(0, Math.floor((now.getTime() - latestRateDate.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    let stalenessLevel: 'Fresh' | 'Attention Needed' | 'Stale' = 'Fresh';
    if (daysSinceRateUpdate > 30) stalenessLevel = 'Attention Needed';
    if (daysSinceRateUpdate > 90) stalenessLevel = 'Stale';

    return NextResponse.json({
      metrics: {
        conversion: {
          searchEventCount,
          totalBookingsCount,
          paidBookingsCount,
          searchMissCount,
          conversionRatePercentage: Number(conversionRate.toFixed(2)),
          paidConversionRatePercentage: Number(paidConversionRate.toFixed(2)),
        },
        handoffs: {
          totalHandoffs,
          breakdown: handoffBreakdown,
        },
        abandonedPayments: {
          totalAbandoned: abandonedPaymentsCount,
          notPaidCount,
          unclearPendingReviewCount: unclearCount,
        },
        rateStaleness: {
          latestRateValidFrom: latestRate?.validFrom || null,
          latestAvailabilityDate: latestAvail?.date || null,
          daysSinceRateValidFrom: daysSinceRateUpdate,
          stalenessLevel,
        },
      },
    });
  } catch (error: unknown) {
    console.error('Metrics computation error:', error);
    return NextResponse.json({ error: 'Failed to compute metrics' }, { status: 500 });
  }
}
