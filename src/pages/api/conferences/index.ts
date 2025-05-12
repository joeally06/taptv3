import type { APIRoute } from 'astro';
import { ConferenceService } from '../../../lib/services/ConferenceService.js';
import { composeMiddleware } from '../../../lib/middleware/compose.js';
import { logger } from '../../../lib/utils/logger.js';
import type { PaginationParams } from '../../../lib/utils/pagination.js';

const conferenceService = new ConferenceService();

const handler: APIRoute = async ({ request }) => {
  const headers = { 'Content-Type': 'application/json' };

  switch (request.method) {
    case 'GET': {
      const url = new URL(request.url);
      const query = {
        status: url.searchParams.get('status'),
        location: url.searchParams.get('location')
      };

      // Extract pagination parameters
      const pagination: PaginationParams = {
        page: Number(url.searchParams.get('page')) || 1,
        pageSize: Number(url.searchParams.get('pageSize')) || 10,
        sortBy: url.searchParams.get('sortBy') || 'startDate',
        sortOrder: (url.searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc'
      };

      logger.info('Fetching conferences', { query, pagination });
      
      const result = await conferenceService.findAllPaginated(
        Object.fromEntries(
          Object.entries(query).filter(([_, v]) => v != null)
        ),
        pagination
      );
      
      return new Response(JSON.stringify(result), { headers });
    }

    case 'POST': {
      const data = await request.json();
      logger.info('Creating new conference', { data });
      
      const conference = await conferenceService.createConference(data);
      
      return new Response(JSON.stringify(conference), {
        status: 201,
        headers
      });
    }

    default:
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers }
      );
  }
};

// Apply all middleware with specific options
export const all = composeMiddleware(handler, {
  auth: {
    requireAuth: true,
    requireAdmin: true
  },
  rateLimit: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000 // 15 minutes
  },
  security: {
    cors: true,
    contentSecurity: true
  }
});