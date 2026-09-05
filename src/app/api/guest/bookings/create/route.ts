import { NextRequest, NextResponse } from 'next/server';
import { getGuestSession } from '@/lib/guest-auth';
import { createBookingWithAtomicPayment } from '@/lib/payment';

export async function POST(req: NextRequest) {
  try {
    const session = await getGuestSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Please sign in to complete your reservation.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { roomTypeId, stayDateFrom, stayDateTo, paymentMethod } = body;

    if (!roomTypeId || !stayDateFrom || !stayDateTo) {
      return NextResponse.json(
        { error: 'Room type, check-in date, and check-out date are required.' },
        { status: 400 }
      );
    }

    const result = await createBookingWithAtomicPayment({
      guestId: session.guestId,
      roomTypeId,
      stayDateFrom,
      stayDateTo,
      paymentMethod: paymentMethod === 'test_simulate' ? 'test_simulate' : 'flutterwave',
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while creating your reservation.' },
      { status: 500 }
    );
  }
}
