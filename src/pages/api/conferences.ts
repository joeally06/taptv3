import type { APIRoute } from 'astro';
import { getLatestConference } from '../../lib/db.js';

export const GET: APIRoute = async () => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  try {
    const conference = await getLatestConference();
    return new Response(
      JSON.stringify({ data: conference }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Error fetching conference:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch conference data';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 404, headers }
    );
  }
};