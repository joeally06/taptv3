import type { APIRoute } from 'astro';

interface SecurityOptions {
  cors?: boolean;
  contentSecurity?: boolean;
}

export function withSecurity(handler: APIRoute, options: SecurityOptions = {}): APIRoute {
  return async (context) => {
    const response = await handler(context);
    const headers = new Headers(response.headers);

    // Basic security headers
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-XSS-Protection', '1; mode=block');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy
    if (options.contentSecurity) {
      headers.set('Content-Security-Policy', [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self'"
      ].join('; '));
    }

    // CORS headers
    if (options.cors) {
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      headers.set('Access-Control-Max-Age', '86400');
    }

    // Handle preflight requests
    if (context.request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    return new Response(response.body, {
      status: response.status,
      headers
    });
  };
}