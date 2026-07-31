import { supabase, isSupabaseConfigured } from './supabaseClient';
import { ApprovalRequest, ApprovalStageRecord } from '../types';
import { RequestType, STAGE_3_DEPARTMENT_ROUTING, Department } from '../constants/approval';

export const approvalService = {
  async submitForApproval(
    vesselId: string,
    requestType: RequestType,
    entityId: string,
    entityTable: string,
    title: string,
    submittedBy: string,
    totalCostIDR?: number
  ): Promise<ApprovalRequest> {
    const stage3Dept = STAGE_3_DEPARTMENT_ROUTING[requestType] || undefined;
    const req: ApprovalRequest = {
      id: `appr-${Date.now()}`,
      vesselId,
      requestType,
      entityId,
      entityTable,
      title,
      submittedBy,
      currentStage: 2, // Submitted -> Moves to Stage 2 (Captain approval)
      stage3Department: stage3Dept || undefined,
      finalStatus: 'pending',
      totalCostIDR,
      stages: [
        {
          id: `stg-${Date.now()}`,
          requestId: `appr-${Date.now()}`,
          stageNumber: 1,
          stageName: 'Crew Submit',
          actionedBy: submittedBy,
          action: 'approved',
          comments: 'Request submitted',
          actionedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('approval_requests').insert(req).select().single();
      if (error) throw error;
      return data as ApprovalRequest;
    }
    return req;
  },

  async fetchPendingApprovals(userRole: string, userDepartment?: Department): Promise<ApprovalRequest[]> {
    if (!isSupabaseConfigured) return [];

    let query = supabase.from('approval_requests').select('*, stages(*)').eq('final_status', 'pending');

    if (userRole === 'master') {
      query = query.eq('current_stage', 2);
    } else if (userRole === 'fleet_manager') {
      query = query.eq('current_stage', 4);
    } else if (userRole === 'finance_manager') {
      query = query.eq('current_stage', 5);
    } else if (userDepartment) {
      query = query.eq('current_stage', 3).eq('stage3_department', userDepartment);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as ApprovalRequest[];
  },
};
