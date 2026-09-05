import { NextRequest, NextResponse } from 'next/server';
import {
  verifyStaffCredentials,
  createStaffToken,
  setStaffSessionCookie,
} from '@/lib/staff-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = (body.username || '').trim();
    const password = body.password || '';

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    const staff = await verifyStaffCredentials(username, password);
    if (!staff) {
      return NextResponse.json(
        { error: 'Invalid staff username or password.' },
        { status: 401 }
      );
    }

    const token = await createStaffToken({
      staffId: staff.id,
      username: staff.username,
      role: staff.role,
      type: 'staff',
    });

    await setStaffSessionCookie(token);

    return NextResponse.json({
      success: true,
      staff: {
        id: staff.id,
        username: staff.username,
        role: staff.role,
      },
    });
  } catch (error: unknown) {
    console.error('Staff login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during staff login.' },
      { status: 500 }
    );
  }
}
