import type { APIRoute } from 'astro';
import { createRegistration } from '../../lib/db.js';
import { validate as validateInput, commonRules } from '../../lib/validation.js';
import { ValidationError } from '../../lib/errors.js';
import { withMiddleware } from '../../lib/middleware.js';

interface Attendee {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  email: string;
  phone: string;
}

interface RegistrationData {
  organization: string;
  attendees: Attendee[];
  totalAmount: number;
}

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }), 
    { status: 405 }
  );
};

const handler: APIRoute = async ({ request }) => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  };

  const body = await request.text();
  if (!body) {
    throw new ValidationError('Request body is required');
  }

  const data = JSON.parse(body) as Partial<RegistrationData>;

  // Validate main fields
  validateInput(data.organization, [
    commonRules.required('Organization name'),
    commonRules.maxLength('Organization name', 200)
  ]);

  validateInput(data.totalAmount, [
    commonRules.required('Total amount')
  ]);

  if (!Array.isArray(data.attendees) || data.attendees.length === 0) {
    throw new ValidationError('At least one attendee is required');
  }

  // Validate each attendee
  data.attendees.forEach((attendee, index) => {
    const prefix = `Attendee ${index + 1}`;
    validateInput(attendee.firstName, [
      commonRules.required(`${prefix} first name`),
      commonRules.maxLength(`${prefix} first name`, 100)
    ]);
    validateInput(attendee.lastName, [
      commonRules.required(`${prefix} last name`),
      commonRules.maxLength(`${prefix} last name`, 100)
    ]);
    validateInput(attendee.email, [
      commonRules.required(`${prefix} email`),
      commonRules.email()
    ]);
    validateInput(attendee.phone, [
      commonRules.required(`${prefix} phone`),
      commonRules.phone()
    ]);
  });

  const registrationData: RegistrationData = {
    organization: data.organization!,
    attendees: data.attendees.map(att => ({
      firstName: att.firstName,
      lastName: att.lastName,
      address: att.address,
      city: att.city,
      state: att.state,
      zip: att.zip,
      email: att.email,
      phone: att.phone
    })),
    totalAmount: Number(data.totalAmount)
  };

  const result = await createRegistration(registrationData);

  return new Response(
    JSON.stringify({ success: true, data: result }),
    { status: 200, headers }
  );
};

// Apply middleware with rate limiting and CSRF protection
export const POST = withMiddleware(handler, {
  rateLimit: true,
  csrfProtection: true
});