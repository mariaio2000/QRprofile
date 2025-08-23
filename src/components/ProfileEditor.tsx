import React from 'react';
import { ProfileData } from '../types/profile';
import BasicInfoEditor from './editors/BasicInfoEditor';
import UsernameEditor from './editors/UsernameEditor';
import SocialLinksEditor from './editors/SocialLinksEditor';
import ServicesEditor from './editors/ServicesEditor';
import ThemeEditor from './editors/ThemeEditor';
import PhotoWidgetsEditor from './editors/PhotoWidgetsEditor';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';

interface PhotoWidget {
  id: string;
  title: string;
  photos: string[];
  layout: 'grid' | 'carousel';
}

interface ProfileEditorProps {
  profileData: ProfileData & { photoWidgets?: PhotoWidget[] };
  onUpdate: (data: Partial<ProfileData & { photoWidgets?: PhotoWidget[] }>) => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ profileData, onUpdate }) => {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id || null);

  const handleUsernameUpdate = (newUsername: string) => {
    // Username is updated directly in the database via the UsernameEditor
    // We don't need to update the profileData state as it doesn't include username
    // The profile hook will automatically update with the new username
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Your Profile</h2>
        <p className="text-slate-600">Customize your digital identity with a beautiful, shareable profile</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <UsernameEditor 
            currentUsername={profile?.username}
            onUsernameUpdate={handleUsernameUpdate}
          />
          <BasicInfoEditor profileData={profileData} onUpdate={onUpdate} />
          <SocialLinksEditor profileData={profileData} onUpdate={onUpdate} />
        </div>
        
        <div className="space-y-6">
          <ServicesEditor profileData={profileData} onUpdate={onUpdate} />
          <PhotoWidgetsEditor profileData={profileData} onUpdate={onUpdate} />
          <ThemeEditor profileData={profileData} onUpdate={onUpdate} />
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;