import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStaffSession } from '@/lib/staff-auth';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * FR-9: Staff Rate Management API
 */
export async function GET() {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rates = await prisma.rate.findMany({
    include: { roomType: true },
    orderBy: [{ roomTypeId: 'asc' }, { validFrom: 'desc' }],
  });

  const roomTypes = await prisma.roomType.findMany({
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({
    rates: rates.map((r) => ({
      id: r.id,
      roomTypeId: r.roomTypeId,
      roomTypeName: r.roomType.name,
      pricePerNight: Number(r.pricePerNight),
      currency: r.currency,
      validFrom: r.validFrom,
      validTo: r.validTo,
      isTestData: r.isTestData,
    })),
    roomTypes,
  });
}

export async function POST(req: NextRequest) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { roomTypeId, pricePerNight, currency, validFrom, validTo } = body;

    if (!roomTypeId || pricePerNight === undefined || !currency || !validFrom || !validTo) {
      return NextResponse.json({ error: 'All rate fields are required' }, { status: 400 });
    }

    const price = parseFloat(pricePerNight);
    if (isNaN(price) || price < 0) {
      return NextResponse.json({ error: 'Price per night must be a valid positive number' }, { status: 400 });
    }

    const fromDate = new Date(validFrom);
    const toDate = new Date(validTo);

    if (fromDate >= toDate) {
      return NextResponse.json({ error: 'validFrom must be before validTo' }, { status: 400 });
    }

    const rate = await prisma.rate.create({
      data: {
        roomTypeId,
        pricePerNight: new Decimal(price),
        currency: currency.trim().toUpperCase(),
        validFrom: fromDate,
        validTo: toDate,
        isTestData: true,
      },
      include: { roomType: true },
    });

    return NextResponse.json({
      success: true,
      rate: {
        id: rate.id,
        roomTypeId: rate.roomTypeId,
        roomTypeName: rate.roomType.name,
        pricePerNight: Number(rate.pricePerNight),
        currency: rate.currency,
        validFrom: rate.validFrom,
        validTo: rate.validTo,
        isTestData: rate.isTestData,
      },
    });
  } catch (error: unknown) {
    console.error('Create rate error:', error);
    return NextResponse.json({ error: 'Failed to create rate' }, { status: 500 });
  }
}
