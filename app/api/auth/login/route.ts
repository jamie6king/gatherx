import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { loginSchema, verifyPassword, generateToken } from '@/app/lib/auth';
import { logger } from '@/app/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = loginSchema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify password
    const isValid = await verifyPassword(validatedData.password, user.password);
    if (!isValid) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate JWT token
    const token = await generateToken(user.id);

    logger.info('User logged in successfully', { userId: user.id });

    // Create the response
    const response = new NextResponse(
      JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: user.userType,
        },
        token,
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' }
      }
    );

    // Set the token cookie with proper attributes
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (error) {
    logger.error('Login error', { error });
    return new NextResponse(
      JSON.stringify({ error: 'Invalid request' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 