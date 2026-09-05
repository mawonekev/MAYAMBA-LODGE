import { NextResponse } from 'next/server';
import { getStaffSession } from '@/lib/staff-auth';

export async function GET() {
  try {
    const session = await getStaffSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, staff: null });
    }

    return NextResponse.json({
      authenticated: true,
      staff: {
        id: session.staffId,
        username: session.username,
        role: session.role,
      },
    });
  } catch (error: unknown) {
    console.error('Error in staff me endpoint:', error);
    return NextResponse.json({ authenticated: false, staff: null }, { status: 500 });
  }
}
