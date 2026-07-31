import { 
  Vessel, Equipment, MaintenanceJob, JobExecution, 
  DailyLog, DrydockProject, WorkOrderCard,
  SparePartItem, SparePartReplacementRecord, MachineryRunSession,
  RequisitionOrder, Supplier, CrewMember, IncidentReport, DrillRecord, NonConformity,
  VesselActivityLog, VoyagePlan, ShipTank, MLCRestHourLog, EquipmentTransferLog, Port
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
    currentState: 'Sailing',
    currentLocation: 'Malacca Strait (En route to Singapore)',
    totalRunningHours: 24650,
    currentROB_MT: 485.2,
    consumptionRates: {
      sailing: 280,   // L/h
      shifting: 220,  // L/h
      waiting: 27,    // L/h
      loading: 27,    // L/h
      discharge: 135, // L/h
      bunkering: 0
    },
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
    currentState: 'Discharge',
    currentLocation: 'Port of Rotterdam (Berth 402)',
    totalRunningHours: 19200,
    currentROB_MT: 620.0,
    consumptionRates: {
      sailing: 310,   // L/h
      shifting: 240,  // L/h
      waiting: 35,    // L/h
      loading: 35,    // L/h
      discharge: 140, // L/h
      bunkering: 0
    },
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
    currentState: 'Waiting',
    currentLocation: 'Damen Shiprepair Rotterdam',
    totalRunningHours: 32400,
    currentROB_MT: 180.4,
    consumptionRates: {
      sailing: 250,   // L/h
      shifting: 190,  // L/h
      waiting: 22,    // L/h
      loading: 22,    // L/h
      discharge: 110, // L/h
      bunkering: 0
    },
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
    id: 'eq-portable-1',
    vesselId: 'vessel-1',
    name: 'Riken Keiki RX-8000 Gas Detector',
    category: 'Portable Instruments',
    maker: 'Riken Keiki',
    model: 'RX-8000',
    serialNumber: 'RK-88210-GX',
    location: 'Bridge / Safety Locker',
    initialRunningHours: 0,
    runningHours: 0,
    tboHours: 8760, // 1 year calibration interval
    lastOverhaulHours: 0,
    solasMarpolTags: ['SOLAS Enclosed Space Entry'],
    criticality: 'High',
    lastOverhaulDate: '2026-01-10',
    status: 'Operational',
    isPortable: true,
  },
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
    tboHours: 12000,
    lastOverhaulHours: 18000,
    solasMarpolTags: ['MARPOL Annex VI NOx', 'SOLAS Main Propulsion'],
    classCmsCode: 'DNV-CMS-110.01',
    diagnostics: {
      vibrationMms: 2.8,
      bearingTempC: 64,
      insulationMOmega: 50,
    },
    diagnosticHistory: [
      { date: '2026-07-01', vibrationMMS: 2.1, bearingTempC: 58 },
      { date: '2026-07-07', vibrationMMS: 2.3, bearingTempC: 60 },
      { date: '2026-07-14', vibrationMMS: 2.5, bearingTempC: 62 },
      { date: '2026-07-21', vibrationMMS: 2.8, bearingTempC: 64 },
    ],
    criticality: 'High',
    lastOverhaulDate: '2025-11-10',
    status: 'Operational',
    attachments: [
      {
        id: 'att-101-1',
        name: 'MAN_6S50ME_Operating_Manual.pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        type: 'pdf',
        uploadedAt: '2026-01-15'
      },
      {
        id: 'att-101-2',
        name: 'Engine_Room_Main_Sectional_Drawing.jpg',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800',
        type: 'image',
        uploadedAt: '2026-02-10'
      }
    ]
  },
  {
    id: 'eq-101-sub1',
    vesselId: 'vessel-1',
    parentId: 'eq-101',
    name: 'Turbocharger No. 1 Assembly (MAN TCR22)',
    category: 'Main Propulsion',
    maker: 'MAN Turbo & Diesel',
    model: 'TCR22-42',
    serialNumber: 'TC-99102',
    location: 'Main Engine Upper Gallery',
    initialRunningHours: 12000,
    runningHours: 12650,
    tboHours: 8000,
    lastOverhaulHours: 5000,
    solasMarpolTags: ['MARPOL Annex VI'],
    classCmsCode: 'DNV-CMS-110.04',
    diagnostics: {
      vibrationMms: 5.2, // High vibration alert!
      bearingTempC: 82, // Overheating alert!
      insulationMOmega: 40,
    },
    criticality: 'High',
    lastOverhaulDate: '2025-05-12',
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
    tboHours: 6000,
    lastOverhaulHours: 6000,
    solasMarpolTags: ['SOLAS Emergency Power'],
    classCmsCode: 'DNV-CMS-211.01',
    diagnostics: {
      vibrationMms: 3.4,
      bearingTempC: 71,
      insulationMOmega: 35,
    },
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
    tboHours: 4000,
    lastOverhaulHours: 4000,
    solasMarpolTags: ['MARPOL Annex I Fuel Treatment'],
    classCmsCode: 'DNV-CMS-541.02',
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
    tboHours: 12000,
    lastOverhaulHours: 12000,
    solasMarpolTags: ['MARPOL Annex VI NOx'],
    classCmsCode: 'LR-CMS-101.01',
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
    tboHours: 10000,
    lastOverhaulHours: 20000,
    solasMarpolTags: ['SOLAS Main Propulsion'],
    classCmsCode: 'BV-CMS-301.01',
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
    unitCostIDR: 21750000.0,
    locationType: 'Ship Storage',
    locationName: 'Engine Store - Rack A2',
    conditionStatus: 'Good / Ready',
    installedAtRunningHours: 24000,
    installedDate: '2026-01-10',
    isCurrentlyInstalled: true,
    expectedLifespanHours: 6000,
    attachments: [
      {
        id: 'att-sp1-1',
        name: 'Injector_Nozzle_Spec_Sheet.pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        type: 'pdf',
        uploadedAt: '2026-01-12'
      }
    ]
  },
  {
    id: 'sp-2',
    vesselId: 'vessel-1',
    equipmentId: 'eq-101',
    partName: 'Cylinder Exhaust Valve Spindle Ring',
    partNumber: 'MAN-EVS-C3',
    itemCategory: 'Spare Part (Non-Consumable)',
    stockQty: 2,
    minStockQty: 1,
    unitCostIDR: 42750000.0,
    locationType: 'Ship Storage',
    locationName: 'Engine Store - Rack B1',
    conditionStatus: 'Good / Ready',
    installedAtRunningHours: 20000,
    installedDate: '2025-05-01',
    isCurrentlyInstalled: true,
    expectedLifespanHours: 4000,
  },
  {
    id: 'sp-1-land',
    equipmentId: 'eq-101',
    partName: 'Fuel Injector Nozzle Assembly (Land Backup)',
    partNumber: 'MAN-FIN-50ME',
    itemCategory: 'Spare Part (Non-Consumable)',
    stockQty: 12,
    minStockQty: 5,
    unitCostIDR: 20700000.0,
    locationType: 'Land Storage',
    locationName: 'Singapore Central Marine Depot (Rack L4)',
    conditionStatus: 'Good / Ready',
    expectedLifespanHours: 6000,
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
    category: 'Main Engine & Turbocharger OEM Parts',
    rating: 4.9,
    contactEmail: 'spares-singapore@man-es.com',
    phone: '+65 6861 5566',
    country: 'Singapore',
    address: '14 Tuas Avenue 2, Singapore 639450',
    status: 'Approved Supplier',
    performanceNotes: 'OEM supplier. Outstanding quality, fast emergency delivery within 12h in Singapore Port.',
    activeOrdersCount: 2,
    picName: 'Tan Ah Kow (Senior Marine Spares Manager)',
    picPhone: '+65 9123 4567',
    picEmail: 'tan.ahkow@man-es.com',
    areaCoverage: 'Singapore, Port Klang, Tanjung Pelepas, Batam',
    supplyCategories: ['Main Engine Spares', 'Turbochargers', 'Fuel Injection Systems']
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
    picName: 'Jan de Jong (Europe Logistics Superintendent)',
    picPhone: '+31 61 234 5678',
    picEmail: 'jan.dejong@alfalaval.com',
    areaCoverage: 'Rotterdam, Antwerp, Hamburg, Bremerhaven, Damen Shiprepair',
    supplyCategories: ['Fuel Purifiers', 'Plate Heat Exchangers', 'Boiler Mountings']
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
    picName: 'Mikael Virtanen (Global Marine Key Account)',
    picPhone: '+358 40 567 8901',
    picEmail: 'mikael.virtanen@wartsila.com',
    areaCoverage: 'Global / Worldwide Hub Network',
    supplyCategories: ['Aux Engine Overhaul Kits', 'Pistons', 'Governor Actuators']
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
    picName: 'Astrid Lindgren (Drydock Coating Inspector)',
    picPhone: '+47 90 12 34 56',
    picEmail: 'astrid.lindgren@jotun.com',
    areaCoverage: 'Europe Yards, Damen, Remontowa, Drydocks World Dubai',
    supplyCategories: ['Hull Marine Paints', 'Anti-Fouling Coatings', 'Hydroblasting Inspection']
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
        unitPriceIDR: 2700000.0, 
        itemCategory: 'Spare Part (Non-Consumable)',
        supplierName: 'MAN Energy Solutions Singapore Hub',
        status: 'Ordered to Vendor'
      },
      { 
        id: 'i-2', 
        partName: 'System Degreaser Chemical (20L Pail)', 
        partNumber: 'CHEM-DEG-20L', 
        qtyRequested: 2, 
        unitPriceIDR: 1650000.0, 
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
        unitPriceIDR: 3600000.0, 
        itemCategory: 'Spare Part (Non-Consumable)',
        supplierName: 'Wärtsilä Global Technical Services',
        status: 'Ordered to Vendor'
      }
    ],
    totalCostIDR: 44700000.0,
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
    certificates: [
      {
        id: 'cert-101',
        certName: 'Master Unlimited CoC (STCW II/2)',
        certNumber: 'UK-MCA-COC-94012',
        issueDate: '2024-05-15',
        expiryDate: '2029-05-15',
        issuingAuthority: 'UK Maritime & Coastguard Agency (MCA)',
        status: 'Valid'
      },
      {
        id: 'cert-102',
        certName: 'GMDSS General Operator Certificate (GOC)',
        certNumber: 'UK-GOC-88391',
        issueDate: '2023-11-20',
        expiryDate: '2028-11-20',
        issuingAuthority: 'UK MCA / Ofcom',
        status: 'Valid'
      },
      {
        id: 'cert-103',
        certName: 'Advanced Oil Tanker Operations (STCW V/1-1-2)',
        certNumber: 'UK-TANK-77102',
        issueDate: '2021-08-30',
        expiryDate: '2026-08-30',
        issuingAuthority: 'UK MCA',
        status: 'Expiring Soon'
      },
      {
        id: 'cert-104',
        certName: 'Medical Care Onboard Ship (STCW VI/4-2)',
        certNumber: 'UK-MED-44910',
        issueDate: '2022-03-10',
        expiryDate: '2027-03-10',
        issuingAuthority: 'NHS Maritime',
        status: 'Valid'
      }
    ],
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
    certificates: [
      {
        id: 'cert-201',
        certName: 'Chief Engineer Unlimited CoC (STCW III/2)',
        certNumber: 'NO-NMA-339201',
        issueDate: '2023-09-10',
        expiryDate: '2028-09-10',
        issuingAuthority: 'Norwegian Maritime Authority (NMA)',
        status: 'Valid'
      },
      {
        id: 'cert-202',
        certName: 'High Voltage Safety & Switchgear (STCW V/2)',
        certNumber: 'NO-HV-99401',
        issueDate: '2021-08-15',
        expiryDate: '2026-08-15',
        issuingAuthority: 'NMA Training Center',
        status: 'Expiring Soon'
      },
      {
        id: 'cert-203',
        certName: 'Advanced Fire Fighting (STCW VI/3)',
        certNumber: 'NO-AFF-10293',
        issueDate: '2022-06-20',
        expiryDate: '2027-06-20',
        issuingAuthority: 'NMA Safety Directorate',
        status: 'Valid'
      }
    ],
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
    certificates: [
      {
        id: 'cert-401',
        certName: 'Chief Engineer Unlimited CoC',
        certNumber: 'BG-MAR-88401',
        issueDate: '2022-01-10',
        expiryDate: '2027-01-10',
        issuingAuthority: 'Executive Agency Maritime Administration BG',
        status: 'Valid'
      }
    ],
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
    totalPlannedBudgetIDR: 6750000000.0,
    totalActualCostIDR: 4275000000.0,
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
    contractorQuoteIDR: 2175000000.0,
    actualCostIDR: 2175000000.0,
    plannedBudgetIDR: 2400000000.0,
    status: 'In Progress',
    publicToken: 'tk_hull_8492019a',
    deadline: '2026-08-10',
  }
];

export const initialVesselActivities: VesselActivityLog[] = [
  {
    id: 'act-1',
    vesselId: 'vessel-1',
    vesselName: 'MV Pacific Star',
    voyageId: 'V-2026-04',
    state: 'Sailing',
    startTime: '2026-07-24 06:00',
    endTime: '2026-07-24 18:00',
    durationHours: 12.0,
    startROB_MT: 488.0,
    endROB_MT: 485.2,
    reportedROB_MT: 485.2,
    fuelConsumedMT: 2.83,
    locationOrPort: 'Malacca Strait (Eastbound)',
    loggedBy: 'Chief Engineer H. Vance',
    remarks: 'Full sea watch speed 14.2 knots. Main engine load 76%.',
  },
  {
    id: 'act-2',
    vesselId: 'vessel-1',
    vesselName: 'MV Pacific Star',
    voyageId: 'V-2026-04',
    state: 'Waiting',
    startTime: '2026-07-23 18:00',
    endTime: '2026-07-24 06:00',
    durationHours: 12.0,
    startROB_MT: 488.27,
    endROB_MT: 488.0,
    reportedROB_MT: 488.0,
    fuelConsumedMT: 0.27,
    locationOrPort: 'Horsburgh Lighthouse Anchorage',
    loggedBy: '2nd Engineer M. Kowalski',
    remarks: 'Awaiting port clearance & pilot boarding slot.',
  },
  {
    id: 'act-3',
    vesselId: 'vessel-2',
    vesselName: 'MV Atlantic Pioneer',
    voyageId: 'V-2026-09',
    state: 'Discharge',
    startTime: '2026-07-24 08:00',
    endTime: '2026-07-24 16:00',
    durationHours: 8.0,
    startROB_MT: 620.9,
    endROB_MT: 620.0,
    reportedROB_MT: 618.5, // 1.5 MT discrepancy trigger!
    fuelConsumedMT: 0.93,
    locationOrPort: 'Port of Rotterdam (Berth 402)',
    loggedBy: 'Chief Engineer D. Ivanov',
    remarks: 'Unloading 1,200 TEU container units. Crane auxiliary load active.',
    isAnomalyGap: true,
    anomalyDetails: 'Reported ROB drop (618.5 MT) exceeds calculated consumption (620.0 MT) by 1.50 MT gap discrepancy.',
  }
];

export const initialVoyagePlans: VoyagePlan[] = [
  {
    id: 'voy-101',
    vesselId: 'vessel-1', // MV Pacific Star -> MPS
    vesselName: 'MV Pacific Star',
    voyageCount: 23,
    year: 2026,
    status: 'In Progress',
    notes: 'Bunkering scheduled at Singapore Tuas Anchorage upon arrival.',
    legs: [
      {
        id: '023/L/MPS/VII/2026',
        state: 'Loading',
        portName: 'Port of Newcastle (AU)',
        eta: '2026-07-08',
        etd: '2026-07-10',
        distanceNm: 0
      },
      {
        id: '023/D1/MPS/VII/2026',
        state: 'Discharge',
        portName: 'Port of Singapore (SG)',
        eta: '2026-07-26',
        etd: '2026-07-28',
        distanceNm: 3400
      }
    ]
  },
  {
    id: 'voy-201',
    vesselId: 'vessel-2', // MV Atlantic Pioneer -> MAP
    vesselName: 'MV Atlantic Pioneer',
    voyageCount: 9,
    year: 2026,
    status: 'In Progress',
    notes: 'Feeder coastal transit via English Channel.',
    legs: [
      {
        id: '009/L/MAP/VII/2026',
        state: 'Loading',
        portName: 'Port of Hamburg (DE)',
        eta: '2026-07-20',
        etd: '2026-07-22',
        distanceNm: 0
      },
      {
        id: '009/D1/MAP/VII/2026',
        state: 'Discharge',
        portName: 'Port of Rotterdam (NL)',
        eta: '2026-07-25',
        etd: '2026-07-27',
        distanceNm: 250
      }
    ]
  }
];

export const initialShipTanks: ShipTank[] = [
  {
    id: 'tank-1',
    vesselId: 'vessel-1',
    tankName: 'No. 1 HFO Storage Tank (Port)',
    fuelType: 'HFO',
    capacityMT: 350.0,
    currentLevelMT: 285.5,
    soundingMeters: 8.2,
    maxSoundingMeters: 10.0,
    temperatureC: 42,
    lastSoundedDate: '2026-07-24 08:00',
    soundedBy: '2nd Engineer M. Kowalski',
  },
  {
    id: 'tank-2',
    vesselId: 'vessel-1',
    tankName: 'No. 2 HFO Storage Tank (Starboard)',
    fuelType: 'HFO',
    capacityMT: 350.0,
    currentLevelMT: 199.7,
    soundingMeters: 5.7,
    maxSoundingMeters: 10.0,
    temperatureC: 44,
    lastSoundedDate: '2026-07-24 08:00',
    soundedBy: '2nd Engineer M. Kowalski',
  },
  {
    id: 'tank-3',
    vesselId: 'vessel-1',
    tankName: 'MGO Service Tank (Day Tank)',
    fuelType: 'MGO',
    capacityMT: 60.0,
    currentLevelMT: 48.0,
    soundingMeters: 4.8,
    maxSoundingMeters: 6.0,
    temperatureC: 28,
    lastSoundedDate: '2026-07-24 12:00',
    soundedBy: 'Chief Engineer H. Vance',
  },
  {
    id: 'tank-4',
    vesselId: 'vessel-1',
    tankName: 'Main Engine Lube Oil Sump Tank',
    fuelType: 'Lube Oil',
    capacityMT: 25.0,
    currentLevelMT: 21.2,
    soundingMeters: 2.5,
    maxSoundingMeters: 3.0,
    temperatureC: 58,
    lastSoundedDate: '2026-07-24 12:00',
    soundedBy: 'Chief Engineer H. Vance',
  },
  {
    id: 'tank-5',
    vesselId: 'vessel-1',
    tankName: 'MARPOL Annex I Sludge Holding Tank',
    fuelType: 'Sludge',
    capacityMT: 15.0,
    currentLevelMT: 13.2,
    soundingMeters: 2.65,
    maxSoundingMeters: 3.0,
    temperatureC: 35,
    lastSoundedDate: '2026-07-24 08:00',
    soundedBy: '2nd Engineer M. Kowalski',
  },
  {
    id: 'tank-6',
    vesselId: 'vessel-1',
    tankName: 'Bilge Water Holding Tank',
    fuelType: 'Bilge',
    capacityMT: 20.0,
    currentLevelMT: 8.5,
    soundingMeters: 1.7,
    maxSoundingMeters: 4.0,
    temperatureC: 24,
    lastSoundedDate: '2026-07-24 08:00',
    soundedBy: '2nd Engineer M. Kowalski',
  }
];

export const initialMLCRestLogs: MLCRestHourLog[] = [
  {
    id: 'mlc-1',
    vesselId: 'vessel-1',
    crewId: 'crew-1',
    crewName: 'Capt. Alexander Vane',
    rank: 'Master',
    date: '2026-07-24',
    workHours: 11.5,
    restHours: 12.5,
    isCompliant: true,
    loggedBy: 'Capt. Alexander Vane'
  },
  {
    id: 'mlc-2',
    vesselId: 'vessel-1',
    crewId: 'crew-2',
    crewName: 'Harlan Vance',
    rank: 'Chief Engineer',
    date: '2026-07-24',
    workHours: 15.0, // Non-compliant! Rest = 9.0h (<10h STCW requirement)
    restHours: 9.0,
    isCompliant: false,
    violationRemarks: 'STCW 2010 Violation: Mandatory minimum 10 hours rest per 24-hour period breached during emergency fuel pump replacement.',
    loggedBy: 'Chief Engineer H. Vance'
  }
];



export const initialEquipmentTransfers: EquipmentTransferLog[] = [
  {
    id: 'eqt-1',
    equipmentId: 'eq-portable-1',
    fromVesselId: 'Land Storage',
    toVesselId: 'vessel-1',
    date: '2026-07-20T08:30:00Z',
    transferredBy: 'Fleet Superintendent',
    notes: 'Transferred newly calibrated detector to vessel before enclosed space entry operations.'
  }
];

export const initialPorts: Port[] = [
  { id: 'port-1', name: 'Port of Singapore', unlocode: 'SGSIN', country: 'Singapore' },
  { id: 'port-2', name: 'Port of Rotterdam', unlocode: 'NLRTM', country: 'Netherlands' },
  { id: 'port-3', name: 'Port of Houston', unlocode: 'USHOU', country: 'United States' },
  { id: 'port-4', name: 'Port of Shanghai', unlocode: 'CNSHG', country: 'China' },
  { id: 'port-5', name: 'Port of Hamburg', unlocode: 'DEHAM', country: 'Germany' },
  { id: 'port-6', name: 'Port of Antwerp', unlocode: 'BEANR', country: 'Belgium' },
];
