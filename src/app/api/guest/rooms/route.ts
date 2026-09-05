import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { triggerHandoff } from '@/lib/refusal';

export async function GET() {
  try {
    const roomTypes = await prisma.roomType.findMany({
      include: {
        photos: true,
        rates: {
          orderBy: { validFrom: 'desc' },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
    });

    if (roomTypes.length === 0) {
      const refusal = await triggerHandoff('records_silent', null, 'No room types currently registered in system.');
      return NextResponse.json({ refusal, roomTypes: [] });
    }

    const data = roomTypes.map((rt) => ({
      id: rt.id,
      name: rt.name,
      description: rt.description,
      features: rt.features,
      photos: rt.photos,
      currentRate: rt.rates[0]
        ? {
            pricePerNight: Number(rt.rates[0].pricePerNight),
            currency: rt.rates[0].currency,
            validFrom: rt.rates[0].validFrom,
            validTo: rt.rates[0].validTo,
          }
        : null,
      isTestData: rt.isTestData,
    }));

    return NextResponse.json({ roomTypes: data });
  } catch (error: unknown) {
    console.error('Fetch rooms error:', error);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}
