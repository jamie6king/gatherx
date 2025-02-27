import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    // For demo purposes, we'll return the first user from the database
    // In a real app, this would be based on authentication
    const user = await prisma.user.findFirst({
      where: {},
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No users found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
} 