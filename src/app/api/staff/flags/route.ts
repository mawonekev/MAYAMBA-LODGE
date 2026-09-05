import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStaffSession } from '@/lib/staff-auth';

/**
 * FR-12: Staff Flag Review API
 */
export async function GET() {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const flags = await prisma.contentFlag.findMany({
    include: {
      guest: {
        select: {
          id: true,
          phoneNumber: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    flags: flags.map((f) => ({
      id: f.id,
      description: f.description,
      status: f.status,
      createdAt: f.createdAt,
      guestPhone: f.guest.phoneNumber,
      guestId: f.guestId,
    })),
  });
}
