import type { APIRoute } from 'astro';
import { withMiddleware } from '../../../lib/middleware.js';
import { RegistrationService } from '../../../lib/services/RegistrationService.js';
import { validateInput, commonRules } from '../../../lib/validation.js';
import { ValidationError } from '../../../lib/errors.js';

const registrationService = new RegistrationService();

const handler: APIRoute = async ({ request, params }) => {
  const { id } = params;
  const headers = { 'Content-Type': 'application/json' };

  switch (request.method) {
    case 'GET': {
      const registration = await registrationService.findById(id);
      return new Response(JSON.stringify(registration), { headers });
    }

    case 'PATCH': {
      const body = await request.json();
      
      validateInput(body.status, [
        commonRules.required('Status'),
        commonRules.enum('Status', ['pending', 'confirmed', 'cancelled'])
      ]);

      validateInput(body.paymentStatus, [
        commonRules.required('Payment status'),
        commonRules.enum('Payment status', ['pending', 'paid', 'refunded'])
      ]);

      const updated = await registrationService.updateRegistrationStatus(
        id,
        body.status,
        body.paymentStatus
      );

      return new Response(JSON.stringify(updated), { headers });
    }

    case 'DELETE': {
      await registrationService.delete(id);
      return new Response(null, { status: 204 });
    }

    default:
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers }
      );
  }
};

export const all = withMiddleware(handler, {
  rateLimit: true,
  csrfProtection: true,
  requireAuth: true
});