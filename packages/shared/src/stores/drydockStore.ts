import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DrydockProject, WorkOrderCard } from '../types';

interface DrydockState {
  projects: DrydockProject[];
  workOrders: WorkOrderCard[];

  setProjects: (projects: DrydockProject[]) => void;
  addProject: (project: DrydockProject) => void;
  updateProject: (id: string, updates: Partial<DrydockProject>) => void;

  setWorkOrders: (workOrders: WorkOrderCard[]) => void;
  addWorkOrder: (workOrder: WorkOrderCard) => void;
  updateWorkOrder: (id: string, updates: Partial<WorkOrderCard>) => void;
}

export const useDrydockStore = create<DrydockState>()(
  persist(
    (set) => ({
      projects: [],
      workOrders: [],

      setProjects: (projects) => set({ projects }),
      addProject: (project) => set((state) => ({ projects: [project, ...state.projects] })),
      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),

      setWorkOrders: (workOrders) => set({ workOrders }),
      addWorkOrder: (workOrder) => set((state) => ({ workOrders: [workOrder, ...state.workOrders] })),
      updateWorkOrder: (id, updates) =>
        set((state) => ({
          workOrders: state.workOrders.map((w) => (w.id === id ? { ...w, ...updates } : w)),
        })),
    }),
    {
      name: 'marineos_drydock_store',
    }
  )
);
