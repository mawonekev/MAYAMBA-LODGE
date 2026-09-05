import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getGuestSession } from '@/lib/guest-auth';
import { triggerHandoff } from '@/lib/refusal';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const session = await getGuestSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        roomType: {
          include: { photos: true },
        },
        payment: true,
      },
    });

    if (!booking) {
      const refusal = await triggerHandoff('records_silent', session.guestId, `Booking ${id} not found.`);
      return NextResponse.json({ refusal, booking: null }, { status: 404 });
    }

    if (booking.guestId !== session.guestId) {
      const refusal = await triggerHandoff(
        'refund_or_dispute',
        session.guestId,
        'Cross-guest booking access is strictly forbidden.'
      );
      return NextResponse.json({ refusal, booking: null }, { status: 403 });
    }

    return NextResponse.json({
      booking: {
        id: booking.id,
        confirmationCode: booking.confirmationCode,
        status: booking.status,
        stayDateFrom: booking.stayDateFrom,
        stayDateTo: booking.stayDateTo,
        isTestData: booking.isTestData,
        roomType: {
          id: booking.roomType.id,
          name: booking.roomType.name,
          description: booking.roomType.description,
          features: booking.roomType.features,
          photos: booking.roomType.photos,
        },
        payment: booking.payment
          ? {
              id: booking.payment.id,
              amount: Number(booking.payment.amount),
              currency: booking.payment.currency,
              status: booking.payment.status,
              flutterwaveRef: booking.payment.flutterwaveRef,
            }
          : null,
      },
    });
  } catch (error: unknown) {
    console.error('Fetch single booking error:', error);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}
