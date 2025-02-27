import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        host: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            attendees: true,
            sessions: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, date, location, hostId } = await request.json();

    // Validate required fields
    if (!name || !description || !date || !location || !hostId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the host user exists
    const host = await prisma.user.findUnique({
      where: { id: hostId },
    });

    if (!host) {
      return NextResponse.json(
        { error: 'Host user not found' },
        { status: 404 }
      );
    }

    // Create the event
    const event = await prisma.event.create({
      data: {
        name,
        description,
        date: new Date(date),
        location,
        hostId,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
} 