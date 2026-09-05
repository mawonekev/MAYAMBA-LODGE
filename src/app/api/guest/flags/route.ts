import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getGuestSession, hashPassword } from '@/lib/guest-auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getGuestSession();
    const body = await req.json();
    const description = (body.description || '').trim();
    const phoneNumber = (body.phoneNumber || '').trim().replace(/\s+/g, '');

    if (!description || description.length < 5) {
      return NextResponse.json(
        { error: 'Please describe the issue or incorrect content clearly (minimum 5 characters).' },
        { status: 400 }
      );
    }

    let guestId = session?.guestId;

    if (!guestId) {
      if (!phoneNumber || phoneNumber.length < 7) {
        return NextResponse.json(
          { error: 'Please provide your phone number or sign in to submit a content flag.' },
          { status: 400 }
        );
      }

      // Find or create guest record
      let guest = await prisma.guest.findUnique({ where: { phoneNumber } });
      if (!guest) {
        const dummyHash = await hashPassword(Math.random().toString(36));
        guest = await prisma.guest.create({
          data: {
            phoneNumber,
            passwordHash: dummyHash,
          },
        });
      }
      guestId = guest.id;
    }

    const flag = await prisma.contentFlag.create({
      data: {
        guestId,
        description,
        status: 'open',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you. Your feedback has been sent to Mayamba Lodge front desk staff for immediate review.',
      flagId: flag.id,
      status: flag.status,
      createdAt: flag.createdAt,
    });
  } catch (error: unknown) {
    console.error('Content flag submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit content flag. Please try again.' },
      { status: 500 }
    );
  }
}
