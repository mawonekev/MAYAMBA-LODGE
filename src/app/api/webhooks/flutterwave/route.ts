import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { triggerHandoff } from '@/lib/refusal';

/**
 * Flutterwave Webhook Handler
 * PRD FR-4 & Section 8:
 * "Each webhook's Flutterwave reference is unique in the database,
 * so a duplicate delivery of the same event is rejected rather than applied twice."
 */
export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('verif-hash');
    const expectedSecretHash = process.env.FLUTTERWAVE_SECRET_HASH || 'mayamba_flw_webhook_secret_key';

    if (!signature || signature !== expectedSecretHash) {
      console.warn('[FLUTTERWAVE WEBHOOK] Rejected invalid verification hash');
      return NextResponse.json({ error: 'Unauthorized webhook request' }, { status: 401 });
    }

    const payload = await req.json();
    console.log('[FLUTTERWAVE WEBHOOK] Received event:', payload?.event);

    const event = payload?.event;
    const data = payload?.data;

    if (!data || !data.flw_ref || !data.tx_ref) {
      return NextResponse.json({ error: 'Invalid webhook payload structure' }, { status: 400 });
    }

    const flutterwaveRef = String(data.flw_ref).trim();
    const txRef = String(data.tx_ref).trim();

    // 1. Strict Duplicate Delivery Check on flutterwaveRef unique constraint
    const existingRefPayment = await prisma.payment.findUnique({
      where: { flutterwaveRef },
    });

    if (existingRefPayment) {
      console.warn(`[FLUTTERWAVE WEBHOOK] Duplicate webhook delivery rejected for flw_ref: ${flutterwaveRef}`);
      return NextResponse.json(
        {
          error: 'duplicate_delivery',
          message: 'Webhook with this flutterwaveRef has already been processed.',
        },
        { status: 409 }
      );
    }

    // 2. Find payment record by bookingId or paymentId stored in tx_ref
    // tx_ref format: booking_{bookingId} or payment_{paymentId} or direct id
    let payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { id: txRef.replace(/^payment_/, '') },
          { bookingId: txRef.replace(/^booking_/, '') },
          { booking: { confirmationCode: txRef } },
        ],
      },
      include: {
        booking: true,
      },
    });

    if (!payment) {
      console.error(`[FLUTTERWAVE WEBHOOK] No matching payment record found for tx_ref: ${txRef}`);
      // Log handoff for orphan payment attempt
      await triggerHandoff('payment_unclear', null, `Orphan payment webhook received for tx_ref: ${txRef}`);
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    // 3. Determine verified payment status
    let newStatus: 'paid' | 'not_paid' | 'unclear_pending_review' = 'unclear_pending_review';
    if (data.status === 'successful' && Number(data.amount) >= Number(payment.amount)) {
      newStatus = 'paid';
    } else if (data.status === 'failed') {
      newStatus = 'not_paid';
    } else {
      newStatus = 'unclear_pending_review';
    }

    // 4. Update Payment and Booking
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment!.id },
        data: {
          status: newStatus,
          flutterwaveRef,
        },
      });

      if (newStatus === 'paid') {
        await tx.booking.update({
          where: { id: payment!.bookingId },
          data: { status: 'confirmed' },
        });
      } else if (newStatus === 'not_paid') {
        // If payment explicitly failed, cancel booking
        await tx.booking.update({
          where: { id: payment!.bookingId },
          data: { status: 'cancelled' },
        });
      }
    });

    // 5. If status is unclear, trigger handoff
    if (newStatus === 'unclear_pending_review') {
      await triggerHandoff(
        'payment_unclear',
        payment.booking.guestId,
        `Payment ${payment.id} for booking ${payment.booking.confirmationCode} ended with status ${data.status}.`
      );
    }

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      status: newStatus,
      flutterwaveRef,
    });
  } catch (error: unknown) {
    console.error('[FLUTTERWAVE WEBHOOK] Internal error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook event' },
      { status: 500 }
    );
  }
}
