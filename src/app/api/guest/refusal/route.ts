import { NextRequest, NextResponse } from 'next/server';
import { triggerHandoff, RefusalReason } from '@/lib/refusal';
import { getGuestSession } from '@/lib/guest-auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getGuestSession();
    const body = await req.json();
    const reason: RefusalReason =
      body.reason === 'refund_or_dispute' || body.reason === 'payment_unclear'
        ? body.reason
        : 'records_silent';

    const result = await triggerHandoff(reason, session?.guestId || null, body.message);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Refusal handler error:', error);
    return NextResponse.json(
      { error: 'Failed to process handoff request.' },
      { status: 500 }
    );
  }
}
