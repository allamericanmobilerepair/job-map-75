
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/project';
import { useToast } from '@/hooks/use-toast';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProjects: Project[] = data.map(project => ({
        id: project.id,
        title: project.title,
        clientName: project.client_name,
        clientPhone: project.client_phone || '',
        address: project.address,
        scheduledDate: project.scheduled_date,
        time: project.time || '',
        description: project.description || '',
        status: project.status as Project['status'],
        latitude: project.latitude || 40.7128,
        longitude: project.longitude || -74.0060,
      }));

      setProjects(formattedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error loading projects',
        description: 'Failed to load projects from database',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (project: Omit<Project, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          title: project.title,
          client_name: project.clientName,
          client_phone: project.clientPhone,
          address: project.address,
          scheduled_date: project.scheduledDate,
          time: project.time,
          description: project.description,
          status: project.status,
          latitude: project.latitude,
          longitude: project.longitude,
        })
        .select()
        .single();

      if (error) throw error;

      const newProject: Project = {
        id: data.id,
        title: data.title,
        clientName: data.client_name,
        clientPhone: data.client_phone || '',
        address: data.address,
        scheduledDate: data.scheduled_date,
        time: data.time || '',
        description: data.description || '',
        status: data.status as Project['status'],
        latitude: data.latitude || 40.7128,
        longitude: data.longitude || -74.0060,
      };

      setProjects(prev => [newProject, ...prev]);
      
      toast({
        title: 'Project added',
        description: 'Your project has been saved to the database',
      });

      return newProject;
    } catch (error) {
      console.error('Error adding project:', error);
      toast({
        title: 'Error adding project',
        description: 'Failed to save project to database',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateProject = async (updatedProject: Project) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          title: updatedProject.title,
          client_name: updatedProject.clientName,
          client_phone: updatedProject.clientPhone,
          address: updatedProject.address,
          scheduled_date: updatedProject.scheduledDate,
          time: updatedProject.time,
          description: updatedProject.description,
          status: updatedProject.status,
          latitude: updatedProject.latitude,
          longitude: updatedProject.longitude,
        })
        .eq('id', updatedProject.id);

      if (error) throw error;

      setProjects(prev => 
        prev.map(p => p.id === updatedProject.id ? updatedProject : p)
      );

      toast({
        title: 'Project updated',
        description: 'Your changes have been saved',
      });
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error updating project',
        description: 'Failed to save changes to database',
        variant: 'destructive',
      });
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProjects(prev => prev.filter(p => p.id !== id));

      toast({
        title: 'Project deleted',
        description: 'Project has been removed from the database',
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error deleting project',
        description: 'Failed to delete project from database',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    addProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
  };
};
