import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

export function useRealtimeSubscription(
  table: string,
  onPayload: (payload: any) => void
) {
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
        onPayload(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, onPayload]);
}
