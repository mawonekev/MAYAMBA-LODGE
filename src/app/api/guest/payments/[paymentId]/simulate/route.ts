import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getGuestSession } from '@/lib/guest-auth';

interface RouteContext {
  params: Promise<{ paymentId: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const session = await getGuestSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentId } = await context.params;
    const body = await req.json().catch(() => ({}));
    const outcome = body.outcome === 'failed' ? 'not_paid' : (body.outcome === 'unclear' ? 'unclear_pending_review' : 'paid');

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });

    if (!payment || payment.booking.guestId !== session.guestId) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    const flutterwaveRef = `flw_sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: outcome,
        flutterwaveRef: outcome === 'paid' ? flutterwaveRef : null,
      },
    });

    if (outcome === 'paid') {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'confirmed' },
      });
    }

    return NextResponse.json({
      success: true,
      payment: updated,
    });
  } catch (error: unknown) {
    console.error('Payment simulation error:', error);
    return NextResponse.json({ error: 'Failed to simulate payment' }, { status: 500 });
  }
}
