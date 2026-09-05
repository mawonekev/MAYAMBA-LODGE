import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getGuestSession } from '@/lib/guest-auth';
import { triggerHandoff } from '@/lib/refusal';

export async function GET(req: NextRequest) {
  try {
    const session = await getGuestSession();
    if (!session) {
      return NextResponse.json({ error: 'Please sign in to view your bookings.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const confirmationCode = searchParams.get('confirmationCode')?.trim();
    const stayDate = searchParams.get('stayDate')?.trim();

    // Check if user is trying to look up someone else's confirmation code
    if (confirmationCode) {
      const anyBooking = await prisma.booking.findUnique({
        where: { confirmationCode },
      });

      if (anyBooking && anyBooking.guestId !== session.guestId) {
        // Strict refusal rule from PRD Section 6:
        // Never allow comparison or viewing of another guest's booking!
        const refusal = await triggerHandoff(
          'refund_or_dispute',
          session.guestId,
          'Cross-guest booking inquiries are strictly protected and handed off to reservations.'
        );
        return NextResponse.json({ refusal, bookings: [] }, { status: 403 });
      }
    }

    // Build query scoped strictly to signed-in guest
    const whereClause: {
      guestId: string;
      confirmationCode?: { contains: string; mode: 'insensitive' };
      stayDateFrom?: { lte: Date };
      stayDateTo?: { gte: Date };
    } = {
      guestId: session.guestId,
    };

    if (confirmationCode) {
      whereClause.confirmationCode = { contains: confirmationCode, mode: 'insensitive' };
    }

    if (stayDate) {
      const parsedDate = new Date(stayDate);
      if (!isNaN(parsedDate.getTime())) {
        parsedDate.setUTCHours(0, 0, 0, 0);
        whereClause.stayDateFrom = { lte: parsedDate };
        whereClause.stayDateTo = { gte: parsedDate };
      }
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        roomType: {
          include: { photos: { take: 1 } },
        },
        payment: true,
      },
      orderBy: { stayDateFrom: 'desc' },
    });

    const formatted = bookings.map((b) => ({
      id: b.id,
      confirmationCode: b.confirmationCode,
      status: b.status,
      stayDateFrom: b.stayDateFrom,
      stayDateTo: b.stayDateTo,
      isTestData: b.isTestData,
      roomType: {
        id: b.roomType.id,
        name: b.roomType.name,
        photo: b.roomType.photos[0]?.url || null,
      },
      payment: b.payment
        ? {
            id: b.payment.id,
            amount: Number(b.payment.amount),
            currency: b.payment.currency,
            status: b.payment.status,
            flutterwaveRef: b.payment.flutterwaveRef,
          }
        : null,
    }));

    return NextResponse.json({ bookings: formatted });
  } catch (error: unknown) {
    console.error('Fetch guest bookings error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
