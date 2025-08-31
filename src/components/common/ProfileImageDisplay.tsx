// src/components/common/ProfileImageDisplay.tsx
import React, { useEffect, useState } from "react";
import { getImageData, imageDataToBlobUrl } from "../../lib/uploadImage";

type Props = {
  imageId?: string;
  fallbackUrl?: string;
  alt?: string;
  className?: string;
};

const ProfileImageDisplay: React.FC<Props> = ({
  imageId,
  fallbackUrl = "https://api.dicebear.com/7.x/initials/jpg?seed=User",
  alt = "Profile image",
  className = "",
}) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      if (imageId) {
        setLoading(true);
        try {
          const imageData = await getImageData(imageId);
          if (imageData) {
            const blobUrl = imageDataToBlobUrl(imageData.data, imageData.mimeType);
            setImageUrl(blobUrl);
          } else {
            setImageUrl(fallbackUrl);
          }
        } catch (error) {
          console.error('Error loading image:', error);
          setImageUrl(fallbackUrl);
        } finally {
          setLoading(false);
        }
      } else {
        setImageUrl(fallbackUrl);
      }
    };

    loadImage();
  }, [imageId, fallbackUrl]);

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`${loading ? 'animate-pulse bg-gray-200' : ''} ${className}`}
    />
  );
};

export default ProfileImageDisplay;
