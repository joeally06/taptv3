import type { APIRoute } from 'astro';
import { AppError } from '../errors/AppError.js';

export function withErrorHandler(handler: APIRoute): APIRoute {
  return async (context) => {
    try {
      return await handler(context);
    } catch (error) {
      console.error('API Error:', error);

      const headers = { 'Content-Type': 'application/json' };
      
      if (error instanceof AppError) {
        return new Response(
          JSON.stringify({
            error: error.message,
            code: error.code
          }),
          { 
            status: error.statusCode,
            headers
          }
        );
      }

      return new Response(
        JSON.stringify({
          error: 'Internal Server Error',
          code: 'INTERNAL_ERROR'
        }),
        { 
          status: 500,
          headers
        }
      );
    }
  };
}