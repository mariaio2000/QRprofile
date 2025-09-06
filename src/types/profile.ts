export interface SocialLinks {
  website?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  featured: boolean;
}

export interface Theme {
  primary: string;
  secondary: string;
  accent: string;
}

export interface PhotoWidget {
  id: string;
  title: string;
  photos: string[];
  layout: 'grid' | 'carousel';
}

// New template system types
export type TemplateId =
  | 'minimal'
  | 'photo-header'
  | 'sidebar'
  | 'accent-badge'
  | 'split'
  | 'glass-glow';

export type TemplateSettings = {
  palette?: 'brand' | 'blue' | 'violet' | 'teal' | 'slate';
  font?: 'system' | 'inter' | 'archivo' | 'manrope';
  avatarShape?: 'circle' | 'rounded' | 'square';
  density?: 'comfy' | 'compact';
  showPhone?: boolean;
  showEmail?: boolean;
  showSocials?: boolean;
  backgroundStyle?: 'gradient' | 'solid' | 'pattern';
};

export type PublicContact = {
  name?: string;
  title?: string;
  company?: string;
  avatarUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  location?: string | null;
  bio?: string | null;
  socials?: Array<{ label: string; url: string }>;
  services?: string[]; // short list of tags
};

export type CardConfig = {
  templateId: TemplateId;
  templateSettings: TemplateSettings;
};

export type ProfileRecord = {
  id: string;
  user_id: string;
  username: string;
  // existing fields...
  name?: string;
  title?: string;
  company?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  location?: string | null;
  socials?: Record<string, string> | null;
  services?: string[] | null;

  // NEW:
  template_id?: TemplateId | null;
  template_settings?: TemplateSettings | null;
};

export interface ProfileData {
  id?: string; // profile ID from database
  name: string;
  title: string;
  bio: string;
  profile_image_id?: string; // database image ID instead of URL
  email: string;
  phone?: string;
  location?: string;
  socialLinks: SocialLinks;
  services: Service[];
  photoWidgets?: PhotoWidget[];
  theme: Theme;
}