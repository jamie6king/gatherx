import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

const ipRequests = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(config: RateLimitConfig = { limit: 100, windowMs: 60000 }) {
  return async function rateLimitMiddleware(
    req: NextRequest,
    res: NextResponse
  ) {
    const ip = req.ip || 'anonymous';
    const now = Date.now();
    const requestData = ipRequests.get(ip);

    if (!requestData || now > requestData.resetTime) {
      ipRequests.set(ip, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return NextResponse.next();
    }

    if (requestData.count >= config.limit) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Please try again later',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((requestData.resetTime - now) / 1000)),
          },
        }
      );
    }

    requestData.count++;
    return NextResponse.next();
  };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of ipRequests.entries()) {
    if (now > data.resetTime) {
      ipRequests.delete(ip);
    }
  }
}, 60000); // Clean up every minute 