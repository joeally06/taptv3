import type { APIRoute } from 'astro';
import { metrics } from '../utils/metrics.js';

export function withMetrics(handler: APIRoute): APIRoute {
  return async (context) => {
    const startTime = Date.now();
    const { pathname } = new URL(context.request.url);

    try {
      const response = await handler(context);
      const duration = Date.now() - startTime;

      metrics.trackTiming('api.response_time', duration, {
        path: pathname,
        method: context.request.method,
        status: response.status.toString()
      });

      metrics.incrementCounter('api.requests', {
        path: pathname,
        method: context.request.method,
        status: response.status.toString()
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      metrics.trackTiming('api.error_response_time', duration, {
        path: pathname,
        method: context.request.method,
        error: error.name
      });

      metrics.incrementCounter('api.errors', {
        path: pathname,
        method: context.request.method,
        error: error.name
      });

      throw error;
    }
  };
}