import { NextResponse } from 'next/server';
import { getGuestSession } from '@/lib/guest-auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getGuestSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, guest: null });
    }

    const guest = await prisma.guest.findUnique({
      where: { id: session.guestId },
      select: {
        id: true,
        phoneNumber: true,
        createdAt: true,
      },
    });

    if (!guest) {
      return NextResponse.json({ authenticated: false, guest: null });
    }

    return NextResponse.json({
      authenticated: true,
      guest,
    });
  } catch (error: unknown) {
    console.error('Error fetching guest session:', error);
    return NextResponse.json({ authenticated: false, guest: null }, { status: 500 });
  }
}
