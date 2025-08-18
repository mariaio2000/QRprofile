import React, { useState, useEffect } from 'react';
import { MapPin, Mail, Phone, Star, Globe, Linkedin, Twitter, Github, Instagram, Facebook, Youtube, MessageCircle, ArrowLeft, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProfileData } from '../types/profile';
import { supabase } from '../lib/supabase';

interface PhotoWidget {
  id: string;
  title: string;
  photos: string[];
  layout: 'grid' | 'carousel';
}

interface PublicProfileProps {
  username: string;
  onBackToHome?: () => void;
}

const PublicProfile: React.FC<PublicProfileProps> = ({ username, onBackToHome }) => {
  const [profileData, setProfileData] = useState<(ProfileData & { photoWidgets?: PhotoWidget[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingLocation, setMeetingLocation] = useState('');
  const [carouselIndices, setCarouselIndices] = useState<Record<string, number>>({});

  const socialIcons = {
    website: Globe,
    linkedin: Linkedin,
    twitter: Twitter,
    github: Github,
    instagram: Instagram,
    facebook: Facebook,
    youtube: Youtube
  };

  useEffect(() => {
    fetchPublicProfile();
  }, [username]);

  const nextPhoto = (widgetId: string, totalPhotos: number) => {
    setCarouselIndices(prev => ({
      ...prev,
      [widgetId]: ((prev[widgetId] || 0) + 1) % totalPhotos
    }));
  };

  const prevPhoto = (widgetId: string, totalPhotos: number) => {
    setCarouselIndices(prev => ({
      ...prev,
      [widgetId]: ((prev[widgetId] || 0) - 1 + totalPhotos) % totalPhotos
    }));
  };

  const fetchPublicProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username.toLowerCase())
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        setError('Profile not found');
        return;
      }

      setProfileData({
        name: data.name,
        title: data.title,
        bio: data.bio,
        profileImage: data.profile_image,
        email: data.email,
        phone: data.phone,
        location: data.location,
        socialLinks: data.social_links || {},
        services: data.services || [],
        photoWidgets: data.photo_widgets || [],
        theme: data.theme || {
          primary: '#8B5CF6',
          secondary: '#EC4899',
          accent: '#F97316'
        }
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const generateVCard = () => {
    if (!profileData) return;

    const vCard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${profileData.name}`,
      `EMAIL:${profileData.email}`,
      profileData.phone ? `TEL:${profileData.phone}` : '',
      profileData.title ? `TITLE:${profileData.title}` : '',
      profileData.location ? `ADR:;;;;;;${profileData.location}` : '',
      profileData.bio ? `NOTE:${profileData.bio}` : '',
      profileData.socialLinks.website ? `URL:${profileData.socialLinks.website}` : '',
      'END:VCARD'
    ].filter(line => line !== '').join('\n');

    const blob = new Blob([vCard], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profileData.name.replace(/\s+/g, '-')}.vcf`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleNiceMeetingYou = () => {
    if (!profileData) return;

    const subject = `Nice meeting you!`;
    const body = `Hi ${profileData.name},

It was great meeting you at ${meetingLocation}! I'd love to stay in touch.

Best regards`;
    
    const mailtoLink = `mailto:${profileData.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
    setShowMeetingModal(false);
    setMeetingLocation('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white/30 rounded-lg"></div>
          </div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-gray-400 rounded-lg"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">
            The profile "@{username}" doesn't exist or has been removed.
          </p>
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="inline-flex items-center space-x-2 bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const photoWidgets = profileData.photoWidgets || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="mb-6 inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        )}

        <div 
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${profileData.theme.primary}20, ${profileData.theme.secondary}20)`
          }}
        >
          {/* Header */}
          <div 
            className="relative h-32"
            style={{
              background: `linear-gradient(135deg, ${profileData.theme.primary}, ${profileData.theme.secondary})`
            }}
          >
            <div className="absolute inset-0 bg-black/10" />
          </div>

          {/* Profile Content */}
          <div className="relative px-6 pb-6">
            {/* Profile Image */}
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
                <img
                  src={profileData.profileImage}
                  alt={profileData.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="pt-20 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{profileData.name}</h1>
              <p className="text-lg text-gray-600 mb-3">{profileData.title}</p>
              
              {profileData.location && (
                <div className="flex items-center justify-center text-gray-500 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{profileData.location}</span>
                </div>
              )}

              <p className="text-gray-700 text-sm leading-relaxed mb-6">{profileData.bio}</p>

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <a 
                  href={`mailto:${profileData.email}`}
                  className="flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{profileData.email}</span>
                </a>
                
                {profileData.phone && (
                  <a 
                    href={`tel:${profileData.phone}`}
                    className="flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{profileData.phone}</span>
                  </a>
                )}
              </div>

              {/* Social Links */}
              {Object.entries(profileData.socialLinks).some(([_, url]) => url) && (
                <div className="flex justify-center space-x-4 mb-6">
                  {Object.entries(profileData.socialLinks).map(([platform, url]) => {
                    if (!url) return null;
                    const Icon = socialIcons[platform as keyof typeof socialIcons];
                    if (!Icon) return null;
                    
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-all"
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Photo Widgets */}
              {photoWidgets.length > 0 && (
                <div className="space-y-6 mb-6">
                  {photoWidgets.map((widget) => (
                    <div key={widget.id} className="text-left">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">{widget.title}</h3>
                      
                      {widget.layout === 'grid' ? (
                        <div className="grid grid-cols-2 gap-2">
                          {widget.photos.slice(0, 4).map((photo, index) => (
                            <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={photo}
                                alt={`${widget.title} ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {widget.photos.length > 4 && (
                            <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                              <span className="text-sm font-medium">+{widget.photos.length - 4}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={widget.photos[carouselIndices[widget.id] || 0]}
                              alt={`${widget.title} ${(carouselIndices[widget.id] || 0) + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {widget.photos.length > 1 && (
                            <>
                              <button
                                onClick={() => prevPhoto(widget.id, widget.photos.length)}
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => nextPhoto(widget.id, widget.photos.length)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                              
                              <div className="flex justify-center space-x-1 mt-2">
                                {widget.photos.map((_, index) => (
                                  <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full ${
                                      index === (carouselIndices[widget.id] || 0)
                                        ? 'bg-gray-800'
                                        : 'bg-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Services */}
              {profileData.services.length > 0 && (
                <div className="space-y-3 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Services</h3>
                  {profileData.services.map((service) => (
                    <div 
                      key={service.id} 
                      className={`p-4 rounded-lg border text-left ${
                        service.featured 
                          ? 'bg-gradient-to-r from-violet-50 to-pink-50 border-violet-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 flex items-center">
                          {service.title}
                          {service.featured && <Star className="w-4 h-4 ml-1 text-yellow-500 fill-current" />}
                        </h4>
                        <span 
                          className="text-sm font-semibold"
                          style={{ color: profileData.theme.primary }}
                        >
                          {service.price}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{service.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={generateVCard}
                  className="w-full py-3 px-6 rounded-full bg-white border-2 text-gray-700 font-semibold shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                  style={{
                    borderColor: profileData.theme.primary
                  }}
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Add as Contact</span>
                </button>

                <button
                  onClick={() => setShowMeetingModal(true)}
                  className="w-full py-3 px-6 rounded-full text-white font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                  style={{
                    background: `linear-gradient(135deg, ${profileData.theme.primary}, ${profileData.theme.secondary})`
                  }}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Nice meeting you!</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Modal */}
        {showMeetingModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Where did you meet?</h3>
              <input
                type="text"
                value={meetingLocation}
                onChange={(e) => setMeetingLocation(e.target.value)}
                placeholder="e.g., Tech Conference 2024"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent mb-4"
              />
              <div className="flex space-x-3">
                <button
                  onClick={handleNiceMeetingYou}
                  disabled={!meetingLocation.trim()}
                  className="flex-1 py-2 px-4 bg-violet-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-violet-700 transition-colors"
                >
                  Send Email
                </button>
                <button
                  onClick={() => setShowMeetingModal(false)}
                  className="flex-1 py-2 px-4 bg-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;