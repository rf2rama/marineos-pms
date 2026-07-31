import { supabase, isSupabaseConfigured } from './supabaseClient';
import { SparePartItem, RequisitionOrder, Supplier } from '../types';

export const inventoryService = {
  async fetchSpareParts(vesselId: string): Promise<SparePartItem[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('spare_parts').select('*').eq('vessel_id', vesselId);
    if (error) throw error;
    return data as SparePartItem[];
  },

  async createSparePart(part: Omit<SparePartItem, 'id'>): Promise<SparePartItem> {
    const item: SparePartItem = { ...part, id: `part-${Date.now()}` };
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('spare_parts').insert(item).select().single();
      if (error) throw error;
      return data as SparePartItem;
    }
    return item;
  },

  async fetchRequisitions(vesselId: string): Promise<RequisitionOrder[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('requisitions').select('*').eq('vessel_id', vesselId);
    if (error) throw error;
    return data as RequisitionOrder[];
  },

  async createRequisition(req: Omit<RequisitionOrder, 'id'>): Promise<RequisitionOrder> {
    const item: RequisitionOrder = { ...req, id: `req-${Date.now()}` };
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('requisitions').insert(item).select().single();
      if (error) throw error;
      return data as RequisitionOrder;
    }
    return item;
  },

  async fetchSuppliers(): Promise<Supplier[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('suppliers').select('*').order('name');
    if (error) throw error;
    return data as Supplier[];
  },
};
