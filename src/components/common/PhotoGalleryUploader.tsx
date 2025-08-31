// src/components/common/PhotoGalleryUploader.tsx
import React, { useEffect, useRef, useState } from "react";
import { uploadImage, getImageData, imageDataToBlobUrl } from "../../lib/uploadImage";

type Props = {
  value?: string[];                // array of image IDs
  onChange: (imageIds: string[]) => void;
  label?: string;
  profileId: string;              // required for database storage
  maxPhotos?: number;
};

const PhotoGalleryUploader: React.FC<Props> = ({
  value = [],
  onChange,
  label = "Photos (JPG, JPEG, PNG)",
  profileId,
  maxPhotos = 6,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progressText, setProgressText] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load image URLs for display
  useEffect(() => {
    const loadImageUrls = async () => {
      const urls: { [key: string]: string } = {};
      for (const imageId of value) {
        try {
          const imageData = await getImageData(imageId);
          if (imageData) {
            const blobUrl = imageDataToBlobUrl(imageData.data, imageData.mimeType);
            urls[imageId] = blobUrl;
          }
        } catch (error) {
          console.error('Error loading image:', error);
        }
      }
      setImageUrls(urls);
    };

    loadImageUrls();
  }, [value]);

  const handlePickFiles = () => fileInputRef.current?.click();

  const handleFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list.length) return;

    const remaining = Math.max(0, maxPhotos - value.length);
    const toUpload = list.slice(0, remaining);

    if (toUpload.length === 0) {
      alert(`You already added the maximum number of photos (${maxPhotos}).`);
      return;
    }

    setUploading(true);
    try {
      const newImageIds: string[] = [];
      let index = 0;

      for (const file of toUpload) {
        index += 1;
        if (!/\.(jpe?g|png)$/i.test(file.name) && !/(jpe?g|png)$/i.test(file.type)) {
          alert(`"${file.name}" is not a supported image format. Please upload .jpg/.jpeg/.png files.`);
          continue;
        }

        setProgressText(`Uploading ${index} of ${toUpload.length}…`);
        const imageId = await uploadImage(file, profileId);
        newImageIds.push(imageId);
      }

      if (newImageIds.length) {
        onChange([...value, ...newImageIds]);
      }
    } catch (err) {
      console.error(err);
      alert("Some images couldn't be uploaded. Please try again.");
    } finally {
      setUploading(false);
      setProgressText(null);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      void handleFiles(e.target.files);
      // Reset value so selecting the same file again works
      e.target.value = "";
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      void handleFiles(e.dataTransfer.files);
    }
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const removePhoto = (index: number) => {
    const newPhotos = value.filter((_, idx) => idx !== index);
    onChange(newPhotos);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label} <span className="text-gray-400">(upload 3–{maxPhotos} images)</span>
      </label>

      {/* Dropzone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4"
      >
        <div className="text-sm text-gray-600">
          Drag & drop images here, or
          <button
            type="button"
            onClick={handlePickFiles}
            className="ml-1 font-medium text-indigo-600 hover:text-indigo-700"
          >
            browse files
          </button>
          .
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          multiple
          onChange={onInputChange}
          className="hidden"
        />

        <button
          type="button"
          disabled={uploading}
          onClick={handlePickFiles}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Add Images"}
        </button>
      </div>

      {progressText && (
        <div className="text-xs text-gray-500">{progressText}</div>
      )}

      {/* Thumbnails */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {value.map((imageId, i) => (
            <div key={imageId + i} className="group relative overflow-hidden rounded-xl border">
              <img
                src={imageUrls[imageId] || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02NCA2NEM2NCA2NCA2NCA2NCA2NCA2NCIgc3Ryb2tlPSIjOUI5QkEwIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+"}
                alt={`Photo ${i + 1}`}
                className="h-32 w-full object-cover"
                loading="lazy"
              />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute right-2 top-2 hidden rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 shadow group-hover:block"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoGalleryUploader;
