import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ProfileData } from '../types/profile';

interface PhotoWidget {
  id: string;
  title: string;
  photos: string[];
  layout: 'grid' | 'carousel';
}

interface DatabaseProfile {
  id: string;
  user_id: string;
  username: string;
  name: string;
  title: string;
  bio: string;
  profile_image_id: string | null; // database image ID
  email: string;
  phone: string | null;
  location: string | null;
  social_links: Record<string, string>;
  services: Array<{
    id: string;
    title: string;
    description: string;
    price: string;
    featured: boolean;
  }>;
  photo_widgets: PhotoWidget[];
  theme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  created_at: string;
  updated_at: string;
}

export const useProfile = (userId: string | null) => {
  const [profile, setProfile] = useState<(ProfileData & { username: string; photoWidgets?: PhotoWidget[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      console.log('Fetching profile for userId:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      console.log('Profile data from database:', data);
      if (data) {
        const profileData = {
          id: data.id, // Include the profile ID
          username: data.username,
          name: data.name,
          title: data.title,
          bio: data.bio,
          profile_image_id: data.profile_image_id,
          email: data.email,
          phone: data.phone,
          location: data.location,
          socialLinks: data.social_links || {},
          services: data.services || [],
          photoWidgets: data.photo_widgets || [],
          theme: data.theme || {
            primary: '#8B5CF6',
            secondary: '#EC4899',
            accent: '#F97316'
          }
        };
        console.log('Setting profile data:', profileData);
        setProfile(profileData);
      } else {
        // No profile exists, create one automatically
        console.log('No profile found, creating new profile for user:', userId);
        await createDefaultProfile();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultProfile = async () => {
    if (!userId) throw new Error('User not authenticated');

    try {
      // Get user info from auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Generate username from email
      let username = user.email?.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
      
      // If username is too short or empty, use a fallback
      if (username.length < 3) {
        username = `user${Date.now().toString().slice(-6)}`;
      }

      // Create default profile
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          username: username.toLowerCase(),
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          title: '',
          bio: '',
          profile_image_id: null, // Already null, which is correct
          email: user.email || '',
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
        })
        .select()
        .single();

      if (error) throw error;
      
      const profileData = {
        id: data.id,
        username: data.username,
        name: data.name,
        title: data.title,
        bio: data.bio,
        profile_image_id: data.profile_image_id,
        email: data.email,
        phone: data.phone,
        location: data.location,
        socialLinks: data.social_links || {},
        services: data.services || [],
        photoWidgets: data.photo_widgets || [],
        theme: data.theme || {
          primary: '#8B5CF6',
          secondary: '#EC4899',
          accent: '#F97316'
        }
      };
      
      console.log('Created default profile:', profileData);
      setProfile(profileData);
      return data;
    } catch (err) {
      console.error('Failed to create default profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to create default profile');
      throw err;
    }
  };

  const createProfile = async (profileData: ProfileData & { photoWidgets?: PhotoWidget[] }, username: string) => {
    if (!userId) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          username: username.toLowerCase(),
          name: profileData.name,
          title: profileData.title,
          bio: profileData.bio,
          profile_image_id: profileData.profile_image_id || null, // Convert empty string to null
          email: profileData.email,
          phone: profileData.phone,
          location: profileData.location,
          social_links: profileData.socialLinks,
          services: profileData.services,
          photo_widgets: profileData.photoWidgets || [],
          theme: profileData.theme
        })
        .select()
        .single();

      if (error) throw error;
      
      setProfile({
        username: username.toLowerCase(),
        ...profileData,
        id: data.id // Include the profile ID from the database
      });
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
      throw err;
    }
  };

  const updateProfile = async (updates: Partial<ProfileData & { photoWidgets?: PhotoWidget[] }>) => {
    if (!userId) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          title: updates.title,
          bio: updates.bio,
          profile_image_id: updates.profile_image_id || null, // Convert empty string to null
          email: updates.email,
          phone: updates.phone,
          location: updates.location,
          social_links: updates.socialLinks,
          services: updates.services,
          photo_widgets: updates.photoWidgets,
          theme: updates.theme
        })
        .eq('user_id', userId);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    }
  };

  const updateUsername = async (newUsername: string) => {
    if (!userId) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername.toLowerCase() })
        .eq('user_id', userId);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, username: newUsername.toLowerCase() } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update username');
      throw err;
    }
  };

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error('Error checking username:', error);
        return false;
      }

      return !data; // If data exists, username is taken
    } catch (err) {
      console.error('Error checking username:', err);
      return false;
    }
  };

  return {
    profile,
    loading,
    error,
    createProfile,
    updateProfile,
    updateUsername,
    checkUsernameAvailability,
    refetch: fetchProfile
  };
};