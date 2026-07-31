import { supabase, isSupabaseConfigured } from './supabaseClient';
import { IncidentReport, DrillRecord, NonConformity } from '../types';

export const safetyService = {
  async fetchIncidents(vesselId: string): Promise<IncidentReport[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('incidents').select('*').eq('vessel_id', vesselId);
    if (error) throw error;
    return data as IncidentReport[];
  },

  async createIncident(incident: Omit<IncidentReport, 'id'>): Promise<IncidentReport> {
    const item: IncidentReport = { ...incident, id: `inc-${Date.now()}` };
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('incidents').insert(item).select().single();
      if (error) throw error;
      return data as IncidentReport;
    }
    return item;
  },

  async fetchDrills(vesselId: string): Promise<DrillRecord[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('drills').select('*').eq('vessel_id', vesselId);
    if (error) throw error;
    return data as DrillRecord[];
  },

  async createDrill(drill: Omit<DrillRecord, 'id'>): Promise<DrillRecord> {
    const item: DrillRecord = { ...drill, id: `drill-${Date.now()}` };
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('drills').insert(item).select().single();
      if (error) throw error;
      return data as DrillRecord;
    }
    return item;
  },
};
