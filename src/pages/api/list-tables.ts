import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async () => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  };

  try {
    // Get all tables
    const tables = ['board_members', 'conferences', 'hall_of_fame_nominations', 'users'];
    const results: Record<string, any> = {};

    // Fetch data from each table
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(10);

      if (error) {
        console.error(`Error fetching ${table}:`, error);
        results[table] = { error: error.message };
      } else {
        results[table] = data;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: results
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Error reading tables:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to read tables'
      }),
      { status: 500, headers }
    );
  }
}