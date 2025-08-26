import React, { useState, useRef } from 'react';
import { User, Upload, X } from 'lucide-react';
import { ProfileData } from '../../types/profile';
import { supabase } from '../../lib/supabase';

interface BasicInfoEditorProps {
  profileData: ProfileData;
  onUpdate: (data: Partial<ProfileData>) => void;
}

const BasicInfoEditor: React.FC<BasicInfoEditorProps> = ({ profileData, onUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      // Update profile with new image URL
      onUpdate({ profileImage: publicUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onUpdate({ profileImage: 'https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg?auto=compress&cs=tinysrgb&w=400' });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Profile Image Section */}
      <div>
        <label className="block text-sm font-medium text-text-700 mb-4">Profile Photo</label>
        
        <div className="flex items-start space-x-6">
          {/* Current Image Preview */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-surface-muted border-2 border-border">
              <img
                src={profileData.profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            
            {profileData.profileImage !== 'https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg?auto=compress&cs=tinysrgb&w=400' && (
              <button
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-danger-600 text-white rounded-full flex items-center justify-center hover:bg-danger-700 transition-colors"
                title="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            <button
              onClick={triggerFileInput}
              disabled={isUploading}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Uploading...' : 'Upload Photo'}</span>
            </button>
            
            <p className="text-xs text-text-500 mt-2">
              JPG, PNG, GIF up to 5MB
            </p>
            
            {uploadError && (
              <p className="text-xs text-danger-600 mt-1">{uploadError}</p>
            )}
          </div>
        </div>
      </div>

      {/* Name Section */}
      <div>
        <label className="block text-sm font-medium text-text-700 mb-2">
          <User className="w-4 h-4 inline mr-2" />
          Full Name
        </label>
        <input
          type="text"
          value={profileData.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="w-full px-4 py-3 border border-border rounded-xl focus:ring-4 focus:ring-ring focus:border-transparent transition-all bg-surface"
          placeholder="Enter your full name"
        />
      </div>
    </div>
  );
};

export default BasicInfoEditor;