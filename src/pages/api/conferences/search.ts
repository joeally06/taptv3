import type { APIRoute } from 'astro';
import { ConferenceService } from '../../../lib/services/ConferenceService.js';
import { composeMiddleware } from '../../../lib/middleware/compose.js';
import { withValidation } from '../../../lib/middleware/validateRequest.js';
import { logger } from '../../../lib/utils/logger.js';

const conferenceService = new ConferenceService();

const handler: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const searchParams = {
    searchTerm: url.searchParams.get('q') || undefined,
    startDate: url.searchParams.get('startDate') ? new Date(url.searchParams.get('startDate')!) : undefined,
    endDate: url.searchParams.get('endDate') ? new Date(url.searchParams.get('endDate')!) : undefined,
    location: url.searchParams.get('location') || undefined,
    minPrice: url.searchParams.get('minPrice') ? Number(url.searchParams.get('minPrice')) : undefined,
    maxPrice: url.searchParams.get('maxPrice') ? Number(url.searchParams.get('maxPrice')) : undefined,
    status: url.searchParams.get('status') as any || undefined
  };

  logger.info('Searching conferences', searchParams);
  
  const conferences = await conferenceService.searchConferences(searchParams);
  
  return new Response(JSON.stringify(conferences), {
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60'
    }
  });
};

// Validate search parameters
const validatedHandler = withValidation(handler, {
  query: {
    startDate: (value) => !value || !isNaN(Date.parse(value)),
    endDate: (value) => !value || !isNaN(Date.parse(value)),
    minPrice: (value) => !value || (!isNaN(Number(value)) && Number(value) >= 0),
    maxPrice: (value) => !value || (!isNaN(Number(value)) && Number(value) >= 0),
    status: (value) => !value || ['draft', 'published', 'cancelled'].includes(value)
  }
});

export const all = composeMiddleware(validatedHandler, {
  auth: { requireAuth: true },
  rateLimit: { maxRequests: 100 },
  security: { cors: true }
});