import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import ProfileEditor from './components/ProfileEditor';
import ProfilePreview from './components/ProfilePreview';
import QRCodeGenerator from './components/QRCodeGenerator';
import Navigation from './components/Navigation';
import PublicProfile from './components/PublicProfile';
import { ProfileData } from './types/profile';
import { useAuth } from './hooks/useAuth';
import { useProfile } from './hooks/useProfile';

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
    profileImage: 'https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg?auto=compress&cs=tinysrgb&w=400',
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

  const handleProfileUpdate = async (newData: Partial<ProfileData & { photoWidgets?: PhotoWidget[] }>) => {
    const updatedData = { ...profileData, ...newData };
    setProfileData(updatedData);

    if (user) {
      try {
        if (profile) {
          await updateProfile(newData);
        } else {
          // Create profile if it doesn't exist
          // Generate username from email or use a default
          let username = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
          
          // If username is too short or empty, use a fallback
          if (username.length < 3) {
            username = `user${Date.now().toString().slice(-6)}`;
          }
          
          await createProfile(updatedData, username);
        }
      } catch (error) {
        console.error('Failed to save profile:', error);
        // You might want to show an error message to the user here
      }
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
        profileImage: 'https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg?auto=compress&cs=tinysrgb&w=400',
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
    return <LandingPage onEnterApp={handleEnterApp} />;
  }

  // Show landing page overlay if requested
  if (showLandingPage) {
    return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <LandingPage onEnterApp={handleEnterApp} />
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
            {currentView === 'edit' && (
              <ProfileEditor 
                profileData={profileData} 
                onUpdate={handleProfileUpdate}
              />
            )}
            
            {currentView === 'preview' && (
              <ProfilePreview profileData={profileData} />
            )}
            
            {currentView === 'qr' && (
              <QRCodeGenerator profileData={profileData} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;