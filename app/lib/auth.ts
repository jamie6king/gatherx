import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { z } from 'zod';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

const UserType = z.enum(['GUEST', 'EVENT_MANAGER']);
type UserType = z.infer<typeof UserType>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  userType: UserType.default('GUEST'),
});

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function generateToken(userId: string): Promise<string> {
  const payload = { sub: userId };
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyAuth(): Promise<string | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('token');

  console.log('Auth token from cookie:', token?.value);

  if (!token) {
    console.log('No token found in cookies');
    return null;
  }

  try {
    const { payload } = await jwtVerify(token.value, JWT_SECRET);
    console.log('JWT payload:', payload);
    return payload.sub as string;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function getUserFromToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function authenticateRequest(req: NextRequest): Promise<{ userId: string } | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const userId = await verifyAuth();
  return userId ? { userId } : null;
}

export function withAuth(handler: Function) {
  return async (req: NextRequest) => {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Add user ID to the request object
    (req as any).userId = auth.userId;
    return handler(req);
  };
} 