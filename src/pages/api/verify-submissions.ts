import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async ({ url }) => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  };

  try {
    // Get registration data
    const regId = url.searchParams.get('regId');
    const reg = regId ? await supabase
      .from('registrations')
      .select(`
        *,
        attendees:registration_attendees(*)
      `)
      .eq('id', regId)
      .single() : { data: null };

    // Get luncheon registration
    const lunchId = url.searchParams.get('lunchId');
    const lunch = lunchId ? await supabase
      .from('luncheon_registrations')
      .select(`
        *,
        event:luncheon_events(*)
      `)
      .eq('id', lunchId)
      .single() : { data: null };

    // Get HOF nomination
    const hofId = url.searchParams.get('hofId');
    const hof = hofId ? await supabase
      .from('hall_of_fame_nominations')
      .select()
      .eq('id', hofId)
      .single() : { data: null };

    // Get scholarship application
    const scholarId = url.searchParams.get('scholarId');
    const scholar = scholarId ? await supabase
      .from('scholarship_applications')
      .select()
      .eq('id', scholarId)
      .single() : { data: null };

    return new Response(
      JSON.stringify({
        registration: reg.data,
        luncheon: lunch.data,
        hallOfFame: hof.data,
        scholarship: scholar.data
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Verification error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to verify submissions' }),
      { status: 500, headers }
    );
  }
};