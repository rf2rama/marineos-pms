import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IncidentReport, DrillRecord, NonConformity } from '../types';

interface SafetyState {
  incidents: IncidentReport[];
  drills: DrillRecord[];
  nonConformities: NonConformity[];

  setIncidents: (incidents: IncidentReport[]) => void;
  addIncident: (incident: IncidentReport) => void;
  updateIncident: (id: string, updates: Partial<IncidentReport>) => void;

  setDrills: (drills: DrillRecord[]) => void;
  addDrill: (drill: DrillRecord) => void;

  setNonConformities: (ncs: NonConformity[]) => void;
  addNonConformity: (nc: NonConformity) => void;
  updateNonConformity: (id: string, updates: Partial<NonConformity>) => void;
}

export const useSafetyStore = create<SafetyState>()(
  persist(
    (set) => ({
      incidents: [],
      drills: [],
      nonConformities: [],

      setIncidents: (incidents) => set({ incidents }),
      addIncident: (incident) => set((state) => ({ incidents: [incident, ...state.incidents] })),
      updateIncident: (id, updates) =>
        set((state) => ({
          incidents: state.incidents.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        })),

      setDrills: (drills) => set({ drills }),
      addDrill: (drill) => set((state) => ({ drills: [drill, ...state.drills] })),

      setNonConformities: (nonConformities) => set({ nonConformities }),
      addNonConformity: (nc) => set((state) => ({ nonConformities: [nc, ...state.nonConformities] })),
      updateNonConformity: (id, updates) =>
        set((state) => ({
          nonConformities: state.nonConformities.map((n) => (n.id === id ? { ...n, ...updates } : n)),
        })),
    }),
    {
      name: 'marineos_safety_store',
    }
  )
);
