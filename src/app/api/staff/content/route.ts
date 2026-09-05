import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStaffSession } from '@/lib/staff-auth';

/**
 * FR-10: Staff Content Management API (Fact sheet, times, WhatsApp, Email, Photos)
 */
export async function GET() {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const hotelInfo = await prisma.hotelInfo.findFirst({
    orderBy: { id: 'asc' },
  });

  const photos = await prisma.photo.findMany({
    include: { roomType: true },
    orderBy: { id: 'desc' },
  });

  const roomTypes = await prisma.roomType.findMany({
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ hotelInfo, photos, roomTypes });
}

export async function POST(req: NextRequest) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const {
      factSheet,
      checkInTime,
      checkOutTime,
      outletOpenTime,
      outletCloseTime,
      outletName,
      whatsappNumber,
      reservationsEmail,
    } = body;

    if (!whatsappNumber || !reservationsEmail) {
      return NextResponse.json(
        { error: 'WhatsApp number and reservations email are strictly required for handoffs' },
        { status: 400 }
      );
    }

    const existingInfo = await prisma.hotelInfo.findFirst();

    let updated;
    if (existingInfo) {
      updated = await prisma.hotelInfo.update({
        where: { id: existingInfo.id },
        data: {
          factSheet: factSheet || existingInfo.factSheet,
          checkInTime: checkInTime || existingInfo.checkInTime,
          checkOutTime: checkOutTime || existingInfo.checkOutTime,
          outletOpenTime: outletOpenTime || existingInfo.outletOpenTime,
          outletCloseTime: outletCloseTime || existingInfo.outletCloseTime,
          outletName: outletName || existingInfo.outletName,
          whatsappNumber: whatsappNumber.trim(),
          reservationsEmail: reservationsEmail.trim(),
        },
      });
    } else {
      updated = await prisma.hotelInfo.create({
        data: {
          factSheet: factSheet || 'Mayamba Lodge',
          checkInTime: checkInTime || '14:00',
          checkOutTime: checkOutTime || '10:00',
          outletOpenTime: outletOpenTime || '06:30',
          outletCloseTime: outletCloseTime || '22:00',
          outletName: outletName || 'Restaurant & Bar',
          whatsappNumber: whatsappNumber.trim(),
          reservationsEmail: reservationsEmail.trim(),
          isTestData: true,
        },
      });
    }

    return NextResponse.json({ success: true, hotelInfo: updated });
  } catch (error: unknown) {
    console.error('Update hotel info error:', error);
    return NextResponse.json({ error: 'Failed to update hotel info' }, { status: 500 });
  }
}
