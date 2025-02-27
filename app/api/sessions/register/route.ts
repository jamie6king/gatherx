import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionId } = await request.json();

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: 'User ID and session ID are required' },
        { status: 400 }
      );
    }

    // Check if the user and session exist
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // First, check if the user is registered for the event
    const event = await prisma.event.findUnique({
      where: { id: session.eventId },
      include: {
        attendees: {
          where: { userId },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // If not registered for the event, register them
    if (event.attendees.length === 0) {
      await prisma.eventUser.create({
        data: {
          userId,
          eventId: event.id,
        },
      });
    }

    // Check if the user is already registered for this session
    const existingRegistration = await prisma.sessionUser.findUnique({
      where: {
        userId_sessionId: {
          userId,
          sessionId,
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { message: 'User already registered for this session' },
        { status: 200 }
      );
    }

    // Register the user for the session
    const registration = await prisma.sessionUser.create({
      data: {
        userId,
        sessionId,
      },
    });

    return NextResponse.json({
      message: 'Successfully registered for session',
      registration,
    });
  } catch (error) {
    console.error('Error registering for session:', error);
    return NextResponse.json(
      { error: 'Failed to register for session' },
      { status: 500 }
    );
  }
} 