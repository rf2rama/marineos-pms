import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ApprovalRequest, ApprovalStageRecord } from '../types';

interface ApprovalState {
  approvalRequests: ApprovalRequest[];
  setApprovalRequests: (requests: ApprovalRequest[]) => void;
  addApprovalRequest: (req: ApprovalRequest) => void;
  updateApprovalRequest: (id: string, updates: Partial<ApprovalRequest>) => void;
  advanceStage: (requestId: string, actionedBy: string, actionedByName: string, comments?: string) => void;
  rejectRequest: (requestId: string, actionedBy: string, actionedByName: string, reason: string) => void;
}

export const useApprovalStore = create<ApprovalState>()(
  persist(
    (set) => ({
      approvalRequests: [],
      setApprovalRequests: (approvalRequests) => set({ approvalRequests }),
      addApprovalRequest: (req) => set((state) => ({ approvalRequests: [req, ...state.approvalRequests] })),
      updateApprovalRequest: (id, updates) =>
        set((state) => ({
          approvalRequests: state.approvalRequests.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),
      advanceStage: (requestId, actionedBy, actionedByName, comments) =>
        set((state) => ({
          approvalRequests: state.approvalRequests.map((req) => {
            if (req.id !== requestId) return req;

            const nextStage = req.currentStage + 1;
            // Check if Stage 5 (Finance) should be skipped (e.g. if cost is 0)
            const actualNextStage = (nextStage === 5 && (!req.totalCostIDR || req.totalCostIDR === 0)) ? 6 : nextStage;
            const isCompleted = actualNextStage >= 6;

            const newStageRecord: ApprovalStageRecord = {
              id: `stg-${Date.now()}`,
              requestId,
              stageNumber: req.currentStage,
              stageName: `Stage ${req.currentStage} Action`,
              actionedBy,
              actionedByName,
              action: 'approved',
              comments,
              actionedAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            };

            return {
              ...req,
              currentStage: actualNextStage,
              finalStatus: isCompleted ? 'approved' : 'pending',
              stages: [...(req.stages || []), newStageRecord],
              updatedAt: new Date().toISOString(),
            };
          }),
        })),
      rejectRequest: (requestId, actionedBy, actionedByName, reason) =>
        set((state) => ({
          approvalRequests: state.approvalRequests.map((req) => {
            if (req.id !== requestId) return req;

            const newStageRecord: ApprovalStageRecord = {
              id: `stg-${Date.now()}`,
              requestId,
              stageNumber: req.currentStage,
              stageName: `Stage ${req.currentStage} Rejection`,
              actionedBy,
              actionedByName,
              action: 'rejected',
              comments: reason,
              actionedAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            };

            return {
              ...req,
              finalStatus: 'rejected',
              rejectionReason: reason,
              stages: [...(req.stages || []), newStageRecord],
              updatedAt: new Date().toISOString(),
            };
          }),
        })),
    }),
    {
      name: 'marineos_approval_store',
    }
  )
);
