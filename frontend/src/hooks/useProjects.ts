// frontend/src/hooks/useProjects.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Project, ProjectInsert, ProjectUpdate, ProjectImage } from '../types/supabase';

interface UseProjectsOptions {
  userId?: string;
  status?: 'draft' | 'published' | 'archived' | 'all';
  category?: string;
  page?: number;
  pageSize?: number;
}

interface PaginatedProjects {
  projects: Project[];
  count: number;
  totalPages: number;
}

export const useProjects = (options: UseProjectsOptions = {}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { userId, status = 'published', category, page = 1, pageSize = 10 } = options;

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('projects')
        .select('*, profiles(full_name, avatar_url), project_images(*)', { count: 'exact' });

      // Filter by user
      if (userId) {
        query = query.eq('user_id', userId);
      } else if (status !== 'all') {
        query = query.eq('status', status);
      }

      // Filter by category
      if (category) {
        query = query.eq('category', category);
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      // Order
      query = query.order('created_at', { ascending: false });

      const { data, error: fetchError, count: totalCount } = await query;

      if (fetchError) throw fetchError;

      if (mounted) {
        setProjects(data || []);
        setCount(totalCount || 0);
        setTotalPages(Math.ceil((totalCount || 0) / pageSize));
      }
    } catch (err) {
      if (mounted) {
        setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      }
    } finally {
      if (mounted) setLoading(false);
    }
  }, [userId, status, category, page, pageSize]);

  let mounted = true;
  useEffect(() => {
    mounted = true;
    fetchProjects();
    return () => { mounted = false; };
  }, [fetchProjects]);

  // Create project
  const createProject = async (project: ProjectInsert): Promise<Project | null> => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select('*, profiles(full_name, avatar_url), project_images(*)')
        .single();
      if (error) throw error;
      setProjects(prev => [data, ...prev]);
      setCount(prev => prev + 1);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      return null;
    }
  };

  // Update project
  const updateProject = async (id: string, updates: ProjectUpdate): Promise<Project | null> => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select('*, profiles(full_name, avatar_url), project_images(*)')
        .single();
      if (error) throw error;
      setProjects(prev => prev.map(p => p.id === id ? data : p));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
      return null;
    }
  };

  // Delete project
  const deleteProject = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setProjects(prev => prev.filter(p => p.id !== id));
      setCount(prev => prev - 1);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      return false;
    }
  };

  // Upload project image
  const uploadProjectImage = async (projectId: string, file: File, altText?: string): Promise<ProjectImage | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${projectId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(fileName);

      const { data, error } = await supabase
        .from('project_images')
        .insert({
          project_id: projectId,
          storage_path: fileName,
          alt_text: altText,
        })
        .select()
        .single();
      if (error) throw error;

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      return null;
    }
  };

  // Delete project image
  const deleteProjectImage = async (imageId: string, storagePath: string): Promise<boolean> => {
    try {
      const { error: storageError } = await supabase.storage
        .from('project-images')
        .remove([storagePath]);
      if (storageError) throw storageError;

      const { error } = await supabase
        .from('project_images')
        .delete()
        .eq('id', imageId);
      if (error) throw error;

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
      return false;
    }
  };

  return {
    projects,
    loading,
    error,
    count,
    totalPages,
    page,
    pageSize,
    refetch: fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    uploadProjectImage,
    deleteProjectImage,
  };
};

// Hook for single project
export const useProject = (slugOrId: string) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchProject = async () => {
      try {
        // Try by slug first, then by ID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
        
        let query = supabase
          .from('projects')
          .select('*, profiles(full_name, avatar_url, bio, website, social_links), project_images(*)');
        
        query = isUUID ? query.eq('id', slugOrId) : query.eq('slug', slugOrId);
        
        const { data, error: fetchError } = await query.single();
        
        if (fetchError) throw fetchError;
        if (mounted) setProject(data);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to fetch project');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProject();
    return () => { mounted = false; };
  }, [slugOrId]);

  return { project, loading, error, refetch: () => {} };
};