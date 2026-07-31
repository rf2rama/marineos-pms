import { supabase, isSupabaseConfigured } from './supabaseClient';
import { AttachmentFile } from '../types';

export const storageService = {
  async uploadFile(bucket: string, path: string, file: File): Promise<AttachmentFile> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.storage.from(bucket).upload(path, file);
      if (error) throw error;
      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
      return {
        id: `att-${Date.now()}`,
        name: file.name,
        url: publicUrlData.publicUrl,
        type: file.type.includes('image') ? 'image' : file.type.includes('pdf') ? 'pdf' : 'document',
        sizeBytes: file.size,
        uploadedAt: new Date().toISOString(),
      };
    }

    // Mock return for local testing
    return {
      id: `att-${Date.now()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type.includes('image') ? 'image' : file.type.includes('pdf') ? 'pdf' : 'document',
      sizeBytes: file.size,
      uploadedAt: new Date().toISOString(),
    };
  },
};
