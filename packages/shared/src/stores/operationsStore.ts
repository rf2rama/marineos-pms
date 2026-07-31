import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { VoyagePlan, VesselActivityLog, FuelAnomalyReport, ShipTank, PortCall, BunkerEvent } from '../types';

interface OperationsState {
  voyages: VoyagePlan[];
  activities: VesselActivityLog[];
  fuelAnomalies: FuelAnomalyReport[];
  tanks: ShipTank[];
  portCalls: PortCall[];
  bunkerEvents: BunkerEvent[];

  setVoyages: (voyages: VoyagePlan[]) => void;
  addVoyage: (voyage: VoyagePlan) => void;
  updateVoyage: (id: string, updates: Partial<VoyagePlan>) => void;

  setActivities: (activities: VesselActivityLog[]) => void;
  addActivity: (activity: VesselActivityLog) => void;
  deleteActivity: (id: string) => void;

  setFuelAnomalies: (anomalies: FuelAnomalyReport[]) => void;
  resolveAnomaly: (id: string, notes?: string) => void;

  setTanks: (tanks: ShipTank[]) => void;
  updateTank: (id: string, updates: Partial<ShipTank>) => void;

  setPortCalls: (portCalls: PortCall[]) => void;
  addPortCall: (portCall: PortCall) => void;

  setBunkerEvents: (events: BunkerEvent[]) => void;
  addBunkerEvent: (event: BunkerEvent) => void;
}

export const useOperationsStore = create<OperationsState>()(
  persist(
    (set) => ({
      voyages: [],
      activities: [],
      fuelAnomalies: [],
      tanks: [],
      portCalls: [],
      bunkerEvents: [],

      setVoyages: (voyages) => set({ voyages }),
      addVoyage: (voyage) => set((state) => ({ voyages: [voyage, ...state.voyages] })),
      updateVoyage: (id, updates) =>
        set((state) => ({
          voyages: state.voyages.map((v) => (v.id === id ? { ...v, ...updates } : v)),
        })),

      setActivities: (activities) => set({ activities }),
      addActivity: (activity) => set((state) => ({ activities: [activity, ...state.activities] })),
      deleteActivity: (id) => set((state) => ({ activities: state.activities.filter(a => a.id !== id) })),

      setFuelAnomalies: (fuelAnomalies) => set({ fuelAnomalies }),
      resolveAnomaly: (id, notes) =>
        set((state) => ({
          fuelAnomalies: state.fuelAnomalies.map((a) =>
            a.id === id ? { ...a, status: 'Resolved', notes: notes || a.notes } : a
          ),
        })),

      setTanks: (tanks) => set({ tanks }),
      updateTank: (id, updates) =>
        set((state) => ({
          tanks: state.tanks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      setPortCalls: (portCalls) => set({ portCalls }),
      addPortCall: (portCall) => set((state) => ({ portCalls: [portCall, ...state.portCalls] })),

      setBunkerEvents: (bunkerEvents) => set({ bunkerEvents }),
      addBunkerEvent: (event) => set((state) => ({ bunkerEvents: [event, ...state.bunkerEvents] })),
    }),
    {
      name: 'marineos_operations_store',
    }
  )
);
