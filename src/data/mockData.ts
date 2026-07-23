import { 
  Vessel, Equipment, MaintenanceJob, JobExecution, 
  DailyLog, DrydockProject, WorkOrderCard,
  SparePartItem, SparePartReplacementRecord, MachineryRunSession,
  RequisitionOrder, Supplier, CrewMember, IncidentReport, DrillRecord, NonConformity
} from '../types';

export const initialVessels: Vessel[] = [
  {
    id: 'vessel-1',
    name: 'MV Pacific Star',
    imoNumber: '9482019',
    flag: 'Panama (PA)',
    vesselType: 'Bulk Carrier (58k DWT)',
    builtYear: 2018,
    classSociety: 'DNV',
    status: 'At Sea',
    currentLocation: 'Malacca Strait (En route to Singapore)',
    totalRunningHours: 24650,
    dimensions: {
      loaMeters: 199.9,
      beamMeters: 32.2,
      draftMeters: 12.8,
      dwtTons: 57800,
      enginePowerKW: 8800,
      cargoCapacityM3: 71500,
    }
  },
  {
    id: 'vessel-2',
    name: 'MV Atlantic Pioneer',
    imoNumber: '9671120',
    flag: 'Liberia (LR)',
    vesselType: 'Container Vessel (4,200 TEU)',
    builtYear: 2020,
    classSociety: "Lloyd's Register",
    status: 'In Port',
    currentLocation: 'Port of Rotterdam (Berth 402)',
    totalRunningHours: 19200,
    dimensions: {
      loaMeters: 260.0,
      beamMeters: 32.3,
      draftMeters: 12.5,
      dwtTons: 50800,
      enginePowerKW: 24200,
      cargoCapacityM3: 98000,
    }
  },
  {
    id: 'vessel-3',
    name: 'MV Northern Glory',
    imoNumber: '9310884',
    flag: 'Marshall Islands (MH)',
    vesselType: 'Chemical Tanker (32k DWT)',
    builtYear: 2016,
    classSociety: 'Bureau Veritas',
    status: 'In Drydock',
    currentLocation: 'Damen Shiprepair Rotterdam',
    totalRunningHours: 32400,
    dimensions: {
      loaMeters: 182.5,
      beamMeters: 27.4,
      draftMeters: 11.2,
      dwtTons: 32500,
      enginePowerKW: 7400,
      cargoCapacityM3: 38200,
    }
  }
];

export const initialEquipment: Equipment[] = [
  {
    id: 'eq-101',
    vesselId: 'vessel-1',
    name: 'Main Engine (MAN B&W 6S50ME-C)',
    category: 'Main Propulsion',
    maker: 'MAN Energy Solutions',
    model: '6S50ME-C9.5',
    serialNumber: 'ME-849201',
    location: 'Engine Room - Bottom Platform',
    initialRunningHours: 24000,
    runningHours: 24650,
    criticality: 'High',
    lastOverhaulDate: '2025-11-10',
    status: 'Operational',
  },
  {
    id: 'eq-102',
    vesselId: 'vessel-1',
    name: 'Auxiliary Engine No. 1 (Daihatsu)',
    category: 'Auxiliary Power',
    maker: 'Daihatsu Diesel',
    model: '6DK-20e',
    serialNumber: 'AE1-39201',
    location: 'Engine Room - 2nd Deck Port Side',
    initialRunningHours: 12000,
    runningHours: 12400,
    criticality: 'High',
    lastOverhaulDate: '2025-08-15',
    status: 'Requires Service',
  },
  {
    id: 'eq-103',
    vesselId: 'vessel-1',
    name: 'Fuel Oil Purifier No. 1 (Alfa Laval)',
    category: 'Purifiers & Separators',
    maker: 'Alfa Laval',
    model: 'S 937',
    serialNumber: 'AL-99201',
    location: 'Purifier Room',
    initialRunningHours: 8000,
    runningHours: 8450,
    criticality: 'Medium',
    lastOverhaulDate: '2026-01-20',
    status: 'Operational',
  },
  {
    id: 'eq-201',
    vesselId: 'vessel-2',
    name: 'Main Engine (MAN B&W 8K90ME-C)',
    category: 'Main Propulsion',
    maker: 'MAN Energy Solutions',
    model: '8K90ME-C10.5',
    serialNumber: 'ME-967112',
    location: 'Engine Room - Main Deck',
    initialRunningHours: 18500,
    runningHours: 19200,
    criticality: 'High',
    lastOverhaulDate: '2025-10-05',
    status: 'Operational',
  },
  {
    id: 'eq-301',
    vesselId: 'vessel-3',
    name: 'Main Propulsion (Wärtsilä 6L46F)',
    category: 'Main Propulsion',
    maker: 'Wärtsilä Marine',
    model: '6L46F',
    serialNumber: 'WAR-46011',
    location: 'Engine Room - Lower Flat',
    initialRunningHours: 31500,
    runningHours: 32400,
    criticality: 'High',
    lastOverhaulDate: '2025-06-20',
    status: 'Requires Service',
  }
];

export const initialSpareParts: SparePartItem[] = [
  {
    id: 'sp-1',
    vesselId: 'vessel-1',
    equipmentId: 'eq-101',
    partName: 'Fuel Injector Nozzle Assembly',
    partNumber: 'MAN-FIN-50ME',
    itemCategory: 'Spare Part (Non-Consumable)',
    stockQty: 4,
    minStockQty: 2,
    unitCostUSD: 1450,
    locationType: 'Ship Storage',
    locationName: 'Engine Store - Rack A2',
    conditionStatus: 'Good / Ready',
    installedAtRunningHours: 24000,
    installedDate: '2026-01-10',
    isCurrentlyInstalled: true,
  },
  {
    id: 'sp-1-land',
    equipmentId: 'eq-101',
    partName: 'Fuel Injector Nozzle Assembly (Land Backup)',
    partNumber: 'MAN-FIN-50ME',
    itemCategory: 'Spare Part (Non-Consumable)',
    stockQty: 12,
    minStockQty: 5,
    unitCostUSD: 1380,
    locationType: 'Land Storage',
    locationName: 'Singapore Central Marine Depot (Rack L4)',
    conditionStatus: 'Good / Ready',
  }
];

export const initialReplacementHistory: SparePartReplacementRecord[] = [
  {
    id: 'rep-1',
    equipmentId: 'eq-101',
    equipmentName: 'Main Engine (MAN B&W 6S50ME-C)',
    partName: 'Cylinder 3 Exhaust Valve Spindle Ring',
    partNumber: 'MAN-EVS-C3',
    qtyReplaced: 1,
    dateReplaced: '2026-06-15',
    runningHoursAtChange: 24150,
    replacedBy: 'Chief Engineer H. Vance',
    reason: 'Routine replacement due to high exhaust temperature reading on Cyl 3.',
  }
];

export const initialRunSessions: MachineryRunSession[] = [
  {
    id: 'run-1',
    equipmentId: 'eq-101',
    equipmentName: 'Main Engine (MAN B&W 6S50ME-C)',
    vesselId: 'vessel-1',
    startTime: '2026-07-20 06:00',
    stopTime: '2026-07-20 18:00',
    hoursCalculated: 12,
    loggedBy: 'Chief Engineer H. Vance',
    purpose: 'Full sea passage watch from Malacca Strait',
  }
];

export const initialSuppliers: Supplier[] = [
  {
    id: 'sup-1',
    name: 'MAN Energy Solutions Singapore Hub',
    category: 'Main Propulsion Spares & Technical Service',
    rating: 4.9,
    contactEmail: 'spares-sg@man-es.com',
    phone: '+65 6861 5220',
    country: 'Singapore',
    address: '14 Tuas Avenue 2, Singapore 639450',
    status: 'Approved Supplier',
    performanceNotes: 'OEM supplier. Outstanding quality, fast emergency delivery within 12h in Singapore Port.',
    activeOrdersCount: 2,
  },
  {
    id: 'sup-2',
    name: 'Alfa Laval Marine Rotterdam Central Depot',
    category: 'Purifiers, Heat Exchangers & Boilers',
    rating: 4.8,
    contactEmail: 'marine.spares@alfalaval.com',
    phone: '+31 10 244 5500',
    country: 'Netherlands',
    address: 'Haven 4000, 3089 JB Rotterdam',
    status: 'Approved Supplier',
    performanceNotes: 'Excellent overhaul kits for separators & Aalborg boilers.',
    activeOrdersCount: 1,
  },
  {
    id: 'sup-3',
    name: 'Wärtsilä Global Technical Services',
    category: 'Auxiliary Engine & Automation Parts',
    rating: 4.7,
    contactEmail: 'services@wartsila.com',
    phone: '+358 10 709 0000',
    country: 'Finland',
    address: 'John Stenbergin ranta 2, Helsinki',
    status: 'Approved Supplier',
    performanceNotes: 'Primary OEM supplier for Wärtsilä 6L20 & 6L46 engines.',
    activeOrdersCount: 0,
  },
  {
    id: 'sup-4',
    name: 'Jotun Performance Coatings Europe',
    category: 'Marine Paints & Anti-Fouling',
    rating: 4.6,
    contactEmail: 'marine.coatings@jotun.com',
    phone: '+47 33 45 70 00',
    country: 'Norway',
    address: 'Hystadveien 167, 3209 Sandefjord',
    status: 'Approved Supplier',
    performanceNotes: 'Drydock paint supplier for hull hydroblasting & SA 2.5 application.',
    activeOrdersCount: 1,
  }
];

export const initialRequisitions: RequisitionOrder[] = [
  {
    id: 'req-101',
    vesselId: 'vessel-1',
    requisitionNo: 'REQ-PS-2026-089',
    requestedBy: 'Chief Engineer H. Vance',
    dateRequested: '2026-07-18',
    supplierName: 'Multiple Assigned Vendors',
    items: [
      { 
        id: 'i-1', 
        partName: 'Lube Oil Cartridge Filter', 
        partNumber: 'DH-LOF-40911', 
        qtyRequested: 10, 
        unitPriceUSD: 180, 
        itemCategory: 'Spare Part (Non-Consumable)',
        supplierName: 'MAN Energy Solutions Singapore Hub',
        status: 'Ordered to Vendor'
      },
      { 
        id: 'i-2', 
        partName: 'System Degreaser Chemical (20L Pail)', 
        partNumber: 'CHEM-DEG-20L', 
        qtyRequested: 2, 
        unitPriceUSD: 110, 
        itemCategory: 'Consumable (Oils, Supplies, Chemicals, Logbooks)',
        supplierName: 'Alfa Laval Marine Rotterdam Central Depot',
        status: 'Denied / Rejected',
        denialReason: 'Excess stock available at Singapore Land Depot (Bay 4).'
      },
      { 
        id: 'i-3', 
        partName: 'Wärtsilä Aux Engine Gasket Set', 
        partNumber: 'WAR-GS-601', 
        qtyRequested: 4, 
        unitPriceUSD: 240, 
        itemCategory: 'Spare Part (Non-Consumable)',
        supplierName: 'Wärtsilä Global Technical Services',
        status: 'Ordered to Vendor'
      }
    ],
    totalCostUSD: 2980,
    status: 'Office Approved',
    originLocationType: 'Land Storage',
    originLocationName: 'Rotterdam Logistics Warehouse',
    deliveryPort: 'Port of Singapore',
    estimatedDeliveryDate: '2026-07-28',
  }
];

export const initialCrewMembers: CrewMember[] = [
  {
    id: 'crew-1',
    fullName: 'Capt. Alexander Vane',
    rank: 'Master',
    nationality: 'United Kingdom (UK)',
    seamanBookNo: 'SB-8492019',
    status: 'Onboard',
    currentVesselId: 'vessel-1',
    currentVesselName: 'MV Pacific Star',
    signOnDate: '2026-03-10',
    signOffDatePlanned: '2026-09-10',
    certificates: [],
    assignmentHistory: [
      {
        id: 'h-prev-1',
        vesselId: 'vessel-2',
        vesselName: 'MV Atlantic Pioneer',
        rank: 'Master',
        signOnDate: '2025-06-01',
        signOffDate: '2025-12-01',
        performanceRating: 'Excellent',
        remarks: 'Completed 6-month contract with zero LTI incidents.'
      }
    ],
    medicalRecords: [],
    accidentRecords: []
  },
  {
    id: 'crew-2',
    fullName: 'Harlan Vance',
    rank: 'Chief Engineer',
    nationality: 'Norway (NO)',
    seamanBookNo: 'SB-3920192',
    status: 'Onboard',
    currentVesselId: 'vessel-1',
    currentVesselName: 'MV Pacific Star',
    signOnDate: '2026-04-15',
    signOffDatePlanned: '2026-10-15',
    certificates: [],
    assignmentHistory: [],
    medicalRecords: [],
    accidentRecords: []
  },
  {
    id: 'crew-4',
    fullName: 'Dimitri Ivanov',
    rank: 'Chief Engineer',
    nationality: 'Bulgaria (BG)',
    seamanBookNo: 'SB-7740192',
    status: 'Waiting for Deployment',
    certificates: [],
    assignmentHistory: [
      {
        id: 'h-dim-1',
        vesselId: 'vessel-1',
        vesselName: 'MV Pacific Star',
        rank: 'Chief Engineer',
        signOnDate: '2025-05-10',
        signOffDate: '2025-11-15',
        performanceRating: 'Excellent',
        remarks: 'Successfully managed main engine 24,000 hrs overhaul.'
      }
    ],
    medicalRecords: [],
    accidentRecords: []
  },
  {
    id: 'crew-5',
    fullName: 'Dario Rossi',
    rank: 'Chief Officer',
    nationality: 'Italy (IT)',
    seamanBookNo: 'SB-1194029',
    status: 'Available',
    certificates: [],
    assignmentHistory: [
      {
        id: 'h-dar-1',
        vesselId: 'vessel-3',
        vesselName: 'MV Northern Glory',
        rank: 'Chief Officer',
        signOnDate: '2025-08-01',
        signOffDate: '2026-02-01',
        performanceRating: 'Good',
        remarks: 'Maintained excellent cargo tank cleaning operations.'
      }
    ],
    medicalRecords: [],
    accidentRecords: []
  }
];

export const initialIncidents: IncidentReport[] = [
  {
    id: 'inc-1',
    vesselId: 'vessel-1',
    vesselName: 'MV Pacific Star',
    title: 'High-Pressure Fuel Leak on AE1 Cylinder 2 Injector Pipe',
    incidentType: 'Near-Miss',
    dateReported: '2026-07-15',
    locationOnboard: 'Engine Room 2nd Deck',
    description: 'During routine watchkeeping, 2nd Engineer noticed high-pressure fuel pipe shielding dripping into save-all tray.',
    severity: 'Medium',
    rootCause: 'Vibration-induced hairline crack at union nut coupling.',
    correctiveAction: 'Replaced high-pressure fuel pipe assembly with pre-tested spare.',
    crewInvolvedNames: 'Marek Kowalski (2nd Engineer), Harlan Vance (Chief Engineer)',
    handledByCrewName: 'Chief Officer D. Rossi',
    status: 'Closed',
  }
];

export const initialDrills: DrillRecord[] = [
  {
    id: 'drill-1',
    vesselId: 'vessel-1',
    vesselName: 'MV Pacific Star',
    drillType: 'Lifeboat & Launching',
    dateConducted: '2026-07-14',
    drilledBy: 'Chief Officer D. Rossi',
    attendeesCount: 21,
    evaluation: 'Satisfactory',
    notes: 'Port lifeboat lowered to water level and engine run for 30 mins.',
  }
];

export const initialNonConformities: NonConformity[] = [
  {
    id: 'nc-1',
    vesselId: 'vessel-1',
    vesselName: 'MV Pacific Star',
    auditType: 'PSC Inspection',
    findingDescription: 'Emergency generator quick-closing fuel valve wire tension slightly slack.',
    findingType: 'Minor NC',
    dateFound: '2026-06-10',
    dueDate: '2026-07-10',
    status: 'Closed',
  }
];

export const initialJobs: MaintenanceJob[] = [
  {
    id: 'job-1',
    vesselId: 'vessel-1',
    vesselName: 'MV Pacific Star',
    equipmentId: 'eq-102',
    equipmentName: 'Auxiliary Engine No. 1 (Daihatsu)',
    title: '30-Day Periodic Fuel Oil Filter Cleaning & Inspection',
    description: 'Dismantle fuel oil duplex strainer, clean wire mesh elements in kerosene.',
    intervalType: 'Calendar',
    intervalDays: 30,
    completionWindowDays: 7,
    lastDoneDate: '2026-06-15',
    nextDueDate: '2026-07-15',
    classSurveyRequired: false,
    priority: 'High',
    status: 'Overdue',
    estimatedManHours: 3,
    requiredParts: ['Lube Oil Cartridge Filter (PN: DH-LOF-40911)'],
  }
];

export const initialExecutions: JobExecution[] = [
  {
    id: 'exec-901',
    jobId: 'job-prev-1',
    jobTitle: 'Main Engine Cylinder Lubrication Inspection',
    equipmentName: 'Main Engine (MAN B&W 6S50ME-C)',
    vesselId: 'vessel-1',
    startDate: '2026-07-10',
    dateCompleted: '2026-07-10',
    runningHoursAtExecution: 24410,
    completedBy: '2nd Engineer M. Kowalski',
    findings: 'All lubricator quills operating normally.',
    partsUsed: [{ partId: 'sp-1', name: 'Fuel Injector Nozzle Assembly', qty: 1, isNonConsumableSpare: true }],
    actualManHours: 5.5,
    estimatedManHours: 4.0,
    daysLateOrEarly: 0,
    signedOffByChief: true,
    signedOffDate: '2026-07-11',
  }
];

export const initialDailyLogs: DailyLog[] = [
  {
    id: 'log-1',
    vesselId: 'vessel-1',
    date: '2026-07-22',
    loggedBy: 'Chief Engineer H. Vance',
    mainEngineRPM: 114,
    mainEngineLoadPercent: 78,
    exhaustTempAvg: 365,
    lubeOilPressureBar: 4.2,
    fuelConsumptionTonsPerDay: 28.4,
    auxGen1Hours: 12400,
    auxGen2Hours: 9150,
    remarks: 'Fair weather. Sea temp 26°C.',
  }
];

export const initialDrydockProjects: DrydockProject[] = [
  {
    id: 'dd-proj-1',
    vesselId: 'vessel-3',
    shipyardName: 'Damen Shiprepair Rotterdam',
    location: 'Drydock No. 4, Schiedam',
    startDate: '2026-08-01',
    endDate: '2026-08-22',
    totalPlannedBudgetUSD: 450000,
    totalActualCostUSD: 285000,
    status: 'Underway',
  }
];

export const initialWorkOrders: WorkOrderCard[] = [
  {
    id: 'wo-101',
    projectId: 'dd-proj-1',
    vesselId: 'vessel-3',
    title: 'Hull High-Pressure Water Jetting',
    department: 'Hull & Steel',
    equipmentRef: 'Underwater Outer Shell Plating',
    scopeDescription: 'Full SA 2.5 hydroblasting.',
    contractorName: 'Jotun Performance Coatings Europe',
    contractorQuoteUSD: 145000,
    actualCostUSD: 145000,
    plannedBudgetUSD: 160000,
    status: 'In Progress',
    publicToken: 'tk_hull_8492019a',
    deadline: '2026-08-10',
  }
];
