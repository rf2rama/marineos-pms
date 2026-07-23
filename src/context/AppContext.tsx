import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Vessel, Equipment, MaintenanceJob, JobExecution, 
  DailyLog, DrydockProject, WorkOrderCard, UserRole,
  SparePartItem, SparePartReplacementRecord, MachineryRunSession,
  RequisitionOrder, Supplier, CrewMember, IncidentReport, DrillRecord, NonConformity,
  SeafarerMedicalRecord, SeafarerAccidentRecord, SeafarerCertificate, ItemConditionStatus, SeafarerStatus, RequisitionItem
} from '../types';
import { 
  initialVessels, initialEquipment, initialJobs, 
  initialExecutions, initialDailyLogs, initialDrydockProjects, initialWorkOrders,
  initialSpareParts, initialReplacementHistory, initialRunSessions,
  initialRequisitions, initialSuppliers, initialCrewMembers,
  initialIncidents, initialDrills, initialNonConformities
} from '../data/mockData';

interface AppContextType {
  vessels: Vessel[];
  selectedVessel: Vessel;
  selectedVesselId: string;
  setSelectedVesselId: (id: string) => void;
  addVessel: (vessel: Omit<Vessel, 'id'>) => void;
  updateVessel: (id: string, vessel: Partial<Vessel>) => void;
  deleteVessel: (id: string) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;

  equipment: Equipment[];
  addEquipment: (eq: Omit<Equipment, 'id' | 'runningHours'>) => void;
  updateEquipment: (id: string, eq: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  updateEquipmentRunningHours: (id: string, newHours: number) => void;
  spareParts: SparePartItem[];
  addSparePart: (part: Omit<SparePartItem, 'id' | 'conditionStatus'> & { conditionStatus?: ItemConditionStatus }) => void;
  updateSparePart: (id: string, part: Partial<SparePartItem>) => void;
  deleteSparePart: (id: string) => void;
  transferPartToShip: (partId: string, targetVesselId: string, shipLocationName?: string) => void;
  updateItemConditionStatus: (partId: string, status: ItemConditionStatus, notes?: string, offloadedVesselName?: string) => void;
  replacementHistory: SparePartReplacementRecord[];
  logPartReplacement: (record: Omit<SparePartReplacementRecord, 'id'>) => void;
  deleteReplacementRecord: (id: string) => void;
  runSessions: MachineryRunSession[];
  logRunSession: (session: Omit<MachineryRunSession, 'id' | 'hoursCalculated'> & { hoursCalculated?: number }) => void;
  deleteRunSession: (id: string) => void;

  requisitions: RequisitionOrder[];
  addRequisition: (req: Omit<RequisitionOrder, 'id' | 'requisitionNo'>) => void;
  updateRequisitionMetadata: (id: string, data: Partial<RequisitionOrder>) => void;
  updateRequisitionStatus: (id: string, status: RequisitionOrder['status']) => void;
  updateRequisitionItem: (requisitionId: string, itemIndex: number, itemUpdates: Partial<RequisitionItem>) => void;
  removeRequisitionItem: (requisitionId: string, itemIndex: number) => void;
  deleteRequisition: (id: string) => void;

  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, data: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  crewMembers: CrewMember[];
  addCrewMember: (crew: Omit<CrewMember, 'id' | 'status' | 'assignmentHistory' | 'medicalRecords' | 'accidentRecords'>) => void;
  updateCrewMember: (id: string, data: Partial<CrewMember>) => void;
  deleteCrewMember: (id: string) => void;
  assignSeafarerToVessel: (crewId: string, vesselId: string, vesselName: string, signOnDate: string, signOffDatePlanned: string) => void;
  releaseSeafarerFromVessel: (crewId: string, remarks: string, rating: 'Excellent' | 'Good' | 'Satisfactory', signOffDate?: string) => void;
  updateCrewStatus: (crewId: string, status: SeafarerStatus) => void;
  
  addCrewCertificate: (crewId: string, cert: Omit<SeafarerCertificate, 'id'>) => void;
  updateCrewCertificate: (crewId: string, certId: string, cert: Partial<SeafarerCertificate>) => void;
  deleteCrewCertificate: (crewId: string, certId: string) => void;

  addCrewMedicalRecord: (crewId: string, record: Omit<SeafarerMedicalRecord, 'id'>) => void;
  updateCrewMedicalRecord: (crewId: string, recId: string, record: Partial<SeafarerMedicalRecord>) => void;
  deleteCrewMedicalRecord: (crewId: string, recId: string) => void;

  addCrewAccidentRecord: (crewId: string, record: Omit<SeafarerAccidentRecord, 'id'>) => void;
  updateCrewAccidentRecord: (crewId: string, recId: string, record: Partial<SeafarerAccidentRecord>) => void;
  deleteCrewAccidentRecord: (crewId: string, recId: string) => void;

  deleteAssignmentHistory: (crewId: string, historyId: string) => void;
  updateCrewNotes: (crewId: string, notes: string) => void;

  incidents: IncidentReport[];
  addIncident: (inc: Omit<IncidentReport, 'id'>) => void;
  updateIncident: (id: string, inc: Partial<IncidentReport>) => void;
  deleteIncident: (id: string) => void;

  drills: DrillRecord[];
  addDrill: (drill: Omit<DrillRecord, 'id'>) => void;
  updateDrill: (id: string, drill: Partial<DrillRecord>) => void;
  deleteDrill: (id: string) => void;

  nonConformities: NonConformity[];
  addNonConformity: (nc: Omit<NonConformity, 'id'>) => void;
  updateNonConformity: (id: string, nc: Partial<NonConformity>) => void;
  deleteNonConformity: (id: string) => void;

  jobs: MaintenanceJob[];
  addJob: (job: Omit<MaintenanceJob, 'id'>) => void;
  updateJob: (id: string, job: Partial<MaintenanceJob>) => void;
  deleteJob: (id: string) => void;
  completeJob: (execution: Omit<JobExecution, 'id' | 'daysLateOrEarly'> & { startDate?: string }) => void;
  executions: JobExecution[];
  deleteJobExecution: (id: string) => void;
  dailyLogs: DailyLog[];
  addDailyLog: (log: Omit<DailyLog, 'id'>) => void;

  drydockProjects: DrydockProject[];
  addDrydockProject: (proj: Omit<DrydockProject, 'id'>) => void;
  updateDrydockProject: (id: string, proj: Partial<DrydockProject>) => void;
  deleteDrydockProject: (id: string) => void;

  workOrders: WorkOrderCard[];
  addWorkOrder: (wo: Omit<WorkOrderCard, 'id' | 'publicToken'>) => void;
  updateWorkOrder: (id: string, wo: Partial<WorkOrderCard>) => void;
  updateWorkOrderStatus: (id: string, status: WorkOrderCard['status']) => void;
  deleteWorkOrder: (id: string) => void;

  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vessels, setVessels] = useState<Vessel[]>(() => {
    const saved = localStorage.getItem('marineos_vessels');
    return saved ? JSON.parse(saved) : initialVessels;
  });

  const [selectedVesselId, setSelectedVesselId] = useState<string>(() => {
    return localStorage.getItem('marineos_selected_vessel_id') || 'vessel-1';
  });

  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    return (localStorage.getItem('marineos_active_role') as UserRole) || 'chief_engineer';
  });

  const [equipment, setEquipment] = useState<Equipment[]>(() => {
    const saved = localStorage.getItem('marineos_equipment');
    return saved ? JSON.parse(saved) : initialEquipment;
  });

  const [spareParts, setSpareParts] = useState<SparePartItem[]>(() => {
    const saved = localStorage.getItem('marineos_spare_parts');
    return saved ? JSON.parse(saved) : initialSpareParts;
  });

  const [replacementHistory, setReplacementHistory] = useState<SparePartReplacementRecord[]>(() => {
    const saved = localStorage.getItem('marineos_replacement_history');
    return saved ? JSON.parse(saved) : initialReplacementHistory;
  });

  const [runSessions, setRunSessions] = useState<MachineryRunSession[]>(() => {
    const saved = localStorage.getItem('marineos_run_sessions');
    return saved ? JSON.parse(saved) : initialRunSessions;
  });

  const [requisitions, setRequisitions] = useState<RequisitionOrder[]>(() => {
    const saved = localStorage.getItem('marineos_requisitions');
    return saved ? JSON.parse(saved) : initialRequisitions;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('marineos_suppliers');
    return saved ? JSON.parse(saved) : initialSuppliers;
  });

  const [crewMembers, setCrewMembers] = useState<CrewMember[]>(() => {
    const saved = localStorage.getItem('marineos_crew');
    return saved ? JSON.parse(saved) : initialCrewMembers;
  });

  const [incidents, setIncidents] = useState<IncidentReport[]>(() => {
    const saved = localStorage.getItem('marineos_incidents');
    return saved ? JSON.parse(saved) : initialIncidents;
  });

  const [drills, setDrills] = useState<DrillRecord[]>(() => {
    const saved = localStorage.getItem('marineos_drills');
    return saved ? JSON.parse(saved) : initialDrills;
  });

  const [nonConformities, setNonConformities] = useState<NonConformity[]>(() => {
    const saved = localStorage.getItem('marineos_non_conformities');
    return saved ? JSON.parse(saved) : initialNonConformities;
  });

  const [jobs, setJobs] = useState<MaintenanceJob[]>(() => {
    const saved = localStorage.getItem('marineos_jobs');
    return saved ? JSON.parse(saved) : initialJobs;
  });

  const [executions, setExecutions] = useState<JobExecution[]>(() => {
    const saved = localStorage.getItem('marineos_executions');
    return saved ? JSON.parse(saved) : initialExecutions;
  });

  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(() => {
    const saved = localStorage.getItem('marineos_daily_logs');
    return saved ? JSON.parse(saved) : initialDailyLogs;
  });

  const [drydockProjects, setDrydockProjects] = useState<DrydockProject[]>(() => {
    const saved = localStorage.getItem('marineos_drydock_projects');
    return saved ? JSON.parse(saved) : initialDrydockProjects;
  });

  const [workOrders, setWorkOrders] = useState<WorkOrderCard[]>(() => {
    const saved = localStorage.getItem('marineos_work_orders');
    return saved ? JSON.parse(saved) : initialWorkOrders;
  });

  useEffect(() => { localStorage.setItem('marineos_vessels', JSON.stringify(vessels)); }, [vessels]);
  useEffect(() => { localStorage.setItem('marineos_selected_vessel_id', selectedVesselId); }, [selectedVesselId]);
  useEffect(() => { localStorage.setItem('marineos_active_role', activeRole); }, [activeRole]);
  useEffect(() => { localStorage.setItem('marineos_equipment', JSON.stringify(equipment)); }, [equipment]);
  useEffect(() => { localStorage.setItem('marineos_spare_parts', JSON.stringify(spareParts)); }, [spareParts]);
  useEffect(() => { localStorage.setItem('marineos_replacement_history', JSON.stringify(replacementHistory)); }, [replacementHistory]);
  useEffect(() => { localStorage.setItem('marineos_run_sessions', JSON.stringify(runSessions)); }, [runSessions]);
  useEffect(() => { localStorage.setItem('marineos_requisitions', JSON.stringify(requisitions)); }, [requisitions]);
  useEffect(() => { localStorage.setItem('marineos_suppliers', JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem('marineos_crew', JSON.stringify(crewMembers)); }, [crewMembers]);
  useEffect(() => { localStorage.setItem('marineos_incidents', JSON.stringify(incidents)); }, [incidents]);
  useEffect(() => { localStorage.setItem('marineos_drills', JSON.stringify(drills)); }, [drills]);
  useEffect(() => { localStorage.setItem('marineos_non_conformities', JSON.stringify(nonConformities)); }, [nonConformities]);
  useEffect(() => { localStorage.setItem('marineos_jobs', JSON.stringify(jobs)); }, [jobs]);
  useEffect(() => { localStorage.setItem('marineos_executions', JSON.stringify(executions)); }, [executions]);
  useEffect(() => { localStorage.setItem('marineos_daily_logs', JSON.stringify(dailyLogs)); }, [dailyLogs]);
  useEffect(() => { localStorage.setItem('marineos_drydock_projects', JSON.stringify(drydockProjects)); }, [drydockProjects]);
  useEffect(() => { localStorage.setItem('marineos_work_orders', JSON.stringify(workOrders)); }, [workOrders]);

  const selectedVessel = selectedVesselId === 'all_vessels'
    ? {
        id: 'all_vessels',
        name: 'All Fleet Vessels',
        imoNumber: 'FLEET-COMBINED',
        flag: 'Global',
        vesselType: 'Combined Fleet View',
        builtYear: 2026,
        classSociety: 'DNV / Lloyds / BV',
        status: 'At Sea' as const,
        currentLocation: 'Global Maritime Trade Routes',
        totalRunningHours: vessels.reduce((acc, v) => acc + (v.totalRunningHours || 0), 0)
      }
    : vessels.find(v => v.id === selectedVesselId) || vessels[0];

  const addVessel = (vesselData: Omit<Vessel, 'id'>) => {
    const newVessel: Vessel = {
      ...vesselData,
      id: `vessel-${Date.now()}`
    };
    setVessels(prev => [...prev, newVessel]);
  };

  const updateVessel = (id: string, vesselData: Partial<Vessel>) => {
    setVessels(prev => prev.map(v => v.id === id ? { ...v, ...vesselData } : v));
  };

  const deleteVessel = (id: string) => {
    setVessels(prev => prev.filter(v => v.id !== id));
  };

  const addEquipment = (eqData: Omit<Equipment, 'id' | 'runningHours'>) => {
    const newEq: Equipment = {
      ...eqData,
      id: `eq-${Date.now()}`,
      runningHours: eqData.initialRunningHours || 0
    };
    setEquipment(prev => [...prev, newEq]);
  };

  const updateEquipment = (id: string, eqData: Partial<Equipment>) => {
    setEquipment(prev => prev.map(item => item.id === id ? { ...item, ...eqData } : item));
  };

  const deleteEquipment = (id: string) => {
    setEquipment(prev => prev.filter(item => item.id !== id));
  };

  const updateEquipmentRunningHours = (id: string, newHours: number) => {
    setEquipment(prev => prev.map(eq => eq.id === id ? { ...eq, runningHours: newHours } : eq));
  };

  const addSparePart = (partData: Omit<SparePartItem, 'id' | 'conditionStatus'> & { conditionStatus?: ItemConditionStatus }) => {
    const newPart: SparePartItem = {
      ...partData,
      id: `part-${Date.now()}`,
      conditionStatus: partData.conditionStatus || 'Good / Ready',
      locationType: partData.locationType || 'Ship Storage',
      locationName: partData.locationName || 'Engine Room Workshop'
    };
    setSpareParts(prev => [...prev, newPart]);
  };

  const updateSparePart = (id: string, partData: Partial<SparePartItem>) => {
    setSpareParts(prev => prev.map(p => p.id === id ? { ...p, ...partData } : p));
  };

  const deleteSparePart = (id: string) => {
    setSpareParts(prev => prev.filter(p => p.id !== id));
  };

  const transferPartToShip = (partId: string, targetVesselId: string, shipLocationName?: string) => {
    const targetVesselObj = vessels.find(v => v.id === targetVesselId);
    setSpareParts(prev => prev.map(part => {
      if (part.id === partId) {
        return {
          ...part,
          vesselId: targetVesselId,
          locationType: 'Ship Storage',
          locationName: shipLocationName || `${targetVesselObj?.name || 'Ship'} Engine Room Store`,
          conditionStatus: 'Good / Ready'
        };
      }
      return part;
    }));
  };

  const updateItemConditionStatus = (partId: string, status: ItemConditionStatus, notes?: string, offloadedVesselName?: string) => {
    setSpareParts(prev => prev.map(part => {
      if (part.id === partId) {
        const isOffloaded = status === 'Offloaded to Land (Ship-to-Shore)';
        return {
          ...part,
          conditionStatus: status,
          conditionNotes: notes || part.conditionNotes,
          offloadedFromVesselName: offloadedVesselName || part.offloadedFromVesselName,
          locationType: isOffloaded ? 'Land Storage' : part.locationType,
          locationName: isOffloaded ? (notes || 'Shore Workshop / Land Depot') : part.locationName,
          statusUpdatedDate: new Date().toISOString().split('T')[0]
        };
      }
      return part;
    }));
  };

  const logPartReplacement = (recordData: Omit<SparePartReplacementRecord, 'id'>) => {
    const newRecord: SparePartReplacementRecord = {
      ...recordData,
      id: `rep-${Date.now()}`
    };
    setReplacementHistory(prev => [newRecord, ...prev]);

    setSpareParts(prev => prev.map(part => {
      if (part.equipmentId === recordData.equipmentId && part.partName.toLowerCase() === recordData.partName.toLowerCase()) {
        return { 
          ...part, 
          stockQty: Math.max(0, part.stockQty - recordData.qtyReplaced),
          installedAtRunningHours: recordData.runningHoursAtChange,
          installedDate: recordData.dateReplaced,
          isCurrentlyInstalled: true
        };
      }
      return part;
    }));
  };

  const deleteReplacementRecord = (id: string) => {
    setReplacementHistory(prev => prev.filter(r => r.id !== id));
  };

  const logRunSession = (sessionData: Omit<MachineryRunSession, 'id' | 'hoursCalculated'> & { hoursCalculated?: number }) => {
    let hours = sessionData.hoursCalculated || 0;
    if (!hours && sessionData.startTime && sessionData.stopTime) {
      const start = new Date(sessionData.startTime).getTime();
      const stop = new Date(sessionData.stopTime).getTime();
      if (stop > start) {
        hours = Math.round(((stop - start) / (1000 * 60 * 60)) * 10) / 10;
      }
    }
    if (!hours) hours = 1;

    const newSession: MachineryRunSession = {
      ...sessionData,
      id: `run-${Date.now()}`,
      hoursCalculated: hours
    };

    setRunSessions(prev => [newSession, ...prev]);

    setEquipment(prev => prev.map(item => {
      if (item.id === sessionData.equipmentId) {
        const updatedHours = item.runningHours + hours;
        return { ...item, runningHours: updatedHours };
      }
      return item;
    }));
  };

  const deleteRunSession = (id: string) => {
    setRunSessions(prev => prev.filter(s => s.id !== id));
  };

  const addRequisition = (reqData: Omit<RequisitionOrder, 'id' | 'requisitionNo'>) => {
    const newReq: RequisitionOrder = {
      ...reqData,
      id: `req-${Date.now()}`,
      requisitionNo: `REQ-PS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
    };
    setRequisitions(prev => [newReq, ...prev]);
  };

  const updateRequisitionMetadata = (id: string, data: Partial<RequisitionOrder>) => {
    setRequisitions(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
  };

  const updateRequisitionStatus = (id: string, status: RequisitionOrder['status']) => {
    setRequisitions(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const updateRequisitionItem = (requisitionId: string, itemIndex: number, itemUpdates: Partial<RequisitionItem>) => {
    setRequisitions(prev => prev.map(r => {
      if (r.id === requisitionId) {
        const updatedItems = [...r.items];
        updatedItems[itemIndex] = { ...updatedItems[itemIndex], ...itemUpdates };
        const total = updatedItems.reduce((acc, it) => acc + (it.qtyRequested * it.unitPriceUSD), 0);
        return { ...r, items: updatedItems, totalCostUSD: total };
      }
      return r;
    }));
  };

  const removeRequisitionItem = (requisitionId: string, itemIndex: number) => {
    setRequisitions(prev => prev.map(r => {
      if (r.id === requisitionId) {
        const updatedItems = r.items.filter((_, idx) => idx !== itemIndex);
        const total = updatedItems.reduce((acc, it) => acc + (it.qtyRequested * it.unitPriceUSD), 0);
        return { ...r, items: updatedItems, totalCostUSD: total };
      }
      return r;
    }));
  };

  const deleteRequisition = (id: string) => {
    setRequisitions(prev => prev.filter(r => r.id !== id));
  };

  const addSupplier = (supplierData: Omit<Supplier, 'id'>) => {
    const newSup: Supplier = {
      ...supplierData,
      id: `sup-${Date.now()}`
    };
    setSuppliers(prev => [...prev, newSup]);
  };

  const updateSupplier = (id: string, data: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const addCrewMember = (crewData: Omit<CrewMember, 'id' | 'status' | 'assignmentHistory' | 'medicalRecords' | 'accidentRecords'>) => {
    const newCrew: CrewMember = {
      ...crewData,
      id: `crew-${Date.now()}`,
      status: 'Available',
      certificates: crewData.certificates || [],
      assignmentHistory: [],
      medicalRecords: [],
      accidentRecords: [],
      personalNotes: ''
    };
    setCrewMembers(prev => [...prev, newCrew]);
  };

  const updateCrewMember = (id: string, data: Partial<CrewMember>) => {
    setCrewMembers(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteCrewMember = (id: string) => {
    setCrewMembers(prev => prev.filter(c => c.id !== id));
  };

  const assignSeafarerToVessel = (crewId: string, vesselId: string, vesselName: string, signOnDate: string, signOffDatePlanned: string) => {
    setCrewMembers(prev => prev.map(c => {
      if (c.id === crewId) {
        return {
          ...c,
          status: 'Onboard',
          currentVesselId: vesselId,
          currentVesselName: vesselName,
          signOnDate,
          signOffDatePlanned,
        };
      }
      return c;
    }));
  };

  const releaseSeafarerFromVessel = (crewId: string, remarks: string, rating: 'Excellent' | 'Good' | 'Satisfactory', signOffDate?: string) => {
    const actualSignOff = signOffDate || new Date().toISOString().split('T')[0];
    setCrewMembers(prev => prev.map(c => {
      if (c.id === crewId) {
        const historyItem = {
          id: `h-${Date.now()}`,
          vesselId: c.currentVesselId || 'vessel-1',
          vesselName: c.currentVesselName || 'Vessel',
          rank: c.rank,
          signOnDate: c.signOnDate || '2026-01-01',
          signOffDate: actualSignOff,
          performanceRating: rating,
          remarks: remarks || 'Signed off vessel.'
        };

        return {
          ...c,
          status: 'Available',
          currentVesselId: undefined,
          currentVesselName: undefined,
          signOnDate: undefined,
          signOffDatePlanned: undefined,
          assignmentHistory: [historyItem, ...(c.assignmentHistory || [])]
        };
      }
      return c;
    }));
  };

  const updateCrewStatus = (crewId: string, status: SeafarerStatus) => {
    setCrewMembers(prev => prev.map(c => c.id === crewId ? { ...c, status } : c));
  };

  const addCrewCertificate = (crewId: string, cert: Omit<SeafarerCertificate, 'id'>) => {
    const newCert: SeafarerCertificate = { ...cert, id: `cert-${Date.now()}` };
    setCrewMembers(prev => prev.map(c => c.id === crewId ? { ...c, certificates: [...(c.certificates || []), newCert] } : c));
  };

  const updateCrewCertificate = (crewId: string, certId: string, certData: Partial<SeafarerCertificate>) => {
    setCrewMembers(prev => prev.map(c => {
      if (c.id === crewId) {
        return {
          ...c,
          certificates: (c.certificates || []).map(crt => crt.id === certId ? { ...crt, ...certData } : crt)
        };
      }
      return c;
    }));
  };

  const deleteCrewCertificate = (crewId: string, certId: string) => {
    setCrewMembers(prev => prev.map(c => {
      if (c.id === crewId) {
        return { ...c, certificates: (c.certificates || []).filter(crt => crt.id !== certId) };
      }
      return c;
    }));
  };

  const addCrewMedicalRecord = (crewId: string, recordData: Omit<SeafarerMedicalRecord, 'id'>) => {
    const newMed: SeafarerMedicalRecord = {
      ...recordData,
      id: `med-${Date.now()}`
    };
    setCrewMembers(prev => prev.map(c => c.id === crewId ? { ...c, medicalRecords: [newMed, ...(c.medicalRecords || [])] } : c));
  };

  const updateCrewMedicalRecord = (crewId: string, recId: string, recordData: Partial<SeafarerMedicalRecord>) => {
    setCrewMembers(prev => prev.map(c => {
      if (c.id === crewId) {
        return {
          ...c,
          medicalRecords: (c.medicalRecords || []).map(m => m.id === recId ? { ...m, ...recordData } : m)
        };
      }
      return c;
    }));
  };

  const deleteCrewMedicalRecord = (crewId: string, recId: string) => {
    setCrewMembers(prev => prev.map(c => {
      if (c.id === crewId) {
        return { ...c, medicalRecords: (c.medicalRecords || []).filter(m => m.id !== recId) };
      }
      return c;
    }));
  };

  const addCrewAccidentRecord = (crewId: string, recordData: Omit<SeafarerAccidentRecord, 'id'>) => {
    const newAcc: SeafarerAccidentRecord = {
      ...recordData,
      id: `acc-${Date.now()}`
    };
    setCrewMembers(prev => prev.map(c => c.id === crewId ? { ...c, accidentRecords: [newAcc, ...(c.accidentRecords || [])] } : c));
  };

  const updateCrewAccidentRecord = (crewId: string, recId: string, recordData: Partial<SeafarerAccidentRecord>) => {
    setCrewMembers(prev => prev.map(c => {
      if (c.id === crewId) {
        return {
          ...c,
          accidentRecords: (c.accidentRecords || []).map(a => a.id === recId ? { ...a, ...recordData } : a)
        };
      }
      return c;
    }));
  };

  const deleteCrewAccidentRecord = (crewId: string, recId: string) => {
    setCrewMembers(prev => prev.map(c => {
      if (c.id === crewId) {
        return { ...c, accidentRecords: (c.accidentRecords || []).filter(a => a.id !== recId) };
      }
      return c;
    }));
  };

  const deleteAssignmentHistory = (crewId: string, historyId: string) => {
    setCrewMembers(prev => prev.map(c => {
      if (c.id === crewId) {
        return { ...c, assignmentHistory: (c.assignmentHistory || []).filter(h => h.id !== historyId) };
      }
      return c;
    }));
  };

  const updateCrewNotes = (crewId: string, notes: string) => {
    setCrewMembers(prev => prev.map(c => c.id === crewId ? { ...c, personalNotes: notes } : c));
  };

  const addIncident = (incData: Omit<IncidentReport, 'id'>) => {
    const incId = `inc-${Date.now()}`;
    const targetVessel = vessels.find(v => v.id === incData.vesselId) || selectedVessel;
    const newInc: IncidentReport = {
      ...incData,
      id: incId,
      vesselName: incData.vesselName || targetVessel.name,
    };
    setIncidents(prev => [newInc, ...prev]);

    // INTEGRATION: Automatically link reported safety incident to involved Crew Members' accident history!
    if (incData.crewInvolvedNames) {
      const namesList = incData.crewInvolvedNames.split(',').map(n => n.trim().toLowerCase());
      setCrewMembers(prev => prev.map(c => {
        if (namesList.some(n => n && c.fullName.toLowerCase().includes(n))) {
          const newAccidentRecord: SeafarerAccidentRecord = {
            id: `acc-inc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            incidentId: incId,
            incidentTitle: incData.title,
            date: incData.dateReported,
            description: `${incData.incidentType} (${incData.severity} Severity) at ${incData.locationOnboard}: ${incData.description}`,
            injuryType: incData.incidentType,
            handledByCrewName: incData.handledByCrewName || 'Chief Officer',
            treatmentDetails: incData.correctiveAction || 'Logged in Safety ISM Module',
            status: incData.status === 'Closed' ? 'Recovered' : 'Under Treatment'
          };
          return {
            ...c,
            accidentRecords: [newAccidentRecord, ...(c.accidentRecords || [])]
          };
        }
        return c;
      }));
    }
  };

  const updateIncident = (id: string, incData: Partial<IncidentReport>) => {
    setIncidents(prev => prev.map(i => {
      if (i.id === id) {
        const targetVessel = incData.vesselId ? vessels.find(v => v.id === incData.vesselId) : undefined;
        return {
          ...i,
          ...incData,
          vesselName: targetVessel ? targetVessel.name : (incData.vesselName || i.vesselName)
        };
      }
      return i;
    }));
  };

  const deleteIncident = (id: string) => {
    setIncidents(prev => prev.filter(i => i.id !== id));
  };

  const addDrill = (drillData: Omit<DrillRecord, 'id'>) => {
    const targetVessel = vessels.find(v => v.id === drillData.vesselId) || selectedVessel;
    const newDrill: DrillRecord = {
      ...drillData,
      id: `drill-${Date.now()}`,
      vesselName: targetVessel.name,
    };
    setDrills(prev => [newDrill, ...prev]);
  };

  const updateDrill = (id: string, drillData: Partial<DrillRecord>) => {
    setDrills(prev => prev.map(d => d.id === id ? { ...d, ...drillData } : d));
  };

  const deleteDrill = (id: string) => {
    setDrills(prev => prev.filter(d => d.id !== id));
  };

  const addNonConformity = (ncData: Omit<NonConformity, 'id'>) => {
    const targetVessel = vessels.find(v => v.id === ncData.vesselId) || selectedVessel;
    const newNc: NonConformity = {
      ...ncData,
      id: `nc-${Date.now()}`,
      vesselName: targetVessel.name
    };
    setNonConformities(prev => [newNc, ...prev]);
  };

  const updateNonConformity = (id: string, ncData: Partial<NonConformity>) => {
    setNonConformities(prev => prev.map(nc => nc.id === id ? { ...nc, ...ncData } : nc));
  };

  const deleteNonConformity = (id: string) => {
    setNonConformities(prev => prev.filter(nc => nc.id !== id));
  };

  const addJob = (jobData: Omit<MaintenanceJob, 'id'>) => {
    const targetVessel = vessels.find(v => v.id === jobData.vesselId) || selectedVessel;
    const newJob: MaintenanceJob = {
      ...jobData,
      id: `job-${Date.now()}`,
      vesselName: targetVessel.name,
    };
    setJobs(prev => [...prev, newJob]);
  };

  const updateJob = (id: string, jobData: Partial<MaintenanceJob>) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, ...jobData } : j));
  };

  const deleteJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const completeJob = (execData: Omit<JobExecution, 'id' | 'daysLateOrEarly'> & { startDate?: string }) => {
    const targetJob = jobs.find(j => j.id === execData.jobId);
    
    let daysLateOrEarly = 0;
    if (targetJob && targetJob.nextDueDate) {
      const dueMs = new Date(targetJob.nextDueDate).getTime();
      const doneMs = new Date(execData.dateCompleted).getTime();
      daysLateOrEarly = Math.round((doneMs - dueMs) / (1000 * 60 * 60 * 24));
    }

    const newExec: JobExecution = {
      ...execData,
      id: `exec-${Date.now()}`,
      startDate: execData.startDate || execData.dateCompleted,
      daysLateOrEarly,
    };
    setExecutions(prev => [newExec, ...prev]);

    setJobs(prev => prev.map(job => {
      if (job.id === execData.jobId) {
        const nextDueHours = job.intervalHours ? execData.runningHoursAtExecution + job.intervalHours : job.nextDueHours;
        const nextDueDate = new Date(execData.dateCompleted);
        const cycleDays = job.intervalDays || 30;
        nextDueDate.setDate(nextDueDate.getDate() + cycleDays);

        return {
          ...job,
          status: 'Upcoming',
          lastDoneDate: execData.dateCompleted,
          lastDoneHours: execData.runningHoursAtExecution,
          nextDueHours,
          nextDueDate: nextDueDate.toISOString().split('T')[0]
        };
      }
      return job;
    }));
  };

  const deleteJobExecution = (id: string) => {
    setExecutions(prev => prev.filter(e => e.id !== id));
  };

  const addDailyLog = (logData: Omit<DailyLog, 'id'>) => {
    const newLog: DailyLog = {
      ...logData,
      id: `log-${Date.now()}`
    };
    setDailyLogs(prev => [newLog, ...prev]);

    if (logData.vesselId) {
      setEquipment(prev => prev.map(eq => {
        if (eq.vesselId === logData.vesselId) {
          if (eq.name.toLowerCase().includes('generator #1') || eq.name.toLowerCase().includes('gen #1') || eq.name.toLowerCase().includes('aux gen 1')) {
            if (logData.auxGen1Hours > eq.runningHours) {
              return { ...eq, runningHours: logData.auxGen1Hours };
            }
          }
          if (eq.name.toLowerCase().includes('generator #2') || eq.name.toLowerCase().includes('gen #2') || eq.name.toLowerCase().includes('aux gen 2')) {
            if (logData.auxGen2Hours > eq.runningHours) {
              return { ...eq, runningHours: logData.auxGen2Hours };
            }
          }
        }
        return eq;
      }));
    }
  };

  const addDrydockProject = (projData: Omit<DrydockProject, 'id'>) => {
    const newProj: DrydockProject = {
      ...projData,
      id: `dd-${Date.now()}`
    };
    setDrydockProjects(prev => [...prev, newProj]);
  };

  const updateDrydockProject = (id: string, projData: Partial<DrydockProject>) => {
    setDrydockProjects(prev => prev.map(p => p.id === id ? { ...p, ...projData } : p));
  };

  const deleteDrydockProject = (id: string) => {
    setDrydockProjects(prev => prev.filter(p => p.id !== id));
  };

  const addWorkOrder = (woData: Omit<WorkOrderCard, 'id' | 'publicToken'>) => {
    const newWo: WorkOrderCard = {
      ...woData,
      id: `wo-${Date.now()}`,
      publicToken: `tk_${Math.random().toString(36).substring(2, 9)}`
    };
    setWorkOrders(prev => [...prev, newWo]);
  };

  const updateWorkOrder = (id: string, woData: Partial<WorkOrderCard>) => {
    setWorkOrders(prev => prev.map(wo => wo.id === id ? { ...wo, ...woData } : wo));
  };

  const updateWorkOrderStatus = (id: string, status: WorkOrderCard['status']) => {
    setWorkOrders(prev => prev.map(wo => wo.id === id ? { ...wo, status } : wo));
  };

  const deleteWorkOrder = (id: string) => {
    setWorkOrders(prev => prev.filter(wo => wo.id !== id));
  };

  const resetToDefaultData = () => {
    localStorage.clear();
    setVessels(initialVessels);
    setEquipment(initialEquipment);
    setSpareParts(initialSpareParts);
    setReplacementHistory(initialReplacementHistory);
    setRunSessions(initialRunSessions);
    setRequisitions(initialRequisitions);
    setSuppliers(initialSuppliers);
    setCrewMembers(initialCrewMembers);
    setIncidents(initialIncidents);
    setDrills(initialDrills);
    setNonConformities(initialNonConformities);
    setJobs(initialJobs);
    setExecutions(initialExecutions);
    setDailyLogs(initialDailyLogs);
    setDrydockProjects(initialDrydockProjects);
    setWorkOrders(initialWorkOrders);
  };

  return (
    <AppContext.Provider value={{
      vessels,
      selectedVessel,
      selectedVesselId,
      setSelectedVesselId,
      addVessel,
      updateVessel,
      deleteVessel,
      activeRole,
      setActiveRole,
      equipment,
      addEquipment,
      updateEquipment,
      deleteEquipment,
      updateEquipmentRunningHours,
      spareParts,
      addSparePart,
      updateSparePart,
      deleteSparePart,
      transferPartToShip,
      updateItemConditionStatus,
      replacementHistory,
      logPartReplacement,
      deleteReplacementRecord,
      runSessions,
      logRunSession,
      deleteRunSession,
      requisitions,
      addRequisition,
      updateRequisitionMetadata,
      updateRequisitionStatus,
      updateRequisitionItem,
      removeRequisitionItem,
      deleteRequisition,
      suppliers,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      crewMembers,
      addCrewMember,
      updateCrewMember,
      deleteCrewMember,
      assignSeafarerToVessel,
      releaseSeafarerFromVessel,
      updateCrewStatus,
      addCrewCertificate,
      updateCrewCertificate,
      deleteCrewCertificate,
      addCrewMedicalRecord,
      updateCrewMedicalRecord,
      deleteCrewMedicalRecord,
      addCrewAccidentRecord,
      updateCrewAccidentRecord,
      deleteCrewAccidentRecord,
      deleteAssignmentHistory,
      updateCrewNotes,
      incidents,
      addIncident,
      updateIncident,
      deleteIncident,
      drills,
      addDrill,
      updateDrill,
      deleteDrill,
      nonConformities,
      addNonConformity,
      updateNonConformity,
      deleteNonConformity,
      jobs,
      addJob,
      updateJob,
      deleteJob,
      completeJob,
      executions,
      deleteJobExecution,
      dailyLogs,
      addDailyLog,
      drydockProjects,
      addDrydockProject,
      updateDrydockProject,
      deleteDrydockProject,
      workOrders,
      addWorkOrder,
      updateWorkOrder,
      updateWorkOrderStatus,
      deleteWorkOrder,
      resetToDefaultData,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
