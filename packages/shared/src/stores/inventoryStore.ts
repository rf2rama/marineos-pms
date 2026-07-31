import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SparePartItem, RequisitionOrder, Supplier, SparePartReplacementRecord } from '../types';

interface InventoryState {
  spareParts: SparePartItem[];
  requisitions: RequisitionOrder[];
  suppliers: Supplier[];
  replacementHistory: SparePartReplacementRecord[];

  setSpareParts: (parts: SparePartItem[]) => void;
  addSparePart: (part: SparePartItem) => void;
  updateSparePart: (id: string, updates: Partial<SparePartItem>) => void;
  deleteSparePart: (id: string) => void;

  setRequisitions: (reqs: RequisitionOrder[]) => void;
  addRequisition: (req: RequisitionOrder) => void;
  updateRequisition: (id: string, updates: Partial<RequisitionOrder>) => void;
  deleteRequisition: (id: string) => void;

  setSuppliers: (suppliers: Supplier[]) => void;
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;

  setReplacementHistory: (history: SparePartReplacementRecord[]) => void;
  addReplacementRecord: (record: SparePartReplacementRecord) => void;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set) => ({
      spareParts: [],
      requisitions: [],
      suppliers: [],
      replacementHistory: [],

      setSpareParts: (spareParts) => set({ spareParts }),
      addSparePart: (part) => set((state) => ({ spareParts: [part, ...state.spareParts] })),
      updateSparePart: (id, updates) =>
        set((state) => ({
          spareParts: state.spareParts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
      deleteSparePart: (id) => set((state) => ({ spareParts: state.spareParts.filter((p) => p.id !== id) })),

      setRequisitions: (requisitions) => set({ requisitions }),
      addRequisition: (req) => set((state) => ({ requisitions: [req, ...state.requisitions] })),
      updateRequisition: (id, updates) =>
        set((state) => ({
          requisitions: state.requisitions.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),
      deleteRequisition: (id) => set((state) => ({ requisitions: state.requisitions.filter((r) => r.id !== id) })),

      setSuppliers: (suppliers) => set({ suppliers }),
      addSupplier: (supplier) => set((state) => ({ suppliers: [supplier, ...state.suppliers] })),
      updateSupplier: (id, updates) =>
        set((state) => ({
          suppliers: state.suppliers.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        })),

      setReplacementHistory: (replacementHistory) => set({ replacementHistory }),
      addReplacementRecord: (record) => set((state) => ({ replacementHistory: [record, ...state.replacementHistory] })),
    }),
    {
      name: 'marineos_inventory_store',
    }
  )
);
