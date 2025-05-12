import type { APIRoute } from 'astro';
import { supabase } from '../supabase.js';
import { AuthorizationError as AuthenticationError } from '../errors/AppError.js';

interface AuthOptions {
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export function withAuth(handler: APIRoute, options: AuthOptions = {}): APIRoute {
  return async (context) => {
    if (!options.requireAuth && !options.requireAdmin) {
      return handler(context);
    }

    const authHeader = context.request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new AuthenticationError('Invalid or expired token');
    }

    if (options.requireAdmin && user.user_metadata?.role !== 'admin') {
      throw new AuthenticationError('Admin access required');
    }

    // Add user to context for route handlers
    context.locals = {
      ...context.locals,
      user: {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || 'user'
      }
    };

    return handler(context);
  };
}