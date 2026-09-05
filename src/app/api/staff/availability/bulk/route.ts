import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStaffSession } from '@/lib/staff-auth';

export async function POST(req: NextRequest) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { roomTypeId, startDate, endDate, roomsOpen } = body;

    if (!roomTypeId || !startDate || !endDate || roomsOpen === undefined) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(0, 0, 0, 0);

    const openCount = parseInt(roomsOpen, 10);
    const dayMillis = 1000 * 60 * 60 * 24;
    const totalDays = Math.round((end.getTime() - start.getTime()) / dayMillis) + 1;

    if (totalDays <= 0 || totalDays > 180) {
      return NextResponse.json({ error: 'Date range must be between 1 and 180 days' }, { status: 400 });
    }

    const updates = [];
    for (let i = 0; i < totalDays; i++) {
      const cur = new Date(start);
      cur.setUTCDate(start.getUTCDate() + i);

      updates.push(
        prisma.availability.upsert({
          where: {
            roomTypeId_date: {
              roomTypeId,
              date: cur,
            },
          },
          update: { roomsOpen: openCount },
          create: {
            roomTypeId,
            date: cur,
            roomsOpen: openCount,
            isTestData: true,
          },
        })
      );
    }

    await prisma.$transaction(updates);

    return NextResponse.json({
      success: true,
      message: `Updated availability for ${totalDays} dates to ${openCount} rooms open.`,
    });
  } catch (error: unknown) {
    console.error('Bulk availability error:', error);
    return NextResponse.json({ error: 'Failed to bulk update availability' }, { status: 500 });
  }
}
