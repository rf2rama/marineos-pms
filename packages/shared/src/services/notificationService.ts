import { supabase, isSupabaseConfigured } from './supabaseClient';
import { InAppNotification } from '../types';

export const notificationService = {
  async fetchNotifications(userId: string): Promise<InAppNotification[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as InAppNotification[];
  },

  async createNotification(notif: Omit<InAppNotification, 'id' | 'createdAt'>): Promise<InAppNotification> {
    const item: InAppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('notifications').insert(item).select().single();
      if (error) throw error;
      return data as InAppNotification;
    }
    return item;
  },

  async markAsRead(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      if (error) throw error;
    }
  },
};
