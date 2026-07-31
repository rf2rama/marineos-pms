import { ManagementRole } from './roles';

export type RequestType = 
  | 'spare_parts_requisition' 
  | 'drydock_work_order' 
  | 'maintenance_job' 
  | 'crew_sign_on' 
  | 'crew_leave' 
  | 'port_call' 
  | 'voyage_plan' 
  | 'vessel_routing_change' 
  | 'it_equipment_purchase' 
  | 'fleet_schedule_change' 
  | 'general_procurement'
  | 'defect_report';

export type Department = 'Technical' | 'Crewing' | 'Operations' | 'IT' | 'Armada' | 'Finance';

export interface ApprovalStageDefinition {
  stageNumber: number;
  stageName: string;
  assignedRoleOrDept: string;
}

export const APPROVAL_STAGES_CONFIG: Record<number, string> = {
  1: 'Crew Submit',
  2: 'Captain Approve',
  3: 'Department Staff Approve',
  4: 'Fleet Manager Approve',
  5: 'Finance Manager Approve',
  6: 'Done / Fulfilled',
};

export const STAGE_3_DEPARTMENT_ROUTING: Record<RequestType, Department | null> = {
  spare_parts_requisition: 'Technical',
  drydock_work_order: 'Technical',
  maintenance_job: 'Technical',
  defect_report: 'Technical',
  crew_sign_on: 'Crewing',
  crew_leave: 'Crewing',
  port_call: 'Operations',
  voyage_plan: 'Operations',
  vessel_routing_change: 'Armada',
  it_equipment_purchase: 'IT',
  fleet_schedule_change: 'Armada',
  general_procurement: null, // Skips Stage 3 to Finance
};
