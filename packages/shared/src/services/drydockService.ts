import { supabase, isSupabaseConfigured } from './supabaseClient';
import { DrydockProject, WorkOrderCard } from '../types';

export const drydockService = {
  async fetchProjects(vesselId: string): Promise<DrydockProject[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('drydock_projects').select('*').eq('vessel_id', vesselId);
    if (error) throw error;
    return data as DrydockProject[];
  },

  async createProject(project: Omit<DrydockProject, 'id'>): Promise<DrydockProject> {
    const item: DrydockProject = { ...project, id: `dry-${Date.now()}` };
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('drydock_projects').insert(item).select().single();
      if (error) throw error;
      return data as DrydockProject;
    }
    return item;
  },

  async fetchWorkOrders(projectId: string): Promise<WorkOrderCard[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('work_order_cards').select('*').eq('project_id', projectId);
    if (error) throw error;
    return data as WorkOrderCard[];
  },
};
