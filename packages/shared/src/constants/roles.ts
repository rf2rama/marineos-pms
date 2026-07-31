export const MANAGEMENT_ROLES = [
  'owner',
  'fleet_manager',
  'finance_manager',
  'technical_superintendent',
  'crewing_officer',
  'operations_officer',
  'armada_officer',
  'it_officer',
  'safety_officer',
] as const;

export const CREW_ROLES = [
  'master', // Captain
  'chief_engineer',
  'second_engineer',
  'third_engineer',
  'fourth_engineer',
  'electrician',
  'motorman',
  'chief_officer',
  'second_officer',
  'third_officer',
  'deck_cadet',
  'engine_cadet',
  'bosun',
  'able_seaman',
  'chief_cook',
  'cook',
  'messman',
  'pumpman',
] as const;

export type ManagementRole = typeof MANAGEMENT_ROLES[number];
export type CrewRole = typeof CREW_ROLES[number];
export type UserRole = ManagementRole | CrewRole;
