import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStaffSession } from '@/lib/staff-auth';

/**
 * FR-8: Staff Availability Management API
 */
export async function GET(req: NextRequest) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const roomTypeId = searchParams.get('roomTypeId');
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');

  const now = new Date();
  const startDate = startDateStr ? new Date(startDateStr) : new Date(now.setUTCHours(0,0,0,0));
  const endDate = endDateStr ? new Date(endDateStr) : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

  const whereClause: {
    date: { gte: Date; lte: Date };
    roomTypeId?: string;
  } = {
    date: { gte: startDate, lte: endDate },
  };

  if (roomTypeId) {
    whereClause.roomTypeId = roomTypeId;
  }

  const availability = await prisma.availability.findMany({
    where: whereClause,
    include: { roomType: true },
    orderBy: [{ date: 'asc' }, { roomTypeId: 'asc' }],
  });

  const roomTypes = await prisma.roomType.findMany({
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ availability, roomTypes });
}

export async function POST(req: NextRequest) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { roomTypeId, date, roomsOpen } = body;

    if (!roomTypeId || !date || roomsOpen === undefined) {
      return NextResponse.json({ error: 'roomTypeId, date, and roomsOpen are required' }, { status: 400 });
    }

    const parsedDate = new Date(date);
    parsedDate.setUTCHours(0, 0, 0, 0);

    const updated = await prisma.availability.upsert({
      where: {
        roomTypeId_date: {
          roomTypeId,
          date: parsedDate,
        },
      },
      update: {
        roomsOpen: parseInt(roomsOpen, 10),
      },
      create: {
        roomTypeId,
        date: parsedDate,
        roomsOpen: parseInt(roomsOpen, 10),
        isTestData: true,
      },
      include: { roomType: true },
    });

    return NextResponse.json({ success: true, availability: updated });
  } catch (error: unknown) {
    console.error('Update availability error:', error);
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 });
  }
}
