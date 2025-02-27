import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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

    // Get request body
    const body = await request.json();
    const { name, jobTitle, industry } = body;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        name,
        jobTitle,
        industry,
      },
      select: {
        id: true,
        email: true,
        name: true,
        userType: true,
        jobTitle: true,
        industry: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 