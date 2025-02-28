import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const searchParams = new URL(request.url).searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if the user is registered for this event
    const registration = await prisma.eventUser.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    return NextResponse.json({
      isRegistered: !!registration,
    });
  } catch (error) {
    console.error('Error checking registration status:', error);
    return NextResponse.json(
      { error: 'Failed to check registration status' },
      { status: 500 }
    );
  }
} 