import { supabase, isSupabaseConfigured } from './supabaseClient';
import { CrewMember, MLCRestHourLog } from '../types';

export const crewService = {
  async fetchCrewMembers(): Promise<CrewMember[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('crew_members').select('*').order('full_name');
    if (error) throw error;
    return data as CrewMember[];
  },

  async createCrewMember(crew: Omit<CrewMember, 'id'>): Promise<CrewMember> {
    const item: CrewMember = { ...crew, id: `crew-${Date.now()}` };
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('crew_members').insert(item).select().single();
      if (error) throw error;
      return data as CrewMember;
    }
    return item;
  },

  async updateCrewMember(id: string, updates: Partial<CrewMember>): Promise<CrewMember> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('crew_members').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data as CrewMember;
    }
    return { id, ...updates } as CrewMember;
  },

  async createMLCLog(log: Omit<MLCRestHourLog, 'id'>): Promise<MLCRestHourLog> {
    const item: MLCRestHourLog = { ...log, id: `mlc-${Date.now()}` };
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('mlc_rest_hour_logs').insert(item).select().single();
      if (error) throw error;
      return data as MLCRestHourLog;
    }
    return item;
  },
};
