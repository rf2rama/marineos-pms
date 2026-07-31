import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Equipment, EquipmentCategory, AttachmentFile, SparePartItem } from '../../types';
import { 
  Wrench, Plus, Layers, AlertTriangle, ShieldCheck, CheckCircle2, 
  Search, Clock, Play, History, Filter, Ship, MapPin, Edit3, Trash2, RefreshCw,
  FileText, Image as ImageIcon, Paperclip, AlertOctagon, FolderTree, ExternalLink, X, Eye, Activity, Zap, TrendingUp
} from 'lucide-react';

export const EquipmentRegistry: React.FC = () => {
  const { 
    vessels, selectedVessel, equipment, addEquipment, updateEquipment, deleteEquipment, 
    equipmentTransfers, transferEquipment,
    spareParts, addSparePart, updateSparePart, replacementHistory, logPartReplacement, deleteReplacementRecord, 
    runSessions, logRunSession, deleteRunSession, jobs, incidents, crewMembers, activeRole, simulateRunningHours 
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<'grid' | 'replacements' | 'sessions' | 'transfers'>('grid');
  const [viewLayout, setViewLayout] = useState<'grid' | 'tree'>('grid');
  const [partDisplayMode, setPartDisplayMode] = useState<'running_hours' | 'part_age'>('running_hours');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEquipmentId, setEditingEquipmentId] = useState<string | null>(null);

  const [partModalEqId, setPartModalEqId] = useState<string | null>(null);
  const [runLogModalEqId, setRunLogModalEqId] = useState<string | null>(null);
  const [transferModalEqId, setTransferModalEqId] = useState<string | null>(null);
  const [diagnosticTrendEq, setDiagnosticTrendEq] = useState<Equipment | null>(null);

  // Transfer Form State
  const [transferFormData, setTransferFormData] = useState({
    toVesselId: '',
    notes: '',
  });

  // Lightbox & Viewer Modals
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [activePdfUrl, setActivePdfUrl] = useState<{ name: string; url: string } | null>(null);

  // Forms
  const [formData, setFormData] = useState({
    name: '',
    category: 'Main Propulsion' as EquipmentCategory,
    parentId: '',
    maker: 'MAN Energy Solutions',
    model: '6S50ME-C',
    serialNumber: 'ME-99102',
    location: 'Engine Room Bottom Platform',
    initialRunningHours: 10000,
    runningHours: 10000,
    tboHours: 12000,
    lastOverhaulHours: 10000,
    solasMarpolTags: 'SOLAS Main Propulsion, MARPOL Annex VI',
    classCmsCode: 'DNV-CMS-110.01',
    criticality: 'High' as Equipment['criticality'],
    lastOverhaulDate: new Date().toISOString().split('T')[0],
    status: 'Operational' as Equipment['status'],
    isPortable: false,
    attachments: [] as AttachmentFile[],
  });

  const [partFormData, setPartFormData] = useState({
    partName: 'Cylinder No. 1 Fuel Injector Nozzle',
    partNumber: 'MAN-FIN-50ME',
    qtyReplaced: 1,
    expectedLifespanHours: 6000,
    dateReplaced: new Date().toISOString().split('T')[0],
    replacedBy: activeRole === 'chief_engineer' ? 'Chief Engineer H. Vance' : '2nd Engineer M. Kowalski',
    reason: 'Preventive replacement at recommended service interval.',
    attachments: [] as AttachmentFile[],
  });

  const [runFormData, setRunFormData] = useState({
    startTime: '2026-07-22 08:00',
    stopTime: '2026-07-22 18:00',
    hoursCalculated: 10,
    loggedBy: activeRole === 'chief_engineer' ? 'Chief Engineer H. Vance' : '2nd Engineer M. Kowalski',
    purpose: 'Engine sea watch & generator load test',
  });

  const categories: string[] = [
    'All',
    'Main Propulsion',
    'Auxiliary Power',
    'Boiler & Steam',
    'Pumps & Piping',
    'Purifiers & Separators',
    'Steering & Deck Machinery',
    'Safety & Firefighting',
    'Portable Instruments'
  ];

  const isAllVessels = selectedVessel.id === 'all_vessels';
  const targetVesselId = isAllVessels ? undefined : selectedVessel.id;

  const filteredEquipment = equipment.filter(eq => {
    if (eq.isDeleted) return false;
    // If it's in land storage, only show it when viewing "All Fleet Vessels"
    const matchesVessel = (!targetVesselId && eq.vesselId === 'Land Storage') || (!targetVesselId && eq.vesselId !== 'Land Storage') || eq.vesselId === targetVesselId;
    const matchesCategory = selectedCategory === 'All' || eq.category === selectedCategory;
    const matchesStatus = filterStatus === 'All' || eq.status === filterStatus;
    const matchesSearch = (eq.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (eq.maker || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (eq.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (eq.serialNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (eq.classCmsCode || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesVessel && matchesCategory && matchesStatus && matchesSearch;
  });

  const filteredReplacements = replacementHistory.filter(rep => {
    const targetEq = equipment.find(e => e.id === rep.equipmentId);
    const matchesVessel = !targetVesselId || (targetEq && targetEq.vesselId === targetVesselId);
    const matchesSearch = (rep.partName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (rep.equipmentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (rep.replacedBy || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesVessel && matchesSearch;
  });

  const filteredRunSessions = runSessions.filter(session => {
    const matchesVessel = !targetVesselId || session.vesselId === targetVesselId;
    const matchesSearch = (session.equipmentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (session.loggedBy || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (session.purpose || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesVessel && matchesSearch;
  });

  const filteredTransfers = equipmentTransfers.filter(transfer => {
    const matchesVessel = !targetVesselId || transfer.toVesselId === targetVesselId || transfer.fromVesselId === targetVesselId;
    const eq = equipment.find(e => e.id === transfer.equipmentId);
    const matchesSearch = (eq?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (transfer.transferredBy || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesVessel && matchesSearch;
  });

  // Handle Base64 file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isEquipmentForm: boolean) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        const type = file.type.includes('pdf') ? 'pdf' : (file.type.includes('image') ? 'image' : 'document');
        const newAttachment: AttachmentFile = {
          id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: file.name,
          url,
          type,
          sizeBytes: file.size,
          uploadedAt: new Date().toISOString().split('T')[0],
        };

        if (isEquipmentForm) {
          setFormData(prev => ({ ...prev, attachments: [...prev.attachments, newAttachment] }));
        } else {
          setPartFormData(prev => ({ ...prev, attachments: [...prev.attachments, newAttachment] }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeEquipmentAttachment = (id: string) => {
    setFormData(prev => ({ ...prev, attachments: prev.attachments.filter(a => a.id !== id) }));
  };

  const openAddModal = () => {
    setEditingEquipmentId(null);
    setFormData({
      name: '',
      category: 'Main Propulsion',
      parentId: '',
      maker: 'MAN Energy Solutions',
      model: '6S50ME-C',
      serialNumber: 'ME-99102',
      location: 'Engine Room Bottom Platform',
      initialRunningHours: 10000,
      runningHours: 10000,
      tboHours: 12000,
      lastOverhaulHours: 10000,
      solasMarpolTags: 'SOLAS Main Propulsion, MARPOL Annex VI',
      classCmsCode: 'DNV-CMS-110.01',
      criticality: 'High',
      lastOverhaulDate: new Date().toISOString().split('T')[0],
      status: 'Operational',
      isPortable: false,
      linkedVesselStates: 'Sailing, Shifting',
      attachments: [],
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (eq: Equipment) => {
    setEditingEquipmentId(eq.id);
    setFormData({
      name: eq.name,
      category: eq.category,
      parentId: eq.parentId || '',
      maker: eq.maker,
      model: eq.model,
      serialNumber: eq.serialNumber,
      location: eq.location,
      initialRunningHours: eq.initialRunningHours || 0,
      runningHours: eq.runningHours || 0,
      tboHours: eq.tboHours || 12000,
      lastOverhaulHours: eq.lastOverhaulHours || (eq.initialRunningHours || 0),
      solasMarpolTags: eq.solasMarpolTags ? eq.solasMarpolTags.join(', ') : '',
      classCmsCode: eq.classCmsCode || '',
      criticality: eq.criticality,
      lastOverhaulDate: eq.lastOverhaulDate,
      status: eq.status,
      isPortable: eq.isPortable || false,
      linkedVesselStates: eq.linkedVesselStates ? eq.linkedVesselStates.join(', ') : '',
      attachments: eq.attachments || [],
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formData.solasMarpolTags ? formData.solasMarpolTags.split(',').map(t => t.trim()).filter(Boolean) : [];
    const statesArray = formData.linkedVesselStates ? formData.linkedVesselStates.split(',').map(t => t.trim()).filter(Boolean) as any[] : [];

    if (editingEquipmentId) {
      updateEquipment(editingEquipmentId, {
        name: formData.name,
        category: formData.category,
        parentId: formData.parentId || undefined,
        maker: formData.maker,
        model: formData.model,
        serialNumber: formData.serialNumber,
        location: formData.location,
        runningHours: Number(formData.runningHours || 0),
        tboHours: Number(formData.tboHours || 12000),
        lastOverhaulHours: Number(formData.lastOverhaulHours || 0),
        solasMarpolTags: tagsArray,
        classCmsCode: formData.classCmsCode,
        criticality: formData.criticality,
        lastOverhaulDate: formData.lastOverhaulDate,
        status: formData.status,
        isPortable: formData.isPortable,
        linkedVesselStates: statesArray,
        attachments: formData.attachments,
      });
    } else {
      addEquipment({
        ...formData,
        parentId: formData.parentId || undefined,
        vesselId: selectedVessel.id === 'all_vessels' ? vessels[0].id : selectedVessel.id,
        tboHours: Number(formData.tboHours || 12000),
        lastOverhaulHours: Number(formData.lastOverhaulHours || 0),
        solasMarpolTags: tagsArray,
        classCmsCode: formData.classCmsCode,
        isPortable: formData.isPortable,
        linkedVesselStates: statesArray,
        attachments: formData.attachments,
      });
    }
    setIsAddModalOpen(false);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferModalEqId || !transferFormData.toVesselId) return;
    
    transferEquipment(transferModalEqId, transferFormData.toVesselId, transferFormData.notes);
    
    setTransferModalEqId(null);
    setTransferFormData({ toVesselId: '', notes: '' });
  };

  const handlePartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partModalEqId) return;
    const targetEq = equipment.find(eq => eq.id === partModalEqId);
    if (!targetEq) return;

    logPartReplacement({
      equipmentId: targetEq.id,
      equipmentName: targetEq.name,
      partName: partFormData.partName,
      partNumber: partFormData.partNumber,
      qtyReplaced: Number(partFormData.qtyReplaced),
      dateReplaced: partFormData.dateReplaced,
      runningHoursAtChange: targetEq.runningHours || 0,
      replacedBy: partFormData.replacedBy,
      reason: partFormData.reason,
    });

    // Also update / create spare part with expected lifespan
    const existingPart = spareParts.find(p => p.partNumber === partFormData.partNumber);
    if (existingPart) {
      updateSparePart(existingPart.id, {
        installedAtRunningHours: targetEq.runningHours || 0,
        installedDate: partFormData.dateReplaced,
        isCurrentlyInstalled: true,
        expectedLifespanHours: Number(partFormData.expectedLifespanHours || 6000),
        attachments: [...(existingPart.attachments || []), ...partFormData.attachments],
      });
    } else {
      addSparePart({
        vesselId: targetEq.vesselId,
        equipmentId: targetEq.id,
        partName: partFormData.partName,
        partNumber: partFormData.partNumber,
        itemCategory: 'Spare Part (Non-Consumable)',
        stockQty: 1,
        minStockQty: 1,
        unitCostIDR: 1000,
        locationType: 'Ship Storage',
        locationName: 'Engine Room Store',
        conditionStatus: 'Good / Ready',
        installedAtRunningHours: targetEq.runningHours || 0,
        installedDate: partFormData.dateReplaced,
        isCurrentlyInstalled: true,
        expectedLifespanHours: Number(partFormData.expectedLifespanHours || 6000),
        attachments: partFormData.attachments,
      });
    }

    setPartModalEqId(null);
  };

  const handleRunLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!runLogModalEqId) return;
    const targetEq = equipment.find(eq => eq.id === runLogModalEqId);
    if (!targetEq) return;

    logRunSession({
      equipmentId: targetEq.id,
      equipmentName: targetEq.name,
      vesselId: targetEq.vesselId,
      startTime: runFormData.startTime,
      stopTime: runFormData.stopTime,
      hoursCalculated: Number(runFormData.hoursCalculated || 1),
      loggedBy: runFormData.loggedBy,
      purpose: runFormData.purpose,
    });

    setRunLogModalEqId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Global Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-sea-accent" />
            Equipment & Machinery Master Technical Registry
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            {selectedVessel.name} — Machinery tree, manuals, attachments, TBO overhaul counters & spare part life expectancy
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search machinery, S/N, DNV CMS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-ocean-900 border border-ocean-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sea-accent/50"
            />
          </div>

          {activeRole !== 'owner' && (
            <>
              <button
                onClick={() => {
                  const targetVessel = selectedVessel.id === 'all_vessels' ? vessels[0] : selectedVessel;
                  simulateRunningHours(targetVessel.id, 24);
                  alert(`⚡ Simulated +24 hours of engine operation for ${targetVessel.name}. Equipment running hours updated across fleet!`);
                }}
                className="px-3 py-2 rounded-xl bg-sea-amber/10 border border-sea-amber/30 text-sea-amber font-semibold text-xs hover:bg-sea-amber/20 transition flex items-center gap-1.5 shrink-0 font-mono"
                title="Auto-advance machinery running hours by 24h"
              >
                <Zap className="w-4 h-4 text-sea-amber" />
                <span>Simulate +24h Hours</span>
              </button>

              <button
                onClick={openAddModal}
                className="px-4 py-2 rounded-xl bg-sea-accent text-ocean-950 font-semibold text-xs hover:bg-sea-accent/90 transition shadow-lg shadow-sea-accent/15 flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                Register Equipment
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-ocean-900 border border-ocean-800 w-fit">
          <button
            onClick={() => setActiveTab('grid')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'grid' ? 'bg-sea-accent text-ocean-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Machinery Registry ({filteredEquipment.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('replacements')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'replacements' ? 'bg-sea-accent text-ocean-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Spare Parts Replacement Logbook ({filteredReplacements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'sessions' ? 'bg-sea-accent text-ocean-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Running Hours Sessions ({filteredRunSessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('transfers')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'transfers' ? 'bg-sea-accent text-ocean-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Transfers ({filteredTransfers.length})</span>
          </button>
        </div>

        {activeTab === 'grid' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewLayout('grid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition ${
                viewLayout === 'grid' ? 'bg-ocean-800 text-sea-accent border border-sea-accent/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Grid View
            </button>
            <button
              onClick={() => setViewLayout('tree')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition ${
                viewLayout === 'tree' ? 'bg-ocean-800 text-sea-accent border border-sea-accent/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" /> Sub-System Tree
            </button>
            <div className="w-px h-6 bg-ocean-800 mx-2"></div>
            <button
              onClick={() => setPartDisplayMode(prev => prev === 'running_hours' ? 'part_age' : 'running_hours')}
              className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition bg-ocean-800 text-sea-amber border border-ocean-700 hover:bg-ocean-750"
              title="Toggle Part Display Mode"
            >
              <Activity className="w-3.5 h-3.5" /> 
              View: {partDisplayMode === 'running_hours' ? 'Running Hours' : 'Age (Calendar Hrs)'}
            </button>
          </div>
        )}
      </div>

      {activeTab === 'grid' ? (
        <>
          {/* Category Pills & Status Filter Bar */}
          <div className="flex flex-wrap items-center gap-4 pb-2">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-sea-accent text-ocean-950 font-bold shadow-lg shadow-sea-accent/10'
                      : 'bg-ocean-900 border border-ocean-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-slate-400">Status:</span>
              <select 
                value={filterStatus} 
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-ocean-900 border border-ocean-700 rounded-lg px-2 py-1 text-white"
              >
                <option value="All">All</option>
                <option value="Operational">Operational</option>
                <option value="Degraded">Degraded</option>
                <option value="Out of Service">Out of Service</option>
              </select>
            </div>
          </div>

          {/* Empty State Banner if no equipment matches filter */}
          {filteredEquipment.length === 0 ? (
            <div className="glass-panel rounded-2xl p-10 text-center space-y-3 border border-ocean-800">
              <Wrench className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No Equipment Found</h3>
              <p className="text-xs text-slate-400 font-mono">
                {selectedCategory !== 'All' 
                  ? `No machinery registered under "${selectedCategory}" category for ${selectedVessel.name}.`
                  : `No machinery registered for ${selectedVessel.name}.`}
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                {selectedCategory !== 'All' && (
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className="px-3.5 py-1.5 rounded-xl bg-ocean-800 hover:bg-ocean-750 text-sea-accent text-xs font-semibold transition"
                  >
                    View All Categories
                  </button>
                )}
                {activeRole !== 'owner' && (
                  <button
                    onClick={openAddModal}
                    className="px-4 py-2 rounded-xl bg-sea-accent text-ocean-950 font-bold text-xs hover:bg-sea-accent/90 transition"
                  >
                    + Register First Equipment Unit
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Equipment Cards Grid / Tree */
            <div className={viewLayout === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
              {filteredEquipment.map(eq => {
                const eqVessel = vessels.find(v => v.id === eq.vesselId);
                const parentEq = eq.parentId ? equipment.find(p => p.id === eq.parentId) : null;
                const installedParts = spareParts.filter(sp => sp.equipmentId === eq.id && sp.isCurrentlyInstalled);

                // TSOH vs TBO Overhaul Counter Calculation
                const tbo = eq.tboHours || 12000;
                const lastOverhaulHrs = eq.lastOverhaulHours || eq.initialRunningHours || 0;
                const tsoh = Math.max(0, (eq.runningHours || 0) - lastOverhaulHrs);
                const tsohPercent = Math.min(100, Math.round((tsoh / tbo) * 100));
                const isOverhaulOverdue = tsoh >= tbo;

                // Daily Operating Rate & Projected Overhaul Date Forecasting
                const eqRunSessions = runSessions.filter(s => s.equipmentId === eq.id);
                const avgDailyHrs = eqRunSessions.length > 0
                  ? Math.round((eqRunSessions.reduce((acc, s) => acc + s.hoursCalculated, 0) / eqRunSessions.length) * 10) / 10
                  : 18;
                const hrsRemainingTbo = Math.max(0, tbo - tsoh);
                const daysRemaining = Math.ceil(hrsRemainingTbo / avgDailyHrs);
                const projectedOverhaulDate = new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                // Linked Jobs & Incidents Count
                const linkedJobs = jobs.filter(j => j.equipmentId === eq.id && j.status !== 'Completed');
                const linkedOverdueJobs = linkedJobs.filter(j => j.status === 'Overdue');
                const linkedIncidents = incidents.filter(i => (i.equipmentId === eq.id) || (i.vesselId === eq.vesselId && i.locationOnboard.toLowerCase().includes((eq.name || '').toLowerCase())));

                return (
                  <div key={eq.id} className={`glass-panel glass-panel-hover rounded-2xl p-5 space-y-4 flex flex-col justify-between border border-ocean-800 ${eq.parentId ? 'ml-0 md:ml-6 border-l-4 border-l-sea-accent' : ''}`}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-ocean-800 text-sea-accent border border-ocean-700 uppercase">
                            {eq.category}
                          </span>
                          {parentEq && (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-ocean-950 text-sea-amber border border-ocean-750 flex items-center gap-1">
                              <FolderTree className="w-3 h-3" /> Sub-System of: {parentEq.name.slice(0, 20)}...
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sea-purple/20 text-sea-purple border border-sea-purple/40 uppercase">
                          {eqVessel?.name || 'Vessel'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white tracking-tight">{eq.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">Maker: {eq.maker} • Model: {eq.model}</p>
                      <p className="text-xs text-slate-400 font-mono">S/N: {eq.serialNumber} • Location: {eq.location}</p>

                      {/* Class CMS & Statutory Regulatory Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1 font-mono text-[10px]">
                        {eq.classCmsCode && (
                          <span className="px-2 py-0.5 rounded bg-sea-accent/10 text-sea-accent border border-sea-accent/20 font-bold">
                            CMS REF: {eq.classCmsCode}
                          </span>
                        )}
                        {eq.solasMarpolTags && eq.solasMarpolTags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded bg-sea-amber/20 text-sea-amber border border-sea-amber/30 font-bold">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Linked Jobs & Safety Incidents Badges */}
                      {(linkedJobs.length > 0 || linkedIncidents.length > 0) && (
                        <div className="flex items-center gap-2 pt-1 font-mono text-[10px]">
                          {linkedJobs.length > 0 && (
                            <span className={`px-2 py-0.5 rounded font-bold flex items-center gap-1 ${
                              linkedOverdueJobs.length > 0 ? 'bg-sea-rose/20 text-sea-rose border border-sea-rose/40' : 'bg-sea-accent/20 text-sea-accent'
                            }`}>
                              <Wrench className="w-3 h-3" /> {linkedJobs.length} Active Job{linkedJobs.length > 1 ? 's' : ''} ({linkedOverdueJobs.length} Overdue)
                            </span>
                          )}
                          {linkedIncidents.length > 0 && (
                            <span className="px-2 py-0.5 rounded bg-sea-rose/20 text-sea-rose border border-sea-rose/40 font-bold flex items-center gap-1">
                              <AlertOctagon className="w-3 h-3" /> {linkedIncidents.length} Incident{linkedIncidents.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      )}

                      {/* TSOH vs TBO Overhaul Counter & Forecasting Card */}
                      <div className="p-3.5 rounded-xl bg-ocean-950/80 border border-ocean-850 space-y-2 font-mono text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">TOTAL RUNNING HOURS</span>
                          <span className="font-bold text-base text-sea-accent">{(eq.runningHours || 0).toLocaleString()} hrs</span>
                        </div>

                        {/* TSOH Overhaul Progress Bar */}
                        <div className="space-y-1 pt-1 border-t border-ocean-850">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">OVERHAUL (TSOH / TBO):</span>
                            <span className={`font-bold ${isOverhaulOverdue ? 'text-sea-rose' : 'text-sea-emerald'}`}>
                              {tsoh.toLocaleString()} / {tbo.toLocaleString()} hrs ({tsohPercent}%)
                            </span>
                          </div>

                          <div className="w-full bg-ocean-900 rounded-full h-2 overflow-hidden border border-ocean-800">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                isOverhaulOverdue ? 'bg-sea-rose animate-pulse' : (tsohPercent >= 80 ? 'bg-sea-amber' : 'bg-sea-emerald')
                              }`}
                              style={{ width: `${tsohPercent}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                            <span>Avg Rate: {avgDailyHrs} hrs/day</span>
                            <span>Proj. Overhaul: <strong className={isOverhaulOverdue ? 'text-sea-rose' : 'text-sea-accent'}>{isOverhaulOverdue ? 'OVERDUE NOW' : projectedOverhaulDate}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Installed Spare Parts Counter & LIFE EXPECTANCY Tracker */}
                      {installedParts.length > 0 && (
                        <div className="p-3 rounded-xl bg-ocean-900 border border-ocean-800 space-y-2 text-xs font-mono">
                          <span className="text-[10px] font-bold text-sea-amber uppercase block flex items-center justify-between">
                            <span>INSTALLED SPARES & LIFE EXPECTANCY</span>
                            <span className="text-[9px] text-slate-400 font-normal">WEAR TRACKER</span>
                          </span>

                          {installedParts.map(part => {
                            let displayValue = 0;
                            let displayLimit = part.expectedLifespanHours || 6000;
                            let displayUnit = 'hrs';
                            
                            if (partDisplayMode === 'part_age') {
                              const installMs = new Date(part.installedDate || new Date()).getTime();
                              const nowMs = new Date().getTime();
                              displayValue = Math.floor(Math.max(0, nowMs - installMs) / (1000 * 60 * 60)); // Calendar hours
                              displayLimit = (part.expectedLifespanDays || (displayLimit / 24)) * 24; // Approximation if days not set
                              displayUnit = 'cal hrs';
                            } else {
                              displayValue = Math.max(0, (eq.runningHours || 0) - (part.installedAtRunningHours || eq.runningHours || 0));
                            }
                            
                            const percentUsed = Math.min(100, Math.round((displayValue / displayLimit) * 100));
                            const isPartOverdue = displayValue >= displayLimit;
                            const isReplaceSoon = percentUsed >= 80 && !isPartOverdue;

                            return (
                              <div key={part.id} className="p-2 rounded-lg bg-ocean-950 border border-ocean-850 space-y-1.5">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-bold text-white">{part.partName}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                    isPartOverdue ? 'bg-sea-rose/20 text-sea-rose border border-sea-rose/40' :
                                    isReplaceSoon ? 'bg-sea-amber/20 text-sea-amber border border-sea-amber/40' :
                                    'bg-sea-emerald/20 text-sea-emerald border border-sea-emerald/40'
                                  }`}>
                                    {isPartOverdue ? 'REPLACE OVERDUE' : (isReplaceSoon ? 'REPLACE SOON' : 'HEALTHY')}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between text-[10px] text-slate-400">
                                  <span>Active: {displayValue.toLocaleString()} {displayUnit}</span>
                                  <span>Lifespan: {Math.round(displayLimit).toLocaleString()} {displayUnit} ({percentUsed}% used)</span>
                                </div>

                                <div className="w-full bg-ocean-900 rounded-full h-1.5 overflow-hidden border border-ocean-800">
                                  <div 
                                    className={`h-full rounded-full ${
                                      isPartOverdue ? 'bg-sea-rose' : (isReplaceSoon ? 'bg-sea-amber' : 'bg-sea-emerald')
                                    }`}
                                    style={{ width: `${percentUsed}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Attachments & Manuals List */}
                      {eq.attachments && eq.attachments.length > 0 && (
                        <div className="p-3 rounded-xl bg-ocean-900 border border-ocean-800 space-y-1.5 text-xs font-mono">
                          <span className="text-[10px] font-bold text-sea-accent uppercase block">TECHNICAL DOCUMENTS & MANUALS ({eq.attachments.length})</span>
                          <div className="space-y-1">
                            {eq.attachments.map(att => (
                              <div key={att.id} className="flex items-center justify-between text-[11px] p-1.5 rounded bg-ocean-950 border border-ocean-850">
                                <div className="flex items-center gap-2 overflow-hidden">
                                  {att.type === 'pdf' ? <FileText className="w-3.5 h-3.5 text-sea-rose shrink-0" /> : <ImageIcon className="w-3.5 h-3.5 text-sea-accent shrink-0" />}
                                  <span className="truncate text-slate-200">{att.name}</span>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  {att.type === 'image' ? (
                                    <button
                                      onClick={() => setLightboxImage(att.url)}
                                      className="px-2 py-0.5 rounded bg-sea-accent/20 text-sea-accent text-[10px] font-bold hover:bg-sea-accent/30 transition flex items-center gap-1"
                                    >
                                      <Eye className="w-3 h-3" /> View
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setActivePdfUrl({ name: att.name, url: att.url })}
                                      className="px-2 py-0.5 rounded bg-sea-rose/20 text-sea-rose text-[10px] font-bold hover:bg-sea-rose/30 transition flex items-center gap-1"
                                    >
                                      <FileText className="w-3 h-3" /> Open PDF
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-ocean-800 space-y-2">
                      {activeRole !== 'owner' && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => setDiagnosticTrendEq(eq)}
                            className="px-2.5 py-1.5 rounded-lg bg-sea-accent/10 border border-sea-accent/30 text-sea-accent text-xs font-bold hover:bg-sea-accent/20 transition flex items-center gap-1 font-mono"
                            title="View historical vibration & temperature trend graph"
                          >
                            <TrendingUp className="w-3.5 h-3.5" /> Trend Graph
                          </button>

                          <button
                            onClick={() => {
                              setRunLogModalEqId(eq.id);
                              setRunFormData(prev => ({ ...prev, startTime: new Date().toISOString().slice(0, 16).replace('T', ' ') }));
                            }}
                            className="flex-1 py-1.5 rounded-xl bg-ocean-900 hover:bg-ocean-850 border border-ocean-700 text-sea-accent text-xs font-semibold transition flex items-center justify-center gap-1"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Log Hours</span>
                          </button>

                          <button
                            onClick={() => setPartModalEqId(eq.id)}
                            className="flex-1 py-1.5 rounded-xl bg-sea-accent hover:bg-sea-accent/90 text-ocean-950 font-bold text-xs transition flex items-center justify-center gap-1"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            <span>Install Spare</span>
                          </button>

                          {eq.isPortable && (
                            <button
                              onClick={() => setTransferModalEqId(eq.id)}
                              className="flex-1 py-1.5 rounded-xl bg-sea-amber hover:bg-sea-amber/90 text-ocean-950 font-bold text-xs transition flex items-center justify-center gap-1"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              <span>Transfer</span>
                            </button>
                          )}

                          <button
                            onClick={() => openEditModal(eq)}
                            className="p-1.5 rounded-xl bg-ocean-800 hover:bg-ocean-750 text-sea-accent border border-ocean-700 text-xs transition flex items-center justify-center"
                            title="Edit Equipment"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete equipment "${eq.name}"?`)) {
                                deleteEquipment(eq.id);
                              }
                            }}
                            className="p-1.5 rounded-xl bg-sea-rose/10 hover:bg-sea-rose/20 text-sea-rose border border-sea-rose/30 text-xs transition flex items-center justify-center"
                            title="Delete Equipment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : activeTab === 'replacements' ? (
        /* Spare Parts Replacement Logbook Tab */
        <div className="space-y-3 font-mono text-xs">
          {filteredReplacements.length === 0 ? (
            <div className="p-8 text-center text-slate-400 glass-panel rounded-2xl border border-ocean-800">
              No spare part replacement logs recorded.
            </div>
          ) : (
            filteredReplacements.map(rep => (
              <div key={rep.id} className="p-4 rounded-xl bg-ocean-900 border border-ocean-800 space-y-2 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-sm">{rep.partName} (P/N: {rep.partNumber})</span>
                    <span className="text-sea-emerald font-bold">Replaced: {rep.dateReplaced}</span>
                  </div>
                  <p className="text-slate-300">Installed On: <strong>{rep.equipmentName}</strong> at <strong>{(rep.runningHoursAtChange || 0).toLocaleString()} hrs</strong></p>
                  <p className="text-slate-400 italic bg-ocean-950 p-2.5 rounded-lg font-sans">"{rep.reason}" — Replaced by {rep.replacedBy}</p>
                </div>

                {activeRole !== 'owner' && (
                  <button
                    onClick={() => {
                      if (confirm(`Delete replacement log for "${rep.partName}"?`)) {
                        deleteReplacementRecord(rep.id);
                      }
                    }}
                    className="p-2 rounded-lg bg-sea-rose/10 hover:bg-sea-rose/20 text-sea-rose border border-sea-rose/30"
                    title="Delete Log Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      ) : activeTab === 'sessions' ? (
        /* Running Sessions Log Tab */
        <div className="space-y-3 font-mono text-xs">
          {filteredRunSessions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 glass-panel rounded-2xl border border-ocean-800">
              No operating hours sessions logged yet.
            </div>
          ) : (
            filteredRunSessions.map(session => (
              <div key={session.id} className="p-4 rounded-xl bg-ocean-900 border border-ocean-800 space-y-2 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-sm">{session.equipmentName}</span>
                    <span className="text-sea-accent font-bold">+{session.hoursCalculated} hrs</span>
                  </div>
                  <p className="text-slate-300">Time: {session.startTime} to {session.stopTime} • Logged by: <strong>{session.loggedBy}</strong></p>
                  <p className="text-slate-400 font-sans">Purpose: "{session.purpose}"</p>
                </div>

                {activeRole !== 'owner' && (
                  <button
                    onClick={() => {
                      if (confirm(`Delete running session for "${session.equipmentName}"?`)) {
                        deleteRunSession(session.id);
                      }
                    }}
                    className="p-2 rounded-lg bg-sea-rose/10 hover:bg-sea-rose/20 text-sea-rose border border-sea-rose/30"
                    title="Delete Session Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      ) : activeTab === 'transfers' ? (
        /* Transfer History Log Tab */
        <div className="space-y-3 font-mono text-xs">
          {filteredTransfers.length === 0 ? (
            <div className="p-8 text-center text-slate-400 glass-panel rounded-2xl border border-ocean-800">
              No equipment transfer logs recorded.
            </div>
          ) : (
            filteredTransfers.map(transfer => {
              const targetEq = equipment.find(e => e.id === transfer.equipmentId);
              const fromVessel = vessels.find(v => v.id === transfer.fromVesselId)?.name || transfer.fromVesselId;
              const toVessel = vessels.find(v => v.id === transfer.toVesselId)?.name || transfer.toVesselId;

              return (
                <div key={transfer.id} className="p-4 rounded-xl bg-ocean-900 border border-ocean-800 space-y-2 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white text-sm">{targetEq?.name || 'Unknown Asset'}</span>
                      <span className="text-sea-accent font-bold">Transferred: {new Date(transfer.date).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-300">
                      From: <strong className="text-sea-amber">{fromVessel}</strong> → To: <strong className="text-sea-emerald">{toVessel}</strong>
                    </p>
                    <p className="text-slate-400 font-sans">Notes: "{transfer.notes || 'N/A'}" • Logged by: {transfer.transferredBy}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : null}

      {/* Lightbox Modal for Photo Attachments */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-ocean-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] space-y-2">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 text-white bg-ocean-800 hover:bg-sea-rose p-2 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={lightboxImage} alt="Attachment Preview" className="max-w-full max-h-[85vh] rounded-2xl border border-ocean-700 object-contain shadow-2xl" />
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {activePdfUrl && (
        <div className="fixed inset-0 z-50 bg-ocean-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-4xl rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl h-[85vh] flex flex-col font-sans">
            <div className="flex items-center justify-between border-b border-ocean-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2 font-mono">
                <FileText className="w-5 h-5 text-sea-rose" />
                PDF Document: {activePdfUrl.name}
              </h3>
              <button onClick={() => setActivePdfUrl(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 bg-ocean-900 rounded-xl overflow-hidden border border-ocean-800 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <FileText className="w-16 h-16 text-sea-rose animate-bounce" />
              <div className="space-y-1">
                <h4 className="font-bold text-white text-lg">{activePdfUrl.name}</h4>
                <p className="text-xs text-slate-400 font-mono">Technical Document / Manual PDF Attachment</p>
              </div>

              <a
                href={activePdfUrl.url}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-2.5 rounded-xl bg-sea-accent text-ocean-950 font-bold text-xs hover:bg-sea-accent/90 transition shadow-lg flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" /> Open Document in Browser PDF Reader
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Log Running Hours Session Modal */}
      {runLogModalEqId && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-sea-accent" />
              Log Machinery Operation Running Session
            </h2>

            <form onSubmit={handleRunLogSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Calculated Operating Hours *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={runFormData.hoursCalculated}
                  onChange={e => setRunFormData({ ...runFormData, hoursCalculated: Number(e.target.value) })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Watch Engineer (Point & Click) *</label>
                <select
                  value={runFormData.loggedBy}
                  onChange={e => setRunFormData({ ...runFormData, loggedBy: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                >
                  {crewMembers.filter(c => c.status === 'Onboard' && c.currentVesselId === equipment.find(eq => eq.id === runLogModalEqId)?.vesselId).map(c => (
                      <option key={c.id} value={`${c.rank} ${c.fullName}`}>{c.rank} {c.fullName}</option>
                    ))}
                    <option value="Shore Service Specialist">Shore Service Specialist</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Operation Purpose / Remarks</label>
                <input
                  type="text"
                  value={runFormData.purpose}
                  onChange={e => setRunFormData({ ...runFormData, purpose: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ocean-800">
                <button
                  type="button"
                  onClick={() => setRunLogModalEqId(null)}
                  className="px-4 py-2 rounded-lg bg-ocean-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sea-accent text-ocean-950 font-bold"
                >
                  Add Running Hours
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Install Spare Part Modal with LIFE EXPECTANCY & ATTACHMENT Upload */}
      {partModalEqId && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl max-h-[90vh] overflow-y-auto font-sans">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-sea-accent" />
              Log Spare Part Installation & Life Expectancy
            </h2>

            <form onSubmit={handlePartSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Part Name *</label>
                <input
                  type="text"
                  required
                  value={partFormData.partName}
                  onChange={e => setPartFormData({ ...partFormData, partName: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Part Number (P/N)</label>
                  <input
                    type="text"
                    value={partFormData.partNumber}
                    onChange={e => setPartFormData({ ...partFormData, partNumber: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono text-sea-amber font-bold">Expected Lifespan (Hours) *</label>
                  <input
                    type="number"
                    required
                    value={partFormData.expectedLifespanHours}
                    onChange={e => setPartFormData({ ...partFormData, expectedLifespanHours: Number(e.target.value) })}
                    className="w-full bg-ocean-900 border border-sea-amber/40 rounded-lg px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Replaced By Engineer (Point & Click) *</label>
                <select
                  value={partFormData.replacedBy}
                  onChange={e => setPartFormData({ ...partFormData, replacedBy: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                >
                  {crewMembers.filter(c => c.status === 'Onboard' && c.currentVesselId === equipment.find(eq => eq.id === partModalEqId)?.vesselId).map(c => (
                      <option key={c.id} value={`${c.rank} ${c.fullName}`}>{c.rank} {c.fullName}</option>
                    ))}
                    <option value="External Service Specialist">External Service Specialist</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Replacement Rationale / Remarks</label>
                <textarea
                  rows={2}
                  value={partFormData.reason}
                  onChange={e => setPartFormData({ ...partFormData, reason: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              {/* Spare Part File Attachment Uploader */}
              <div className="p-3 rounded-xl bg-ocean-900 border border-ocean-800 space-y-2">
                <label className="block text-sea-accent font-bold font-mono">Attach Drawing or Spec Sheet (Image/PDF)</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={e => handleFileUpload(e, false)}
                  className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sea-accent file:text-ocean-950 hover:file:bg-sea-accent/90"
                />
                {partFormData.attachments.length > 0 && (
                  <div className="text-[10px] text-slate-300 font-mono">
                    {partFormData.attachments.length} file(s) ready to attach.
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ocean-800">
                <button
                  type="button"
                  onClick={() => setPartModalEqId(null)}
                  className="px-4 py-2 rounded-lg bg-ocean-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sea-accent text-ocean-950 font-bold"
                >
                  Log Replacement & Track Wear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Equipment Modal with Hierarchy, TBO, Regulatory Tags & Attachments */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl max-h-[90vh] overflow-y-auto font-sans">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-sea-accent" />
              {editingEquipmentId ? 'Edit Machinery / Equipment Unit' : 'Register New Machinery / Equipment Unit'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Equipment Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Auxiliary Engine No. 3"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Sub-System Hierarchy (Parent Equipment)</label>
                  <select
                    value={formData.parentId}
                    onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">Top-Level Main Machinery (No Parent)</option>
                    {equipment.filter(eq => eq.id !== editingEquipmentId).map(eq => (
                      <option key={eq.id} value={eq.id}>Sub-System of: {eq.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as EquipmentCategory })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Criticality Level</label>
                  <select
                    value={formData.criticality}
                    onChange={e => setFormData({ ...formData, criticality: e.target.value as any })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="High">High Criticality</option>
                    <option value="Medium">Medium Criticality</option>
                    <option value="Low">Low Criticality</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Maker / Manufacturer</label>
                  <input
                    type="text"
                    value={formData.maker}
                    onChange={e => setFormData({ ...formData, maker: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Model / Spec</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Serial Number (S/N)</label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Current Running Hours</label>
                  <input
                    type="number"
                    value={formData.runningHours}
                    onChange={e => setFormData({ ...formData, runningHours: Number(e.target.value) })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono text-sea-accent">TBO Interval (Hours) *</label>
                  <input
                    type="number"
                    value={formData.tboHours}
                    onChange={e => setFormData({ ...formData, tboHours: Number(e.target.value) })}
                    className="w-full bg-ocean-900 border border-sea-accent/40 rounded-lg px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Class CMS Item Code</label>
                  <input
                    type="text"
                    placeholder="e.g. DNV-CMS-110.01"
                    value={formData.classCmsCode}
                    onChange={e => setFormData({ ...formData, classCmsCode: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">SOLAS / MARPOL Tags (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="SOLAS Emergency, MARPOL Annex VI"
                    value={formData.solasMarpolTags}
                    onChange={e => setFormData({ ...formData, solasMarpolTags: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Linked Auto-Logging Ship States (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="Sailing, Shifting, Loading, Discharge, Bunkering"
                  value={formData.linkedVesselStates}
                  onChange={e => setFormData({ ...formData, linkedVesselStates: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  title="When the vessel enters these states, it will automatically log running hours for this equipment."
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="isPortable"
                  checked={formData.isPortable}
                  onChange={e => setFormData({ ...formData, isPortable: e.target.checked })}
                  className="w-4 h-4 bg-ocean-900 border-ocean-700 rounded text-sea-accent focus:ring-sea-accent"
                />
                <label htmlFor="isPortable" className="text-sm text-slate-300 font-mono">
                  This is a Portable Asset (Can be transferred between vessels or storage)
                </label>
              </div>

              {/* Document & Manual Upload Dropzone */}
              <div className="p-3.5 rounded-xl bg-ocean-900 border border-ocean-800 space-y-2 font-mono">
                <label className="block text-sea-accent font-bold">Attach Operating Manuals & Drawings (Images / PDFs)</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={e => handleFileUpload(e, true)}
                  className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sea-accent file:text-ocean-950 hover:file:bg-sea-accent/90 cursor-pointer"
                />

                {formData.attachments.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Attachments:</span>
                    {formData.attachments.map(att => (
                      <div key={att.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-ocean-950 border border-ocean-850">
                        <span className="text-white truncate">{att.name}</span>
                        <button
                          type="button"
                          onClick={() => removeEquipmentAttachment(att.id)}
                          className="text-sea-rose hover:underline text-[11px]"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ocean-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-ocean-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sea-accent text-ocean-950 font-bold"
                >
                  {editingEquipmentId ? 'Save Changes' : 'Save Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Diagnostic Trend Chart Modal */}
      {diagnosticTrendEq && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-xl rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl font-sans">
            <div className="flex items-center justify-between border-b border-ocean-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                  <TrendingUp className="w-5 h-5 text-sea-accent" />
                  Diagnostic Condition Trend — {diagnosticTrendEq.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono">S/N: {diagnosticTrendEq.serialNumber} • Location: {diagnosticTrendEq.location}</p>
              </div>
              <button onClick={() => setDiagnosticTrendEq(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-ocean-950 border border-ocean-850 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">CURRENT VIBRATION</span>
                  <span className="text-lg font-bold text-sea-amber block flex items-center gap-1">
                    <Activity className="w-4 h-4" /> {diagnosticTrendEq.diagnostics?.vibrationMms || 2.8} mm/s RMS
                  </span>
                  <span className="text-[10px] text-slate-400">ISO 10816 Alarm Threshold: 4.5 mm/s</span>
                </div>

                <div className="p-3 rounded-xl bg-ocean-950 border border-ocean-850 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">BEARING TEMP (°C)</span>
                  <span className="text-lg font-bold text-sea-rose block flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-sea-rose" /> {diagnosticTrendEq.diagnostics?.bearingTempC || 64} °C
                  </span>
                  <span className="text-[10px] text-slate-400">High Temp Alarm Threshold: 75°C</span>
                </div>
              </div>

              {/* HISTORICAL TREND GRAPH SIMULATION BARS */}
              <div className="p-4 rounded-xl bg-ocean-950 border border-ocean-850 space-y-3">
                <span className="text-[11px] font-bold text-white uppercase block">Historical Diagnostic Trend (Last 30 Days)</span>

                {(diagnosticTrendEq.diagnosticHistory || [
                  { date: '2026-07-01', vibrationMMS: 2.1, bearingTempC: 58 },
                  { date: '2026-07-07', vibrationMMS: 2.3, bearingTempC: 60 },
                  { date: '2026-07-14', vibrationMMS: 2.5, bearingTempC: 62 },
                  { date: '2026-07-21', vibrationMMS: 2.8, bearingTempC: 64 },
                ]).map((pt, i) => (
                  <div key={i} className="space-y-1 text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Log Date: {pt.date}</span>
                      <span>Vibration: <strong className="text-sea-amber">{pt.vibrationMMS} mm/s</strong> | Temp: <strong className="text-sea-rose">{pt.bearingTempC}°C</strong></span>
                    </div>

                    <div className="w-full bg-ocean-900 rounded-full h-2 overflow-hidden flex gap-1">
                      <div className="h-full bg-sea-amber rounded-full" style={{ width: `${(pt.vibrationMMS / 5.0) * 100}%` }} />
                      <div className="h-full bg-sea-rose rounded-full" style={{ width: `${(pt.bearingTempC / 80) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2 border-t border-ocean-800">
                <button
                  onClick={() => setDiagnosticTrendEq(null)}
                  className="px-4 py-2 rounded-xl bg-ocean-800 hover:bg-ocean-750 text-slate-200"
                >
                  Close Diagnostic Chart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Asset Modal */}
      {transferModalEqId && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex items-center justify-between border-b border-ocean-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-sea-amber" />
                Transfer Portable Asset
              </h3>
              <button onClick={() => setTransferModalEqId(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div className="p-3 bg-ocean-900 border border-ocean-800 rounded-lg text-sm text-slate-300">
                You are transferring: <strong>{equipment.find(e => e.id === transferModalEqId)?.name}</strong>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-sm">Destination</label>
                <select
                  required
                  value={transferFormData.toVesselId}
                  onChange={e => setTransferFormData({ ...transferFormData, toVesselId: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Select Destination</option>
                  <option value="Land Storage">Land Storage</option>
                  {vessels.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-sm">Transfer Notes</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Reason for transfer, condition, received by..."
                  value={transferFormData.notes}
                  onChange={e => setTransferFormData({ ...transferFormData, notes: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ocean-800">
                <button
                  type="button"
                  onClick={() => setTransferModalEqId(null)}
                  className="px-4 py-2 rounded-lg bg-ocean-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sea-amber text-ocean-950 font-bold"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default EquipmentRegistry;
