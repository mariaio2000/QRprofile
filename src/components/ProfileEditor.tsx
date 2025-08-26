import React, { useMemo, useState } from "react";
import { ProfileData } from '../types/profile';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { ChevronLeft, ChevronRight, Mail, Copy, QrCode } from 'lucide-react';
import QrCreator from "./QrCreator";

interface PhotoWidget {
  id: string;
  title: string;
  photos: string[];
  layout: 'grid' | 'carousel';
}

interface ProfileEditorProps {
  profileData: ProfileData & { photoWidgets?: PhotoWidget[] };
  onUpdate: (data: Partial<ProfileData & { photoWidgets?: PhotoWidget[] }>) => void;
}

// ---------- Utilities ----------
const classNames = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(" ");

// ---------- Types ----------
const STEPS = [
  { id: 1, key: "basic", label: "Basic Info" },
  { id: 2, key: "username", label: "Username" },
  { id: 3, key: "title", label: "Bio & Title" },
  { id: 4, key: "contact", label: "Contact" },
  { id: 5, key: "social", label: "Social" },
  { id: 6, key: "services", label: "Services" },
  { id: 7, key: "photos", label: "Photos" },
  { id: 8, key: "theme", label: "Theme" },
];

// ---------- Small UI Primitives ----------
function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-900 dark:text-gray-100">
      {children}
    </label>
  );
}

function Helper({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{children}</p>;
}

function Input({ 
  id, 
  type = "text", 
  value, 
  onChange, 
  placeholder, 
  required, 
  ariaInvalid, 
  ...rest 
}: {
  id: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  ariaInvalid?: boolean;
  [key: string]: any;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      aria-invalid={ariaInvalid}
      className={classNames(
        "mt-1 w-full rounded-xl border bg-white/80 dark:bg-gray-800/80",
        "border-gray-300 dark:border-gray-700",
        "px-4 py-3 text-sm text-gray-900 dark:text-gray-100",
        "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      )}
      {...rest}
    />
  );
}

function Textarea({ 
  id, 
  value, 
  onChange, 
  placeholder, 
  rows = 3 
}: {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="mt-1 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  );
}

function Button({ 
  variant = "primary", 
  className, 
  children,
  ...props 
}: {
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}) {
  const styles =
    variant === "primary"
      ? "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500"
      : variant === "secondary"
      ? "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
      : "text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white";
  return (
    <button
      className={classNames(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2",
        styles,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// ---------- Progress Header ----------
function WizardHeader({ currentStep }: { currentStep: number }) {
  const pct = Math.round((currentStep / STEPS.length) * 100);
  return (
    <div className="sticky top-0 z-10 -mx-6 mb-6 border-b border-gray-200 bg-white/70 backdrop-blur dark:bg-gray-900/70 dark:border-gray-800 px-6 py-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Step {currentStep} of {STEPS.length}
        </div>
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{pct}%</div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
        <div 
          style={{ width: `${pct}%` }} 
          className="h-full rounded-full bg-indigo-600 transition-all" 
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className={classNames(
            "flex items-center gap-2 rounded-full px-3 py-1 text-xs",
            i + 1 <= currentStep 
              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200" 
              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          )}>
            <span 
              className="inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold"
              aria-hidden
            >
              {s.id}
            </span>
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Preview Card ----------
function PhonePreview({ profile }: { profile: ProfileData & { photoWidgets?: PhotoWidget[] } }) {
  const { name, title, email, profileImage, theme } = profile;
  const gradientFrom = theme?.primary || "#6366F1";
  const gradientTo = theme?.secondary || "#8B5CF6";
  
  return (
    <div className="sticky top-6">
      <div className="mx-auto w-full max-w-sm rounded-[2rem] border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div 
          className="rounded-t-[2rem] p-6" 
          style={{
            background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`
          }}
        >
          <div className="mx-auto h-20 w-20 overflow-hidden rounded-full ring-4 ring-white dark:ring-gray-900">
            <img 
              src={profileImage} 
              alt="Profile" 
              className="h-full w-full object-cover" 
            />
          </div>
        </div>
        <div className="px-6 pb-8 pt-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {name || "Your name"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {title || "Your Title"}
          </p>
          {email && (
            <div className="mt-4 flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300">
              <Mail className="h-4 w-4" />
              <span>{email}</span>
            </div>
          )}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="secondary" className="text-xs">
              <Copy className="h-3 w-3" />
              Copy Link
            </Button>
            <Button className="text-xs">
              <QrCode className="h-3 w-3" />
              Download QR
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Step Content ----------
function StepBasic({ profile, setProfile, errors }: { 
  profile: ProfileData; 
  setProfile: (data: Partial<ProfileData>) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="photo">Profile photo</Label>
        <div className="mt-2 flex items-center gap-4">
          <img 
            src={profile.profileImage} 
            alt="Preview" 
            className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input 
              id="photo" 
              type="url" 
              placeholder="Paste image URL…" 
              value={profile.profileImage}
              onChange={(e) => setProfile({ profileImage: e.target.value })}
            />
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => alert("Hook up file picker / cropper here")}
            >
              Upload
            </Button>
          </div>
        </div>
        <Helper>Images are cropped to a circle. Recommended 400×400px.</Helper>
      </div>

      <div>
        <Label htmlFor="name">Full name</Label>
        <Input 
          id="name" 
          placeholder="Maria Alecu" 
          value={profile.name}
          ariaInvalid={Boolean(errors.name)}
          onChange={(e) => setProfile({ name: e.target.value })}
          required
        />
        {errors.name && (
          <p role="alert" className="mt-1 text-xs text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input 
          id="title" 
          placeholder="Product Designer" 
          value={profile.title}
          onChange={(e) => setProfile({ title: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="maria@example.com" 
          value={profile.email}
          ariaInvalid={Boolean(errors.email)}
          onChange={(e) => setProfile({ email: e.target.value })} 
          required
        />
        {errors.email && (
          <p role="alert" className="mt-1 text-xs text-red-600">{errors.email}</p>
        )}
      </div>

      <div>
        <Label htmlFor="bio">Short bio</Label>
        <Textarea 
          id="bio" 
          placeholder="One–two sentences about you." 
          value={profile.bio}
          onChange={(e) => setProfile({ bio: e.target.value })} 
        />
      </div>
    </div>
  );
}

function StepUsername({ profile, setProfile }: { 
  profile: any; 
  setProfile: (data: any) => void;
}) {
  const [localUsername, setLocalUsername] = useState(profile.username || "");

  const handleUsernameUpdate = (newUsername: string) => {
    setLocalUsername(newUsername);
    setProfile({ username: newUsername });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="username">Profile URL</Label>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm text-gray-500">qrprofile.com/</span>
          <Input
            id="username"
            placeholder="your-username"
            value={localUsername}
            onChange={(e) => {
              const username = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
              handleUsernameUpdate(username);
            }}
          />
        </div>
        <Helper>This will be your unique link to share with others.</Helper>
      </div>
    </div>
  );
}

function StepBio({ profile, setProfile }: { 
  profile: any; 
  setProfile: (data: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title">Job title</Label>
        <Input 
          id="title" 
          placeholder="Product Designer" 
          value={profile.title}
          onChange={(e) => setProfile({ title: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea 
          id="bio" 
          placeholder="Tell people about yourself, your expertise, and what you're passionate about..." 
          value={profile.bio}
          onChange={(e) => setProfile({ bio: e.target.value })} 
        />
      </div>
    </div>
  );
}

function StepContact({ profile, setProfile }: { 
  profile: any; 
  setProfile: (data: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="your.email@example.com" 
          value={profile.email}
          onChange={(e) => setProfile({ email: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input 
          id="phone" 
          type="tel" 
          placeholder="+1 (555) 123-4567" 
          value={profile.phone || ""}
          onChange={(e) => setProfile({ phone: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="location">Location (optional)</Label>
        <Input 
          id="location" 
          placeholder="San Francisco, CA" 
          value={profile.location || ""}
          onChange={(e) => setProfile({ location: e.target.value })}
        />
      </div>
    </div>
  );
}

function StepSocial({ profile, setProfile }: { 
  profile: any; 
  setProfile: (data: any) => void;
}) {
  const socialLinks = profile.socialLinks || {};
  
  const updateSocialLink = (platform: string, value: string) => {
    setProfile({
      socialLinks: {
        ...socialLinks,
        [platform]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="social-links">Social links</Label>
        <Helper>Add links to your social media and website</Helper>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input 
            id="linkedin" 
            type="url" 
            placeholder="https://linkedin.com/in/yourprofile" 
            value={socialLinks.linkedin || ""}
            onChange={(e) => updateSocialLink('linkedin', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="twitter">Twitter/X</Label>
          <Input 
            id="twitter" 
            type="url" 
            placeholder="https://twitter.com/yourhandle" 
            value={socialLinks.twitter || ""}
            onChange={(e) => updateSocialLink('twitter', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="instagram">Instagram</Label>
          <Input 
            id="instagram" 
            type="url" 
            placeholder="https://instagram.com/yourhandle" 
            value={socialLinks.instagram || ""}
            onChange={(e) => updateSocialLink('instagram', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="website">Website</Label>
          <Input 
            id="website" 
            type="url" 
            placeholder="https://yourwebsite.com" 
            value={socialLinks.website || ""}
            onChange={(e) => updateSocialLink('website', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

function StepServices({ profile, setProfile }: { 
  profile: any; 
  setProfile: (data: any) => void;
}) {
  const services = profile.services || [];
  
  const addService = () => {
    setProfile({
      services: [...services, { name: '', description: '', price: '' }]
    });
  };
  
  const updateService = (index: number, field: string, value: string) => {
    const updatedServices = [...services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };
    setProfile({ services: updatedServices });
  };
  
  const removeService = (index: number) => {
    setProfile({
      services: services.filter((_: any, i: number) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="services">Services</Label>
        <Helper>Add the services you offer to your clients</Helper>
      </div>
      
      <div className="space-y-4">
        {services.map((service: any, index: number) => (
          <div key={index} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <Label htmlFor={`service-${index}`}>Service {index + 1}</Label>
              <Button 
                variant="ghost" 
                onClick={() => removeService(index)}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </Button>
            </div>
            
            <div className="space-y-3">
              <Input 
                id={`service-${index}`}
                placeholder="Service name" 
                value={service.name}
                onChange={(e) => updateService(index, 'name', e.target.value)}
              />
                             <Textarea 
                 id={`service-desc-${index}`}
                 placeholder="Service description" 
                 value={service.description}
                 onChange={(e) => updateService(index, 'description', e.target.value)}
                 rows={2}
               />
               <Input 
                 id={`service-price-${index}`}
                 placeholder="Price (optional)" 
                 value={service.price}
                 onChange={(e) => updateService(index, 'price', e.target.value)}
               />
            </div>
          </div>
        ))}
        
        <Button 
          variant="secondary" 
          onClick={addService}
          className="w-full"
        >
          Add Service
        </Button>
      </div>
    </div>
  );
}

function StepPhotos({ profile, setProfile }: { 
  profile: any; 
  setProfile: (data: any) => void;
}) {
  const photoWidgets = profile.photoWidgets || [];
  
  const addPhotoWidget = () => {
    setProfile({
      photoWidgets: [...photoWidgets, { 
        id: Date.now().toString(), 
        title: '', 
        photos: [], 
        layout: 'grid' 
      }]
    });
  };
  
  const updatePhotoWidget = (index: number, field: string, value: any) => {
    const updatedWidgets = [...photoWidgets];
    updatedWidgets[index] = { ...updatedWidgets[index], [field]: value };
    setProfile({ photoWidgets: updatedWidgets });
  };
  
  const removePhotoWidget = (index: number) => {
    setProfile({
      photoWidgets: photoWidgets.filter((_: any, i: number) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="photo-galleries">Photo galleries</Label>
        <Helper>Showcase your work with beautiful photo collections</Helper>
      </div>
      
      <div className="space-y-4">
        {photoWidgets.map((widget: any, index: number) => (
          <div key={widget.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <Label htmlFor={`widget-${index}`}>Gallery {index + 1}</Label>
              <Button 
                variant="ghost" 
                onClick={() => removePhotoWidget(index)}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </Button>
            </div>
            
            <div className="space-y-3">
              <Input 
                id={`widget-${index}`}
                placeholder="Gallery title" 
                value={widget.title}
                onChange={(e) => updatePhotoWidget(index, 'title', e.target.value)}
              />
              
              <div>
                <Label htmlFor={`layout-${index}`}>Layout</Label>
                <select 
                  id={`layout-${index}`}
                  value={widget.layout}
                  onChange={(e) => updatePhotoWidget(index, 'layout', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800/80"
                >
                  <option value="grid">Grid</option>
                  <option value="carousel">Carousel</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor={`photos-${index}`}>Photo URLs (one per line)</Label>
                <Textarea 
                  id={`photos-${index}`}
                  placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg" 
                  value={widget.photos.join('\n')}
                  onChange={(e) => updatePhotoWidget(index, 'photos', e.target.value.split('\n').filter(url => url.trim()))}
                  rows={3}
                />
              </div>
            </div>
          </div>
        ))}
        
        <Button 
          variant="secondary" 
          onClick={addPhotoWidget}
          className="w-full"
        >
          Add Photo Gallery
        </Button>
      </div>
    </div>
  );
}

function StepTheme({ profile, setProfile }: { 
  profile: any; 
  setProfile: (data: any) => void;
}) {
  const presets = [
    { name: "Indigo Sky", from: "#6366F1", to: "#8B5CF6" },
    { name: "Ocean", from: "#06B6D4", to: "#3B82F6" },
    { name: "Sunset", from: "#F97316", to: "#EF4444" },
    { name: "Forest", from: "#16A34A", to: "#22C55E" },
  ];

  const update = (kv: any) => setProfile((p: any) => ({ ...p, ...kv }));

  return (
        <div className="space-y-6">
      {/* Presets */}
      <div>
        <Label htmlFor="header-gradient">Header gradient</Label>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {presets.map(p => {
            const active = profile.theme?.primary === p.from && profile.theme?.secondary === p.to;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => update({ 
                  theme: { 
                    primary: p.from, 
                    secondary: p.to, 
                    accent: p.to 
                  } 
                })}
                className={classNames(
                  "group overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm",
                  active ? "border-indigo-500 ring-2 ring-indigo-500" : "hover:shadow-md"
                )}
              >
                <div className="h-16" style={{ background: `linear-gradient(135deg, ${p.from} 0%, ${p.to} 100%)` }} />
                <div className="px-3 py-2 text-center text-xs text-gray-700 dark:text-gray-300 group-hover:underline">
                  {p.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom colors */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="from">From</Label>
          <Input 
            id="from" 
            type="color" 
            value={profile.theme?.primary || "#6366F1"}
            onChange={(e) => update({ 
              theme: { 
                ...profile.theme, 
                primary: e.target.value 
              } 
            })} 
          />
        </div>
        <div>
          <Label htmlFor="to">To</Label>
          <Input 
            id="to" 
            type="color" 
            value={profile.theme?.secondary || "#8B5CF6"}
            onChange={(e) => update({ 
              theme: { 
                ...profile.theme, 
                secondary: e.target.value 
              } 
            })} 
          />
        </div>
      </div>

      {/* Preview */}
      <div>
        <Label htmlFor="preview">Preview</Label>
        <div className="mt-2 h-16 rounded-xl border border-gray-200 dark:border-gray-800" 
          style={{ 
            background: `linear-gradient(135deg, ${profile.theme?.primary || "#6366F1"} 0%, ${profile.theme?.secondary || "#8B5CF6"} 100%)` 
          }} 
        />
      </div>
    </div>
  );
}

// ---------- Main Component ----------
const ProfileEditor: React.FC<ProfileEditorProps> = ({ profileData, onUpdate }) => {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id || null);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Convert profileData to the format expected by the wizard
  const wizardProfile: any = {
    name: profileData.name || "",
    title: profileData.title || "",
    email: profileData.email || "",
    bio: profileData.bio || "",
    profileImage: profileData.profileImage || "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=400&auto=format&fit=crop",
    gradientFrom: profileData.theme?.primary || "#6366F1",
    gradientTo: profileData.theme?.secondary || "#8B5CF6",
  };

  const setWizardProfile = (updates: any) => {
    // Convert wizard format back to profileData format
    const profileUpdates: Partial<ProfileData> = {};
    
    if (updates.name !== undefined) profileUpdates.name = updates.name;
    if (updates.title !== undefined) profileUpdates.title = updates.title;
    if (updates.email !== undefined) profileUpdates.email = updates.email;
    if (updates.bio !== undefined) profileUpdates.bio = updates.bio;
    if (updates.profileImage !== undefined) profileUpdates.profileImage = updates.profileImage;
    if (updates.gradientFrom !== undefined || updates.gradientTo !== undefined) {
      profileUpdates.theme = {
        primary: updates.gradientFrom || profileData.theme?.primary || "#6366F1",
        secondary: updates.gradientTo || profileData.theme?.secondary || "#8B5CF6",
        accent: updates.gradientTo || profileData.theme?.accent || "#8B5CF6"
      };
    }
    
    onUpdate(profileUpdates);
  };

  const canNext = useMemo(() => {
    if (currentStep === 1) {
      const errs: Record<string, string> = {};
      if (!wizardProfile.name?.trim()) errs.name = "Please enter your name.";
      if (!wizardProfile.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = "Enter a valid email address.";
      setErrors(errs);
      return Object.keys(errs).length === 0;
    }
    return true;
  }, [currentStep, wizardProfile.name, wizardProfile.email]);

  const goNext = () => setCurrentStep(s => Math.min(STEPS.length, s + 1));
  const goPrev = () => setCurrentStep(s => Math.max(1, s - 1));

  // Data passed to the QR component
  const profileForQr = {
    username: (wizardProfile.username ?? "maria"),
    name: (wizardProfile.name ?? "Maria Alecu"),
    email: (wizardProfile.email ?? "maria@example.com"),
    title: wizardProfile.title,
    company: wizardProfile.company,
    phone: wizardProfile.phone,
    website: wizardProfile.website,
    address: wizardProfile.location,
    avatarUrl: wizardProfile.profileImage,
    socials: wizardProfile.socialLinks,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-8 text-gray-900 dark:from-gray-950 dark:to-gray-900 dark:text-gray-100">
      <div className="mx-auto w-full max-w-6xl rounded-2xl border border-gray-200 bg-white/70 p-6 shadow-xl backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/70">
        <WizardHeader currentStep={currentStep} />

        <div className="grid gap-8 md:grid-cols-[1fr_420px]">
          {/* Form Area */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            {currentStep === 1 && <StepBasic profile={wizardProfile} setProfile={setWizardProfile} errors={errors} />}
            {currentStep === 2 && <StepUsername profile={wizardProfile} setProfile={setWizardProfile} />}
            {currentStep === 3 && <StepBio profile={wizardProfile} setProfile={setWizardProfile} />}
            {currentStep === 4 && <StepContact profile={wizardProfile} setProfile={setWizardProfile} />}
            {currentStep === 5 && <StepSocial profile={wizardProfile} setProfile={setWizardProfile} />}
            {currentStep === 6 && <StepServices profile={wizardProfile} setProfile={setWizardProfile} />}
            {currentStep === 7 && <StepPhotos profile={wizardProfile} setProfile={setWizardProfile} />}
            {currentStep === 8 && <StepTheme profile={wizardProfile} setProfile={setWizardProfile} />}

            {/* Actions */}
            <div className="mt-8 flex items-center justify-between">
              <Button 
                variant="ghost" 
                onClick={goPrev} 
                className={classNames(currentStep === 1 && "opacity-40 pointer-events-none")}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-3">
                <Button 
                  variant="secondary" 
                  type="button" 
                  onClick={() => alert("Saved! Hook to API")}
                >
                  Save Draft
                </Button>
                {currentStep < STEPS.length ? (
                  <Button onClick={goNext} disabled={!canNext} aria-disabled={!canNext}>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={() => alert("Published! Hook to API")}>
                    Publish
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">Live preview</h2>
              <span className="text-xs text-gray-500">Updates in real time</span>
            </div>
            <PhonePreview profile={profileData} />
          </div>

          {/* QR Code (instant) */}
          {currentStep === 8 && (
            <div className="mt-8">
              <QrCreator profile={profileForQr} />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sticky Actions (shown under md) */}
      <div className="fixed inset-x-0 bottom-0 z-20 block border-t border-gray-200 bg-white/90 p-3 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90 md:hidden">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <Button 
            variant="ghost" 
            onClick={goPrev} 
            className={classNames(currentStep === 1 && "opacity-40 pointer-events-none")}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          {currentStep < STEPS.length ? (
            <Button onClick={goNext} disabled={!canNext} aria-disabled={!canNext}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={() => alert("Published! Hook to API")}>
              Publish
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;