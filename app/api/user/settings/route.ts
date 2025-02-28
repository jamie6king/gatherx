import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        jobTitle: true,
        industry: true,
        bio: true,
        avatarUrl: true,
        bannerUrl: true,
        useGravatar: true,
        tagString: true,
        notifications: true,
        userType: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch user settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const body = await request.json();
    const {
      name,
      jobTitle,
      industry,
      bio,
      useGravatar,
      tagString,
      notifications,
    } = body;

    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        name,
        jobTitle,
        industry,
        bio,
        useGravatar,
        tagString,
        notifications,
      },
      select: {
        id: true,
        name: true,
        email: true,
        jobTitle: true,
        industry: true,
        bio: true,
        avatarUrl: true,
        bannerUrl: true,
        useGravatar: true,
        tagString: true,
        notifications: true,
        userType: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user settings:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update user settings' },
      { status: 500 }
    );
  }
} 