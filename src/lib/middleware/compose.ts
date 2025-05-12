import type { APIRoute } from 'astro';
import { withErrorHandler } from './errorHandler.js';
import { withAuth } from './authHandler.js';
import { withRateLimit } from './rateLimit.js';
import { withSecurity } from './security.js';
import { withMetrics } from './metrics.js';
import { withValidation } from './validateRequest.js';

export interface MiddlewareOptions {
  auth?: {
    requireAuth?: boolean;
    requireAdmin?: boolean;
  };
  rateLimit?: {
    maxRequests?: number;
    windowMs?: number;
  };
  security?: {
    cors?: boolean;
    contentSecurity?: boolean;
  };
  validation?: {
    body?: any;
    query?: any;
    params?: any;
  };
}

export function composeMiddleware(
  handler: APIRoute,
  options: MiddlewareOptions = {}
): APIRoute {
  // Apply middleware in specific order
  // Metrics first to capture timing accurately
  let composed = withMetrics(handler);

  // Add validation if specified
  if (options.validation) {
    composed = withValidation(composed, options.validation);
  }

  // Security middleware
  composed = withSecurity(composed, options.security);
  composed = withRateLimit(composed, options.rateLimit);
  composed = withAuth(composed, options.auth);

  // Error handler should be last to catch all errors
  composed = withErrorHandler(composed);

  return composed;
}