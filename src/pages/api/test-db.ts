import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async () => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  };

  try {
    // Test query to fetch the latest conference
    const { data, error } = await supabase
      .from('conferences')
      .select('*')
      .limit(1);

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Successfully connected to Supabase',
        data 
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Connection test error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to Supabase'
      }),
      { status: 500, headers }
    );
  }
}