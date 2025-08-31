import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Share, Copy } from 'lucide-react';
import { ProfileData } from '../types/profile';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';
import { getImageData, imageDataToBlobUrl } from '../lib/uploadImage';

interface QRCodeGeneratorProps {
  profileData: ProfileData;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ profileData }) => {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id || null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Use the actual username from the profile, fallback to generated one
  const username = profile?.username || user?.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
  const profileUrl = `${window.location.origin}/${username}`;

  useEffect(() => {
    generateQRCode();
  }, [profileData, username]);

  const generateQRCode = async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = 400;
      canvas.height = 500;

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 400, 500);
      gradient.addColorStop(0, profileData.theme.primary + '40');
      gradient.addColorStop(0.5, profileData.theme.secondary + '30');
      gradient.addColorStop(1, profileData.theme.accent + '40');
      
      // Fill background
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 500);

      // Add organic blob shapes
      ctx.save();
      ctx.globalAlpha = 0.1;
      
      // Blob 1
      ctx.fillStyle = profileData.theme.primary;
      ctx.beginPath();
      ctx.ellipse(100, 100, 80, 60, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Blob 2
      ctx.fillStyle = profileData.theme.secondary;
      ctx.beginPath();
      ctx.ellipse(300, 400, 90, 70, -Math.PI / 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Blob 3
      ctx.fillStyle = profileData.theme.accent;
      ctx.beginPath();
      ctx.ellipse(350, 150, 60, 80, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();

      // Generate QR code
      const qrCodeDataUrl = await QRCode.toDataURL(profileUrl, {
        width: 240,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      const qrImage = new Image();
      qrImage.onload = () => {
        // Draw white rounded rectangle for QR code
        const qrX = 80;
        const qrY = 130;
        const qrSize = 240;
        const radius = 20;

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.roundRect(qrX, qrY, qrSize, qrSize, radius);
        ctx.fill();

        // Draw QR code
        ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

        // Load and draw profile image in center
        const profileImage = new Image();
        profileImage.crossOrigin = 'anonymous';
        profileImage.onload = () => {
          const centerX = 200;
          const centerY = 250;
          const circleRadius = 30;

          // Draw white circle background for profile image
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(centerX, centerY, circleRadius + 5, 0, Math.PI * 2);
          ctx.fill();

          // Clip to circle and draw profile image with proper aspect ratio
          ctx.save();
          ctx.beginPath();
          ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
          ctx.clip();

          // Calculate dimensions to maintain aspect ratio
          const imgWidth = profileImage.naturalWidth;
          const imgHeight = profileImage.naturalHeight;
          const aspectRatio = imgWidth / imgHeight;
          
          let drawWidth, drawHeight;
          if (aspectRatio > 1) {
            // Image is wider than tall
            drawHeight = circleRadius * 2;
            drawWidth = drawHeight * aspectRatio;
          } else {
            // Image is taller than wide or square
            drawWidth = circleRadius * 2;
            drawHeight = drawWidth / aspectRatio;
          }

          // Center the image within the circle
          const drawX = centerX - drawWidth / 2;
          const drawY = centerY - drawHeight / 2;

          ctx.drawImage(profileImage, drawX, drawY, drawWidth, drawHeight);
          ctx.restore();

          // Add name and title below QR code
          ctx.fillStyle = '#1F2937';
          ctx.font = 'bold 24px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText(profileData.name, 200, 410);

          ctx.fillStyle = '#6B7280';
          ctx.font = '18px system-ui';
          ctx.fillText(profileData.title, 200, 440);

          // Convert canvas to data URL
          const dataUrl = canvas.toDataURL('image/png');
          setQrCodeUrl(dataUrl);
        };
        // Use the new database image system
        if (profileData.profile_image_id) {
          // Load image from database
          getImageData(profileData.profile_image_id).then((imageData) => {
            if (imageData) {
              const blobUrl = imageDataToBlobUrl(imageData.data, imageData.mimeType);
              profileImage.src = blobUrl;
            } else {
              // Fallback to default avatar
              profileImage.src = `https://api.dicebear.com/7.x/initials/jpg?seed=${encodeURIComponent(profileData.name || "User")}`;
            }
          }).catch(() => {
            // Fallback to default avatar on error
            profileImage.src = `https://api.dicebear.com/7.x/initials/jpg?seed=${encodeURIComponent(profileData.name || "User")}`;
          });
        } else {
          // Fallback to default avatar
          profileImage.src = `https://api.dicebear.com/7.x/initials/jpg?seed=${encodeURIComponent(profileData.name || "User")}`;
        }
      };
      qrImage.src = qrCodeDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleDownload = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = `${profileData.name.replace(/\s+/g, '-')}-qr-code.png`;
      link.href = qrCodeUrl;
      link.click();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileData.name}'s Profile`,
          text: `Check out ${profileData.name}'s profile`,
          url: profileUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your QR Code</h2>
        <p className="text-gray-600">Share your profile instantly</p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-xl">
        <div className="flex justify-center mb-6">
          <canvas 
            ref={canvasRef}
            className="rounded-2xl shadow-lg"
            style={{ width: '300px', height: '375px' }}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            <span className="font-mono">{profileUrl}</span>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={handleDownload}
                              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>

            <button
              onClick={handleCopyLink}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl ${
                copied 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>


          </div>
        </div>
      </div>

      
    </div>
  );
};

export default QRCodeGenerator;