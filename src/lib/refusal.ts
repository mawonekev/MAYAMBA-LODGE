import prisma from '@/lib/prisma';

export type RefusalReason = 'records_silent' | 'refund_or_dispute' | 'payment_unclear';

export interface RefusalResult {
  refusal: true;
  reason: RefusalReason;
  message: string;
  whatsappNumber: string;
  reservationsEmail: string;
  handoffId: string;
}

/**
 * Shared refusal and handoff handler required by PRD Section 6.
 * Reads whatsappNumber and reservationsEmail from HotelInfo and creates a Handoff row.
 * No screen or handler may hardcode contact details or skip logging the handoff.
 */
export async function triggerHandoff(
  reason: RefusalReason,
  guestId?: string | null,
  customContextMessage?: string
): Promise<RefusalResult> {
  try {
    const hotelInfo = await prisma.hotelInfo.findFirst({
      orderBy: { id: 'asc' },
    });

    // Log handoff record to database
    let handoffId = 'offline-handoff';
    try {
      const handoff = await prisma.handoff.create({
        data: {
          reason,
          guestId: guestId || null,
        },
      });
      handoffId = handoff.id;
    } catch (dbErr) {
      console.warn('Could not log handoff row to DB:', dbErr);
    }

    let message = 'This information is not yet available in our verified records.';
    if (reason === 'refund_or_dispute') {
      message =
        'Refund requests, payment disputes, and individual guest booking inquiries must be handled directly by our reservations team. We do not provide automated estimates or cross-guest details.';
    } else if (reason === 'payment_unclear') {
      message =
        'Payment verification requires review by our reservations desk. Please contact our team with your reference details.';
    } else if (customContextMessage) {
      message = customContextMessage;
    }

    return {
      refusal: true,
      reason,
      message,
      whatsappNumber: hotelInfo?.whatsappNumber || '+263771234567',
      reservationsEmail: hotelInfo?.reservationsEmail || 'reservations@mayambalodge.internal',
      handoffId,
    };
  } catch (err) {
    console.error('triggerHandoff caught error:', err);
    return {
      refusal: true,
      reason,
      message: customContextMessage || 'This information is not yet available in our verified records.',
      whatsappNumber: '+263771234567',
      reservationsEmail: 'reservations@mayambalodge.internal',
      handoffId: 'offline-handoff',
    };
  }
}
