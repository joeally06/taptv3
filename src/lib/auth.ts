import { supabase } from './supabase';
import { setSessionCookie, clearSessionCookie } from './session';

export async function createUser(email: string, password: string, role: string = 'user') {
  try {
    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role
        }
      }
    });

    if (error) {
      console.error('User creation error:', error);
      throw error;
    }

    if (!user) {
      throw new Error('No user data returned');
    }

    return {
      id: user.id,
      email: user.email,
      role
    };
  } catch (error) {
    console.error('User creation process failed:', error);
    throw error;
  }
}

export async function authenticateUser(email: string, password: string) {
  try {
    console.log('Attempting authentication for:', email);
    
    const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      console.error('Sign in error:', signInError);
      throw signInError;
    }

    if (!session?.user) {
      console.error('No session or user data returned');
      throw new Error('Authentication failed');
    }

    console.log('Session established:', session);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting user data:', userError);
      throw userError || new Error('Failed to get user data');
    }

    console.log('User metadata:', user.user_metadata);

    const isAdmin = user.user_metadata?.role === 'admin';
    if (!isAdmin) {
      console.error('User is not an admin:', user.user_metadata);
      throw new Error('Access denied: User is not an admin');
    }

    // Set the session cookie
    setSessionCookie(session.access_token);

    return {
      id: user.id,
      email: user.email,
      role: 'admin',
      session: session.access_token
    };
  } catch (error) {
    console.error('Authentication process failed:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    await supabase.auth.signOut();
    clearSessionCookie();
    return true;
  } catch (error) {
    console.error('Sign out error:', error);
    return false;
  }
}

export async function isAdmin(userId: string) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      console.error('Error checking admin status:', error);
      return false;
    }

    const isAdmin = user.user_metadata?.role === 'admin';
    console.log('Admin check result:', { userId, isAdmin, metadata: user.user_metadata });
    return isAdmin;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}