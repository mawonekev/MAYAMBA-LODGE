import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, createGuestToken, setGuestSessionCookie } from '@/lib/guest-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phoneNumber = (body.phoneNumber || '').trim().replace(/\s+/g, '');
    const password = body.password || '';

    if (!phoneNumber || !password) {
      return NextResponse.json(
        { error: 'Phone number and password are required.' },
        { status: 400 }
      );
    }

    const guest = await prisma.guest.findUnique({
      where: { phoneNumber },
    });

    if (!guest) {
      return NextResponse.json(
        { error: 'Invalid phone number or password.' },
        { status: 401 }
      );
    }

    const matches = await comparePassword(password, guest.passwordHash);
    if (!matches) {
      return NextResponse.json(
        { error: 'Invalid phone number or password.' },
        { status: 401 }
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
    console.error('Sign in error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during sign in.' },
      { status: 500 }
    );
  }
}
