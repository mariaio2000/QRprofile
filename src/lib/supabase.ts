import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          name: string;
          title: string;
          bio: string;
          profile_image: string;
          email: string;
          phone: string | null;
          location: string | null;
          social_links: Record<string, string>;
          services: Array<{
            id: string;
            title: string;
            description: string;
            price: string;
            featured: boolean;
          }>;
          theme: {
            primary: string;
            secondary: string;
            accent: string;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          name: string;
          title?: string;
          bio?: string;
          profile_image?: string;
          email: string;
          phone?: string | null;
          location?: string | null;
          social_links?: Record<string, string>;
          services?: Array<{
            id: string;
            title: string;
            description: string;
            price: string;
            featured: boolean;
          }>;
          theme?: {
            primary: string;
            secondary: string;
            accent: string;
          };
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string;
          name?: string;
          title?: string;
          bio?: string;
          profile_image?: string;
          email?: string;
          phone?: string | null;
          location?: string | null;
          social_links?: Record<string, string>;
          services?: Array<{
            id: string;
            title: string;
            description: string;
            price: string;
            featured: boolean;
          }>;
          theme?: {
            primary: string;
            secondary: string;
            accent: string;
          };
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};