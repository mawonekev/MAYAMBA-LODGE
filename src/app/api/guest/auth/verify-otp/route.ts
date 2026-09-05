import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyOtpForGuest, createGuestToken, setGuestSessionCookie } from '@/lib/guest-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phoneNumber = (body.phoneNumber || '').trim().replace(/\s+/g, '');
    const code = (body.code || '').trim();

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: 'Phone number and verification code are required.' },
        { status: 400 }
      );
    }

    const guest = await prisma.guest.findUnique({
      where: { phoneNumber },
    });

    if (!guest) {
      return NextResponse.json(
        { error: 'No guest account found for this phone number. Please request a new code.' },
        { status: 404 }
      );
    }

    // Verify OTP code (checks matching, unused status, and expiration, marks used: true)
    const verification = await verifyOtpForGuest(guest.id, code);
    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.reason || 'Invalid or expired verification code.' },
        { status: 400 }
      );
    }

    const token = await createGuestToken({
      guestId: guest.id,
      phoneNumber: guest.phoneNumber,
      type: 'guest',
    });

    await setGuestSessionCookie(token);

    return NextResponse.json({
      success: true,
      guest: {
        id: guest.id,
        phoneNumber: guest.phoneNumber,
      },
    });
  } catch (error: unknown) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while verifying the code.' },
      { status: 500 }
    );
  }
}
