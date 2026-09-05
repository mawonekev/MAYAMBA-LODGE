import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { StaffSession, StaffType } from '@/types';

// Separate cookie name to guarantee complete isolation from guest sessions
const STAFF_COOKIE_NAME = 'mayamba_staff_session';
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'mayamba_lodge_super_secret_jwt_key_2026_dev_prod'
);

export async function hashStaffPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyStaffCredentials(
  username: string,
  password: string
): Promise<StaffType | null> {
  const staff = await prisma.staff.findUnique({
    where: { username: username.trim().toLowerCase() },
  });

  if (!staff) return null;

  const valid = await bcrypt.compare(password, staff.passwordHash);
  if (!valid) return null;

  return {
    id: staff.id,
    username: staff.username,
    passwordHash: staff.passwordHash,
    role: staff.role,
    createdAt: staff.createdAt,
  };
}

export async function createStaffToken(payload: StaffSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h') // Shorter session for administrative staff
    .sign(JWT_SECRET);
}

export async function verifyStaffToken(token: string): Promise<StaffSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    // Strict type check: ONLY tokens specifically minted with type === 'staff' are accepted
    if (payload.type !== 'staff' || !payload.staffId || !payload.username) {
      return null;
    }

    // Verify staff record still exists in staff table
    const staff = await prisma.staff.findUnique({
      where: { id: payload.staffId as string },
    });

    if (!staff) return null;

    return {
      staffId: staff.id,
      username: staff.username,
      role: staff.role,
      type: 'staff',
    };
  } catch {
    return null;
  }
}

export async function getStaffSession(): Promise<StaffSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(STAFF_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyStaffToken(token);
}

export async function setStaffSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(STAFF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12, // 12 hours
  });
}

export async function clearStaffSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(STAFF_COOKIE_NAME);
}
