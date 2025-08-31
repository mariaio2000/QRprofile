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

    // If signup was successful and we have a user, create a profile immediately
    if (data.user) {
      try {
        console.log('Creating profile for new user:', data.user.id);
        
        // Generate username from email
        let username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // If username is too short or empty, use a fallback
        if (username.length < 3) {
          username = `user${Date.now().toString().slice(-6)}`;
        }

        // Handle username conflicts by adding a number suffix
        let finalUsername = username;
        let counter = 1;
        while (true) {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('username')
            .eq('username', finalUsername)
            .single();
          
          if (!existingProfile) {
            break; // Username is available
          }
          finalUsername = `${username}${counter}`;
          counter++;
        }

        // Create default profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            username: finalUsername,
            name: name || email.split('@')[0] || 'User',
            title: '',
            bio: '',
            profile_image_id: null, // Already null, which is correct
            email: email,
            phone: '',
            location: '',
            social_links: {},
            services: [],
            photo_widgets: [],
            theme: {
              primary: '#8B5CF6',
              secondary: '#EC4899',
              accent: '#F97316'
            }
          });

        if (profileError) {
          console.error('Failed to create profile during signup:', profileError);
          // Don't throw error here as the user account was created successfully
          // The profile will be created later by useProfile hook
        } else {
          console.log('Profile created successfully for new user:', finalUsername);
        }
      } catch (profileErr) {
        console.error('Error creating profile during signup:', profileErr);
        // Don't throw error here as the user account was created successfully
        // The profile will be created later by useProfile hook
      }
    }

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