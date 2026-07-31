import { UserRole, ManagementRole, CrewRole } from '../constants/roles';
import { RequestType, Department } from '../constants/approval';

export * from '../constants/roles';
export * from '../constants/approval';

export interface UserProfile {
  id: string;
  fullName: string;
  role: UserRole;
  department?: Department;
  avatarUrl?: string;
  phone?: string;
  isActive: boolean;
}

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'approval_needed' | 'approved' | 'rejected' | 'overdue' | 'expiring' | 'info';
  linkUrl?: string;
  isRead: boolean;
  entityId?: string;
  entityTable?: string;
  createdAt: string;
}

export interface ApprovalStageRecord {
  id: string;
  requestId: string;
  stageNumber: number;
  stageName: string;
  actionedBy?: string;
  actionedByName?: string;
  action: 'approved' | 'rejected' | 'pending' | 'skipped';
  comments?: string;
  actionedAt?: string;
  createdAt: string;
}

export interface ApprovalRequest {
  id: string;
  vesselId: string;
  vesselName?: string;
  requestType: RequestType;
  entityId: string;
  entityTable: string;
  title: string;
  submittedBy: string;
  submittedByName?: string;
  currentStage: number;
  stage3Department?: Department;
  finalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  totalCostIDR?: number;
  stages?: ApprovalStageRecord[];
  createdAt: string;
  updatedAt: string;
}

export type CertificateStatus = 'Valid' | 'Expiring Soon' | 'Expired';

export interface VesselCertificate {
  id: string;
  vesselId: string;
  vesselName?: string;
  certificateName: string;
  certificateNumber: string;
  issuingAuthority: string;
  issueDate: Date;
  expiryDate: Date;
  status: CertificateStatus;
  attachmentUrl?: string;
  notes?: string;
}

export interface VesselDimensions {
  loaMeters: number;
  beamMeters: number;
  draftMeters: number;
  dwtTons: number;
  enginePowerKW: number;
  cargoCapacityM3: number;
}

export interface FuelConsumptionRates {
  sailing: number;
  shifting: number;
  waiting: number;
  loading: number;
  discharge: number;
  bunkering?: number;
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
  currentROB_MT?: number;
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
  | 'Safety & Firefighting';

export interface Equipment {
  id: string;
  vesselId: string;
  parentId?: string;
  name: string;
  category: EquipmentCategory;
  maker: string;
  model: string;
  serialNumber: string;
  location: string;
  initialRunningHours: number;
  runningHours: number;
  tboHours?: number;
  lastOverhaulHours?: number;
  solasMarpolTags?: string[];
  classCmsCode?: string;
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
}

export type StorageLocationType = 'Land Storage' | 'Ship Storage';
export type ItemCategory = 
  | 'Maintenance' 
  | 'Mesin' 
  | 'Listrik' 
  | 'Navigasi' 
  | 'Akomodasi' 
  | 'Safety' 
  | 'Perlengkapan Bantu' 
  | 'ATK' 
  | 'Alat Kerja' 
  | 'Pengiriman' 
  | 'Dokumen atau Sertifikat'
  | 'Spare Part (Non-Consumable)' 
  | 'Consumable (Oils, Supplies, Chemicals, Logbooks)';
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
  expectedLifespanHours?: number;
  expectedLifespanDays?: number;
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
  size?: string;
  qtyRequested: number;
  unit?: string;
  unitPriceIDR: number;
  itemCategory: ItemCategory;
  supplierName?: string;
  status?: RequisitionItemStatus;
  denialReason?: string;
  comment?: string;
  isUrgent?: boolean;
  notes?: string;
  vendorRating?: number;
  vendorFeedback?: string;
}

export interface RequisitionOrder {
  id: string;
  vesselId: string;
  vesselName?: string;
  department?: string;
  bagian?: string;
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
  approvalRequestId?: string;
  attachmentLink?: string;
  documentLink?: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  rating: number;
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
  areaCoverage?: string;
  supplyCategories?: string[];
}

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
  approvalRequestId?: string;
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

export type IntervalType = 'Calendar' | 'RunningHours' | 'Both';

export interface ProcedureStep {
  id: string;
  stepText: string;
  isCompleted: boolean;
}

export interface PMSchedule {
  id: string;
  vesselId: string;
  equipmentId: string;
  equipmentName?: string;
  title: string;
  description?: string;
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
  isActive: boolean;
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

export interface VoyagePlan {
  id: string;
  vesselId: string;
  vesselName?: string;
  voyageNo: string;
  originPort: string;
  destinationPort: string;
  departureDate: string;
  estimatedArrivalDate: string;
  cargoType: string;
  cargoQtyTons: number;
  fuelBudgetMT: number;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
  notes?: string;
}

export interface FuelAnomalyReport {
  id: string;
  vesselId: string;
  vesselName?: string;
  voyageId: string;
  detectedAt: string;
  anomalyType: 'Sudden Gap' | 'Unreported Consumption Drop' | 'Fuel Level Jump' | 'Unlogged Activity Gap';
  discrepancyMT: number;
  reportedROB: number;
  calculatedROB: number;
  status: 'Unresolved' | 'Under Investigation' | 'Resolved';
  notes: string;
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

export interface PortCall {
  id: string;
  vesselId: string;
  voyageId?: string;
  portName: string;
  country: string;
  eta: string;
  etd: string;
  ata?: string;
  atd?: string;
  berthNo?: string;
  agentName?: string;
  agentContact?: string;
  status: 'Scheduled' | 'Arrived' | 'Departed' | 'Cancelled';
}

export interface BunkerEvent {
  id: string;
  vesselId: string;
  portCallId?: string;
  bdnNumber: string;
  fuelType: 'HFO' | 'MGO' | 'VLSFO' | 'Lube Oil';
  qtyMT: number;
  supplierName: string;
  bunkerDate: string;
  density15C?: number;
  viscosity50C?: number;
  sulfurPercent?: number;
  notes?: string;
}
