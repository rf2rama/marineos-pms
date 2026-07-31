import { supabase, isSupabaseConfigured } from './supabaseClient';
import { VoyagePlan, VesselActivityLog, ShipTank, PortCall, BunkerEvent } from '../types';

export const operationsService = {
  async fetchVoyages(vesselId: string): Promise<VoyagePlan[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('voyage_plans').select('*').eq('vessel_id', vesselId);
    if (error) throw error;
    return data as VoyagePlan[];
  },

  async createVoyage(voyage: Omit<VoyagePlan, 'id'>): Promise<VoyagePlan> {
    const item: VoyagePlan = { ...voyage, id: `voy-${Date.now()}` };
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('voyage_plans').insert(item).select().single();
      if (error) throw error;
      return data as VoyagePlan;
    }
    return item;
  },

  async fetchActivities(vesselId: string): Promise<VesselActivityLog[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('vessel_activities').select('*').eq('vessel_id', vesselId);
    if (error) throw error;
    return data as VesselActivityLog[];
  },

  async fetchTanks(vesselId: string): Promise<ShipTank[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('ship_tanks').select('*').eq('vessel_id', vesselId);
    if (error) throw error;
    return data as ShipTank[];
  },
};
