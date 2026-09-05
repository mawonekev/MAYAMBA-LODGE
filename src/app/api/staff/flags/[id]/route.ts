import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStaffSession } from '@/lib/staff-auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await context.params;
    const body = await req.json();
    const status = body.status === 'resolved' ? 'resolved' : 'open';

    const updated = await prisma.contentFlag.update({
      where: { id },
      data: { status },
      include: {
        guest: {
          select: { phoneNumber: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      flag: {
        id: updated.id,
        description: updated.description,
        status: updated.status,
        createdAt: updated.createdAt,
        guestPhone: updated.guest.phoneNumber,
      },
    });
  } catch (error: unknown) {
    console.error('Update flag error:', error);
    return NextResponse.json({ error: 'Failed to update flag status' }, { status: 500 });
  }
}
