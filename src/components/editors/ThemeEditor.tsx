import React from 'react';
import { Palette } from 'lucide-react';
import { ProfileData } from '../../types/profile';

interface ThemeEditorProps {
  profileData: ProfileData;
  onUpdate: (data: Partial<ProfileData>) => void;
}

const ThemeEditor: React.FC<ThemeEditorProps> = ({ profileData, onUpdate }) => {
  const presetThemes = [
    { name: 'Professional Blue', primary: '#3B82F6', secondary: '#6366F1', accent: '#8B5CF6' },
    { name: 'Ocean Breeze', primary: '#0EA5E9', secondary: '#06B6D4', accent: '#10B981' },
    { name: 'Violet Dreams', primary: '#8B5CF6', secondary: '#EC4899', accent: '#F97316' },
    { name: 'Sunset Glow', primary: '#F59E0B', secondary: '#EF4444', accent: '#EC4899' },
    { name: 'Forest Green', primary: '#059669', secondary: '#84CC16', accent: '#F59E0B' },
    { name: 'Royal Purple', primary: '#7C3AED', secondary: '#A855F7', accent: '#F472B6' }
  ];

  const handleThemeChange = (theme: typeof presetThemes[0]) => {
    onUpdate({
      theme: {
        primary: theme.primary,
        secondary: theme.secondary,
        accent: theme.accent
      }
    });
  };

  const handleCustomColorChange = (colorType: 'primary' | 'secondary' | 'accent', color: string) => {
    onUpdate({
      theme: {
        ...profileData.theme,
        [colorType]: color
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-text-700 mb-3">Preset Themes</h4>
        <div className="grid grid-cols-2 gap-3">
          {presetThemes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => handleThemeChange(theme)}
              className="group p-3 border border-border rounded-xl hover:border-primary-300 transition-all text-left bg-surface"
            >
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex space-x-1">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: theme.primary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: theme.secondary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: theme.accent }}
                  />
                </div>
              </div>
              <p className="text-sm font-medium text-text-900 group-hover:text-primary-600 transition-colors">
                {theme.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-text-700 mb-3">Custom Colors</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <label className="text-sm text-text-600 w-20">Primary</label>
            <input
              type="color"
              value={profileData.theme.primary}
              onChange={(e) => handleCustomColorChange('primary', e.target.value)}
              className="w-12 h-8 border border-border rounded-xl cursor-pointer"
            />
            <input
              type="text"
              value={profileData.theme.primary}
              onChange={(e) => handleCustomColorChange('primary', e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-border rounded-xl focus:ring-4 focus:ring-ring focus:border-transparent bg-surface"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <label className="text-sm text-text-600 w-20">Secondary</label>
            <input
              type="color"
              value={profileData.theme.secondary}
              onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
              className="w-12 h-8 border border-border rounded-xl cursor-pointer"
            />
            <input
              type="text"
              value={profileData.theme.secondary}
              onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-border rounded-xl focus:ring-4 focus:ring-ring focus:border-transparent bg-surface"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <label className="text-sm text-text-600 w-20">Accent</label>
            <input
              type="color"
              value={profileData.theme.accent}
              onChange={(e) => handleCustomColorChange('accent', e.target.value)}
              className="w-12 h-8 border border-border rounded-xl cursor-pointer"
            />
            <input
              type="text"
              value={profileData.theme.accent}
              onChange={(e) => handleCustomColorChange('accent', e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-border rounded-xl focus:ring-4 focus:ring-ring focus:border-transparent bg-surface"
            />
          </div>
        </div>
      </div>

      <div className="p-4 border border-border rounded-xl bg-surface">
        <h4 className="text-sm font-medium text-text-700 mb-3">Preview</h4>
        <div 
          className="h-16 rounded-xl relative"
          style={{
            background: `linear-gradient(135deg, ${profileData.theme.primary}, ${profileData.theme.secondary})`
          }}
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-sm font-medium">Your Profile Header</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeEditor;