import type { APIRoute } from 'astro';
import { ConferenceService } from '../../../lib/services/ConferenceService.js';
import { withErrorHandler } from '../../../lib/middleware/errorHandler.js';

const conferenceService = new ConferenceService();

const handler: APIRoute = async ({ request, params }) => {
  const headers = { 'Content-Type': 'application/json' };
  const { id } = params;

  switch (request.method) {
    case 'GET': {
      const conference = await conferenceService.findById(id);
      return new Response(JSON.stringify(conference), { headers });
    }

    case 'PATCH': {
      const data = await request.json();
      const conference = await conferenceService.update(id, data);
      return new Response(JSON.stringify(conference), { headers });
    }

    case 'DELETE': {
      await conferenceService.delete(id);
      return new Response(null, { status: 204 });
    }

    default:
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }), 
        { status: 405, headers }
      );
  }
};

export const all = withErrorHandler(handler);