import { NextResponse } from 'next/server';
import { clearGuestSessionCookie } from '@/lib/guest-auth';

export async function POST() {
  await clearGuestSessionCookie();
  return NextResponse.json({ success: true, message: 'Signed out successfully.' });
}
