import type { APIRoute } from 'astro';
import { RegistrationService } from '../../../lib/services/RegistrationService.js';
import { withErrorHandler } from '../../../lib/middleware/errorHandler.js';

const registrationService = new RegistrationService();

const handler: APIRoute = async ({ request }) => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  };

  switch (request.method) {
    case 'POST': {
      const data = await request.json();
      const registration = await registrationService.createRegistration(data);
      return new Response(JSON.stringify(registration), { 
        status: 201, 
        headers 
      });
    }

    case 'GET': {
      const url = new URL(request.url);
      const conferenceId = url.searchParams.get('conferenceId');
      const userId = url.searchParams.get('userId');

      let registrations;
      if (conferenceId) {
        registrations = await registrationService.getRegistrationsByConference(conferenceId);
      } else if (userId) {
        registrations = await registrationService.getRegistrationsByUser(userId);
      } else {
        registrations = await registrationService.findAll();
      }

      return new Response(JSON.stringify(registrations), { headers });
    }

    default:
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers }
      );
  }
};

export const all = withErrorHandler(handler);