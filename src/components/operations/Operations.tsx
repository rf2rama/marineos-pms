import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useOperationsStore } from '@marineos/shared';
import { VoyagePlanner } from './VoyagePlanner';
import { PortsManager } from './PortsManager';
import { VesselActivityLog, VoyagePlan, ShipState, ShipTank } from '../../types';
import { 
  Compass, Plus, Activity, AlertTriangle, CheckCircle2, Clock, 
  MapPin, Anchor, Flame, ShieldAlert, ArrowRight, Filter, Search, Trash2, Fuel, Droplet, Thermometer
} from 'lucide-react';

export const Operations: React.FC = () => {
  const { 
    vessels, selectedVessel,
    voyagePlans, addVoyagePlan, updateVoyagePlan, deleteVoyagePlan,
    ports,
    tanks, updateTankSounding, crewMembers, activeRole, updateVessel
  } = useApp();

  const { activities: vesselActivities, addActivity: addVesselActivity, deleteActivity: deleteVesselActivity } = useOperationsStore();

  const [activeSubTab, setActiveSubTab] = useState<'logger' | 'analytics' | 'tanks' | 'voyages' | 'ports'>('logger');
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('All');

  // Modals
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isVoyageModalOpen, setIsVoyageModalOpen] = useState(false);
  const [isSoundingModalOpen, setIsSoundingModalOpen] = useState(false);
  const [selectedTankForSounding, setSelectedTankForSounding] = useState<ShipTank | null>(null);

  const [soundingFormData, setSoundingFormData] = useState({
    soundingMeters: 8.2,
    currentLevelMT: 285.5,
    temperatureC: 42,
    soundedBy: '2nd Engineer M. Kowalski',
  });

  // Activity Log Form State
  const [logFormData, setLogFormData] = useState({
    voyageId: '',
    state: 'Sailing' as ShipState,
    startTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
    durationHours: 8.0,
    startROB_MT: selectedVessel.currentROB_MT || 485.2,
    reportedROB_MT: selectedVessel.currentROB_MT ? selectedVessel.currentROB_MT - 1.86 : 483.34,
    fromPortId: '',
    toPortId: '',
    atPortId: '',
    locationOrPort: selectedVessel.currentLocation || 'Singapore Strait Passage',
    loggedBy: activeRole === 'chief_engineer' ? 'Chief Engineer H. Vance' : '2nd Engineer M. Kowalski',
    remarks: 'Routine watchkeeping & main engine speed 14.5 knots.',
  });

  const [logInputMode, setLogInputMode] = useState<'form' | 'paste'>('form');
  const [rawPastedText, setRawPastedText] = useState('');

  const handleParsePastedText = (text: string) => {
    setRawPastedText(text);
    if (!text.trim()) return;

    const newLogData = { ...logFormData };
    
    // Tab-separated (from Excel copy-paste)
    if (text.includes('\t')) {
      const parts = text.split('\t').map(p => p.trim()).filter(Boolean);
      parts.forEach(part => {
        if (/v-\d+/i.test(part)) newLogData.voyageId = part;
        else if (['sailing', 'shifting', 'waiting', 'loading', 'discharge', 'bunkering', 'anchorage'].includes(part.toLowerCase())) {
          newLogData.state = (part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()) as ShipState;
        } else if (!isNaN(Number(part)) && Number(part) > 100) {
          newLogData.startROB_MT = Number(part);
        } else if (!isNaN(Number(part)) && Number(part) <= 24 && Number(part) > 0) {
          newLogData.durationHours = Number(part);
        } else if (part.length > 2) {
          if (!newLogData.locationOrPort || newLogData.locationOrPort.includes('Strait')) newLogData.locationOrPort = part;
          else newLogData.remarks = part;
        }
      });
      setLogFormData(newLogData);
      return;
    }

    // Key-value / Line-by-line (from Email / Master Cable)
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    lines.forEach(line => {
      const lower = line.toLowerCase();
      const parts = line.split(/[:=]/);
      const val = parts[1]?.trim() || '';

      if (lower.includes('state') || lower.includes('status')) {
        const match = ['Sailing', 'Shifting', 'Waiting', 'Loading', 'Discharge', 'Bunkering', 'Anchorage'].find(
          s => lower.includes(s.toLowerCase())
        );
        if (match) newLogData.state = match as ShipState;
      } else if (['sailing', 'shifting', 'waiting', 'loading', 'discharge', 'bunkering', 'anchorage'].includes(lower)) {
        newLogData.state = (line.charAt(0).toUpperCase() + line.slice(1).toLowerCase()) as ShipState;
      }

      if (lower.includes('voyage') || lower.includes('voy')) {
        const match = line.match(/v-?\d+[\w-]*/i);
        if (match) newLogData.voyageId = match[0].toUpperCase();
      }

      if (lower.includes('duration') || lower.includes('hrs') || lower.includes('hours')) {
        const num = line.match(/\d+(\.\d+)?/);
        if (num) newLogData.durationHours = parseFloat(num[0]);
      }

      if (lower.includes('rob') || lower.includes('fuel')) {
        const nums = line.match(/\d+(\.\d+)?/g);
        if (nums && nums.length > 0) {
          newLogData.startROB_MT = parseFloat(nums[0]);
          if (nums.length > 1) newLogData.reportedROB_MT = parseFloat(nums[1]);
        }
      }

      if (lower.includes('location') || lower.includes('port') || lower.includes('lat') || lower.includes('lng') || lower.includes('pos')) {
        if (val) newLogData.locationOrPort = val;
        else newLogData.locationOrPort = line;
      }

      if (lower.includes('officer') || lower.includes('logged by') || lower.includes('engineer') || lower.includes('master')) {
        if (val) newLogData.loggedBy = val;
      }

      if (lower.includes('remarks') || lower.includes('notes') || lower.includes('watchkeeping')) {
        if (val) newLogData.remarks = val;
        else if (!line.includes(':')) newLogData.remarks = line;
      }
    });

    setLogFormData(newLogData);
  };

  // Voyage Plan Form State
  const [voyageFormData, setVoyageFormData] = useState({
    voyageNo: 'V-2026-06',
    originPort: 'Port of Singapore (SG)',
    destinationPort: 'Port of Rotterdam (NL)',
    departureDate: new Date().toISOString().split('T')[0],
    estimatedArrivalDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    cargoType: 'Iron Ore / Containers',
    cargoQtyTons: 50000,
    fuelBudgetMT: 320.0,
    notes: 'Cape of Good Hope route passage.',
  });

  const isAllVessels = selectedVessel.id === 'all_vessels';
  const targetVesselId = isAllVessels ? undefined : selectedVessel.id;

  // Filtered lists
  const filteredActivities = vesselActivities.filter(act => {
    const matchesVessel = !targetVesselId || act.vesselId === targetVesselId;
    const matchesState = stateFilter === 'All' || act.state === stateFilter;
    const matchesSearch = act.locationOrPort.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          act.voyageId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          act.remarks.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesVessel && matchesState && matchesSearch;
  });

  const filteredVoyages = voyagePlans.filter(voy => {
    const matchesVessel = !targetVesselId || voy.vesselId === targetVesselId;
    const matchesSearch = (voy.voyageNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (voy.originPort || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (voy.destinationPort || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesVessel && matchesSearch;
  });

  const activeVoyages = voyagePlans.filter(voy => {
    const matchesVessel = !targetVesselId || voy.vesselId === targetVesselId;
    const matchesStatus = voy.status === 'Planned' || voy.status === 'In Progress';
    return matchesVessel && matchesStatus;
  });

  

  // Rates for selected vessel
  const rates = selectedVessel.consumptionRates || {
    sailing: 280,
    shifting: 220,
    waiting: 27,
    loading: 27,
    discharge: 135,
    bunkering: 0
  };

  // State fuel consumption rate helper
  const getRateForState = (st: ShipState) => {
    switch(st) {
      case 'Sailing': return rates.sailing;
      case 'Shifting': return rates.shifting;
      case 'Waiting': return rates.waiting;
      case 'Loading': return rates.loading;
      case 'Discharge': return rates.discharge;
      case 'Bunkering': return 0;
      default: return rates.waiting;
    }
  };

  // Submit Activity Log
  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rateLitersPerHr = getRateForState(logFormData.state);
    const totalLiters = rateLitersPerHr * Number(logFormData.durationHours);
    // Convert Liters to Metric Tons (density ~0.845)
    const fuelConsumedMT = Math.round((totalLiters * 0.845 / 1000) * 1000) / 1000;
    const calculatedEndROB = Math.max(0, Number(logFormData.startROB_MT) - fuelConsumedMT);

    const targetVessel = selectedVessel.id === 'all_vessels' ? vessels[0] : selectedVessel;

    let finalLocation = logFormData.locationOrPort;
    if (logInputMode === 'form') {
      if (logFormData.state === 'Sailing') {
        const fromP = ports.find(p => p.id === logFormData.fromPortId);
        const toP = ports.find(p => p.id === logFormData.toPortId);
        if (fromP && toP) {
          finalLocation = `Sailing from ${fromP.name} to ${toP.name}`;
        }
      } else {
        const atP = ports.find(p => p.id === logFormData.atPortId);
        if (atP) {
          finalLocation = `${logFormData.state} at ${atP.name}`;
        }
      }
    }

    addVesselActivity({
      id: crypto.randomUUID(),
      vesselId: targetVessel.id,
      vesselName: targetVessel.name,
      voyageId: logFormData.voyageId,
      state: logFormData.state,
      startTime: logFormData.startTime,
      durationHours: Number(logFormData.durationHours),
      startROB_MT: Number(logFormData.startROB_MT),
      endROB_MT: Math.round(calculatedEndROB * 100) / 100,
      reportedROB_MT: Number(logFormData.reportedROB_MT),
      fuelConsumedMT,
      locationOrPort: finalLocation,
      loggedBy: logFormData.loggedBy,
      remarks: logFormData.remarks,
    });

    updateVessel(targetVessel.id, {
      currentState: logFormData.state,
      currentLocation: finalLocation,
    });

    setIsLogModalOpen(false);
  };

  // Submit Voyage Plan
  const handleVoyageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVessel = selectedVessel.id === 'all_vessels' ? vessels[0] : selectedVessel;

    addVoyagePlan({
      vesselId: targetVessel.id,
      vesselName: targetVessel.name,
      voyageNo: voyageFormData.voyageNo,
      originPort: voyageFormData.originPort,
      destinationPort: voyageFormData.destinationPort,
      departureDate: voyageFormData.departureDate,
      estimatedArrivalDate: voyageFormData.estimatedArrivalDate,
      cargoType: voyageFormData.cargoType,
      cargoQtyTons: Number(voyageFormData.cargoQtyTons),
      fuelBudgetMT: Number(voyageFormData.fuelBudgetMT),
      status: 'Planned',
      notes: voyageFormData.notes,
      legs: [],
    } as any);

    setIsVoyageModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Global Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-sea-accent" />
            Voyage & Fleet Operations Logbook
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            {selectedVessel.name} — Real-time ROB tracking, ship state logging, fuel consumption rates & sudden gap anomaly detector
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search voyage, location, activity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-ocean-900 border border-ocean-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sea-accent/50"
            />
          </div>

          {activeRole !== 'owner' && (
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-sea-accent text-ocean-950 font-semibold text-xs hover:bg-sea-accent/90 transition shadow-lg shadow-sea-accent/15 flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Log Ship Activity
            </button>
          )}
        </div>
      </div>

      {/* Top Status & ROB KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-ocean-800 space-y-1">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">CURRENT SHIP STATE</span>
          <div className="flex items-center justify-between pt-1">
            <span className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sea-emerald animate-ping" />
              {selectedVessel.currentState || 'Sailing'}
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sea-accent/20 text-sea-accent">
              {getRateForState(selectedVessel.currentState || 'Sailing')} L/h
            </span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-ocean-800 space-y-1">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">REMAIN ON BOARD (ROB)</span>
          <div className="flex items-center justify-between pt-1">
            <span className="text-lg font-bold text-sea-accent font-mono">
              {(selectedVessel.currentROB_MT || 485.2).toFixed(1)} MT
            </span>
            <span className="text-xs text-slate-400 font-mono">~{Math.round((selectedVessel.currentROB_MT || 485.2) * 1183).toLocaleString()} L</span>
          </div>
        </div>



        <div className="glass-panel rounded-2xl p-4 border border-ocean-800 space-y-1">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">ACTIVE VOYAGE</span>
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-bold text-white font-mono truncate">
              {filteredVoyages.find(v => v.status === 'In Progress')?.voyageNo || 'V-2026-04'}
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sea-purple/20 text-sea-purple">
              IN TRANSIT
            </span>
          </div>
        </div>
      </div>

      {/* Operations Subtabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-ocean-900 border border-ocean-800 w-fit">
          <button
            onClick={() => setActiveSubTab('logger')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeSubTab === 'logger' ? 'bg-sea-accent text-ocean-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Activity Logbook ({filteredActivities.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeSubTab === 'analytics' ? 'bg-sea-accent text-ocean-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Fuel className="w-3.5 h-3.5" />
            <span>ROB & Consumption Rates</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tanks')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeSubTab === 'tanks' ? 'bg-sea-accent text-ocean-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Droplet className="w-3.5 h-3.5" />
            <span>Tank Sounding Gauges ({tanks.filter(t => !targetVesselId || t.vesselId === targetVesselId).length})</span>
          </button>

          <button 
            onClick={() => setActiveSubTab('voyages')}
            className={`px-4 py-2 font-bold transition flex items-center gap-2 whitespace-nowrap ${activeSubTab === 'voyages' ? 'border-b-2 border-sea-accent text-sea-accent' : 'text-slate-400 hover:text-white border-b-2 border-transparent hover:border-ocean-700'}`}
          >
            <MapPin className="w-4 h-4" /> Voyage Planner
          </button>
          <button 
            onClick={() => setActiveSubTab('ports')}
            className={`px-4 py-2 font-bold transition flex items-center gap-2 whitespace-nowrap ${activeSubTab === 'ports' ? 'border-b-2 border-sea-accent text-sea-accent' : 'text-slate-400 hover:text-white border-b-2 border-transparent hover:border-ocean-700'}`}
          >
            <Anchor className="w-4 h-4" /> Ports & Locations
          </button>
        </div>

        {activeSubTab === 'logger' && (
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Filter State:</span>
            {['All', 'Sailing', 'Shifting', 'Waiting', 'Loading', 'Discharge', 'Bunkering'].map(st => (
              <button
                key={st}
                onClick={() => setStateFilter(st)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  stateFilter === st ? 'bg-ocean-800 text-sea-accent border border-ocean-700 font-bold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Subtab 1: Activity Logbook */}
      {activeSubTab === 'logger' && (
        <div className="space-y-4 font-mono text-xs">
          {filteredActivities.length === 0 ? (
            <div className="glass-panel rounded-2xl p-10 text-center space-y-2 border border-ocean-800">
              <Activity className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No Activity Logs Found</h3>
              <p className="text-slate-400">Log vessel state activities to track ROB and fuel consumption.</p>
            </div>
          ) : (
            filteredActivities.map(act => (
              <div key={act.id} className="glass-panel glass-panel-hover rounded-2xl p-5 space-y-3 border border-ocean-800">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded font-bold uppercase text-[10px] ${
                      act.state === 'Sailing' ? 'bg-sea-accent/20 text-sea-accent border border-sea-accent/40' :
                      act.state === 'Shifting' ? 'bg-sea-amber/20 text-sea-amber border border-sea-amber/40' :
                      act.state === 'Discharge' ? 'bg-sea-rose/20 text-sea-rose border border-sea-rose/40' :
                      'bg-sea-emerald/20 text-sea-emerald border border-sea-emerald/40'
                    }`}>
                      {act.state}
                    </span>
                    <span className="font-bold text-white text-sm">Voyage {act.voyageId}</span>
                    <span className="text-slate-400">({act.locationOrPort})</span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-slate-400">Time: {act.startTime} ({act.durationHours} hrs)</span>
                    <span className="text-sea-rose font-bold">-{act.fuelConsumedMT} MT Consumed</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-xl bg-ocean-950/80 border border-ocean-850 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">START ROB:</span>
                    <strong className="text-white">{act.startROB_MT} MT</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">STATE CALCULATED END ROB:</span>
                    <strong className="text-sea-accent">{act.endROB_MT} MT</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">OFFICER REPORTED ROB:</span>
                    <strong className={act.isAnomalyGap ? 'text-sea-rose' : 'text-sea-emerald'}>
                      {act.reportedROB_MT ? `${act.reportedROB_MT} MT` : 'Not Reported'}
                    </strong>
                  </div>
                </div>

                {act.isAnomalyGap && (
                  <div className="p-3 rounded-xl bg-sea-rose/10 border border-sea-rose/30 text-sea-rose text-xs space-y-1">
                    <span className="font-bold uppercase flex items-center gap-1">
                      <ShieldAlert className="w-4 h-4" /> Sudden Gap Discrepancy Detected!
                    </span>
                    <p className="font-sans text-slate-300">{act.anomalyDetails}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400 font-sans border-t border-ocean-850">
                  <span>Remarks: "{act.remarks}" — Logged by <strong>{act.loggedBy}</strong></span>

                  {activeRole !== 'owner' && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete activity log for ${act.state}?`)) {
                          deleteVesselActivity(act.id);
                        }
                      }}
                      className="p-1 rounded text-sea-rose hover:bg-sea-rose/10"
                      title="Delete Activity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Subtab 2: ROB & Fuel Consumption Analytics */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="glass-panel rounded-2xl p-6 space-y-4 border border-ocean-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Fuel className="w-5 h-5 text-sea-accent" />
              Standard Fuel Consumption Rates Config — {selectedVessel.name}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
              <div className="p-3 rounded-xl bg-ocean-950 border border-ocean-850 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">SAILING</span>
                <span className="text-lg font-bold text-sea-accent block">{rates.sailing} L/h</span>
                <span className="text-[10px] text-slate-400">~{((rates.sailing * 24 * 0.845) / 1000).toFixed(1)} MT/day</span>
              </div>

              <div className="p-3 rounded-xl bg-ocean-950 border border-ocean-850 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">SHIFTING</span>
                <span className="text-lg font-bold text-sea-amber block">{rates.shifting} L/h</span>
                <span className="text-[10px] text-slate-400">~{((rates.shifting * 24 * 0.845) / 1000).toFixed(1)} MT/day</span>
              </div>

              <div className="p-3 rounded-xl bg-ocean-950 border border-ocean-850 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">WAITING</span>
                <span className="text-lg font-bold text-slate-200 block">{rates.waiting} L/h</span>
                <span className="text-[10px] text-slate-400">~{((rates.waiting * 24 * 0.845) / 1000).toFixed(1)} MT/day</span>
              </div>

              <div className="p-3 rounded-xl bg-ocean-950 border border-ocean-850 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">LOADING</span>
                <span className="text-lg font-bold text-sea-purple block">{rates.loading} L/h</span>
                <span className="text-[10px] text-slate-400">~{((rates.loading * 24 * 0.845) / 1000).toFixed(1)} MT/day</span>
              </div>

              <div className="p-3 rounded-xl bg-ocean-950 border border-ocean-850 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">DISCHARGE</span>
                <span className="text-lg font-bold text-sea-rose block">{rates.discharge} L/h</span>
                <span className="text-[10px] text-slate-400">~{((rates.discharge * 24 * 0.845) / 1000).toFixed(1)} MT/day</span>
              </div>

              <div className="p-3 rounded-xl bg-ocean-950 border border-ocean-850 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">BUNKERING</span>
                <span className="text-lg font-bold text-sea-emerald block">{rates.bunkering || 0} L/h</span>
                <span className="text-[10px] text-slate-400">Intake Rate</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Tank Sounding Gauges Dashboard */}
      {activeSubTab === 'tanks' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Droplet className="w-5 h-5 text-sea-accent" />
              Shipboard Fuel & Fluid Tank Sounding Gauges — {selectedVessel.name}
            </h3>
            <span className="text-slate-400 text-xs">Real-time Sounding Levels & MARPOL Annex I Overfill Alarms</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tanks.filter(t => !targetVesselId || t.vesselId === targetVesselId).map(tank => {
              const fillPercent = Math.round((tank.currentLevelMT / tank.capacityMT) * 100);
              const isHighLevelMarpolAlert = (tank.fuelType === 'Sludge' || tank.fuelType === 'Bilge') && fillPercent >= 85;

              return (
                <div 
                  key={tank.id} 
                  className={`glass-panel rounded-2xl p-5 space-y-4 border transition ${
                    isHighLevelMarpolAlert 
                      ? 'border-sea-rose/60 bg-sea-rose/5 shadow-lg shadow-sea-rose/10' 
                      : 'border-ocean-800 hover:border-ocean-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-white text-sm">{tank.tankName}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        tank.fuelType === 'HFO' ? 'bg-sea-accent/20 text-sea-accent' :
                        tank.fuelType === 'MGO' ? 'bg-sea-amber/20 text-sea-amber' :
                        tank.fuelType === 'Lube Oil' ? 'bg-sea-purple/20 text-sea-purple' :
                        tank.fuelType === 'Sludge' ? 'bg-sea-rose/20 text-sea-rose' :
                        'bg-sea-emerald/20 text-sea-emerald'
                      }`}>
                        {tank.fuelType} Tank
                      </span>
                    </div>

                    <div className="text-right space-y-0.5">
                      <span className="text-lg font-bold text-white block">{fillPercent}%</span>
                      {tank.temperatureC !== undefined && (
                        <span className="text-[10px] text-slate-400 flex items-center justify-end gap-1 font-bold">
                          <Thermometer className="w-3 h-3 text-sea-amber" /> {tank.temperatureC}°C
                        </span>
                      )}
                    </div>
                  </div>

                  {/* VISUAL ANIMATED FLUID TANK LEVEL METER */}
                  <div className="space-y-1.5">
                    <div className="w-full bg-ocean-950 rounded-xl h-6 p-1 border border-ocean-850 relative overflow-hidden flex items-center">
                      <div 
                        className={`h-full rounded-lg transition-all duration-700 ${
                          isHighLevelMarpolAlert ? 'bg-sea-rose animate-pulse' :
                          tank.fuelType === 'HFO' ? 'bg-sea-accent' :
                          tank.fuelType === 'MGO' ? 'bg-sea-amber' :
                          tank.fuelType === 'Lube Oil' ? 'bg-sea-purple' :
                          'bg-sea-emerald'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, fillPercent))}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">
                        {tank.currentLevelMT.toFixed(1)} MT / {tank.capacityMT} MT
                      </span>
                    </div>
                  </div>

                  {/* TANK SOUNDING & METRICS GRID */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-xl bg-ocean-950 border border-ocean-850">
                    <div>
                      <span className="text-slate-400 block text-[10px]">SOUNDING DEPTH:</span>
                      <strong className="text-white">{tank.soundingMeters} m / {tank.maxSoundingMeters} m</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">EST. VOLUME:</span>
                      <strong className="text-sea-accent">~{Math.round(tank.currentLevelMT * 1183).toLocaleString()} Liters</strong>
                    </div>
                  </div>

                  {isHighLevelMarpolAlert && (
                    <div className="p-2.5 rounded-xl bg-sea-rose/20 border border-sea-rose/40 text-sea-rose text-[11px] font-bold flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>MARPOL Annex I High Level Warning (≥85%) — Discharge/Offload Required!</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-ocean-850 text-[10px] text-slate-400">
                    <span>Sounded: {tank.lastSoundedDate} ({tank.soundedBy})</span>

                    {activeRole !== 'owner' && (
                      <button
                        onClick={() => {
                          setSelectedTankForSounding(tank);
                          setSoundingFormData({
                            soundingMeters: tank.soundingMeters,
                            currentLevelMT: tank.currentLevelMT,
                            temperatureC: tank.temperatureC || 40,
                            soundedBy: tank.soundedBy || '2nd Engineer M. Kowalski',
                          });
                          setIsSoundingModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-sea-accent/20 hover:bg-sea-accent/30 text-sea-accent font-bold transition flex items-center gap-1"
                      >
                        <Droplet className="w-3 h-3" /> Log Sounding
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

              {/* Subtab 4: Voyage Planning & Itineraries */}
        {activeSubTab === 'voyages' && (
          <VoyagePlanner />
        )}

        {/* Subtab 5: Ports Manager */}
        {activeSubTab === 'ports' && (
          <PortsManager />
        )}

      {/* Log Activity Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-sea-accent" />
              Log Ship Activity
            </h2>

            <div className="flex gap-2 text-xs font-mono mb-2">
              <button 
                onClick={() => setLogInputMode('form')}
                className={`px-3 py-1 rounded-md ${logInputMode === 'form' ? 'bg-sea-accent text-ocean-950 font-bold' : 'bg-ocean-800 text-slate-300'}`}
              >
                Manual Entry
              </button>
              <button 
                onClick={() => setLogInputMode('paste')}
                className={`px-3 py-1 rounded-md ${logInputMode === 'paste' ? 'bg-sea-accent text-ocean-950 font-bold' : 'bg-ocean-800 text-slate-300'}`}
              >
                Smart Paste
              </button>
            </div>

            {logInputMode === 'paste' && (
              <div className="mb-4">
                <label className="block text-slate-400 mb-1 text-xs">Paste from Excel or Email (auto-fills form below)</label>
                <textarea
                  rows={4}
                  value={rawPastedText}
                  onChange={(e) => handleParsePastedText(e.target.value)}
                  placeholder="Paste tab-separated values or key-value text here..."
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono text-xs"
                />
              </div>
            )}

            <form onSubmit={handleLogSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Voyage ID</label>
                  <select
                    required
                    value={logFormData.voyageId}
                    onChange={e => setLogFormData({ ...logFormData, voyageId: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">-- Select Voyage --</option>
                    {activeVoyages.map((v) => (
                      <option key={v.id} value={v.id}>
                        Voyage {String(v.voyageCount || 1).padStart(3, '0')} / {v.year} ({v.status})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">State</label>
                  <select
                    value={logFormData.state}
                    onChange={e => setLogFormData({ ...logFormData, state: e.target.value as ShipState })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Sailing">Sailing</option>
                    <option value="Shifting">Shifting</option>
                    <option value="Waiting">Waiting</option>
                    <option value="Loading">Loading</option>
                    <option value="Discharge">Discharge</option>
                    <option value="Bunkering">Bunkering</option>
                    <option value="Anchorage">Anchorage</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Start Time</label>
                  <input
                    type="text"
                    required
                    value={logFormData.startTime}
                    onChange={e => setLogFormData({ ...logFormData, startTime: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={logFormData.durationHours}
                    onChange={e => setLogFormData({ ...logFormData, durationHours: Number(e.target.value) })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Start ROB (MT)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={logFormData.startROB_MT}
                    onChange={e => setLogFormData({ ...logFormData, startROB_MT: Number(e.target.value) })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Reported End ROB (MT)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={logFormData.reportedROB_MT}
                    onChange={e => setLogFormData({ ...logFormData, reportedROB_MT: Number(e.target.value) })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                {logInputMode === 'form' ? (
                  logFormData.state === 'Sailing' ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">From Port</label>
                        <select
                          required
                          value={logFormData.fromPortId}
                          onChange={e => setLogFormData({ ...logFormData, fromPortId: e.target.value })}
                          className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                        >
                          <option value="">-- Select Port --</option>
                          {ports.map((p) => (
                            <option key={p.id} value={p.id}>{p.name} ({p.country})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">To Port</label>
                        <select
                          required
                          value={logFormData.toPortId}
                          onChange={e => setLogFormData({ ...logFormData, toPortId: e.target.value })}
                          className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                        >
                          <option value="">-- Select Port --</option>
                          {ports.map((p) => (
                            <option key={p.id} value={p.id}>{p.name} ({p.country})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-slate-400 mb-1">At Port / Location</label>
                      <select
                        required
                        value={logFormData.atPortId}
                        onChange={e => setLogFormData({ ...logFormData, atPortId: e.target.value })}
                        className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="">-- Select Port --</option>
                        {ports.map((p) => (
                          <option key={p.id} value={p.id}>{p.name} ({p.country})</option>
                        ))}
                      </select>
                    </div>
                  )
                ) : (
                  <div>
                    <label className="block text-slate-400 mb-1">Location / Port</label>
                    <input
                      type="text"
                      required
                      value={logFormData.locationOrPort}
                      onChange={e => setLogFormData({ ...logFormData, locationOrPort: e.target.value })}
                      className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Remarks</label>
                <textarea
                  rows={2}
                  value={logFormData.remarks}
                  onChange={e => setLogFormData({ ...logFormData, remarks: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ocean-800">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-ocean-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sea-accent text-ocean-950 font-bold"
                >
                  Save Log Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Tank Sounding Modal */}
      {isSoundingModalOpen && selectedTankForSounding && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Droplet className="w-5 h-5 text-sea-accent" />
              Log Tank Sounding: {selectedTankForSounding.tankName}
            </h2>

            <form onSubmit={(e) => {
              e.preventDefault();
              updateTankSounding(selectedTankForSounding.id, {
                soundingMeters: Number(soundingFormData.soundingMeters),
                currentLevelMT: Number(soundingFormData.currentLevelMT),
                temperatureC: Number(soundingFormData.temperatureC),
                soundedBy: soundingFormData.soundedBy,
                lastSoundedDate: new Date().toISOString().split('T')[0],
              });
              setIsSoundingModalOpen(false);
            }} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Sounding (Meters)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={soundingFormData.soundingMeters}
                    onChange={e => setSoundingFormData({ ...soundingFormData, soundingMeters: Number(e.target.value) })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Current Level (MT)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={soundingFormData.currentLevelMT}
                    onChange={e => setSoundingFormData({ ...soundingFormData, currentLevelMT: Number(e.target.value) })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={soundingFormData.temperatureC}
                    onChange={e => setSoundingFormData({ ...soundingFormData, temperatureC: Number(e.target.value) })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Sounded By</label>
                  <input
                    type="text"
                    required
                    value={soundingFormData.soundedBy}
                    onChange={e => setSoundingFormData({ ...soundingFormData, soundedBy: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ocean-800">
                <button
                  type="button"
                  onClick={() => setIsSoundingModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-ocean-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sea-accent text-ocean-950 font-bold"
                >
                  Save Sounding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Operations;
