// src/components/common/ImageAvatarUploader.tsx
import React, { useEffect, useRef, useState } from "react";
import { uploadImage, getImageData, imageDataToBlobUrl } from "../../lib/uploadImage";
import { supabase } from "../../supabase/client";

type Props = {
  value?: string;                 // current image ID (not URL)
  onChange: (imageId: string) => void;
  label?: string;
  fallbackName?: string;          // used to render a default avatar
  profileId: string;              // required for database storage
};

const ImageAvatarUploader: React.FC<Props> = ({
  value,
  onChange,
  label = "Profile photo (JPG, JPEG, PNG)",
  fallbackName = "User",
  profileId,
}) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");

  // Debug: Log when imageUrl changes
  useEffect(() => {
    console.log('ImageAvatarUploader: imageUrl state changed to:', imageUrl);
  }, [imageUrl]);
  const fileRef = useRef<HTMLInputElement>(null);

  // A nice default avatar
  const fallbackUrl = `https://api.dicebear.com/7.x/initials/jpg?seed=${encodeURIComponent(
    fallbackName || "User"
  )}`;

  // Load image data when value changes
  useEffect(() => {
    const loadImage = async () => {
      console.log('ImageAvatarUploader: Loading image for value:', value);
      if (value) {
        try {
          const imageData = await getImageData(value);
          console.log('ImageAvatarUploader: Image data received:', imageData ? 'success' : 'null');
          if (imageData) {
            const blobUrl = imageDataToBlobUrl(imageData.data, imageData.mimeType);
            console.log('ImageAvatarUploader: Created blob URL:', blobUrl);
            setImageUrl(blobUrl);
          } else {
            console.log('ImageAvatarUploader: No image data found, using fallback');
            setImageUrl(fallbackUrl);
          }
        } catch (error) {
          console.error('ImageAvatarUploader: Error loading image:', error);
          setImageUrl(fallbackUrl);
        }
      } else {
        console.log('ImageAvatarUploader: No value, using fallback');
        setImageUrl("");
      }
    };

    loadImage();
  }, [value, fallbackUrl]);

  const trigger = () => fileRef.current?.click();

  const handleFile = async (file: File) => {
    try {
      setLoading(true);
      console.log('ImageAvatarUploader: Starting upload...');
      console.log('ImageAvatarUploader: File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      console.log('ImageAvatarUploader: profileId:', profileId);
      console.log('ImageAvatarUploader: profileId type:', typeof profileId);
      console.log('ImageAvatarUploader: profileId length:', profileId?.length);
      
      if (!profileId) {
        throw new Error('Profile ID is required for image upload');
      }
      
      console.log('ImageAvatarUploader: Calling uploadImage...');
      const imageId = await uploadImage(file, profileId);
      console.log('ImageAvatarUploader: Upload successful, calling onChange with imageId:', imageId);
      onChange(imageId);
    } catch (e: any) {
      console.error('ImageAvatarUploader: Upload error:', e);
      console.error('ImageAvatarUploader: Error details:', {
        message: e?.message,
        stack: e?.stack,
        name: e?.name
      });
      alert(e?.message || "Could not upload image.");
    } finally {
      setLoading(false);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    // reset so selecting same file works again
    e.currentTarget.value = "";
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      <div className="flex items-center gap-4">
        <img
          src={imageUrl || fallbackUrl}
          alt="Avatar preview"
          className="h-16 w-16 rounded-full object-cover ring-1 ring-gray-200"
          onLoad={() => console.log('ImageAvatarUploader: Image loaded successfully, src:', imageUrl || fallbackUrl)}
          onError={(e) => {
            console.error('ImageAvatarUploader: Image failed to load, src:', e.currentTarget.src);
            console.error('ImageAvatarUploader: Error details:', e);
            console.error('ImageAvatarUploader: Current imageUrl state:', imageUrl);
            console.error('ImageAvatarUploader: Current value:', value);
          }}
        />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={trigger}
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Uploading…" : "Upload Image"}
          </button>

          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded-lg border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Use default
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        className="hidden"
        onChange={onInputChange}
      />

      <p className="text-xs text-gray-500">
        JPG, JPEG, PNG only. Max 10MB. The preview updates instantly.
      </p>
    </div>
  );
};

export default ImageAvatarUploader;
