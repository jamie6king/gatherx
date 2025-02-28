import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/app/lib/auth';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const webinar = await prisma.webinar.findUnique({
      where: {
        id: params.id,
      },
      include: {
        speakers: true,
      },
    });

    if (!webinar) {
      return NextResponse.json(
        { error: 'Webinar not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(webinar);
  } catch (error) {
    console.error('Error fetching webinar:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webinar' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const existingWebinar = await prisma.webinar.findUnique({
      where: { id: params.id },
      select: { hostId: true },
    });

    if (!existingWebinar || existingWebinar.hostId !== user.sub) {
      return NextResponse.json(
        { error: 'Not authorized to update this webinar' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const webinar = await prisma.webinar.update({
      where: {
        id: params.id,
      },
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        time: data.time,
        hostName: data.hostName,
        imageUrl: data.imageUrl,
        registrationLink: data.registrationLink,
        speakers: {
          deleteMany: {},
          create: data.speakers.map((speaker: any) => ({
            name: speaker.name,
            role: speaker.role,
          })),
        },
      },
      include: {
        speakers: true,
      },
    });

    return NextResponse.json(webinar);
  } catch (error) {
    console.error('Error updating webinar:', error);
    return NextResponse.json(
      { error: 'Failed to update webinar' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const existingWebinar = await prisma.webinar.findUnique({
      where: { id: params.id },
      select: { hostId: true },
    });

    if (!existingWebinar || existingWebinar.hostId !== user.sub) {
      return NextResponse.json(
        { error: 'Not authorized to delete this webinar' },
        { status: 403 }
      );
    }

    await prisma.webinar.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting webinar:', error);
    return NextResponse.json(
      { error: 'Failed to delete webinar' },
      { status: 500 }
    );
  }
} 