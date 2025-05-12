import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async ({ request }) => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  };

  try {
    // Get auth token from cookie
    const authCookie = request.headers.get('cookie')?.split(';')
      .find(c => c.trim().startsWith('sb-access-token='));
    
    if (!authCookie) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No authentication cookie found',
          debug: {
            cookies: request.headers.get('cookie'),
            timestamp: new Date().toISOString()
          }
        }),
        { status: 401, headers }
      );
    }

    const token = authCookie.split('=')[1].trim();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw error || new Error('Invalid authentication token');
    }

    const isAdmin = user.user_metadata?.role === 'admin';

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: isAdmin ? 'Successfully authenticated as admin' : 'User is not an admin',
        user: {
          id: user.id,
          email: user.email,
          role: user.user_metadata?.role
        },
        debug: {
          metadata: user.user_metadata,
          timestamp: new Date().toISOString()
        }
      }),
      { status: isAdmin ? 200 : 403, headers }
    );
  } catch (error) {
    console.error('Authentication test error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to authenticate',
        debug: {
          errorType: error instanceof Error ? error.constructor.name : typeof error,
          timestamp: new Date().toISOString()
        }
      }),
      { status: 500, headers }
    );
  }
};