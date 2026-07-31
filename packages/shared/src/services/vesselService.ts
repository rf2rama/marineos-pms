import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Vessel } from '../types';

export const vesselService = {
  async fetchVessels(): Promise<Vessel[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('vessels').select('*').order('name');
    if (error) throw error;
    return data as Vessel[];
  },

  async createVessel(vessel: Omit<Vessel, 'id'>): Promise<Vessel> {
    const newVessel: Vessel = {
      ...vessel,
      id: `vessel-${Date.now()}`,
    };
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('vessels').insert(newVessel).select().single();
      if (error) throw error;
      return data as Vessel;
    }
    return newVessel;
  },

  async updateVessel(id: string, updates: Partial<Vessel>): Promise<Vessel> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('vessels').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data as Vessel;
    }
    return { id, ...updates } as Vessel;
  },

  async deleteVessel(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('vessels').delete().eq('id', id);
      if (error) throw error;
    }
  },
};
