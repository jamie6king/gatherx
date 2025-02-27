import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, eventId } = await request.json();

    if (!userId || !eventId) {
      return NextResponse.json(
        { error: 'User ID and event ID are required' },
        { status: 400 }
      );
    }

    // Check if the user and event exist
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if the user is already registered for this event
    const existingRegistration = await prisma.eventUser.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { message: 'User already registered for this event' },
        { status: 200 }
      );
    }

    // Register the user for the event
    const registration = await prisma.eventUser.create({
      data: {
        userId,
        eventId,
      },
    });

    return NextResponse.json({
      message: 'Successfully registered for event',
      registration,
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    return NextResponse.json(
      { error: 'Failed to register for event' },
      { status: 500 }
    );
  }
} 