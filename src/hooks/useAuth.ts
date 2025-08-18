import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || ''
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || ''
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (error) throw error;
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    // Clear local state immediately to provide instant UI feedback
    setUser(null);
    setSession(null);

    // If there's no active session, we're already signed out
    if (!session) {
      return;
    }

    // Check if the session has already expired
    if (session.expires_at) {
      const expiresAt = new Date(session.expires_at * 1000); // Convert to milliseconds
      const now = new Date();
      
      if (expiresAt <= now) {
        // Session has already expired, no need to call the API
        console.debug('Session already expired, skipping sign out request');
        return;
      }
    }

    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        // Handle specific session-related errors that are non-critical
        const sessionErrorCodes = [
          'session_not_found',
          'Auth session missing!',
          'Session from session_id claim in JWT does not exist'
        ];
        
        const isSessionError = sessionErrorCodes.some(code => 
          error.message.includes(code) || error.message === code
        );
        
        if (!isSessionError) {
          // Re-throw non-session errors as they might be critical
          throw error;
        }
        
        // For session errors, we silently continue as the user is effectively signed out
        console.debug('Session already expired or invalid, sign out completed');
      }
    } catch (error: any) {
      // Additional safety net for any other session-related errors
      const errorMessage = error?.message || '';
      const sessionErrorCodes = [
        'session_not_found',
        'Auth session missing!',
        'Session from session_id claim in JWT does not exist'
      ];
      
      const isSessionError = sessionErrorCodes.some(code => 
        errorMessage.includes(code) || errorMessage === code
      );
      
      if (!isSessionError) {
        // Re-throw non-session errors
        throw error;
      }
      
      // For session errors, log debug info but don't throw
      console.debug('Session error during sign out, continuing:', errorMessage);
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut
  };
};