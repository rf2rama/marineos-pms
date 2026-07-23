import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from './Sidebar';
import { 
  Ship, Wrench, CalendarCheck, ShieldAlert, ShoppingCart, 
  Users, BarChart3, ChevronDown, ChevronUp, Search, Compass, Activity, ArrowUpRight 
} from 'lucide-react';

interface OverviewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const Overview: React.FC<OverviewProps> = ({ setActiveTab }) => {
  const { selectedVessel, vessels, equipment, jobs, requisitions, crewMembers, incidents, drydockProjects } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isDimensionsMinimized, setIsDimensionsMinimized] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* Header & Global Search Bar */}
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

        {/* Overview Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search fleet equipment, jobs, crew, safety..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-ocean-900 border border-ocean-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sea-accent/50"
          />
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
    </div>
  );
};
