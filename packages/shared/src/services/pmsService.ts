import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Equipment, MaintenanceJob, JobExecution, DailyLog, PMSchedule } from '../types';

export const pmsService = {
  async fetchEquipment(vesselId: string): Promise<Equipment[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('vessel_id', vesselId)
      .order('name');
    if (error) throw error;
    return data as Equipment[];
  },

  async createEquipment(equipment: Omit<Equipment, 'id'>): Promise<Equipment> {
    const item: Equipment = { ...equipment, id: `eq-${Date.now()}` };
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('equipment').insert(item).select().single();
      if (error) throw error;
      return data as Equipment;
    }
    return item;
  },

  async fetchJobs(vesselId: string): Promise<MaintenanceJob[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('maintenance_jobs')
      .select('*')
      .eq('vessel_id', vesselId)
      .order('next_due_date');
    if (error) throw error;
    return data as MaintenanceJob[];
  },

  async createJob(job: Omit<MaintenanceJob, 'id'>): Promise<MaintenanceJob> {
    const item: MaintenanceJob = { ...job, id: `job-${Date.now()}` };
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('maintenance_jobs').insert(item).select().single();
      if (error) throw error;
      return data as MaintenanceJob;
    }
    return item;
  },

  async updateJob(id: string, updates: Partial<MaintenanceJob>): Promise<MaintenanceJob> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('maintenance_jobs').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data as MaintenanceJob;
    }
    return { id, ...updates } as MaintenanceJob;
  },

  async executeJob(execution: JobExecution): Promise<JobExecution> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('job_executions').insert(execution).select().single();
      if (error) throw error;
      return data as JobExecution;
    }
    return execution;
  },

  async createPMSchedule(schedule: Omit<PMSchedule, 'id'>): Promise<PMSchedule> {
    const item: PMSchedule = { ...schedule, id: `pmsched-${Date.now()}` };
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('pm_schedules').insert(item).select().single();
      if (error) throw error;
      return data as PMSchedule;
    }
    return item;
  },
};
