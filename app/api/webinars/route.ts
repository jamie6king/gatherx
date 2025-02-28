import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/app/lib/auth';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    const userId = await verifyAuth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Verify the user is the event owner
    const event = await prisma.event.findUnique({
      where: { id: data.eventId },
      select: { hostId: true },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.hostId !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to create webinars for this event' },
        { status: 403 }
      );
    }

    const webinar = await prisma.webinar.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        time: data.time,
        hostId: userId,
        hostName: data.hostName,
        eventId: data.eventId,
        imageUrl: data.imageUrl,
        registrationLink: data.registrationLink,
        speakers: {
          create: data.speakers?.map((speaker: any) => ({
            name: speaker.name,
            role: speaker.role,
          })) || [],
        },
      },
    });

    // Revalidate the event page
    revalidatePath(`/events/${data.eventId}`);

    return NextResponse.json(webinar);
  } catch (error) {
    console.error('Error creating webinar:', error);
    return NextResponse.json(
      { error: 'Failed to create webinar' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const webinars = await prisma.webinar.findMany({
      where: {
        eventId,
      },
      include: {
        speakers: true,
      },
    });

    return NextResponse.json(webinars);
  } catch (error) {
    console.error('Error fetching webinars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webinars' },
      { status: 500 }
    );
  }
} 