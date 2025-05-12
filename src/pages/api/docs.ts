import type { APIRoute } from 'astro';
import { openApiSpec } from '../../lib/docs/openapi.js';
import { composeMiddleware } from '../../lib/middleware/compose.js';

const handler: APIRoute = async () => {
  return new Response(JSON.stringify(openApiSpec), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};

export const all = composeMiddleware(handler, {
  security: { cors: true }
});