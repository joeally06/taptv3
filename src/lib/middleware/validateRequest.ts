import type { APIRoute } from 'astro';
import { ValidationError } from '../errors/AppError.js';
import { logger } from '../utils/logger.js';

type ValidationSchema = {
  [key: string]: (value: any) => boolean;
};

export interface ValidationOptions {
  body?: ValidationSchema;
  query?: ValidationSchema;
  params?: ValidationSchema;
}

export function withValidation(handler: APIRoute, options: ValidationOptions): APIRoute {
  return async (context) => {
    try {
      if (options.params) {
        await validateObject(context.params, options.params, 'params');
      }

      if (options.query) {
        const url = new URL(context.request.url);
        const query = Object.fromEntries(url.searchParams);
        await validateObject(query, options.query, 'query');
      }

      if (options.body && context.request.method !== 'GET') {
        const body = await context.request.json();
        await validateObject(body, options.body, 'body');
        // Reconstruct request with validated body
        context.request = new Request(context.request.url, {
          method: context.request.method,
          headers: context.request.headers,
          body: JSON.stringify(body)
        });
      }

      return handler(context);
    } catch (error) {
      logger.warn('Request validation failed', error);
      throw error instanceof ValidationError 
        ? error 
        : new ValidationError('Invalid request data');
    }
  };
}

async function validateObject(
  data: any, 
  schema: ValidationSchema, 
  location: string
): Promise<void> {
  const errors: string[] = [];

  for (const [field, validator] of Object.entries(schema)) {
    if (!validator(data[field])) {
      errors.push(`Invalid ${field} in ${location}`);
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(', '));
  }
}