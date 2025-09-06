import React, { useState, useEffect, useCallback } from 'react';
import LandingPage from '@/components/LandingPage';
import ProfileEditor, { type Profile } from '@/components/ProfileEditor';
import ProfileSummary from '@/components/ProfileSummary';
import QrCodeTab, { type Profile as QrProfile } from '@/components/QrCodeTab';
import Navigation from '@/components/Navigation';
import PublicProfile from '@/components/PublicProfile';
import { ProfileData } from '@/types/profile';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

function toEditorModel(profileData: any): Profile {
  console.log('toEditorModel input:', profileData);
  const result = {
    id: profileData.id,
    fullName: profileData.name ?? "",
    title: profileData.title ?? "",
    bio: profileData.bio ?? "",
    profile_image_id: profileData.profile_image_id ?? "",

    phone: profileData.phone ?? "",
    location: profileData.location ?? "",
    website: profileData.socialLinks?.website ?? profileData.website ?? "",

    socials: profileData.socialLinks ? Object.entries(profileData.socialLinks)
      .filter(([_, url]) => url)
      .map(([platform, url]) => ({
        label: platform.charAt(0).toUpperCase() + platform.slice(1),
        url: url as string
      })) : [],
    services: profileData.services ?? [],
    photos: profileData.photos ?? [],

    themeFrom: profileData.theme?.primary ?? "#4F46E5",
    themeTo: profileData.theme?.secondary ?? "#6366F1",
  };
  console.log('toEditorModel output:', result);
  return result;
}

interface PhotoWidget {
  id: string;
  title: string;
  photos: string[];
  layout: 'grid' | 'carousel';
}

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, loading: profileLoading, createProfile, updateProfile } = useProfile(user?.id || null);
  const [currentView, setCurrentView] = useState<'edit' | 'preview' | 'qr'>('edit');
  const [publicUsername, setPublicUsername] = useState<string | null>(null);
  const [showLandingPage, setShowLandingPage] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData & { photoWidgets?: PhotoWidget[] }>({
    name: '',
    title: '',
    bio: '',
    profile_image_id: undefined,
    email: '',
    phone: '',
    location: '',
    socialLinks: {},
    services: [],
    photoWidgets: [],
    theme: {
      primary: '#3B82F6',
      secondary: '#6366F1',
      accent: '#8B5CF6'
    }
  });

  // Check for public profile route on mount
  useEffect(() => {
    const path = window.location.pathname;
    if (path !== '/' && path.length > 1) {
      const username = path.substring(1); // Remove leading slash
      setPublicUsername(username);
    }
  }, []);

  // Update profile data when user or profile changes
  useEffect(() => {
    if (user && profile) {
      console.log('Setting profileData from profile:', profile);
      setProfileData({
        ...profile,
        photoWidgets: profile.photoWidgets || []
      });
    } else if (user && !profile && !profileLoading) {
      // Initialize with user data if no profile exists
      setProfileData(prev => ({
        ...prev,
        name: user.name,
        email: user.email
      }));
    }
  }, [user, profile, profileLoading]);

  // Debug: Log profileData when it changes
  useEffect(() => {
    console.log('profileData changed:', profileData);
    console.log('profileData.id:', profileData.id);
  }, [profileData]);

  const handleProfileUpdate = async (newData: Partial<ProfileData & { photoWidgets?: PhotoWidget[] }>) => {
    const updatedData = { ...profileData, ...newData };
    setProfileData(updatedData);

    if (user) {
      try {
        console.log('Profile update triggered:', { user: user.id, profile: !!profile, newData });
        if (profile) {
          console.log('Updating existing profile');
          await updateProfile(newData);
        } else {
          console.log('Creating new profile');
          // Create profile if it doesn't exist
          // Generate username from email or use a default
          let username = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
          
          // If username is too short or empty, use a fallback
          if (username.length < 3) {
            username = `user${Date.now().toString().slice(-6)}`;
          }
          
          console.log('Creating profile with username:', username);
          await createProfile(updatedData, username);
        }
      } catch (error) {
        console.error('Failed to save profile:', error);
        // You might want to show an error message to the user here
      }
    } else {
      console.log('No user found, cannot save profile');
    }
  };

  const handleEnterApp = (authenticatedUser: { id: string; email: string; name: string }) => {
    // The useAuth hook will handle setting the user state
    // Profile will be loaded automatically by useProfile hook
    setPublicUsername(null); // Clear public view when entering app
    
    // Add a history entry for the landing page so back button works
    window.history.pushState({ view: 'landing' }, '', '/');
    // Add current app state
    window.history.pushState({ view: 'app' }, '', '/app');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setCurrentView('edit');
      setPublicUsername(null);
      setProfileData({
        name: '',
        title: '',
        bio: '',
        profile_image_id: undefined,
        email: '',
        phone: '',
        location: '',
        socialLinks: {},
        services: [],
        photoWidgets: [],
        theme: {
          primary: '#3B82F6',
          secondary: '#6366F1',
          accent: '#8B5CF6'
        }
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Auto-save callback for ProfileEditor
  const handleAutoSave = useCallback(async (profile: Profile) => {
    console.log('handleAutoSave called with profile:', profile);
    
    const updateData = {
      name: profile.fullName,
      title: profile.title,
      bio: profile.bio,
      profile_image_id: profile.profile_image_id || null, // Convert empty string to null
      phone: profile.phone,
      location: profile.location,
      website: profile.website,
      socialLinks: profile.socials.reduce((acc, social) => {
        acc[social.label.toLowerCase()] = social.url;
        return acc;
      }, {} as Record<string, string>),
      services: profile.services,
      photos: profile.photos,
      photoWidgets: profile.photoWidgets || [],
      theme: {
        primary: profile.themeFrom,
        secondary: profile.themeTo,
        accent: profile.themeTo
      }
    };
    
    console.log('handleAutoSave updateData:', updateData);
    
    // Update local state immediately for real-time preview
    setProfileData(prev => {
      const newData = { ...prev, ...updateData };
      console.log('handleAutoSave updating profileData from:', prev, 'to:', newData);
      return newData;
    });
    
    // Also update database (but don't await it to avoid blocking UI)
    handleProfileUpdate(updateData).catch(error => {
      console.error('Failed to save to database:', error);
    });
  }, [handleProfileUpdate]);

  const handleBackToHome = () => {
    setPublicUsername(null);
    window.history.pushState({}, '', '/');
  };

  const handleBackToLanding = () => {
    setShowLandingPage(true);
  };



  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.view === 'landing' || !event.state) {
        // Go back to landing page
        setShowLandingPage(true);
        // Update URL to show landing page
        window.history.replaceState({ view: 'landing' }, '', '/');
      } else if (event.state?.view === 'app') {
        // Stay in app
        setShowLandingPage(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Show public profile if username is provided
  if (publicUsername) {
    return <PublicProfile username={publicUsername} onBackToHome={handleBackToHome} />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white/30 rounded-lg"></div>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage onEnterApp={handleEnterApp} user={null} onNavigateToProfile={() => {}} onLogout={() => {}} />;
  }

  // Show landing page overlay if requested
  if (showLandingPage) {
    return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <LandingPage 
        onEnterApp={handleEnterApp} 
        user={user} 
        onNavigateToProfile={() => setShowLandingPage(false)}
        onLogout={handleLogout}
      />
    </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView}
        user={user}
        onLogout={handleLogout}
        onBackToLanding={handleBackToLanding}
      />
      
      <main className="container mx-auto px-4 py-8">
        {profileLoading ? (
                      <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your profile...</p>
              </div>
            </div>
        ) : (
          <>
            {currentView === 'edit' && (() => {
              const editorProfile = toEditorModel(profileData);
              console.log('Passing to ProfileEditor:', editorProfile);
              console.log('ProfileEditor profile.id:', editorProfile.id);
              return (
                <ProfileEditor 
                  initialProfile={editorProfile}
                  onAutoSave={handleAutoSave}
                  onBack={() => setCurrentView('preview')}
                  onFinish={() => setCurrentView('qr')}
                />
              );
            })()}
            
            {currentView === 'preview' && (() => {
              console.log('Rendering ProfileSummary component');
              return <ProfileSummary />;
            })()}
            
            {currentView === 'qr' && (
              <QrCodeTab profile={{
                username: profile?.username || 'user',
                name: profileData.name || '',
                title: profileData.title,
                company: profileData.company,
                email: profileData.email,
                phone: profileData.phone,
                website: profileData.socialLinks?.website,
                address: profileData.location,
                avatarUrl: profileData.profile_image_id, // Use the image ID instead of URL
                socials: profileData.socialLinks ? Object.entries(profileData.socialLinks)
                  .filter(([_, url]) => url)
                  .map(([platform, url]) => ({
                    label: platform.charAt(0).toUpperCase() + platform.slice(1),
                    url: url as string
                  })) : [],
                services: profileData.services || [],
                photoWidgets: profileData.photoWidgets || [],
                theme: profileData.theme
              }} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;