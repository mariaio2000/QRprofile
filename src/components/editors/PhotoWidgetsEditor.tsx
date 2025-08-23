import React, { useState, useRef } from 'react';
import { Camera, Plus, X, Upload, Grid3X3, Image as ImageIcon } from 'lucide-react';
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

  const handleRemovePhoto = (widgetId: string, photoUrl: string) => {
    const updatedWidgets = photoWidgets.map(widget => 
      widget.id === widgetId 
        ? { ...widget, photos: widget.photos.filter(url => url !== photoUrl) }
        : widget
    );

    onUpdate({ photoWidgets: updatedWidgets });
  };

  const handleLayoutChange = (widgetId: string, layout: 'grid' | 'carousel') => {
    const updatedWidgets = photoWidgets.map(widget => 
      widget.id === widgetId 
        ? { ...widget, layout }
        : widget
    );

    onUpdate({ photoWidgets: updatedWidgets });
  };

  const triggerFileInput = (widgetId: string) => {
    setCurrentWidgetId(widgetId);
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <Camera className="w-5 h-5 mr-2 text-blue-600" />
          Photo Widgets
        </h3>
        <button
          onClick={() => setIsAddingWidget(true)}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Widget</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => currentWidgetId && handlePhotoUpload(e, currentWidgetId)}
        className="hidden"
      />

      <div className="space-y-6">
        {photoWidgets.map((widget) => (
          <div key={widget.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h4 className="font-semibold text-gray-900">{widget.title}</h4>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleLayoutChange(widget.id, 'grid')}
                    className={`p-2 rounded-lg transition-all ${
                      widget.layout === 'grid'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-400 hover:text-blue-600'
                    }`}
                    title="Grid layout"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleLayoutChange(widget.id, 'carousel')}
                    className={`p-2 rounded-lg transition-all ${
                      widget.layout === 'carousel'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-400 hover:text-blue-600'
                    }`}
                    title="Carousel layout"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => triggerFileInput(widget.id)}
                  disabled={uploadingPhotos.includes(widget.id)}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploadingPhotos.includes(widget.id) ? 'Uploading...' : 'Add Photos'}</span>
                </button>
                <button
                  onClick={() => handleRemoveWidget(widget.id)}
                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Photos Grid */}
            {widget.photos.length > 0 ? (
              <div className={`grid gap-3 ${
                widget.layout === 'grid' 
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' 
                  : 'grid-cols-1 sm:grid-cols-2'
              }`}>
                {widget.photos.map((photoUrl, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={photoUrl}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => handleRemovePhoto(widget.id, photoUrl)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Camera className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No photos added yet</p>
                <p className="text-sm">Click "Add Photos" to get started</p>
              </div>
            )}
          </div>
        ))}

        {isAddingWidget && (
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Widget title (e.g., 'Portfolio', 'Recent Work')"
                value={newWidget.title}
                onChange={(e) => setNewWidget({ ...newWidget, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="layout"
                    value="grid"
                    checked={newWidget.layout === 'grid'}
                    onChange={(e) => setNewWidget({ ...newWidget, layout: e.target.value as 'grid' })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <Grid3X3 className="w-4 h-4" />
                  <span className="text-sm">Grid</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="layout"
                    value="carousel"
                    checked={newWidget.layout === 'carousel'}
                    onChange={(e) => setNewWidget({ ...newWidget, layout: e.target.value as 'carousel' })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-sm">Carousel</span>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAddWidget}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  Add Widget
                </button>
                <button
                  onClick={() => setIsAddingWidget(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {photoWidgets.length === 0 && !isAddingWidget && (
          <div className="text-center py-12 text-gray-500">
            <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-medium mb-2">No photo widgets yet</h4>
            <p className="mb-4">Add photo galleries to showcase your work, portfolio, or memories</p>
            <button
              onClick={() => setIsAddingWidget(true)}
                              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Widget</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoWidgetsEditor;