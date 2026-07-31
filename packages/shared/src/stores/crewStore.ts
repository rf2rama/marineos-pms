import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CrewMember, MLCRestHourLog } from '../types';

interface CrewState {
  crewMembers: CrewMember[];
  mlcLogs: MLCRestHourLog[];

  setCrewMembers: (crew: CrewMember[]) => void;
  addCrewMember: (crew: CrewMember) => void;
  updateCrewMember: (id: string, updates: Partial<CrewMember>) => void;
  deleteCrewMember: (id: string) => void;

  setMLCLogs: (logs: MLCRestHourLog[]) => void;
  addMLCLog: (log: MLCRestHourLog) => void;
}

export const useCrewStore = create<CrewState>()(
  persist(
    (set) => ({
      crewMembers: [],
      mlcLogs: [],

      setCrewMembers: (crewMembers) => set({ crewMembers }),
      addCrewMember: (crew) => set((state) => ({ crewMembers: [crew, ...state.crewMembers] })),
      updateCrewMember: (id, updates) =>
        set((state) => ({
          crewMembers: state.crewMembers.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),
      deleteCrewMember: (id) => set((state) => ({ crewMembers: state.crewMembers.filter((c) => c.id !== id) })),

      setMLCLogs: (mlcLogs) => set({ mlcLogs }),
      addMLCLog: (log) => set((state) => ({ mlcLogs: [log, ...state.mlcLogs] })),
    }),
    {
      name: 'marineos_crew_store',
    }
  )
);
