import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, createGuestToken, setGuestSessionCookie } from '@/lib/guest-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phoneNumber = (body.phoneNumber || '').trim().replace(/\s+/g, '');
    const password = body.password || '';

    if (!phoneNumber || phoneNumber.length < 7) {
      return NextResponse.json(
        { error: 'Please enter a valid mobile phone number.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const existingGuest = await prisma.guest.findUnique({
      where: { phoneNumber },
    });

    if (existingGuest) {
      return NextResponse.json(
        { error: 'An account with this phone number already exists. Please sign in.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const guest = await prisma.guest.create({
      data: {
        phoneNumber,
        passwordHash,
      },
    });

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
    console.error('Sign up error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during sign up.' },
      { status: 500 }
    );
  }
}
