import type { APIRoute } from 'astro';
import { RegistrationService } from '../../../lib/services/RegistrationService.js';
import { withErrorHandler } from '../../../lib/middleware/errorHandler.js';

const registrationService = new RegistrationService();

const handler: APIRoute = async ({ request, params }) => {
  const { id } = params;
  const headers = { 'Content-Type': 'application/json' };

  switch (request.method) {
    case 'GET': {
      const registration = await registrationService.findById(id);
      return new Response(JSON.stringify(registration), { headers });
    }

    case 'POST': {
      if (request.url.endsWith('/confirm')) {
        const registration = await registrationService.confirmRegistration(id);
        return new Response(JSON.stringify(registration), { headers });
      }
      if (request.url.endsWith('/cancel')) {
        const registration = await registrationService.cancelRegistration(id);
        return new Response(JSON.stringify(registration), { headers });
      }
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers }
      );
    }

    default:
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers }
      );
  }
};

export const all = withErrorHandler(handler);