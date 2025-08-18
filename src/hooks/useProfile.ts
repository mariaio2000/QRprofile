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
  profile_image: string;
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setProfile({
          username: data.username,
          name: data.name,
          title: data.title,
          bio: data.bio,
          profileImage: data.profile_image,
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
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
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
          profile_image: profileData.profileImage,
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
        ...profileData
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
          profile_image: updates.profileImage,
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