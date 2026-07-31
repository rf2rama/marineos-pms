import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Vessel } from '../types';

interface VesselState {
  vessels: Vessel[];
  selectedVesselId: string;
  setSelectedVesselId: (id: string) => void;
  setVessels: (vessels: Vessel[]) => void;
  addVessel: (vessel: Vessel) => void;
  updateVessel: (id: string, updates: Partial<Vessel>) => void;
  deleteVessel: (id: string) => void;
}

export const useVesselStore = create<VesselState>()(
  persist(
    (set) => ({
      vessels: [],
      selectedVesselId: 'vessel-1',
      setSelectedVesselId: (id) => set({ selectedVesselId: id }),
      setVessels: (vessels) => set({ vessels }),
      addVessel: (vessel) => set((state) => ({ vessels: [vessel, ...state.vessels] })),
      updateVessel: (id, updates) =>
        set((state) => ({
          vessels: state.vessels.map((v) => (v.id === id ? { ...v, ...updates } : v)),
        })),
      deleteVessel: (id) => set((state) => ({ vessels: state.vessels.filter((v) => v.id !== id) })),
    }),
    {
      name: 'marineos_vessel_store',
    }
  )
);
