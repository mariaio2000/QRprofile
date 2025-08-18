import React from 'react';
import { Link2, Globe, Linkedin, Twitter, Github, Instagram, Facebook, Youtube } from 'lucide-react';
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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <Link2 className="w-5 h-5 mr-2 text-violet-600" />
        Social Links
      </h3>
      
      <div className="space-y-4">
        {socialPlatforms.map((platform) => {
          const Icon = platform.icon;
          return (
            <div key={platform.key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Icon className="w-4 h-4 inline mr-1" />
                {platform.label}
              </label>
              <input
                type="url"
                value={profileData.socialLinks[platform.key as keyof typeof profileData.socialLinks] || ''}
                onChange={(e) => handleSocialLinkChange(platform.key, e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                placeholder={platform.placeholder}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SocialLinksEditor;