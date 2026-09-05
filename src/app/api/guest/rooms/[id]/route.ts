import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { triggerHandoff } from '@/lib/refusal';
import { getGuestSession } from '@/lib/guest-auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await getGuestSession();

    const roomType = await prisma.roomType.findUnique({
      where: { id },
      include: {
        photos: true,
        rates: {
          orderBy: { validFrom: 'desc' },
          take: 5,
        },
      },
    });

    if (!roomType) {
      // Record is missing -> PRD Section 6 Refusal
      const refusal = await triggerHandoff('records_silent', session?.guestId || null, `Room type record ${id} not found.`);
      return NextResponse.json({ refusal, roomType: null }, { status: 404 });
    }

    const currentRate = roomType.rates[0] || null;

    return NextResponse.json({
      roomType: {
        id: roomType.id,
        name: roomType.name,
        description: roomType.description,
        features: roomType.features,
        photos: roomType.photos,
        rates: roomType.rates.map((r) => ({
          id: r.id,
          pricePerNight: Number(r.pricePerNight),
          currency: r.currency,
          validFrom: r.validFrom,
          validTo: r.validTo,
        })),
        currentRate: currentRate
          ? {
              pricePerNight: Number(currentRate.pricePerNight),
              currency: currentRate.currency,
              validFrom: currentRate.validFrom,
              validTo: currentRate.validTo,
            }
          : null,
        isTestData: roomType.isTestData,
      },
    });
  } catch (error: unknown) {
    console.error('Fetch room details error:', error);
    return NextResponse.json({ error: 'Failed to fetch room details' }, { status: 500 });
  }
}
