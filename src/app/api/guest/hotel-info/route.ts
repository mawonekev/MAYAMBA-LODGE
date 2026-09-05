import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { triggerHandoff } from '@/lib/refusal';
import { getGuestSession } from '@/lib/guest-auth';

export async function GET() {
  try {
    const session = await getGuestSession();
    const hotelInfo = await prisma.hotelInfo.findFirst({
      orderBy: { id: 'asc' },
    });

    if (!hotelInfo) {
      const refusal = await triggerHandoff(
        'records_silent',
        session?.guestId || null,
        'Hotel information fact sheet is not currently published.'
      );
      return NextResponse.json({ refusal, hotelInfo: null }, { status: 404 });
    }

    const generalPhotos = await prisma.photo.findMany({
      where: {
        roomTypeId: null,
      },
    });

    return NextResponse.json({
      hotelInfo: {
        id: hotelInfo.id,
        factSheet: hotelInfo.factSheet,
        checkInTime: hotelInfo.checkInTime,
        checkOutTime: hotelInfo.checkOutTime,
        outletOpenTime: hotelInfo.outletOpenTime,
        outletCloseTime: hotelInfo.outletCloseTime,
        outletName: hotelInfo.outletName,
        whatsappNumber: hotelInfo.whatsappNumber,
        reservationsEmail: hotelInfo.reservationsEmail,
        isTestData: hotelInfo.isTestData,
      },
      photos: generalPhotos,
    });
  } catch (error: unknown) {
    console.error('Fetch hotel info error:', error);
    return NextResponse.json({ error: 'Failed to fetch hotel info' }, { status: 500 });
  }
}
