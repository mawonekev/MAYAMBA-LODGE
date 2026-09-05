import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, createOtpForGuest } from '@/lib/guest-auth';
import { sendSmsOtp } from '@/lib/sms';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phoneNumber = (body.phoneNumber || '').trim().replace(/\s+/g, '');

    if (!phoneNumber || phoneNumber.length < 7) {
      return NextResponse.json(
        { error: 'Please enter a valid mobile phone number.' },
        { status: 400 }
      );
    }

    // Find or create guest account so OtpCode can link to guestId
    let guest = await prisma.guest.findUnique({
      where: { phoneNumber },
    });

    if (!guest) {
      // Auto-create guest account with temporary random password hash
      const randomPassword = Math.random().toString(36) + Date.now().toString();
      const passwordHash = await hashPassword(randomPassword);
      guest = await prisma.guest.create({
        data: {
          phoneNumber,
          passwordHash,
        },
      });
    }

    // Create OtpCode record with 10-min expiry and used: false
    const { code, expiresAt } = await createOtpForGuest(guest.id);

    // Call stubbed SMS provider
    await sendSmsOtp(phoneNumber, code);

    return NextResponse.json({
      success: true,
      message: 'One-time verification code sent via SMS.',
      // In development mode, return code to facilitate manual and automated testing
      devCode: process.env.NODE_ENV !== 'production' ? code : undefined,
      expiresAt,
    });
  } catch (error: unknown) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Unable to send SMS verification code at this time.' },
      { status: 500 }
    );
  }
}
