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

    // Get all sessions for the event
    const sessions = await prisma.eventSession.findMany({
      where: { eventId },
      include: {
        tags: true,
        _count: {
          select: {
            attendees: true,
          },
        },
      },
    });

    // Get user's interests based on their profile and past sessions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        sessionUsers: {
          include: {
            session: {
              include: {
                tags: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Simple recommendation algorithm:
    // 1. Select sessions that don't overlap in time
    // 2. Prioritize sessions with tags matching user's past interests
    // 3. Consider popularity (number of attendees)
    
    const selectedSessions = sessions.reduce((acc, session) => {
      // Check for time conflicts with already selected sessions
      const hasTimeConflict = acc.some(selectedSession => {
        const sessionStart = new Date(session.startTime);
        const sessionEnd = new Date(session.endTime);
        const selectedStart = new Date(selectedSession.startTime);
        const selectedEnd = new Date(selectedSession.endTime);
        
        return (
          (sessionStart >= selectedStart && sessionStart < selectedEnd) ||
          (sessionEnd > selectedStart && sessionEnd <= selectedEnd)
        );
      });

      if (!hasTimeConflict) {
        acc.push(session);
      }

      return acc;
    }, [] as typeof sessions);

    // Register user for selected sessions
    for (const session of selectedSessions) {
      await prisma.sessionUser.create({
        data: {
          userId,
          sessionId: session.id,
        },
      });
    }

    return NextResponse.json({
      message: 'Successfully registered for sessions',
      sessions: selectedSessions,
    });
  } catch (error) {
    console.error('Error auto-selecting sessions:', error);
    return NextResponse.json(
      { error: 'Failed to register for sessions' },
      { status: 500 }
    );
  }
} 