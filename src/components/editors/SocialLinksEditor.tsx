import React from 'react';
import { Share2, Globe, Linkedin, Twitter, Github, Instagram, Facebook, Youtube } from 'lucide-react';
import { ProfileData } from '../../types/profile';

interface SocialLinksEditorProps {
  profileData: ProfileData;
  onUpdate: (data: Partial<ProfileData>) => void;
}

const SocialLinksEditor: React.FC<SocialLinksEditorProps> = ({ profileData, onUpdate }) => {
  const socialPlatforms = [
    { key: 'website', label: 'Website', icon: Globe, placeholder: 'https://yourwebsite.com' },
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
    { key: 'twitter', label: 'Twitter', icon: Twitter, placeholder: 'https://twitter.com/username' },
    { key: 'github', label: 'GitHub', icon: Github, placeholder: 'https://github.com/username' },
    { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/username' },
    { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/username' },
    { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/c/username' }
  ];

  const handleSocialLinkChange = (platform: string, value: string) => {
    onUpdate({
      socialLinks: {
        ...profileData.socialLinks,
        [platform]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      {socialPlatforms.map((platform) => {
        const Icon = platform.icon;
        return (
          <div key={platform.key}>
            <label className="block text-sm font-medium text-text-700 mb-2">
              <Icon className="w-4 h-4 inline mr-2" />
              {platform.label}
            </label>
            <input
              type="url"
              value={profileData.socialLinks[platform.key as keyof typeof profileData.socialLinks] || ''}
              onChange={(e) => handleSocialLinkChange(platform.key, e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-xl focus:ring-4 focus:ring-ring focus:border-transparent transition-all bg-surface"
              placeholder={platform.placeholder}
            />
          </div>
        );
      })}
    </div>
  );
};

export default SocialLinksEditor;