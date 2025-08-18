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

export interface ProfileData {
  name: string;
  title: string;
  bio: string;
  profileImage: string;
  email: string;
  phone?: string;
  location?: string;
  socialLinks: SocialLinks;
  services: Service[];
  theme: Theme;
}