import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        startDate: 'desc',
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            jobTitle: true,
            avatarUrl: true,
          },
        },
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
    // Verify authentication
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token and get user ID
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
    const {
      name,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      industry,
      interestTags,
      eventType,
      capacity,
      price,
      location,
      website,
      socialMediaLinks,
      contactEmail,
      contactPhone,
      contactName,
      hostId,
      bannerUrl,
      logoUrl,
      videoUrl,
    } = await request.json();

    // Validate required fields
    if (!name || !description || !startDate || !endDate || !startTime || !endTime || !location || !industry || !eventType || !hostId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify that the authenticated user matches the hostId
    if (decoded.sub !== hostId) {
      return NextResponse.json(
        { error: 'Unauthorized to create event for another user' },
        { status: 403 }
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
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        startTime,
        endTime,
        industry,
        interestTags: Array.isArray(interestTags) ? JSON.stringify(interestTags) : interestTags,
        eventType,
        capacity: capacity ? parseInt(capacity) : null,
        price: price ? parseFloat(price) : null,
        location,
        website: website || null,
        socialMediaLinks: Array.isArray(socialMediaLinks) ? JSON.stringify(socialMediaLinks) : socialMediaLinks,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        contactName: contactName || null,
        bannerUrl: bannerUrl || null,
        logoUrl: logoUrl || null,
        videoUrl: videoUrl || null,
        hostId,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
} 