import type { APIRoute } from 'astro';
import { HealthChecker } from '../../lib/utils/health.js';
import { composeMiddleware } from '../../lib/middleware/compose.js';

const handler: APIRoute = async () => {
  const health = await HealthChecker.check();
  
  return new Response(JSON.stringify(health), {
    status: health.status === 'unhealthy' ? 503 : 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
};

export const all = composeMiddleware(handler, {
  security: { cors: true },
  rateLimit: { maxRequests: 60, windowMs: 60000 } // 60 requests per minute
});