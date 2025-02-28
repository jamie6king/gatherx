import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { registerSchema, hashPassword, generateToken } from '@/app/lib/auth';
import { logger } from '@/app/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return new NextResponse(
        JSON.stringify({ error: 'User already exists' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(validatedData.password);
    const user = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
      },
    });

    // Generate JWT token
    const token = generateToken(user.id);

    logger.info('User registered successfully', { userId: user.id });

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
        status: 201, 
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
    logger.error('Registration error', { error });
    return new NextResponse(
      JSON.stringify({ error: 'Invalid request' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 