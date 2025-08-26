import React, { useState, useRef } from 'react';
import { Image, Plus, X, Upload, Grid3X3, Image as ImageIcon } from 'lucide-react';
import { ProfileData } from '../../types/profile';
import { supabase } from '../../lib/supabase';

interface PhotoWidget {
  id: string;
  title: string;
  photos: string[];
  layout: 'grid' | 'carousel';
}

interface PhotoWidgetsEditorProps {
  profileData: ProfileData & { photoWidgets?: PhotoWidget[] };
  onUpdate: (data: Partial<ProfileData & { photoWidgets?: PhotoWidget[] }>) => void;
}

const PhotoWidgetsEditor: React.FC<PhotoWidgetsEditorProps> = ({ profileData, onUpdate }) => {
  const [isAddingWidget, setIsAddingWidget] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState<string[]>([]);
  const [newWidget, setNewWidget] = useState({
    title: '',
    layout: 'grid' as 'grid' | 'carousel'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentWidgetId, setCurrentWidgetId] = useState<string | null>(null);

  const photoWidgets = profileData.photoWidgets || [];

  const handleAddWidget = () => {
    if (newWidget.title) {
      const widget: PhotoWidget = {
        id: Date.now().toString(),
        title: newWidget.title,
        photos: [],
        layout: newWidget.layout
      };
      
      onUpdate({
        photoWidgets: [...photoWidgets, widget]
      });
      
      setNewWidget({ title: '', layout: 'grid' });
      setIsAddingWidget(false);
    }
  };

  const handleRemoveWidget = (widgetId: string) => {
    onUpdate({
      photoWidgets: photoWidgets.filter(widget => widget.id !== widgetId)
    });
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>, widgetId: string) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploadingPhotos(prev => [...prev, widgetId]);

    try {
      const uploadPromises = files.map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error('Please select image files only');
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Images must be less than 5MB');
        }

        // Create unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `photo-widgets/${fileName}`;

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

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      // Update widget with new photos
      const updatedWidgets = photoWidgets.map(widget => 
        widget.id === widgetId 
          ? { ...widget, photos: [...widget.photos, ...uploadedUrls] }
          : widget
      );

      onUpdate({ photoWidgets: updatedWidgets });
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload photos');
    } finally {
      setUploadingPhotos(prev => prev.filter(id => id !== widgetId));
    }
  };

  const handleRemovePhoto = (widgetId: string, photoIndex: number) => {
    const updatedWidgets = photoWidgets.map(widget => 
      widget.id === widgetId 
        ? { ...widget, photos: widget.photos.filter((_, index) => index !== photoIndex) }
        : widget
    );
    onUpdate({ photoWidgets: updatedWidgets });
  };

  const triggerFileInput = (widgetId: string) => {
    setCurrentWidgetId(widgetId);
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-900 flex items-center">
          <Image className="w-5 h-5 mr-2 text-primary-600" />
          Photo Galleries
        </h3>
        <button
          onClick={() => setIsAddingWidget(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Gallery</span>
        </button>
      </div>

      <div className="space-y-4">
        {photoWidgets.map((widget) => (
          <div key={widget.id} className="border border-border rounded-xl p-4 bg-surface">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="font-semibold text-text-900 mb-1">{widget.title}</h4>
                <div className="flex items-center space-x-2 text-sm text-text-600">
                  <span>{widget.photos.length} photos</span>
                  <span>•</span>
                  <span className="capitalize">{widget.layout} layout</span>
                </div>
              </div>
              <button
                onClick={() => handleRemoveWidget(widget.id)}
                className="p-2 bg-danger-100 text-danger-600 rounded-xl hover:bg-danger-200 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {widget.photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {widget.photos.slice(0, 6).map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-surface-muted">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleRemovePhoto(widget.id, index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-danger-600 text-white rounded-full flex items-center justify-center hover:bg-danger-700 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {widget.photos.length > 6 && (
                  <div className="aspect-square rounded-lg bg-surface-muted flex items-center justify-center text-text-500 text-sm">
                    +{widget.photos.length - 6} more
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => triggerFileInput(widget.id)}
              disabled={uploadingPhotos.includes(widget.id)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-border rounded-xl text-text-600 hover:text-text-900 hover:border-primary-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              <span>
                {uploadingPhotos.includes(widget.id) 
                  ? 'Uploading...' 
                  : widget.photos.length === 0 
                    ? 'Add photos to this gallery' 
                    : 'Add more photos'
                }
              </span>
            </button>
          </div>
        ))}
      </div>

      {isAddingWidget && (
        <div className="border border-border rounded-xl p-6 bg-surface">
          <h4 className="font-semibold text-text-900 mb-4">Create New Photo Gallery</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-700 mb-2">Gallery Title</label>
              <input
                type="text"
                value={newWidget.title}
                onChange={(e) => setNewWidget({ ...newWidget, title: e.target.value })}
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-4 focus:ring-ring focus:border-transparent transition-all bg-surface"
                placeholder="e.g., My Work, Portfolio, Behind the Scenes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-700 mb-2">Layout</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="grid"
                    checked={newWidget.layout === 'grid'}
                    onChange={(e) => setNewWidget({ ...newWidget, layout: e.target.value as 'grid' | 'carousel' })}
                    className="w-4 h-4 text-primary-600 border-border focus:ring-ring"
                  />
                  <span className="text-sm text-text-700">Grid</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="carousel"
                    checked={newWidget.layout === 'carousel'}
                    onChange={(e) => setNewWidget({ ...newWidget, layout: e.target.value as 'grid' | 'carousel' })}
                    className="w-4 h-4 text-primary-600 border-border focus:ring-ring"
                  />
                  <span className="text-sm text-text-700">Carousel</span>
                </label>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleAddWidget}
                className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all"
              >
                Create Gallery
              </button>
              <button
                onClick={() => setIsAddingWidget(false)}
                className="px-4 py-2 text-text-700 hover:text-text-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          if (currentWidgetId) {
            handlePhotoUpload(e, currentWidgetId);
          }
        }}
        className="hidden"
      />
    </div>
  );
};

export default PhotoWidgetsEditor;