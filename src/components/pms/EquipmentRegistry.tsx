import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Equipment, EquipmentCategory } from '../../types';
import { 
  Wrench, Plus, Layers, AlertTriangle, ShieldCheck, CheckCircle2, 
  Search, Clock, Play, History, Filter, Ship, MapPin, Edit3, Trash2, RefreshCw
} from 'lucide-react';

export const EquipmentRegistry: React.FC = () => {
  const { vessels, selectedVessel, equipment, addEquipment, updateEquipment, deleteEquipment, spareParts, replacementHistory, logPartReplacement, deleteReplacementRecord, runSessions, logRunSession, deleteRunSession, activeRole } = useApp();
  
  const [activeTab, setActiveTab] = useState<'grid' | 'replacements' | 'sessions'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEquipmentId, setEditingEquipmentId] = useState<string | null>(null);

  const [partModalEqId, setPartModalEqId] = useState<string | null>(null);
  const [runLogModalEqId, setRunLogModalEqId] = useState<string | null>(null);

  // Forms
  const [formData, setFormData] = useState({
    name: '',
    category: 'Main Propulsion' as EquipmentCategory,
    maker: 'MAN Energy Solutions',
    model: '6S50ME-C',
    serialNumber: 'ME-99102',
    location: 'Engine Room Bottom Platform',
    initialRunningHours: 10000,
    runningHours: 10000,
    criticality: 'High' as Equipment['criticality'],
    lastOverhaulDate: new Date().toISOString().split('T')[0],
    status: 'Operational' as Equipment['status'],
  });

  const [partFormData, setPartFormData] = useState({
    partName: 'Cylinder No. 1 Fuel Injector Nozzle',
    partNumber: 'MAN-FIN-50ME',
    qtyReplaced: 1,
    dateReplaced: new Date().toISOString().split('T')[0],
    replacedBy: activeRole === 'chief_engineer' ? 'Chief Engineer H. Vance' : '2nd Engineer M. Kowalski',
    reason: 'Preventive replacement at 12,000 running hours interval.',
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
    'Safety & Firefighting'
  ];

  const isAllVessels = selectedVessel.id === 'all_vessels';
  const targetVesselId = isAllVessels ? undefined : selectedVessel.id;

  const filteredEquipment = equipment.filter(eq => {
    const matchesVessel = !targetVesselId || eq.vesselId === targetVesselId;
    const matchesCategory = selectedCategory === 'All' || eq.category === selectedCategory;
    const matchesSearch = (eq.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (eq.maker || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (eq.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (eq.serialNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesVessel && matchesCategory && matchesSearch;
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

  const openAddModal = () => {
    setEditingEquipmentId(null);
    setFormData({
      name: '',
      category: 'Main Propulsion',
      maker: 'MAN Energy Solutions',
      model: '6S50ME-C',
      serialNumber: 'ME-99102',
      location: 'Engine Room Bottom Platform',
      initialRunningHours: 10000,
      runningHours: 10000,
      criticality: 'High',
      lastOverhaulDate: new Date().toISOString().split('T')[0],
      status: 'Operational',
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (eq: Equipment) => {
    setEditingEquipmentId(eq.id);
    setFormData({
      name: eq.name,
      category: eq.category,
      maker: eq.maker,
      model: eq.model,
      serialNumber: eq.serialNumber,
      location: eq.location,
      initialRunningHours: eq.initialRunningHours || 0,
      runningHours: eq.runningHours || 0,
      criticality: eq.criticality,
      lastOverhaulDate: eq.lastOverhaulDate,
      status: eq.status,
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEquipmentId) {
      updateEquipment(editingEquipmentId, {
        name: formData.name,
        category: formData.category,
        maker: formData.maker,
        model: formData.model,
        serialNumber: formData.serialNumber,
        location: formData.location,
        runningHours: Number(formData.runningHours || 0),
        criticality: formData.criticality,
        lastOverhaulDate: formData.lastOverhaulDate,
        status: formData.status,
      });
    } else {
      addEquipment({
        ...formData,
        vesselId: selectedVessel.id === 'all_vessels' ? vessels[0].id : selectedVessel.id,
      });
    }
    setIsAddModalOpen(false);
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
            {selectedVessel.name} — Full machinery tree, maker specs, serial numbers & spare parts history
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search machinery, maker, S/N..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-ocean-900 border border-ocean-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sea-accent/50"
            />
          </div>

          {activeRole !== 'owner' && (
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-sea-accent text-ocean-950 font-semibold text-xs hover:bg-sea-accent/90 transition shadow-lg shadow-sea-accent/15 flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Register Equipment
            </button>
          )}
        </div>
      </div>

      {/* Tabs & View Controls */}
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
      </div>

      {activeTab === 'grid' ? (
        <>
          {/* Category Pills Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
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
            /* Equipment Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEquipment.map(eq => {
                const eqVessel = vessels.find(v => v.id === eq.vesselId);
                const installedParts = spareParts.filter(sp => sp.equipmentId === eq.id && sp.isCurrentlyInstalled);

                return (
                  <div key={eq.id} className="glass-panel glass-panel-hover rounded-2xl p-5 space-y-4 flex flex-col justify-between border border-ocean-800">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-ocean-800 text-sea-accent border border-ocean-700 uppercase">
                          {eq.category}
                        </span>

                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sea-purple/20 text-sea-purple border border-sea-purple/40 uppercase">
                          {eqVessel?.name || 'Vessel'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white tracking-tight">{eq.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">Maker: {eq.maker} • Model: {eq.model}</p>
                      <p className="text-xs text-slate-400 font-mono">S/N: {eq.serialNumber} • Location: {eq.location}</p>

                      {/* Running Hours Card */}
                      <div className="p-3.5 rounded-xl bg-ocean-950/80 border border-ocean-850 space-y-1 font-mono">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">TOTAL RUNNING HOURS</span>
                          <span className="font-bold text-base text-sea-accent">{(eq.runningHours || 0).toLocaleString()} hrs</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Initial counter: {(eq.initialRunningHours || 0).toLocaleString()} hrs</span>
                          <span>Status: <strong className="text-sea-emerald">{eq.status}</strong></span>
                        </div>
                      </div>

                      {/* Installed Spare Parts Running Hours Counter */}
                      {installedParts.length > 0 && (
                        <div className="p-3 rounded-xl bg-ocean-900 border border-ocean-800 space-y-1.5 text-xs font-mono">
                          <span className="text-[10px] font-bold text-sea-amber uppercase block">INSTALLED SPARE PARTS COUNTER</span>
                          {installedParts.map(part => {
                            const hoursInstalled = (eq.runningHours || 0) - (part.installedAtRunningHours || eq.runningHours || 0);
                            return (
                              <div key={part.id} className="flex items-center justify-between text-[11px] text-slate-300 border-b border-ocean-850 pb-1">
                                <span>{part.partName}</span>
                                <span className="font-bold text-sea-emerald">{hoursInstalled} hrs active</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-ocean-800 space-y-2">
                      {activeRole !== 'owner' && (
                        <div className="flex items-center gap-2">
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
      ) : (
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
                <label className="block text-slate-400 mb-1">Watch Engineer *</label>
                <input
                  type="text"
                  required
                  value={runFormData.loggedBy}
                  onChange={e => setRunFormData({ ...runFormData, loggedBy: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
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

      {/* Install Spare Part Modal */}
      {partModalEqId && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-sea-accent" />
              Log Spare Part Installation
            </h2>

            <form onSubmit={handlePartSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Part Name *</label>
                <input
                  type="text"
                  required
                  value={partFormData.partName}
                  onChange={e => setPartFormData({ ...partFormData, partName: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Part Number (P/N)</label>
                <input
                  type="text"
                  value={partFormData.partNumber}
                  onChange={e => setPartFormData({ ...partFormData, partNumber: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Quantity Installed</label>
                <input
                  type="number"
                  value={partFormData.qtyReplaced}
                  onChange={e => setPartFormData({ ...partFormData, qtyReplaced: Number(e.target.value) })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Replaced By</label>
                <input
                  type="text"
                  value={partFormData.replacedBy}
                  onChange={e => setPartFormData({ ...partFormData, replacedBy: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Replacement Reason</label>
                <textarea
                  rows={2}
                  value={partFormData.reason}
                  onChange={e => setPartFormData({ ...partFormData, reason: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
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
                  Log Replacement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Equipment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-sea-accent" />
              {editingEquipmentId ? 'Edit Machinery / Equipment Unit' : 'Register New Machinery / Equipment Unit'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Equipment Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Auxiliary Engine No. 3"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Category</label>
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
                  <label className="block text-slate-400 mb-1">Criticality Level</label>
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
                  <label className="block text-slate-400 mb-1">Maker / Manufacturer</label>
                  <input
                    type="text"
                    value={formData.maker}
                    onChange={e => setFormData({ ...formData, maker: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Model / Spec</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Serial Number (S/N)</label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Running Hours Counter</label>
                  <input
                    type="number"
                    value={formData.runningHours}
                    onChange={e => setFormData({ ...formData, runningHours: Number(e.target.value) })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Location Onboard</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Operational Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Operational">Operational</option>
                    <option value="Requires Service">Requires Service</option>
                    <option value="Critical Repair">Critical Repair</option>
                  </select>
                </div>
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
    </div>
  );
};
