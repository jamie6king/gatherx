import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;

    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            bio: true,
            avatarUrl: true,
          },
        },
        sessions: {
          include: {
            tags: true,
            _count: {
              select: {
                attendees: true,
              },
            },
          },
          orderBy: {
            startTime: 'asc',
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Get user ID from token if available
    const token = request.cookies.get('token')?.value;
    let userId: string | undefined;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        userId = decoded.userId;
      } catch (error) {
        // Token is invalid, but we can still return the event without user-specific data
        console.error('Invalid token:', error);
      }
    }

    // Add user-specific data if user is authenticated
    if (userId) {
      const registration = await prisma.eventUser.findUnique({
        where: {
          userId_eventId: {
            userId,
            eventId,
          },
        },
      });

      return NextResponse.json({
        ...event,
        isRegistered: !!registration,
      });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
} 