import React from 'react';
import { ProfileData } from '../types/profile';
import DualCardSwitcher, { type Profile as CardProfile } from "./DualCardSwitcher";

interface PhotoWidget {
  id: string;
  title: string;
  photos: string[];
  layout: 'grid' | 'carousel';
}

interface ProfilePreviewProps {
  profileData: ProfileData & { photoWidgets?: PhotoWidget[] };
}

const ProfilePreview: React.FC<ProfilePreviewProps> = ({ profileData }) => {
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
    <div className="max-w-md mx-auto">
      <div className="mt-4">
        <DualCardSwitcher profile={cardProfile} />
      </div>
    </div>
  );
};

export default ProfilePreview;