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

    // Get all sessions for the event with attendee counts
    const sessions = await prisma.eventSession.findMany({
      where: { eventId },
      include: {
        attendees: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            attendees: true,
          },
        },
      },
    });

    // Find sessions with the most attendees (popular among all users)
    const popularSessions = sessions
      .sort((a, b) => b._count.attendees - a._count.attendees)
      .slice(0, 5); // Take top 5 most popular sessions

    // Register user for popular sessions that don't have time conflicts
    const selectedSessions = popularSessions.reduce((acc, session) => {
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
    }, [] as typeof popularSessions);

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
    console.error('Error following friends\' sessions:', error);
    return NextResponse.json(
      { error: 'Failed to register for sessions' },
      { status: 500 }
    );
  }
} 