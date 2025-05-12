import type { APIRoute } from 'astro';
import { rateLimiter } from './rate-limit.js';
import { APIError } from './errors.js';

export interface MiddlewareConfig {
  rateLimit?: boolean;
  requireAuth?: boolean;
  csrfProtection?: boolean;
}

export function withMiddleware(handler: APIRoute, config: MiddlewareConfig = {}): APIRoute {
  return async (context) => {
    try {
      const { request } = context;
      const clientIP = request.headers.get('x-forwarded-for') || 'unknown';

      // Rate limiting
      if (config.rateLimit) {
        const isLimited = await rateLimiter.isRateLimited(clientIP);
        if (isLimited) {
          throw new APIError('Too many requests', 429, 'RATE_LIMIT_EXCEEDED');
        }
      }

      // CSRF Protection
      if (config.csrfProtection && request.method !== 'GET') {
        const csrfToken = request.headers.get('x-csrf-token');
        const expectedToken = request.headers.get('cookie')?.match(/csrf=([^;]+)/)?.[1];
        
        if (!csrfToken || !expectedToken || csrfToken !== expectedToken) {
          throw new APIError('Invalid CSRF token', 403, 'INVALID_CSRF_TOKEN');
        }
      }

      // Execute the handler
      const response = await handler(context);
      
      // Add security headers
      const headers = new Headers(response.headers);
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('X-Frame-Options', 'DENY');
      headers.set('X-XSS-Protection', '1; mode=block');
      
      if (config.rateLimit) {
        headers.set('X-RateLimit-Remaining', 
          rateLimiter.getRemainingRequests(clientIP).toString()
        );
      }

      return new Response(response.body, {
        status: response.status,
        headers
      });

    } catch (error) {
      if (error instanceof APIError) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message,
            code: error.code 
          }),
          { 
            status: error.status,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      console.error('Unhandled error:', error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Internal server error'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };
}