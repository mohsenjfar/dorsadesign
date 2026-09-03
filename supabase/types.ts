// supabase/types.ts
// Auto-generated TypeScript types from Supabase schema
// Run: npx supabase gen types typescript --project-id <ref> > types.ts

export interface Json {
  [key: string]: Json | string | number | boolean | null | Json[];
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin' | 'architect';
  bio: string | null;
  website: string | null;
  social_links: Json;
  created_at: string;
  updated_at: string;
}

export interface Project {
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
  // Relations (populated via joins)
  profiles?: Profile;
  project_images?: ProjectImage[];
}

export interface ProjectImage {
  id: string;
  project_id: string;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
}

// Insert/Update types (without auto-generated fields)
export type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at' | 'profiles' | 'project_images'>;
export type ProjectUpdate = Partial<ProjectInsert>;

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'>;
export type ProfileUpdate = Partial<ProfileInsert>;

export type ProjectImageInsert = Omit<ProjectImage, 'id' | 'created_at'>;
export type ProjectImageUpdate = Partial<ProjectImageInsert>;

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: string;
}

// Supabase Realtime types
export interface RealtimeProjectPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: 'projects';
  record: Project;
  old_record: Project | null;
}

export interface RealtimeProjectImagePayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: 'project_images';
  record: ProjectImage;
  old_record: ProjectImage | null;
}