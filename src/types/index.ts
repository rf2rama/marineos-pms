export type UserRole = 
  | 'owner' 
  | 'technical_manager' 
  | 'superintendent' 
  | 'chief_engineer' 
  | 'supply_officer' 
  | 'safety_officer'
  | 'crew_manager';

export interface VesselDimensions {
  loaMeters: number; // Length Overall
  beamMeters: number; // Moulded Beam
  draftMeters: number; // Summer Loaded Draft
  dwtTons: number; // Deadweight Tonnage
  enginePowerKW: number; // Main Engine MCR Output
  cargoCapacityM3: number; // Total Hold Grain/Bale Volume
}

export interface Vessel {
  id: string;
  name: string;
  imoNumber: string;
  flag: string;
  vesselType: string;
  builtYear: number;
  classSociety: string;
  status: 'At Sea' | 'In Port' | 'In Drydock' | 'Anchorage' | 'Laid Up' | 'Scrapped' | 'Under Repair';
  currentLocation: string;
  totalRunningHours: number;
  dimensions?: VesselDimensions;
}

export type EquipmentCategory = 
  | 'Main Propulsion' 
  | 'Auxiliary Power' 
  | 'Boiler & Steam' 
  | 'Pumps & Piping' 
  | 'Purifiers & Separators' 
  | 'Steering & Deck Machinery' 
  | 'Safety & Firefighting';

export interface Equipment {
  id: string;
  vesselId: string;
  name: string;
  category: EquipmentCategory;
  maker: string;
  model: string;
  serialNumber: string;
  location: string;
  initialRunningHours: number;
  runningHours: number;
  criticality: 'High' | 'Medium' | 'Low';
  lastOverhaulDate: string;
  status: 'Operational' | 'Requires Service' | 'Critical Repair';
}

export type StorageLocationType = 'Land Storage' | 'Ship Storage';
export type ItemCategory = 'Spare Part (Non-Consumable)' | 'Consumable (Oils, Supplies, Chemicals, Logbooks)';
export type ItemConditionStatus = 
  | 'Good / Ready' 
  | 'Broken / Damaged' 
  | 'Offloaded to Land (Ship-to-Shore)' 
  | 'In Workshop / Under Overhaul' 
  | 'Scrapped';

export interface SparePartItem {
  id: string;
  vesselId?: string;
  equipmentId?: string;
  partName: string;
  partNumber: string;
  itemCategory: ItemCategory;
  stockQty: number;
  minStockQty: number;
  unitCostUSD: number;
  locationType: StorageLocationType;
  locationName: string;
  conditionStatus: ItemConditionStatus;
  conditionNotes?: string;
  offloadedFromVesselName?: string;
  statusUpdatedDate?: string;
  installedAtRunningHours?: number;
  installedDate?: string;
  isCurrentlyInstalled?: boolean;
}

export interface SparePartReplacementRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  partName: string;
  partNumber: string;
  qtyReplaced: number;
  dateReplaced: string;
  runningHoursAtChange: number;
  replacedBy: string;
  reason: string;
}

export interface MachineryRunSession {
  id: string;
  equipmentId: string;
  equipmentName: string;
  vesselId: string;
  startTime: string;
  stopTime: string;
  hoursCalculated: number;
  loggedBy: string;
  purpose: string;
}

/* =========================================================================
   INVENTORY, PROCUREMENT & VENDOR MANAGEMENT (PER-ITEM VENDORS & STATUSES)
   ========================================================================= */

export type RequisitionStatus = 'Draft' | 'Vessel Requested' | 'Office Approved' | 'PO Issued' | 'Delivered & Received';

export type RequisitionItemStatus = 
  | 'Requested' 
  | 'Approved' 
  | 'Denied / Rejected' 
  | 'Ordered to Vendor' 
  | 'In Transit' 
  | 'Delivered & Received';

export interface RequisitionItem {
  id?: string;
  partName: string;
  partNumber: string;
  qtyRequested: number;
  unitPriceUSD: number;
  itemCategory: ItemCategory;
  supplierName?: string; // Assigned vendor for this specific item!
  status?: RequisitionItemStatus; // Status of this specific item!
  denialReason?: string; // Reason if item is denied
}

export interface RequisitionOrder {
  id: string;
  vesselId: string;
  requisitionNo: string;
  requestedBy: string;
  dateRequested: string;
  supplierName?: string;
  items: RequisitionItem[];
  totalCostUSD: number;
  status: RequisitionStatus;
  originLocationType: StorageLocationType;
  originLocationName: string;
  deliveryPort: string;
  estimatedDeliveryDate: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  rating: number; // Out of 5.0
  contactEmail: string;
  phone?: string;
  country: string;
  address?: string;
  status: 'Approved Supplier' | 'Under Audit' | 'Blacklisted';
  performanceNotes?: string;
  activeOrdersCount?: number;
}

/* =========================================================================
   CREW MANAGEMENT WITH DETAILED DEPLOYMENT & TERMINATION STATUSES
   ========================================================================= */

export interface SeafarerCertificate {
  id: string;
  certName: string;
  certNumber: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  status: 'Valid' | 'Expiring Soon' | 'Expired';
}

export interface VesselAssignmentHistory {
  id: string;
  vesselId: string;
  vesselName: string;
  rank: string;
  signOnDate: string;
  signOffDate: string;
  performanceRating: 'Excellent' | 'Good' | 'Satisfactory';
  remarks: string;
}

export interface SeafarerMedicalRecord {
  id: string;
  date: string;
  conditionType: 'Routine Medical' | 'Illness' | 'Injury' | 'Vaccination';
  description: string;
  fitForDuty: boolean;
  doctorNotes: string;
  treatedByCrewName?: string;
}

export interface SeafarerAccidentRecord {
  id: string;
  incidentId?: string;
  incidentTitle: string;
  date: string;
  description: string;
  injuryType: string;
  handledByCrewName: string;
  treatmentDetails: string;
  status: 'Recovered' | 'Under Treatment' | 'Repatriated';
}

export type SeafarerStatus = 
  | 'Available' 
  | 'Onboard' 
  | 'On Leave' 
  | 'In Transit' 
  | 'Waiting for Deployment' 
  | 'Fired / Terminated' 
  | 'Blacklisted' 
  | 'Medical Hold';

export type SeafarerRank = 
  | 'Master' 
  | 'Chief Engineer' 
  | '2nd Engineer' 
  | '3rd Engineer'
  | '4th Engineer'
  | 'Electrician'
  | 'Motorman'
  | 'Chief Officer' 
  | '2nd Officer' 
  | '3rd Officer'
  | 'Deck Cadet'
  | 'Engine Cadet'
  | 'Bosun' 
  | 'AB Seaman'
  | 'Chief Cook'
  | 'Cook'
  | 'Messman'
  | 'Pumpman';

export interface CrewMember {
  id: string;
  fullName: string;
  rank: SeafarerRank;
  nationality: string;
  seamanBookNo: string;
  status: SeafarerStatus;
  currentVesselId?: string;
  currentVesselName?: string;
  signOnDate?: string;
  signOffDatePlanned?: string;
  certificates: SeafarerCertificate[];
  assignmentHistory: VesselAssignmentHistory[];
  medicalRecords: SeafarerMedicalRecord[];
  accidentRecords: SeafarerAccidentRecord[];
  personalNotes?: string;
}

/* =========================================================================
   SAFETY, RISK & ISM/SMS (VESSEL ACCIDENT LOCATION & MULTI-CREW)
   ========================================================================= */

export interface IncidentReport {
  id: string;
  vesselId: string;
  vesselName?: string;
  title: string;
  incidentType: 'Near-Miss' | 'Minor Injury' | 'Equipment Failure' | 'Environmental Spill' | 'Unsafe Act';
  dateReported: string;
  locationOnboard: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
  rootCause: string;
  correctiveAction: string;
  crewInvolvedIds?: string[];
  crewInvolvedNames?: string;
  handledByCrewName?: string;
  status: 'Open' | 'Under Investigation' | 'Corrective Action Done' | 'Closed';
}

export interface DrillRecord {
  id: string;
  vesselId: string;
  vesselName?: string;
  drillType: 'Lifeboat & Launching' | 'Fire & Smoke Emergency' | 'SOPEP Oil Spill Response' | 'Enclosed Space Entry' | 'Abandon Ship';
  dateConducted: string;
  drilledBy: string;
  attendeesCount: number;
  evaluation: 'Satisfactory' | 'Needs Improvement';
  notes: string;
}

export interface NonConformity {
  id: string;
  vesselId: string;
  vesselName?: string;
  auditType: 'PSC Inspection' | 'Flag State Audit' | 'Internal ISM Audit' | 'Vetting (SIRE)';
  findingDescription: string;
  findingType: 'Major NC' | 'Minor NC' | 'Observation';
  dateFound: string;
  dueDate: string;
  status: 'Open' | 'Action In Progress' | 'Closed';
}

/* =========================================================================
   PMS CORE TYPES
   ========================================================================= */

export type IntervalType = 'Calendar' | 'RunningHours' | 'Both';

export interface MaintenanceJob {
  id: string;
  vesselId: string;
  vesselName?: string;
  equipmentId: string;
  equipmentName: string;
  title: string;
  description: string;
  intervalType: IntervalType;
  intervalDays?: number;
  intervalHours?: number;
  completionWindowDays?: number;
  lastDoneDate?: string;
  lastDoneHours?: number;
  nextDueDate: string;
  nextDueHours?: number;
  classSurveyRequired: boolean;
  classSocietyRef?: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Upcoming' | 'Due' | 'Overdue' | 'Completed';
  estimatedManHours: number;
  requiredParts: string[];
}

export interface JobExecution {
  id: string;
  jobId: string;
  jobTitle: string;
  equipmentName: string;
  vesselId: string;
  startDate: string;
  dateCompleted: string;
  runningHoursAtExecution: number;
  completedBy: string;
  findings: string;
  partsUsed: { partId?: string; name: string; qty: number; isNonConsumableSpare?: boolean }[];
  actualManHours: number;
  estimatedManHours: number;
  daysLateOrEarly: number;
  signedOffByChief: boolean;
  signedOffDate?: string;
}

export interface DailyLog {
  id: string;
  vesselId: string;
  date: string;
  loggedBy: string;
  mainEngineRPM: number;
  mainEngineLoadPercent: number;
  exhaustTempAvg: number;
  lubeOilPressureBar: number;
  fuelConsumptionTonsPerDay: number;
  auxGen1Hours: number;
  auxGen2Hours: number;
  remarks?: string;
}

export interface WorkOrderCard {
  id: string;
  projectId: string;
  vesselId: string;
  title: string;
  department: 'Engine' | 'Deck' | 'Electrical' | 'Hull & Steel';
  equipmentRef: string;
  scopeDescription: string;
  contractorName?: string;
  contractorQuoteUSD?: number;
  actualCostUSD?: number;
  plannedBudgetUSD: number;
  status: 'Draft' | 'Sent for Tender' | 'Approved' | 'In Progress' | 'Inspection Ready' | 'Completed';
  publicToken: string;
  deadline: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
}

export interface DrydockProject {
  id: string;
  vesselId: string;
  shipyardName: string;
  location: string;
  startDate: string;
  endDate: string;
  totalPlannedBudgetUSD: number;
  totalActualCostUSD: number;
  status: 'Planning' | 'Underway' | 'Completed';
}
