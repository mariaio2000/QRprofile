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