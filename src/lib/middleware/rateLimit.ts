import type { APIRoute } from 'astro';
import { AppError } from '../errors/AppError.js';

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

const defaultOptions: RateLimitOptions = {
  maxRequests: 100,
  windowMs: 15 * 60 * 1000 // 15 minutes
};

// Store IP requests in memory
const requestLog = new Map<string, number[]>();

export function withRateLimit(handler: APIRoute, options: Partial<RateLimitOptions> = {}): APIRoute {
  const { maxRequests, windowMs } = { ...defaultOptions, ...options };

  return async (context) => {
    const ip = context.request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    
    // Get existing requests for this IP
    const requests = requestLog.get(ip) || [];
    
    // Remove requests outside current window
    const windowStart = now - windowMs;
    const validRequests = requests.filter(timestamp => timestamp > windowStart);

    if (validRequests.length >= maxRequests) {
      throw new AppError('Too many requests', 429, 'RATE_LIMIT_EXCEEDED');
    }

    // Add current request
    validRequests.push(now);
    requestLog.set(ip, validRequests);

    const response = await handler(context);
    const headers = new Headers(response.headers);
    
    // Add rate limit headers
    headers.set('X-RateLimit-Limit', maxRequests.toString());
    headers.set('X-RateLimit-Remaining', (maxRequests - validRequests.length).toString());
    headers.set('X-RateLimit-Reset', (windowStart + windowMs).toString());

    return new Response(response.body, {
      status: response.status,
      headers
    });
  };
}