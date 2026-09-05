import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * FR-1: Availability search by calendar
 * - Reads Availability and Rate
 * - Writes AvailabilitySearchEvent for every search (regardless of result)
 * - Writes SearchMiss when search returns nothing
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateFromStr = searchParams.get('dateFrom');
    const dateToStr = searchParams.get('dateTo');

    if (!dateFromStr || !dateToStr) {
      return NextResponse.json(
        { error: 'Please provide both check-in (dateFrom) and check-out (dateTo) dates.' },
        { status: 400 }
      );
    }

    const dateFrom = new Date(dateFromStr);
    const dateTo = new Date(dateToStr);
    dateFrom.setUTCHours(0, 0, 0, 0);
    dateTo.setUTCHours(0, 0, 0, 0);

    if (isNaN(dateFrom.getTime()) || isNaN(dateTo.getTime()) || dateFrom >= dateTo) {
      return NextResponse.json(
        { error: 'Invalid dates. Check-out must be strictly after check-in.' },
        { status: 400 }
      );
    }

    // 1. Log every search to AvailabilitySearchEvent (PRD FR-1 & Section 12 metric denominator)
    await prisma.availabilitySearchEvent.create({
      data: {
        dateFrom,
        dateTo,
      },
    });

    const dayMillis = 1000 * 60 * 60 * 24;
    const nights = Math.round((dateTo.getTime() - dateFrom.getTime()) / dayMillis);

    // List of nights needed
    const datesNeeded: Date[] = [];
    for (let i = 0; i < nights; i++) {
      const d = new Date(dateFrom);
      d.setUTCDate(dateFrom.getUTCDate() + i);
      datesNeeded.push(d);
    }

    // Fetch all room types
    const roomTypes = await prisma.roomType.findMany({
      include: {
        photos: true,
        rates: {
          where: {
            validFrom: { lte: dateFrom },
            validTo: { gte: dateTo },
          },
        },
        availability: {
          where: {
            date: {
              gte: dateFrom,
              lt: dateTo,
            },
          },
        },
      },
    });

    const availableResults = [];

    for (const rt of roomTypes) {
      // Must have active rate for the period
      const activeRate = rt.rates[0];
      if (!activeRate) continue;

      // Check if EVERY night has availability with roomsOpen > 0
      let fullyAvailable = true;
      let minRoomsOpen = Infinity;

      for (const d of datesNeeded) {
        const availRow = rt.availability.find(
          (a) => new Date(a.date).toISOString().split('T')[0] === d.toISOString().split('T')[0]
        );

        if (!availRow || availRow.roomsOpen <= 0) {
          fullyAvailable = false;
          break;
        }

        if (availRow.roomsOpen < minRoomsOpen) {
          minRoomsOpen = availRow.roomsOpen;
        }
      }

      if (fullyAvailable) {
        const pricePerNight = Number(activeRate.pricePerNight);
        const totalPrice = pricePerNight * nights;

        availableResults.push({
          id: rt.id,
          name: rt.name,
          description: rt.description,
          features: rt.features,
          photos: rt.photos,
          pricePerNight,
          currency: activeRate.currency,
          totalPrice,
          nights,
          roomsAvailable: minRoomsOpen === Infinity ? 0 : minRoomsOpen,
          isTestData: rt.isTestData,
        });
      }
    }

    // 2. If nothing is available, log to SearchMiss as required by FR-1
    if (availableResults.length === 0) {
      await prisma.searchMiss.create({
        data: {
          dateFrom,
          dateTo,
        },
      });
    }

    return NextResponse.json({
      dateFrom: dateFrom.toISOString(),
      dateTo: dateTo.toISOString(),
      nights,
      results: availableResults,
      miss: availableResults.length === 0,
    });
  } catch (error: unknown) {
    console.error('Availability search error:', error);
    return NextResponse.json(
      { error: 'Failed to search availability.' },
      { status: 500 }
    );
  }
}
