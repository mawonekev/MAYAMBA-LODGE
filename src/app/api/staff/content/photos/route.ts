import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStaffSession } from '@/lib/staff-auth';

export async function POST(req: NextRequest) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { url, caption, roomTypeId } = body;

    if (!url || !url.startsWith('http')) {
      return NextResponse.json({ error: 'Valid image URL is required' }, { status: 400 });
    }

    const photo = await prisma.photo.create({
      data: {
        url: url.trim(),
        caption: caption ? caption.trim() : null,
        roomTypeId: roomTypeId && roomTypeId !== 'none' ? roomTypeId : null,
        isTestData: true,
      },
      include: { roomType: true },
    });

    return NextResponse.json({ success: true, photo });
  } catch (error: unknown) {
    console.error('Create photo error:', error);
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Photo ID required' }, { status: 400 });

    await prisma.photo.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Delete photo error:', error);
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}
