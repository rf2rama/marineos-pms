import { UserRole } from '../constants/roles';

export type PermissionKey =
  | 'vessel.view'
  | 'vessel.edit'
  | 'vessel.delete'
  | 'equipment.manage'
  | 'pm_schedule.create'
  | 'job.execute'
  | 'job.approve'
  | 'requisition.create'
  | 'requisition.approve'
  | 'approval.stage2'
  | 'approval.stage3'
  | 'approval.stage4'
  | 'approval.stage5'
  | 'crew.manage'
  | 'crew.assign'
  | 'voyage.plan'
  | 'incident.submit'
  | 'incident.close'
  | 'analytics.view'
  | 'analytics.export'
  | 'user.manage'
  | 'daily_log.enter'
  | 'rest_hours.enter'
  | 'noon_report.submit';

export const PERMISSION_MATRIX: Record<PermissionKey, UserRole[]> = {
  'vessel.view': [
    'owner', 'fleet_manager', 'finance_manager', 'technical_superintendent',
    'crewing_officer', 'operations_officer', 'armada_officer', 'it_officer', 'safety_officer',
    'master', 'chief_engineer', 'second_engineer', 'third_engineer', 'fourth_engineer',
    'electrician', 'motorman', 'chief_officer', 'second_officer', 'third_officer',
    'deck_cadet', 'engine_cadet', 'bosun', 'able_seaman', 'chief_cook', 'cook', 'messman', 'pumpman'
  ],
  'vessel.edit': ['owner', 'fleet_manager', 'technical_superintendent', 'armada_officer'],
  'vessel.delete': ['owner'],
  'equipment.manage': ['owner', 'fleet_manager', 'technical_superintendent', 'chief_engineer'],
  'pm_schedule.create': ['owner', 'fleet_manager', 'technical_superintendent', 'chief_engineer'],
  'job.execute': ['master', 'chief_engineer', 'second_engineer', 'third_engineer', 'fourth_engineer', 'electrician', 'motorman', 'chief_officer', 'second_officer', 'third_officer', 'bosun', 'able_seaman', 'pumpman'],
  'job.approve': ['owner', 'fleet_manager', 'technical_superintendent', 'master', 'chief_engineer'],
  'requisition.create': ['technical_superintendent', 'master', 'chief_engineer', 'chief_officer'],
  'requisition.approve': ['owner', 'fleet_manager', 'finance_manager', 'technical_superintendent', 'master'],
  'approval.stage2': ['master'],
  'approval.stage3': ['technical_superintendent', 'crewing_officer', 'operations_officer', 'armada_officer', 'it_officer'],
  'approval.stage4': ['owner', 'fleet_manager'],
  'approval.stage5': ['owner', 'finance_manager'],
  'crew.manage': ['owner', 'fleet_manager', 'crewing_officer'],
  'crew.assign': ['owner', 'fleet_manager', 'crewing_officer'],
  'voyage.plan': ['owner', 'fleet_manager', 'operations_officer', 'armada_officer', 'master'],
  'incident.submit': [
    'owner', 'fleet_manager', 'finance_manager', 'technical_superintendent',
    'crewing_officer', 'operations_officer', 'armada_officer', 'it_officer', 'safety_officer',
    'master', 'chief_engineer', 'second_engineer', 'third_engineer', 'fourth_engineer',
    'electrician', 'motorman', 'chief_officer', 'second_officer', 'third_officer',
    'deck_cadet', 'engine_cadet', 'bosun', 'able_seaman', 'chief_cook', 'cook', 'messman', 'pumpman'
  ],
  'incident.close': ['owner', 'fleet_manager', 'technical_superintendent', 'safety_officer'],
  'analytics.view': ['owner', 'fleet_manager', 'finance_manager', 'technical_superintendent', 'crewing_officer', 'operations_officer', 'armada_officer', 'safety_officer'],
  'analytics.export': ['owner', 'fleet_manager', 'finance_manager', 'technical_superintendent', 'crewing_officer', 'operations_officer', 'armada_officer', 'safety_officer'],
  'user.manage': ['owner', 'fleet_manager', 'it_officer'],
  'daily_log.enter': ['master', 'chief_engineer', 'second_engineer', 'third_engineer', 'fourth_engineer', 'electrician', 'motorman'],
  'rest_hours.enter': [
    'master', 'chief_engineer', 'second_engineer', 'third_engineer', 'fourth_engineer',
    'electrician', 'motorman', 'chief_officer', 'second_officer', 'third_officer',
    'deck_cadet', 'engine_cadet', 'bosun', 'able_seaman', 'chief_cook', 'cook', 'messman', 'pumpman'
  ],
  'noon_report.submit': ['master', 'chief_officer', 'second_officer', 'third_officer'],
};
