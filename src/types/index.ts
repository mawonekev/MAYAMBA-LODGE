import { Decimal } from '@prisma/client/runtime/library';

export interface GuestType {
  id: string;
  phoneNumber: string;
  passwordHash: string;
  createdAt: Date;
}

export interface OtpCodeType {
  id: string;
  guestId: string;
  code: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

export interface StaffType {
  id: string;
  username: string;
  passwordHash: string;
  role: 'staff' | 'owner' | string;
  createdAt: Date;
}

export interface RoomTypeModel {
  id: string;
  name: string;
  description: string;
  features: string[];
  isTestData: boolean;
}

export interface PhotoType {
  id: string;
  url: string;
  caption: string | null;
  roomTypeId: string | null;
  isTestData: boolean;
}

export interface RateType {
  id: string;
  roomTypeId: string;
  pricePerNight: Decimal | number | string;
  currency: string;
  validFrom: Date;
  validTo: Date;
  isTestData: boolean;
}

export interface AvailabilityType {
  id: string;
  roomTypeId: string;
  date: Date;
  roomsOpen: number;
  isTestData: boolean;
}

export interface HotelInfoType {
  id: string;
  factSheet: string;
  checkInTime: string;
  checkOutTime: string;
  outletOpenTime: string;
  outletCloseTime: string;
  outletName: string;
  whatsappNumber: string;
  reservationsEmail: string;
  isTestData: boolean;
}

export interface BookingType {
  id: string;
  confirmationCode: string;
  guestId: string;
  roomTypeId: string;
  stayDateFrom: Date;
  stayDateTo: Date;
  status: 'confirmed' | 'cancelled' | 'no_show' | string;
  isTestData: boolean;
}

export interface PaymentType {
  id: string;
  bookingId: string;
  amount: Decimal | number | string;
  currency: string;
  status: 'paid' | 'not_paid' | 'unclear_pending_review' | string;
  flutterwaveRef: string | null;
  createdAt: Date;
}

export interface ContentFlagType {
  id: string;
  guestId: string;
  description: string;
  status: 'open' | 'resolved' | string;
  createdAt: Date;
}

export interface SearchMissType {
  id: string;
  dateFrom: Date;
  dateTo: Date;
  createdAt: Date;
}

export interface AvailabilitySearchEventType {
  id: string;
  dateFrom: Date;
  dateTo: Date;
  createdAt: Date;
}

export interface HandoffType {
  id: string;
  reason: 'records_silent' | 'refund_or_dispute' | 'payment_unclear' | string;
  guestId: string | null;
  createdAt: Date;
}

// Session tokens
export interface GuestSession {
  guestId: string;
  phoneNumber: string;
  type: 'guest';
}

export interface StaffSession {
  staffId: string;
  username: string;
  role: string;
  type: 'staff';
}
