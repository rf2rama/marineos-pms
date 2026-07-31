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

export interface FuelConsumptionRates {
  sailing: number;    // Liters per hour (L/h)
  shifting: number;   // Liters per hour (L/h)
  waiting: number;    // Liters per hour (L/h)
  loading: number;    // Liters per hour (L/h)
  discharge: number;  // Liters per hour (L/h)
  bunkering?: number; // Rate or quantity
  customRates?: Record<string, number>;
}

export type ShipState = 
  | 'Sailing' 
  | 'Shifting' 
  | 'Waiting' 
  | 'Loading' 
  | 'Discharge' 
  | 'Bunkering' 
  | 'Anchorage' 
  | 'Laid Up';

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
  currentROB_MT?: number; // Remaining Fuel Onboard in Metric Tons
  currentState?: ShipState;
  consumptionRates?: FuelConsumptionRates;
}

export interface AttachmentFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'document';
  sizeBytes?: number;
  uploadedAt: string;
}

export type EquipmentCategory = 
  | 'Main Propulsion' 
  | 'Auxiliary Power' 
  | 'Boiler & Steam' 
  | 'Pumps & Piping' 
  | 'Purifiers & Separators' 
  | 'Steering & Deck Machinery' 
  | 'Safety & Firefighting'
  | 'Portable Instruments';

export interface EquipmentTransferLog {
  id: string;
  equipmentId: string;
  fromVesselId: string;
  toVesselId: string; // can be 'Land Storage'
  date: string;
  transferredBy: string;
  notes?: string;
}

export interface Equipment {
  id: string;
  vesselId: string;
  parentId?: string; // Sub-system hierarchy
  name: string;
  category: EquipmentCategory;
  maker: string;
  model: string;
  serialNumber: string;
  location: string;
  initialRunningHours: number;
  runningHours: number;
  tboHours?: number; // Time Between Overhauls (hrs)
  lastOverhaulHours?: number; // Running hours counter at last major overhaul
  solasMarpolTags?: string[]; // e.g. ['SOLAS Emergency', 'MARPOL Annex VI']
  classCmsCode?: string; // e.g. 'DNV-CMS-111.01'
  diagnostics?: {
    vibrationMms?: number;
    bearingTempC?: number;
    insulationMOmega?: number;
  };
  diagnosticHistory?: DiagnosticHistoryPoint[];
  attachments?: AttachmentFile[];
  criticality: 'High' | 'Medium' | 'Low';
  lastOverhaulDate: string;
  status: 'Operational' | 'Requires Service' | 'Critical Repair';
  isPortable?: boolean;
  isDeleted?: boolean;
  linkedVesselStates?: ShipState[]; // E.g., ['Sailing', 'Shifting'] to auto-log hours
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
  unitCostIDR: number;
  locationType: StorageLocationType;
  locationName: string;
  conditionStatus: ItemConditionStatus;
  conditionNotes?: string;
  offloadedFromVesselName?: string;
  statusUpdatedDate?: string;
  installedAtRunningHours?: number;
  installedDate?: string;
  isCurrentlyInstalled?: boolean;
  expectedLifespanHours?: number; // Expected lifespan in running hours
  expectedLifespanDays?: number;  // Expected lifespan in calendar days
  attachments?: AttachmentFile[];
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
  unitPriceIDR: number;
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
  totalCostIDR: number;
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
  picName?: string;
  picPhone?: string;
  picEmail?: string;
  areaCoverage?: string; // e.g. "Singapore, Rotterdam, Houston, Shanghai"
  supplyCategories?: string[];
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
  equipmentId?: string;
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

export interface ProcedureStep {
  id: string;
  stepText: string;
  isCompleted: boolean;
}

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
  procedureChecklist?: ProcedureStep[];
  isAutoGenerated?: boolean;
  autoGeneratedPartId?: string;
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
  contractorQuoteIDR?: number;
  actualCostIDR?: number;
  plannedBudgetIDR: number;
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
  totalPlannedBudgetIDR: number;
  totalActualCostIDR: number;
  status: 'Planning' | 'Underway' | 'Completed';
}

/* =========================================================================
   OPERATIONS, VOYAGE LOGGING & FUEL ANOMALY ENGINE TYPES
   ========================================================================= */

export interface VesselActivityLog {
  id: string;
  vesselId: string;
  vesselName?: string;
  voyageId: string;
  state: ShipState;
  startTime: string;
  endTime?: string;
  durationHours: number;
  startROB_MT: number;
  endROB_MT: number;
  reportedROB_MT?: number;
  fuelConsumedMT: number;
  locationOrPort: string;
  loggedBy: string;
  remarks: string;
  isAnomalyGap?: boolean;
  anomalyDetails?: string;
}

export interface VoyageLeg {
  id: string; // Format: 023/D1/SA99/IX/2026
  state: 'Loading' | 'Discharge' | 'Bunker' | 'Docking';
  portName: string;
  eta: string;
  etd: string;
  ata?: string;
  atd?: string;
  distanceNm: number;
}

export interface VoyagePlan {
  id: string; // internal UUID
  vesselId: string;
  vesselName?: string;
  voyageCount: number; // e.g., 23
  year: number; // e.g., 2026
  status: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
  legs: VoyageLeg[];
  notes?: string;
}

export interface ShipTank {
  id: string;
  vesselId: string;
  tankName: string;
  fuelType: 'HFO' | 'MGO' | 'Lube Oil' | 'Sludge' | 'Bilge' | 'Fresh Water';
  capacityMT: number;
  currentLevelMT: number;
  soundingMeters: number;
  maxSoundingMeters: number;
  temperatureC?: number;
  lastSoundedDate: string;
  soundedBy: string;
}

export interface MLCRestHourLog {
  id: string;
  vesselId: string;
  crewId: string;
  crewName: string;
  rank: string;
  date: string;
  workHours: number;
  restHours: number;
  isCompliant: boolean;
  violationRemarks?: string;
  loggedBy: string;
}

export interface DiagnosticHistoryPoint {
  date: string;
  vibrationMMS: number;
  bearingTempC: number;
  lubeOilViscosityCSt?: number;
}

export interface Port {
  id: string;
  name: string;
  unlocode?: string;
  country: string;
  latitude?: number;
  longitude?: number;
}
