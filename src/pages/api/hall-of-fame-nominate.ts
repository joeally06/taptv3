import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { logger } from '../../../lib/utils/logger.js';
import { validate, rules } from '../../../lib/validation.js';
import { ValidationError } from '../../../lib/errors/AppError.js';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // Validate required fields
    const requiredFields = {
      supervisorFirstName: 'Supervisor First Name',
      supervisorLastName: 'Supervisor Last Name',
      district: 'School District',
      supervisorEmail: 'Supervisor Email',
      nomineeFirstName: 'Nominee First Name',
      nomineeLastName: 'Nominee Last Name',
      nomineeCity: 'Nominee City',
      nominationReason: 'Reason for Nomination',
      region: 'Grand Division',
      isTAPTMember: 'TAPT Membership Status'
    };

    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!data[field]) {
        throw new ValidationError(`${label} is required`);
      }
    });

    const { error } = await supabase
      .from('hall_of_fame_nominations')
      .insert([{
        supervisor_first_name: data.supervisorFirstName,
        supervisor_last_name: data.supervisorLastName,
        district: data.district,
        supervisor_email: data.supervisorEmail,
        nominee_first_name: data.nomineeFirstName,
        nominee_last_name: data.nomineeLastName,
        nominee_city: data.nomineeCity,
        nomination_reason: data.nominationReason,
        region: data.region,
        is_tapt_member: data.isTAPTMember === 'yes',
        years_of_service: data.yearsOfService || null,
        status: 'pending'
      }]);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    const status = error instanceof ValidationError ? 400 : 500;
    const message = error instanceof Error ? error.message : 'Internal server error';
    
    return new Response(JSON.stringify({ 
      success: false,
      error: message 
    }), {
      status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};