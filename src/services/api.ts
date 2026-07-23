import { supabase, isSupabaseConfigured } from './supabaseClient';
import { 
  Vessel, Equipment, MaintenanceJob, JobExecution, DailyLog, DrydockProject, WorkOrderCard,
  SparePartItem, SparePartReplacementRecord, MachineryRunSession, RequisitionOrder, Supplier, CrewMember, IncidentReport, DrillRecord, NonConformity
} from '../types';

/**
 * Unified API Data Service
 * Routes calls to Supabase Cloud when connected, or degrades gracefully to LocalStorage fallback.
 */

// Generic fetcher
export async function fetchEntityData<T>(tableName: string, localStorageKey: string, defaultData: T[]): Promise<T[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from(tableName).select('*');
      if (!error && data && data.length > 0) {
        return data as T[];
      }
    } catch (e) {
      console.warn(`[Supabase API] Failed to fetch ${tableName}, falling back to LocalStorage`, e);
    }
  }

  // LocalStorage Fallback
  const saved = localStorage.getItem(localStorageKey);
  return saved ? JSON.parse(saved) : defaultData;
}

// Generic saver/upsert
export async function upsertEntityData<T extends { id: string }>(tableName: string, localStorageKey: string, item: T, currentItems: T[]): Promise<T[]> {
  const updatedItems = currentItems.some(i => i.id === item.id)
    ? currentItems.map(i => i.id === item.id ? { ...i, ...item } : i)
    : [item, ...currentItems];

  localStorage.setItem(localStorageKey, JSON.stringify(updatedItems));

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from(tableName).upsert(item);
    } catch (e) {
      console.error(`[Supabase API] Error upserting to ${tableName}:`, e);
    }
  }

  return updatedItems;
}

// Generic deleter
export async function deleteEntityData<T extends { id: string }>(tableName: string, localStorageKey: string, id: string, currentItems: T[]): Promise<T[]> {
  const updatedItems = currentItems.filter(i => i.id !== id);
  localStorage.setItem(localStorageKey, JSON.stringify(updatedItems));

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from(tableName).delete().eq('id', id);
    } catch (e) {
      console.error(`[Supabase API] Error deleting from ${tableName}:`, e);
    }
  }

  return updatedItems;
}
