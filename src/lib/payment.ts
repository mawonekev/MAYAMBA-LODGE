import prisma from '@/lib/prisma';
import { triggerHandoff } from '@/lib/refusal';
import { Decimal } from '@prisma/client/runtime/library';

export interface CreateBookingPaymentInput {
  guestId: string;
  roomTypeId: string;
  stayDateFrom: string | Date;
  stayDateTo: string | Date;
  paymentMethod?: 'flutterwave' | 'test_simulate';
}

export interface CreateBookingPaymentResult {
  success: boolean;
  error?: 'room_no_longer_available' | 'records_silent' | 'invalid_dates' | 'internal_error';
  message: string;
  booking?: {
    id: string;
    confirmationCode: string;
    status: string;
    stayDateFrom: Date;
    stayDateTo: Date;
    roomTypeName: string;
  };
  payment?: {
    id: string;
    amount: string | number;
    currency: string;
    status: string;
    flutterwaveRef?: string | null;
  };
  refusalDetails?: {
    whatsappNumber: string;
    reservationsEmail: string;
  };
}

function generateConfirmationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'MYB-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Executes FR-4 atomic booking and payment transaction.
 * 1. Inside one database transaction: re-check Availability.roomsOpen for that room and date is still > 0.
 * 2. Decrement it by one for each date.
 * 3. Fail cleanly with "room no longer available" result without charging if roomsOpen is already 0.
 * 4. Create Booking and Payment records.
 */
export async function createBookingWithAtomicPayment(
  input: CreateBookingPaymentInput
): Promise<CreateBookingPaymentResult> {
  const dateFrom = new Date(input.stayDateFrom);
  const dateTo = new Date(input.stayDateTo);

  // Normalize to UTC midnight
  dateFrom.setUTCHours(0, 0, 0, 0);
  dateTo.setUTCHours(0, 0, 0, 0);

  if (isNaN(dateFrom.getTime()) || isNaN(dateTo.getTime()) || dateFrom >= dateTo) {
    return {
      success: false,
      error: 'invalid_dates',
      message: 'Check-out date must be after check-in date.',
    };
  }

  // Calculate days of stay
  const dayMillis = 1000 * 60 * 60 * 24;
  const nights = Math.round((dateTo.getTime() - dateFrom.getTime()) / dayMillis);
  if (nights <= 0) {
    return {
      success: false,
      error: 'invalid_dates',
      message: 'Stay duration must be at least 1 night.',
    };
  }

  // Check rate from database
  const rate = await prisma.rate.findFirst({
    where: {
      roomTypeId: input.roomTypeId,
      validFrom: { lte: dateFrom },
      validTo: { gte: dateTo },
    },
    include: {
      roomType: true,
    },
  });

  if (!rate) {
    // Record missing -> Trigger Section 6 refusal handoff
    const handoff = await triggerHandoff('records_silent', input.guestId, 'No published rate found for the requested dates.');
    return {
      success: false,
      error: 'records_silent',
      message: 'Rates for these dates are not currently loaded in our records. Please contact reservations.',
      refusalDetails: {
        whatsappNumber: handoff.whatsappNumber,
        reservationsEmail: handoff.reservationsEmail,
      },
    };
  }

  const pricePerNight = Number(rate.pricePerNight);
  const totalAmount = pricePerNight * nights;

  // Build list of all dates in the stay
  const datesToCheck: Date[] = [];
  for (let i = 0; i < nights; i++) {
    const d = new Date(dateFrom);
    d.setUTCDate(dateFrom.getUTCDate() + i);
    datesToCheck.push(d);
  }

  try {
    // Execute atomic transaction as strictly required by PRD FR-4
    const result = await prisma.$transaction(async (tx) => {
      // 1. Re-check Availability.roomsOpen for every night inside transaction
      for (const d of datesToCheck) {
        const avail = await tx.availability.findUnique({
          where: {
            roomTypeId_date: {
              roomTypeId: input.roomTypeId,
              date: d,
            },
          },
        });

        // If no availability row exists or roomsOpen <= 0, fail cleanly
        if (!avail || avail.roomsOpen <= 0) {
          throw new Error('ROOM_NO_LONGER_AVAILABLE');
        }
      }

      // 2. Decrement Availability.roomsOpen by 1 for each date
      for (const d of datesToCheck) {
        await tx.availability.update({
          where: {
            roomTypeId_date: {
              roomTypeId: input.roomTypeId,
              date: d,
            },
          },
          data: {
            roomsOpen: { decrement: 1 },
          },
        });
      }

      // 3. Create Booking
      let confirmationCode = generateConfirmationCode();
      // Ensure unique confirmation code
      let codeExists = await tx.booking.findUnique({ where: { confirmationCode } });
      while (codeExists) {
        confirmationCode = generateConfirmationCode();
        codeExists = await tx.booking.findUnique({ where: { confirmationCode } });
      }

      const booking = await tx.booking.create({
        data: {
          confirmationCode,
          guestId: input.guestId,
          roomTypeId: input.roomTypeId,
          stayDateFrom: dateFrom,
          stayDateTo: dateTo,
          status: 'confirmed',
          isTestData: true,
        },
        include: {
          roomType: true,
        },
      });

      // 4. Create Payment record
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: new Decimal(totalAmount),
          currency: rate.currency,
          status: input.paymentMethod === 'test_simulate' ? 'paid' : 'not_paid',
          flutterwaveRef:
            input.paymentMethod === 'test_simulate'
              ? `sim_flw_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
              : null,
        },
      });

      return { booking, payment };
    });

    return {
      success: true,
      message: 'Reservation and payment initialized successfully.',
      booking: {
        id: result.booking.id,
        confirmationCode: result.booking.confirmationCode,
        status: result.booking.status,
        stayDateFrom: result.booking.stayDateFrom,
        stayDateTo: result.booking.stayDateTo,
        roomTypeName: result.booking.roomType.name,
      },
      payment: {
        id: result.payment.id,
        amount: Number(result.payment.amount),
        currency: result.payment.currency,
        status: result.payment.status,
        flutterwaveRef: result.payment.flutterwaveRef,
      },
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'ROOM_NO_LONGER_AVAILABLE') {
      return {
        success: false,
        error: 'room_no_longer_available',
        message:
          'This room is no longer available for one or more selected dates. Your card has not been charged.',
      };
    }

    console.error('Atomic payment transaction failed:', error);
    return {
      success: false,
      error: 'internal_error',
      message: 'Failed to complete reservation. Please try again or contact reservations.',
    };
  }
}
