import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ProfileData } from '../types/profile';
import { supabase } from '../lib/supabase';
import DualCardSwitcher, { type Profile as CardProfile } from "./DualCardSwitcher";

interface PhotoWidget {
  id: string;
  title: string;
  photos: string[];
  layout: 'grid' | 'carousel';
}

interface PublicProfileProps {
  username: string;
  onBackToHome?: () => void;
}

const PublicProfile: React.FC<PublicProfileProps> = ({ username, onBackToHome }) => {
  const [profileData, setProfileData] = useState<(ProfileData & { photoWidgets?: PhotoWidget[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicProfile();
  }, [username]);

  const fetchPublicProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username.toLowerCase())
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        setError('Profile not found');
        return;
      }

      setProfileData({
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
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white/30 rounded-lg"></div>
          </div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-gray-400 rounded-lg"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">
            The profile "@{username}" doesn't exist or has been removed.
          </p>
          {onBackToHome && (
            <button
              onClick={onBackToHome}
                              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const photoWidgets = profileData.photoWidgets || [];

  const cardProfile: CardProfile = {
    username: profileData.username ?? "maria",
    name: profileData.name ?? "maria",
    email: profileData.email ?? "maria@example.com",
    avatarUrl: profileData.profileImage,
    title: profileData.title,
    company: profileData.company,
    phone: profileData.phone,
    website: profileData.socialLinks?.website,
    address: profileData.location,
    socials: profileData.socialLinks ? Object.entries(profileData.socialLinks)
      .filter(([_, url]) => url)
      .map(([label, url]) => ({ label, url })) : [],
  };

    return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="mb-6 inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        )}

        <div className="mt-4">
          <DualCardSwitcher profile={cardProfile} />
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;