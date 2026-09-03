-- supabase/schema.sql
-- Dorsadesign Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'architect')),
    bio TEXT,
    website TEXT,
    social_links JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PROJECTS
-- ============================================
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    short_description TEXT,
    category TEXT NOT NULL,
    location TEXT,
    area_sqm NUMERIC,
    year_completed INTEGER,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    featured_image_url TEXT,
    gallery_images TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    meta_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_slug ON public.projects(slug);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_category ON public.projects(category);

-- ============================================
-- PROJECT IMAGES (for gallery management)
-- ============================================
CREATE TABLE public.project_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    alt_text TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_project_images_project_id ON public.project_images(project_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Published projects are viewable by everyone"
    ON public.projects FOR SELECT USING (status = 'published');

CREATE POLICY "Users can view own projects (any status)"
    ON public.projects FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
    ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
    ON public.projects FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
    ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Project images policies
CREATE POLICY "Project images viewable with project access"
    ON public.project_images FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_images.project_id
            AND (p.status = 'published' OR p.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can manage images for own projects"
    ON public.project_images FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_images.project_id
            AND p.user_id = auth.uid()
        )
    );

-- ============================================
-- STORAGE BUCKET POLICIES
-- ============================================
-- Run after creating 'project-images' bucket in Supabase Dashboard
/*
INSERT INTO storage.buckets (id, name, public) VALUES ('project-images', 'project-images', true);

CREATE POLICY "Public read access for project images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'project-images');

CREATE POLICY "Authenticated users can upload project images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'project-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own project images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'project-images' AND auth.uid() = owner);

CREATE POLICY "Users can delete own project images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'project-images' AND auth.uid() = owner);
*/

-- ============================================
-- HELPER FUNCTIONS
-- ============================================
-- Generate unique slug from title
CREATE OR REPLACE FUNCTION public.generate_unique_slug(base_slug TEXT)
RETURNS TEXT AS $$
DECLARE
    slug TEXT := base_slug;
    counter INTEGER := 1;
BEGIN
    WHILE EXISTS (SELECT 1 FROM public.projects WHERE slug = slug) LOOP
        slug := base_slug || '-' || counter;
        counter := counter + 1;
    END LOOP;
    RETURN slug;
END;
$$ LANGUAGE plpgsql;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- REALTIME PUBLICATION
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_images;