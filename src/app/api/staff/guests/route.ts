import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStaffSession } from '@/lib/staff-auth';

/**
 * FR-11: Staff Guest Sign Up Review API
 */
export async function GET() {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const guests = await prisma.guest.findMany({
    select: {
      id: true,
      phoneNumber: true,
      createdAt: true,
      _count: {
        select: {
          bookings: true,
          contentFlags: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    guests: guests.map((g) => ({
      id: g.id,
      phoneNumber: g.phoneNumber,
      createdAt: g.createdAt,
      bookingsCount: g._count.bookings,
      flagsCount: g._count.contentFlags,
    })),
  });
}
