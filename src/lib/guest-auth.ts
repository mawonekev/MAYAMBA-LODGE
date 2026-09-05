import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { GuestSession } from '@/types';

const GUEST_COOKIE_NAME = 'mayamba_guest_session';
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'mayamba_lodge_super_secret_jwt_key_2026_dev_prod'
);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateOtpCode(): string {
  // Generate 6-digit random code
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createGuestToken(payload: GuestSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

export async function verifyGuestToken(token: string): Promise<GuestSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.type !== 'guest' || !payload.guestId || !payload.phoneNumber) {
      return null;
    }
    return {
      guestId: payload.guestId as string,
      phoneNumber: payload.phoneNumber as string,
      type: 'guest',
    };
  } catch {
    return null;
  }
}

export async function getGuestSession(): Promise<GuestSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(GUEST_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyGuestToken(token);
}

export async function setGuestSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(GUEST_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearGuestSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(GUEST_COOKIE_NAME);
}

/**
 * Creates an OtpCode record for the specified guest with 10-minute expiry
 */
export async function createOtpForGuest(guestId: string): Promise<{ code: string; expiresAt: Date; id: string }> {
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const otp = await prisma.otpCode.create({
    data: {
      guestId,
      code,
      expiresAt,
      used: false,
    },
  });

  return { code, expiresAt, id: otp.id };
}

/**
 * Validates OtpCode: verifies unused status and non-expired time, then marks used: true
 */
export async function verifyOtpForGuest(
  guestId: string,
  code: string
): Promise<{ valid: boolean; reason?: string }> {
  const latestOtp = await prisma.otpCode.findFirst({
    where: {
      guestId,
      code: code.trim(),
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!latestOtp) {
    return { valid: false, reason: 'Invalid verification code.' };
  }

  if (latestOtp.used) {
    return { valid: false, reason: 'This verification code has already been used.' };
  }

  if (new Date() > latestOtp.expiresAt) {
    return { valid: false, reason: 'This verification code has expired. Please request a new one.' };
  }

  // Mark as used immediately to prevent reuse
  await prisma.otpCode.update({
    where: { id: latestOtp.id },
    data: { used: true },
  });

  return { valid: true };
}
