import { supabase } from './supabase';

export interface SessionUser {
  id: string;
  email: string;
  role: string;
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session?.user) {
      console.error('Session error:', error);
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email || '',
      role: session.user.user_metadata?.role || 'user'
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export function setSessionCookie(token: string) {
  const secure = window.location.protocol === 'https:';
  document.cookie = `sb-access-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}${secure ? '; secure' : ''}; samesite=lax`;
}

export function clearSessionCookie() {
  document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; samesite=lax';
}

export function getSessionCookie(): string | null {
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(c => c.trim().startsWith('sb-access-token='));
  return tokenCookie ? tokenCookie.split('=')[1].trim() : null;
}