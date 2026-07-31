import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from './Sidebar';
import { Vessel } from '../types';
import { 
  Ship, Wrench, CalendarCheck, ShieldAlert, ShoppingCart, 
  Users, BarChart3, ChevronDown, ChevronUp, Search, Compass, Activity, ArrowUpRight,
  Plus, Edit3, Trash2, XCircle
} from 'lucide-react';

interface OverviewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const Overview: React.FC<OverviewProps> = ({ setActiveTab }) => {
  const { 
    selectedVessel, vessels, equipment, jobs, requisitions, crewMembers, incidents, drydockProjects,
    addVessel, updateVessel, deleteVessel, updateConsumptionRates, setSelectedVesselId, activeRole 
  } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isDimensionsMinimized, setIsDimensionsMinimized] = useState(false);

  // Vessel Add/Edit Modal State
  const [isVesselModalOpen, setIsVesselModalOpen] = useState(false);
  const [editingVesselId, setEditingVesselId] = useState<string | null>(null);

  // Fuel Rates Modal State
  const [isRatesModalOpen, setIsRatesModalOpen] = useState(false);
  const [ratesFormData, setRatesFormData] = useState({
    sailing: 280,
    shifting: 220,
    waiting: 27,
    loading: 27,
    discharge: 135,
    bunkering: 0,
  });

  const [vesselFormData, setVesselFormData] = useState({
    name: '',
    imoNumber: '',
    flag: 'Panama (PA)',
    vesselType: 'Container Ship',
    builtYear: 2020,
    classSociety: 'DNV',
    status: 'At Sea' as Vessel['status'],
    currentLocation: 'Pacific Trade Route',
    totalRunningHours: 25000,
    loaMeters: 220,
    beamMeters: 32,
    draftMeters: 11.5,
    dwtTons: 45000,
    enginePowerKW: 18500,
    cargoCapacityM3: 58000,
  });

  const isAllVessels = selectedVessel.id === 'all_vessels';
  const targetVesselId = isAllVessels ? undefined : selectedVessel.id;

  const filteredEquipment = equipment.filter(eq => (!targetVesselId || eq.vesselId === targetVesselId) && (eq.name.toLowerCase().includes(searchTerm.toLowerCase()) || eq.maker.toLowerCase().includes(searchTerm.toLowerCase())));
  const filteredJobs = jobs.filter(j => (!targetVesselId || j.vesselId === targetVesselId) && (j.title.toLowerCase().includes(searchTerm.toLowerCase()) || j.equipmentName.toLowerCase().includes(searchTerm.toLowerCase())));
  const filteredCrew = crewMembers.filter(c => (!targetVesselId || c.currentVesselId === targetVesselId) && (c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || c.rank.toLowerCase().includes(searchTerm.toLowerCase())));
  const filteredIncidents = incidents.filter(i => (!targetVesselId || i.vesselId === targetVesselId) && (i.title.toLowerCase().includes(searchTerm.toLowerCase()) || i.description.toLowerCase().includes(searchTerm.toLowerCase())));

  const overdueJobs = jobs.filter(j => (!targetVesselId || j.vesselId === targetVesselId) && j.status === 'Overdue');
  const activeRequisitions = requisitions.filter(r => (!targetVesselId || r.vesselId === targetVesselId) && r.status !== 'Delivered & Received');
  const onboardCrew = crewMembers.filter(c => (!targetVesselId || c.currentVesselId === targetVesselId) && c.status === 'Onboard');

  const dims = selectedVessel.dimensions;

  const openAddVesselModal = () => {
    setEditingVesselId(null);
    setVesselFormData({
      name: '',
      imoNumber: `IMO-${Math.floor(9000000 + Math.random() * 999999)}`,
      flag: 'Panama (PA)',
      vesselType: 'Container Ship',
      builtYear: 2021,
      classSociety: 'DNV',
      status: 'At Sea',
      currentLocation: 'Malacca Strait',
      totalRunningHours: 18000,
      loaMeters: 210,
      beamMeters: 30,
      draftMeters: 10.8,
      dwtTons: 40000,
      enginePowerKW: 16000,
      cargoCapacityM3: 52000,
    });
    setIsVesselModalOpen(true);
  };

  const openEditVesselModal = () => {
    if (isAllVessels) return;
    setEditingVesselId(selectedVessel.id);
    setVesselFormData({
      name: selectedVessel.name,
      imoNumber: selectedVessel.imoNumber,
      flag: selectedVessel.flag,
      vesselType: selectedVessel.vesselType,
      builtYear: selectedVessel.builtYear,
      classSociety: selectedVessel.classSociety,
      status: selectedVessel.status,
      currentLocation: selectedVessel.currentLocation,
      totalRunningHours: selectedVessel.totalRunningHours || 20000,
      loaMeters: dims ? dims.loaMeters : 220,
      beamMeters: dims ? dims.beamMeters : 32,
      draftMeters: dims ? dims.draftMeters : 11.5,
      dwtTons: dims ? dims.dwtTons : 45000,
      enginePowerKW: dims ? dims.enginePowerKW : 18500,
      cargoCapacityM3: dims ? dims.cargoCapacityM3 : 58000,
    });
    setIsVesselModalOpen(true);
  };

  const handleDeleteVessel = () => {
    if (isAllVessels) return;
    if (confirm(`Are you sure you want to delete ship "${selectedVessel.name}" (IMO: ${selectedVessel.imoNumber}) from the fleet registry?`)) {
      deleteVessel(selectedVessel.id);
    }
  };

  const handleVesselSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dimensions = {
      loaMeters: Number(vesselFormData.loaMeters),
      beamMeters: Number(vesselFormData.beamMeters),
      draftMeters: Number(vesselFormData.draftMeters),
      dwtTons: Number(vesselFormData.dwtTons),
      enginePowerKW: Number(vesselFormData.enginePowerKW),
      cargoCapacityM3: Number(vesselFormData.cargoCapacityM3),
    };

    if (editingVesselId) {
      updateVessel(editingVesselId, {
        name: vesselFormData.name,
        imoNumber: vesselFormData.imoNumber,
        flag: vesselFormData.flag,
        vesselType: vesselFormData.vesselType,
        builtYear: Number(vesselFormData.builtYear),
        classSociety: vesselFormData.classSociety,
        status: vesselFormData.status,
        currentLocation: vesselFormData.currentLocation,
        totalRunningHours: Number(vesselFormData.totalRunningHours),
        dimensions,
      });
    } else {
      const newVesselId = `vessel-${Date.now()}`;
      addVessel({
        name: vesselFormData.name,
        imoNumber: vesselFormData.imoNumber,
        flag: vesselFormData.flag,
        vesselType: vesselFormData.vesselType,
        builtYear: Number(vesselFormData.builtYear),
        classSociety: vesselFormData.classSociety,
        status: vesselFormData.status,
        currentLocation: vesselFormData.currentLocation,
        totalRunningHours: Number(vesselFormData.totalRunningHours),
        dimensions,
      });
      setSelectedVesselId(newVesselId);
    }

    setIsVesselModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Global Search Bar & Fleet Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-sea-accent" />
            {selectedVessel.name} Dashboard
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            IMO {selectedVessel.imoNumber} • {selectedVessel.vesselType} • Flag: {selectedVessel.flag}
          </p>
        </div>

        {/* Overview Search Bar & Fleet Management Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search fleet equipment, jobs, crew..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-ocean-900 border border-ocean-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sea-accent/50"
            />
          </div>

          {activeRole !== 'owner' && (
            <>
              <button
                onClick={openAddVesselModal}
                className="px-3.5 py-2 rounded-xl bg-sea-accent text-ocean-950 font-bold text-xs hover:bg-sea-accent/90 transition shadow-lg shadow-sea-accent/15 flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Ship</span>
              </button>

              {!isAllVessels && (
                <>
                  <button
                    onClick={openEditVesselModal}
                    className="px-3.5 py-2 rounded-xl bg-ocean-900 border border-ocean-700 text-sea-accent font-semibold text-xs hover:bg-ocean-850 transition flex items-center gap-1.5 shrink-0"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Ship</span>
                  </button>

                  <button
                    onClick={() => {
                      const rates = selectedVessel.consumptionRates || { sailing: 280, shifting: 220, waiting: 27, loading: 27, discharge: 135, bunkering: 0 };
                      setRatesFormData({
                        sailing: rates.sailing || 280,
                        shifting: rates.shifting || 220,
                        waiting: rates.waiting || 27,
                        loading: rates.loading || 27,
                        discharge: rates.discharge || 135,
                        bunkering: rates.bunkering || 0,
                      });
                      setIsRatesModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-sea-amber/10 border border-sea-amber/30 text-sea-amber font-semibold text-xs hover:bg-sea-amber/20 transition flex items-center gap-1.5 shrink-0"
                  >
                    <Activity className="w-4 h-4" />
                    <span>Fuel Rates</span>
                  </button>

                  <button
                    onClick={handleDeleteVessel}
                    className="px-3 py-2 rounded-xl bg-sea-rose/10 hover:bg-sea-rose/20 text-sea-rose border border-sea-rose/30 font-semibold text-xs transition flex items-center gap-1.5 shrink-0"
                    title="Delete Ship from Fleet"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Ship</span>
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* MINIMIZABLE MAIN DIMENSIONS & PARTICULAR CARDS */}
      <div className="glass-panel rounded-2xl p-5 border border-ocean-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ship className="w-5 h-5 text-sea-accent" />
            <h2 className="text-base font-bold text-white">Vessel Main Dimensions & Particulars</h2>
            <span className="text-[10px] font-mono bg-sea-accent/10 text-sea-accent px-2 py-0.5 rounded font-bold border border-sea-accent/20">
              CLASS CERTIFIED
            </span>
          </div>

          <button
            onClick={() => setIsDimensionsMinimized(!isDimensionsMinimized)}
            className="p-1.5 rounded-lg bg-ocean-900 hover:bg-ocean-800 border border-ocean-750 text-slate-400 hover:text-white transition flex items-center gap-1.5 text-xs font-mono"
          >
            <span>{isDimensionsMinimized ? 'Expand Dimensions' : 'Minimize'}</span>
            {isDimensionsMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {!isDimensionsMinimized && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 font-mono text-xs">
            <div className="p-3 rounded-xl bg-ocean-900/80 border border-ocean-850">
              <span className="text-slate-500 block text-[10px]">LENGTH OVERALL (LOA)</span>
              <span className="font-bold text-white text-sm">{dims ? `${dims.loaMeters} m` : 'N/A'}</span>
            </div>

            <div className="p-3 rounded-xl bg-ocean-900/80 border border-ocean-850">
              <span className="text-slate-500 block text-[10px]">MOULDED BEAM</span>
              <span className="font-bold text-white text-sm">{dims ? `${dims.beamMeters} m` : 'N/A'}</span>
            </div>

            <div className="p-3 rounded-xl bg-ocean-900/80 border border-ocean-850">
              <span className="text-slate-500 block text-[10px]">SUMMER DRAFT</span>
              <span className="font-bold text-white text-sm">{dims ? `${dims.draftMeters} m` : 'N/A'}</span>
            </div>

            <div className="p-3 rounded-xl bg-ocean-900/80 border border-ocean-850">
              <span className="text-slate-500 block text-[10px]">DEADWEIGHT (DWT)</span>
              <span className="font-bold text-sea-accent text-sm">{dims ? `${dims.dwtTons.toLocaleString()} MT` : 'N/A'}</span>
            </div>

            <div className="p-3 rounded-xl bg-ocean-900/80 border border-ocean-850">
              <span className="text-slate-500 block text-[10px]">MAIN ENGINE POWER</span>
              <span className="font-bold text-sea-emerald text-sm">{dims ? `${dims.enginePowerKW.toLocaleString()} kW` : 'N/A'}</span>
            </div>

            <div className="p-3 rounded-xl bg-ocean-900/80 border border-ocean-850">
              <span className="text-slate-500 block text-[10px]">CARGO HOLD VOLUME</span>
              <span className="font-bold text-white text-sm">{dims ? `${dims.cargoCapacityM3.toLocaleString()} m³` : 'N/A'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Overview Metric Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveTab('equipment')}
          className="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer space-y-2 border border-ocean-800"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Registered Machinery</span>
            <Wrench className="w-4 h-4 text-sea-accent" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">{filteredEquipment.length} Units</p>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <span>Running Hours: {selectedVessel.totalRunningHours ? selectedVessel.totalRunningHours.toLocaleString() : 0} hrs</span>
          </p>
        </div>

        <div 
          onClick={() => setActiveTab('jobs')}
          className="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer space-y-2 border border-ocean-800"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Overdue Maintenance</span>
            <CalendarCheck className="w-4 h-4 text-sea-rose" />
          </div>
          <p className="text-2xl font-bold text-sea-rose font-mono">{overdueJobs.length} Overdue</p>
          <p className="text-[11px] text-slate-400">Requires Chief Engineer Action</p>
        </div>

        <div 
          onClick={() => setActiveTab('inventory')}
          className="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer space-y-2 border border-ocean-800"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Open Requisitions</span>
            <ShoppingCart className="w-4 h-4 text-sea-amber" />
          </div>
          <p className="text-2xl font-bold text-sea-amber font-mono">{activeRequisitions.length} Pending</p>
          <p className="text-[11px] text-slate-400">Logistics & PO Delivery</p>
        </div>

        <div 
          onClick={() => setActiveTab('crew')}
          className="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer space-y-2 border border-ocean-800"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Onboard Complement</span>
            <Users className="w-4 h-4 text-sea-emerald" />
          </div>
          <p className="text-2xl font-bold text-sea-emerald font-mono">{onboardCrew.length} Seafarers</p>
          <p className="text-[11px] text-slate-400">STCW Certified Crew</p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel rounded-2xl p-5 space-y-3 border border-ocean-800">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Critical Equipment Quick Status</span>
            <button onClick={() => setActiveTab('equipment')} className="text-xs text-sea-accent flex items-center gap-1 hover:underline">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </h3>
          <div className="space-y-2">
            {filteredEquipment.slice(0, 3).map(eq => (
              <div key={eq.id} className="p-3 rounded-xl bg-ocean-900 border border-ocean-850 flex items-center justify-between text-xs font-mono">
                <div>
                  <p className="font-bold text-white">{eq.name}</p>
                  <p className="text-slate-400 text-[11px]">{eq.maker} {eq.model}</p>
                </div>
                <span className={`px-2 py-0.5 rounded font-bold ${
                  eq.status === 'Operational' ? 'bg-sea-emerald/20 text-sea-emerald' : 'bg-sea-amber/20 text-sea-amber'
                }`}>
                  {eq.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 space-y-3 border border-ocean-800">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Upcoming / Overdue Schedules</span>
            <button onClick={() => setActiveTab('jobs')} className="text-xs text-sea-accent flex items-center gap-1 hover:underline">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </h3>
          <div className="space-y-2">
            {filteredJobs.slice(0, 3).map(j => (
              <div key={j.id} className="p-3 rounded-xl bg-ocean-900 border border-ocean-850 flex items-center justify-between text-xs font-mono">
                <div>
                  <p className="font-bold text-white">{j.title}</p>
                  <p className="text-slate-400 text-[11px]">Due: {j.nextDueDate}</p>
                </div>
                <span className={`px-2 py-0.5 rounded font-bold ${
                  j.status === 'Overdue' ? 'bg-sea-rose/20 text-sea-rose' : 'bg-sea-accent/20 text-sea-accent'
                }`}>
                  {j.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add / Edit Vessel Modal */}
      {isVesselModalOpen && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-ocean-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Ship className="w-5 h-5 text-sea-accent" />
                {editingVesselId ? `Modify Ship Details: ${selectedVessel.name}` : 'Register New Vessel to Fleet'}
              </h2>
              <button onClick={() => setIsVesselModalOpen(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVesselSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Ship Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MV Pacific Horizon"
                    value={vesselFormData.name}
                    onChange={e => setVesselFormData({ ...vesselFormData, name: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-xl px-3.5 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">IMO Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9845123"
                    value={vesselFormData.imoNumber}
                    onChange={e => setVesselFormData({ ...vesselFormData, imoNumber: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-xl px-3.5 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Vessel Type</label>
                  <select
                    value={vesselFormData.vesselType}
                    onChange={e => setVesselFormData({ ...vesselFormData, vesselType: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-xl px-3.5 py-2 text-white"
                  >
                    <option value="Container Ship">Container Ship</option>
                    <option value="Bulk Carrier">Bulk Carrier</option>
                    <option value="Oil / Chemical Tanker">Oil / Chemical Tanker</option>
                    <option value="LNG Carrier">LNG Carrier</option>
                    <option value="General Cargo">General Cargo</option>
                    <option value="Offshore Tug / Supply">Offshore Tug / Supply</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Flag State</label>
                  <input
                    type="text"
                    placeholder="e.g. Panama (PA)"
                    value={vesselFormData.flag}
                    onChange={e => setVesselFormData({ ...vesselFormData, flag: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-xl px-3.5 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Built Year</label>
                  <input
                    type="number"
                    value={vesselFormData.builtYear}
                    onChange={e => setVesselFormData({ ...vesselFormData, builtYear: Number(e.target.value) })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-xl px-3.5 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Class Society</label>
                  <input
                    type="text"
                    placeholder="e.g. DNV / Lloyd's Register"
                    value={vesselFormData.classSociety}
                    onChange={e => setVesselFormData({ ...vesselFormData, classSociety: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-xl px-3.5 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Operational Status</label>
                  <select
                    value={vesselFormData.status}
                    onChange={e => setVesselFormData({ ...vesselFormData, status: e.target.value as any })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-xl px-3.5 py-2 text-white font-bold"
                  >
                    <option value="At Sea">At Sea</option>
                    <option value="In Port">In Port</option>
                    <option value="In Drydock">In Drydock</option>
                    <option value="Anchorage">Anchorage</option>
                    <option value="Laid Up">Laid Up</option>
                    <option value="Under Repair">Under Repair</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Current Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Singapore Strait"
                    value={vesselFormData.currentLocation}
                    onChange={e => setVesselFormData({ ...vesselFormData, currentLocation: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-xl px-3.5 py-2 text-white"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-ocean-900 border border-ocean-800 space-y-3 font-mono">
                <span className="text-sea-accent text-xs font-bold block uppercase tracking-wider">Vessel Main Dimensions & Particulars</span>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">LOA (Meters)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={vesselFormData.loaMeters}
                      onChange={e => setVesselFormData({ ...vesselFormData, loaMeters: Number(e.target.value) })}
                      className="w-full bg-ocean-950 border border-ocean-750 rounded-lg px-3 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Beam (Meters)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={vesselFormData.beamMeters}
                      onChange={e => setVesselFormData({ ...vesselFormData, beamMeters: Number(e.target.value) })}
                      className="w-full bg-ocean-950 border border-ocean-750 rounded-lg px-3 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Draft (Meters)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={vesselFormData.draftMeters}
                      onChange={e => setVesselFormData({ ...vesselFormData, draftMeters: Number(e.target.value) })}
                      className="w-full bg-ocean-950 border border-ocean-750 rounded-lg px-3 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">DWT (MT)</label>
                    <input
                      type="number"
                      value={vesselFormData.dwtTons}
                      onChange={e => setVesselFormData({ ...vesselFormData, dwtTons: Number(e.target.value) })}
                      className="w-full bg-ocean-950 border border-ocean-750 rounded-lg px-3 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Engine Power (kW)</label>
                    <input
                      type="number"
                      value={vesselFormData.enginePowerKW}
                      onChange={e => setVesselFormData({ ...vesselFormData, enginePowerKW: Number(e.target.value) })}
                      className="w-full bg-ocean-950 border border-ocean-750 rounded-lg px-3 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Hold Volume (m³)</label>
                    <input
                      type="number"
                      value={vesselFormData.cargoCapacityM3}
                      onChange={e => setVesselFormData({ ...vesselFormData, cargoCapacityM3: Number(e.target.value) })}
                      className="w-full bg-ocean-950 border border-ocean-750 rounded-lg px-3 py-1.5 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ocean-800 font-mono">
                <button
                  type="button"
                  onClick={() => setIsVesselModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-ocean-800 hover:bg-ocean-750 text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sea-accent text-ocean-950 font-bold hover:bg-sea-accent/90 transition shadow-lg shadow-sea-accent/15"
                >
                  {editingVesselId ? 'Save Ship Changes' : 'Register New Ship'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fuel Consumption Rates Modal Dialog */}
      {isRatesModalOpen && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl font-sans">
            <div className="flex items-center justify-between border-b border-ocean-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base font-mono flex items-center gap-2">
                  <Activity className="w-5 h-5 text-sea-amber" />
                  Fuel Consumption Rates — {selectedVessel.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono">Set standard fuel consumption rates (Liters/hour) per operational state</p>
              </div>
              <button onClick={() => setIsRatesModalOpen(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateConsumptionRates(selectedVessel.id, {
                  sailing: Number(ratesFormData.sailing),
                  shifting: Number(ratesFormData.shifting),
                  waiting: Number(ratesFormData.waiting),
                  loading: Number(ratesFormData.loading),
                  discharge: Number(ratesFormData.discharge),
                  bunkering: Number(ratesFormData.bunkering),
                });
                setIsRatesModalOpen(false);
              }}
              className="space-y-3 text-xs font-mono"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-ocean-900 border border-ocean-800 space-y-1">
                  <label className="block text-sea-accent font-bold">Sailing Rate (L/h)</label>
                  <input
                    type="number"
                    required
                    value={ratesFormData.sailing}
                    onChange={e => setRatesFormData({ ...ratesFormData, sailing: Number(e.target.value) })}
                    className="w-full bg-ocean-950 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                  />
                  <span className="text-[10px] text-slate-400">Full sea watch / transit</span>
                </div>

                <div className="p-3 rounded-xl bg-ocean-900 border border-ocean-800 space-y-1">
                  <label className="block text-sea-amber font-bold">Shifting Rate (L/h)</label>
                  <input
                    type="number"
                    required
                    value={ratesFormData.shifting}
                    onChange={e => setRatesFormData({ ...ratesFormData, shifting: Number(e.target.value) })}
                    className="w-full bg-ocean-950 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                  />
                  <span className="text-[10px] text-slate-400">Harbor / berth shifting</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-ocean-900 border border-ocean-800 space-y-1">
                  <label className="block text-slate-300 font-bold">Waiting / Anchorage Rate (L/h)</label>
                  <input
                    type="number"
                    required
                    value={ratesFormData.waiting}
                    onChange={e => setRatesFormData({ ...ratesFormData, waiting: Number(e.target.value) })}
                    className="w-full bg-ocean-950 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                  />
                  <span className="text-[10px] text-slate-400">Anchorage / auxiliary load</span>
                </div>

                <div className="p-3 rounded-xl bg-ocean-900 border border-ocean-800 space-y-1">
                  <label className="block text-sea-purple font-bold">Loading Rate (L/h)</label>
                  <input
                    type="number"
                    required
                    value={ratesFormData.loading}
                    onChange={e => setRatesFormData({ ...ratesFormData, loading: Number(e.target.value) })}
                    className="w-full bg-ocean-950 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                  />
                  <span className="text-[10px] text-slate-400">Cargo loading operations</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-ocean-900 border border-ocean-800 space-y-1">
                  <label className="block text-sea-rose font-bold">Discharge Rate (L/h)</label>
                  <input
                    type="number"
                    required
                    value={ratesFormData.discharge}
                    onChange={e => setRatesFormData({ ...ratesFormData, discharge: Number(e.target.value) })}
                    className="w-full bg-ocean-950 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                  />
                  <span className="text-[10px] text-slate-400">Cargo discharge & pumps</span>
                </div>

                <div className="p-3 rounded-xl bg-ocean-900 border border-ocean-800 space-y-1">
                  <label className="block text-sea-emerald font-bold">Bunkering Intake Rate (L/h)</label>
                  <input
                    type="number"
                    required
                    value={ratesFormData.bunkering}
                    onChange={e => setRatesFormData({ ...ratesFormData, bunkering: Number(e.target.value) })}
                    className="w-full bg-ocean-950 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                  />
                  <span className="text-[10px] text-slate-400">Fuel intake rate</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ocean-800">
                <button
                  type="button"
                  onClick={() => setIsRatesModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-ocean-800 hover:bg-ocean-750 text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sea-amber text-ocean-950 font-bold hover:bg-sea-amber/90 transition shadow-lg"
                >
                  Update Fuel Consumption Rates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;
