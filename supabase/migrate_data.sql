-- supabase/migrate_data.sql
-- Data migration from Docker schema to Supabase schema
-- Run this AFTER running schema.sql in Supabase SQL Editor
-- This transforms data from the old docker database structure

-- ============================================
-- STEP 1: Create a temporary table to hold docker data
-- ============================================
CREATE TEMP TABLE temp_docker_admins (
    id uuid,
    username varchar(50),
    email varchar(255),
    hashed_password varchar(255),
    full_name varchar(255),
    is_active boolean,
    is_superuser boolean,
    last_login timestamptz,
    created_at timestamptz,
    updated_at timestamptz
);

CREATE TEMP TABLE temp_docker_projects (
    id uuid,
    title varchar(255),
    description text,
    full_description text,
    project_type varchar(50),
    client_name varchar(255),
    year varchar(20),
    area varchar(50),
    status varchar(20),
    cover_image varchar(500),
    gallery_images varchar(500),
    is_featured boolean,
    views integer,
    created_at timestamptz,
    updated_at timestamptz,
    features text
);

-- ============================================
-- STEP 2: Insert the docker data here (replace with actual data)
-- ============================================
-- COPY THE DATA FROM dorsadesign_backup.sql HERE
-- Example format:
/*
INSERT INTO temp_docker_admins (id, username, email, hashed_password, full_name, is_active, is_superuser, last_login, created_at, updated_at) VALUES
('729a4329-0e8d-47b9-9ee8-3abcaa6e6516', 'admin', 'admin@dorsadesign.ir', '$2b$12$.5ACKsaXg0SIoZOTauEr.OU7WJxKMlxuswDc3KLUYmzAYdJu1Bmgm', 'Admin User', true, false, '2026-08-15 12:08:53.56895+00', '2026-08-15 11:38:37.288319+00', '2026-08-15 12:08:53.241332+00');

INSERT INTO temp_docker_projects (id, title, description, full_description, project_type, client_name, year, area, status, cover_image, gallery_images, is_featured, views, created_at, updated_at, features) VALUES
('37138489-cf80-406b-8e93-490cccbe8e0c', 'ویلای ساحلی بندر چارک', 'ویلای ساحلی بندر چارک', 'ویلای ساحلی بندر چارک', 'VILLA', '', '1405', '500', 'PUBLISHED', '/uploads/projects/covers/836ac5f3-fd35-4369-9949-85004d6fddc7.jpg', '/uploads/projects/galleries/fbff2668-50bd-4e99-b808-4c771c821dc0.jpg,/uploads/projects/galleries/bc3a8101-c782-490e-83ce-c6aeed4b431d.jpg,/uploads/projects/galleries/06ebf86e-6b15-4de7-a2c9-137a6c38fefc.jpg', false, 34, '2026-08-15 11:54:39.289776+00', '2026-08-25 22:56:17.666307+00', NULL);
*/

-- ============================================
-- STEP 3: Migrate admins to auth.users + profiles
-- ============================================
-- Note: This requires Supabase auth admin access.
-- Option A: Use Supabase Dashboard to create users, then run this to create profiles
-- Option B: Use Supabase CLI/Management API to create users programmatically

-- For now, create profiles that will be linked when users sign up
-- The handle_new_user trigger will create profiles on signup
-- We pre-create profiles here so they exist

INSERT INTO public.profiles (id, full_name, role, bio, created_at, updated_at)
SELECT 
    id,
    full_name,
    CASE WHEN is_superuser THEN 'admin' ELSE 'architect' END as role,
    'Migrated from legacy system' as bio,
    created_at,
    updated_at
FROM temp_docker_admins
WHERE is_active = true
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    bio = EXCLUDED.bio,
    updated_at = EXCLUDED.updated_at;

-- ============================================
-- STEP 4: Migrate projects to new schema
-- ============================================
-- Map project_type enum values to text categories
-- Map status enum values to new status values
-- Generate slug from title (Persian slugify would be ideal, using simple approach here)

INSERT INTO public.projects (
    id,
    user_id,
    title,
    slug,
    description,
    short_description,
    category,
    location,
    area_sqm,
    year_completed,
    status,
    featured_image_url,
    gallery_images,
    tags,
    meta_data,
    created_at,
    updated_at
)
SELECT 
    p.id,
    -- Assign to first admin user (in reality, map to actual user)
    (SELECT id FROM temp_docker_admins WHERE is_superuser = true LIMIT 1) as user_id,
    p.title,
    -- Generate slug from title (basic transliteration)
    lower(regexp_replace(p.title, '[^a-zA-Z0-9\u0600-\u06FF]+', '-', 'g')) as slug,
    p.description,
    p.full_description,
    -- Map project_type to category
    CASE p.project_type
        WHEN 'RESIDENTIAL' THEN 'residential'
        WHEN 'COMMERCIAL' THEN 'commercial'
        WHEN 'OFFICE' THEN 'office'
        WHEN 'VILLA' THEN 'villa'
        WHEN 'CULTURAL' THEN 'cultural'
        WHEN 'EDUCATIONAL' THEN 'educational'
        ELSE 'other'
    END as category,
    p.client_name as location,
    NULLIF(p.area, '')::numeric as area_sqm,
    NULLIF(p.year, '')::integer as year_completed,
    -- Map status
    CASE p.status
        WHEN 'DRAFT' THEN 'draft'
        WHEN 'PUBLISHED' THEN 'published'
        WHEN 'ARCHIVED' THEN 'archived'
        ELSE 'draft'
    END as status,
    p.cover_image as featured_image_url,
    -- Parse gallery_images CSV to array
    string_to_array(p.gallery_images, ',') as gallery_images,
    -- Parse features CSV to tags array
    CASE WHEN p.features IS NOT NULL AND p.features != '' 
         THEN string_to_array(p.features, ',') 
         ELSE '{}'::text[] 
    END as tags,
    jsonb_build_object(
        'migrated_from_docker', true,
        'original_id', p.id,
        'is_featured', p.is_featured,
        'views', p.views
    ) as meta_data,
    p.created_at,
    p.updated_at
FROM temp_docker_projects p
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    short_description = EXCLUDED.short_description,
    category = EXCLUDED.category,
    location = EXCLUDED.location,
    area_sqm = EXCLUDED.area_sqm,
    year_completed = EXCLUDED.year_completed,
    status = EXCLUDED.status,
    featured_image_url = EXCLUDED.featured_image_url,
    gallery_images = EXCLUDED.gallery_images,
    tags = EXCLUDED.tags,
    meta_data = EXCLUDED.meta_data,
    updated_at = EXCLUDED.updated_at;

-- ============================================
-- STEP 5: Migrate project images to project_images table
-- ============================================
-- This splits the gallery_images into individual records
-- Run after projects are migrated

INSERT INTO public.project_images (project_id, storage_path, alt_text, sort_order, created_at)
SELECT 
    p.id as project_id,
    trim(unnest(string_to_array(p.gallery_images, ','))) as storage_path,
    p.title || ' - Gallery Image' as alt_text,
    generate_series(0, array_length(string_to_array(p.gallery_images, ','), 1) - 1) as sort_order,
    p.created_at
FROM temp_docker_projects p
WHERE p.gallery_images IS NOT NULL AND p.gallery_images != ''
ON CONFLICT DO NOTHING;

-- Also add cover_image as a project_image if it exists
INSERT INTO public.project_images (project_id, storage_path, alt_text, sort_order, created_at)
SELECT 
    p.id as project_id,
    p.cover_image as storage_path,
    p.title || ' - Cover Image' as alt_text,
    -1 as sort_order,  -- Cover image first
    p.created_at
FROM temp_docker_projects p
WHERE p.cover_image IS NOT NULL AND p.cover_image != ''
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 6: Verification queries
-- ============================================
-- Run these to verify migration

-- SELECT 'profiles' as table, COUNT(*) FROM public.profiles;
-- SELECT 'projects' as table, COUNT(*) FROM public.projects;
-- SELECT 'project_images' as table, COUNT(*) FROM public.project_images;

-- SELECT * FROM public.profiles;
-- SELECT * FROM public.projects;
-- SELECT * FROM public.project_images;