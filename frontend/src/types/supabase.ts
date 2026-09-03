// frontend/src/types/supabase.ts
// Database types matching supabase/schema.sql
// Generated from: npx supabase gen types typescript --project-id <ref>

export interface Json {
  [key: string]: Json | string | number | boolean | null | Json[];
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'user' | 'admin' | 'architect';
          bio: string | null;
          website: string | null;
          social_links: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin' | 'architect';
          bio?: string | null;
          website?: string | null;
          social_links?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin' | 'architect';
          bio?: string | null;
          website?: string | null;
          social_links?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          slug: string;
          description: string | null;
          short_description: string | null;
          category: string;
          location: string | null;
          area_sqm: number | null;
          year_completed: number | null;
          status: 'draft' | 'published' | 'archived';
          featured_image_url: string | null;
          gallery_images: string[];
          tags: string[];
          meta_data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          slug: string;
          description?: string | null;
          short_description?: string | null;
          category: string;
          location?: string | null;
          area_sqm?: number | null;
          year_completed?: number | null;
          status?: 'draft' | 'published' | 'archived';
          featured_image_url?: string | null;
          gallery_images?: string[];
          tags?: string[];
          meta_data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          short_description?: string | null;
          category?: string;
          location?: string | null;
          area_sqm?: number | null;
          year_completed?: number | null;
          status?: 'draft' | 'published' | 'archived';
          featured_image_url?: string | null;
          gallery_images?: string[];
          tags?: string[];
          meta_data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'projects_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      project_images: {
        Row: {
          id: string;
          project_id: string;
          storage_path: string;
          alt_text: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          storage_path: string;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          storage_path?: string;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'project_images_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      generate_unique_slug: {
        Args: { base_slug: string };
        Returns: string;
      };
      handle_new_user: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
      update_updated_at_column: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
    };
    Enums: {
      user_role: 'user' | 'admin' | 'architect';
      project_status: 'draft' | 'published' | 'archived';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}