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
        webinars: {
          include: {
            speakers: true,
          },
        },
        _count: {
          select: {
            attendees: true,
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

    // Format the event data to handle edge cases
    const formattedEvent = {
      ...event,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      interestTags: typeof event.interestTags === 'string' 
        ? JSON.parse(event.interestTags) 
        : event.interestTags,
      socialMediaLinks: typeof event.socialMediaLinks === 'string'
        ? JSON.parse(event.socialMediaLinks)
        : event.socialMediaLinks,
      // Ensure optional fields are properly handled
      capacity: event.capacity ?? undefined,
      price: event.price ?? undefined,
      website: event.website ?? undefined,
      contactEmail: event.contactEmail ?? undefined,
      contactPhone: event.contactPhone ?? undefined,
      contactName: event.contactName ?? undefined,
      bannerUrl: event.bannerUrl ?? undefined,
      logoUrl: event.logoUrl ?? undefined,
      videoUrl: event.videoUrl ?? undefined,
    };

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
        ...formattedEvent,
        isRegistered: !!registration,
      });
    }

    return NextResponse.json(formattedEvent);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
} 