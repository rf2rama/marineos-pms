import { supabase, isSupabaseConfigured } from './supabaseClient';
import { UserProfile } from '../types';
import { UserRole } from '../constants/roles';

export const authService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data as UserProfile;
  },

  async login(email: string, role: UserRole): Promise<UserProfile> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: 'password123',
      });
      if (error) throw error;
      if (data.user) {
        const profile = await this.getProfile(data.user.id);
        if (profile) return profile;
      }
    }

    // Fallback profile
    return {
      id: `usr-${Date.now()}`,
      fullName: email.split('@')[0].replace('.', ' '),
      role,
      isActive: true,
    };
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  },
};
