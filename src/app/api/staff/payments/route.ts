import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStaffSession } from '@/lib/staff-auth';

/**
 * FR-13: Staff Payment Status View API
 */
export async function GET(req: NextRequest) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status');

  const whereClause: {
    payment?: {
      status?: string;
    };
  } = {};

  if (statusFilter && statusFilter !== 'all') {
    whereClause.payment = { status: statusFilter };
  }

  const bookings = await prisma.booking.findMany({
    where: whereClause,
    include: {
      guest: {
        select: { id: true, phoneNumber: true },
      },
      roomType: {
        select: { id: true, name: true },
      },
      payment: true,
    },
    orderBy: { stayDateFrom: 'desc' },
  });

  return NextResponse.json({
    bookings: bookings.map((b) => ({
      id: b.id,
      confirmationCode: b.confirmationCode,
      status: b.status,
      stayDateFrom: b.stayDateFrom,
      stayDateTo: b.stayDateTo,
      guestPhone: b.guest.phoneNumber,
      roomTypeName: b.roomType.name,
      payment: b.payment
        ? {
            id: b.payment.id,
            amount: Number(b.payment.amount),
            currency: b.payment.currency,
            status: b.payment.status,
            flutterwaveRef: b.payment.flutterwaveRef,
            createdAt: b.payment.createdAt,
          }
        : null,
    })),
  });
}
