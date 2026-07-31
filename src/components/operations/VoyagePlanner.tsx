import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VoyagePlan, VoyageLeg } from '../../types';
import { Plus, Compass, MapPin, Anchor, Flame, Trash2, ArrowRight } from 'lucide-react';

const getVesselAbbreviation = (name: string) => {
  const words = name.split(' ');
  const numberMatch = name.match(/\d+$/);
  const num = numberMatch ? numberMatch[0] : '';
  const wordOnly = name.replace(/\d+$/, '').trim().split(' ');

  if (wordOnly.length === 1) {
    return (wordOnly[0].substring(0, 2) + num).toUpperCase();
  } else {
    return (wordOnly.map(w => w[0]).join('') + num).toUpperCase();
  }
};

const getRomanMonth = (dateString: string) => {
  if (!dateString) return 'I';
  const month = parseInt(dateString.split('-')[1], 10);
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return roman[month - 1] || 'I';
};

const generateLegId = (voyageCount: number, state: string, shipAbbr: string, dateString: string, year: number, existingLegs: VoyageLeg[]) => {
  const romanMonth = getRomanMonth(dateString);
  const stateAbbr = state === 'Loading' ? 'L' : state === 'Discharge' ? 'D' : state === 'Bunker' ? 'B' : 'Docking';
  
  const sameStateCount = existingLegs.filter(l => l.state === state).length;
  const stateStr = sameStateCount > 0 || state === 'Discharge' ? `${stateAbbr}${sameStateCount + 1}` : stateAbbr;
  
  return `${String(voyageCount || 1).padStart(3, '0')}/${stateStr}/${shipAbbr}/${romanMonth}/${year}`;
};

export const VoyagePlanner: React.FC = () => {
  const { voyagePlans, addVoyagePlan, updateVoyagePlan, deleteVoyagePlan, selectedVessel, activeRole, ports } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedVoyages, setExpandedVoyages] = useState<Record<string, boolean>>({});
  const [portFilter, setPortFilter] = useState('');
  const [viewTab, setViewTab] = useState<'active' | 'archived'>('active');
  const [editingVoyageId, setEditingVoyageId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{ voyageCount: number; year: number; status: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled'; legs: VoyageLeg[] }>({
    voyageCount: 1,
    year: new Date().getFullYear(),
    status: 'Planned',
    legs: []
  });

  const filteredVoyages = voyagePlans.filter(v => {
    const matchesVessel = v.vesselId === selectedVessel.id;
    const matchesPort = !portFilter || (v.legs && v.legs.some(leg => leg.portName === portFilter));
    const matchesTab = viewTab === 'active' ? (v.status === 'Planned' || v.status === 'In Progress') : (v.status === 'Completed' || v.status === 'Cancelled');
    return matchesVessel && matchesPort && matchesTab;
  });

  const toggleExpand = (id: string) => {
    setExpandedVoyages(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenModal = (voyage?: VoyagePlan) => {
    if (voyage) {
      setEditingVoyageId(voyage.id);
      setFormData({
        voyageCount: voyage.voyageCount,
        year: voyage.year,
        status: voyage.status,
        legs: [...voyage.legs]
      });
    } else {
      setEditingVoyageId(null);
      setFormData({
        voyageCount: 1,
        year: new Date().getFullYear(),
        status: 'Planned',
        legs: []
      });
    }
    setIsModalOpen(true);
  };

  const handleAddLeg = () => {
    setFormData(prev => {
      const newLeg: VoyageLeg = {
        id: `temp-${Date.now()}`,
        state: 'Loading',
        portName: '',
        eta: new Date().toISOString().split('T')[0],
        etd: new Date().toISOString().split('T')[0],
        ata: '',
        atd: '',
        distanceNm: 0
      };
      return { ...prev, legs: [...prev.legs, newLeg] };
    });
  };

  const handleUpdateLeg = (index: number, field: keyof VoyageLeg, value: any) => {
    setFormData(prev => {
      const newLegs = [...prev.legs];
      newLegs[index] = { ...newLegs[index], [field]: value };
      return { ...prev, legs: newLegs };
    });
  };

  const handleRemoveLeg = (index: number) => {
    setFormData(prev => {
      const newLegs = [...prev.legs];
      newLegs.splice(index, 1);
      return { ...prev, legs: newLegs };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const shipAbbr = getVesselAbbreviation(selectedVessel.name);
    
    const finalLegs: VoyageLeg[] = [];
    formData.legs.forEach(leg => {
      const finalId = (editingVoyageId && !leg.id.startsWith('temp-')) 
        ? leg.id 
        : generateLegId(formData.voyageCount, leg.state, shipAbbr, leg.eta, formData.year, finalLegs);
      finalLegs.push({ ...leg, id: finalId });
    });

    if (editingVoyageId) {
      updateVoyagePlan(editingVoyageId, {
        voyageCount: formData.voyageCount,
        year: formData.year,
        status: formData.status,
        legs: finalLegs,
      });
    } else {
      addVoyagePlan({
        vesselId: selectedVessel.id,
        vesselName: selectedVessel.name,
        voyageCount: formData.voyageCount,
        year: formData.year,
        status: formData.status,
        legs: finalLegs,
        notes: ''
      });
    }
    
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex bg-ocean-950 border border-ocean-700 rounded-lg p-1">
            <button
              onClick={() => setViewTab('active')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${viewTab === 'active' ? 'bg-sea-accent text-ocean-950' : 'text-slate-400 hover:text-white'}`}
            >
              Active Voyages
            </button>
            <button
              onClick={() => setViewTab('archived')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${viewTab === 'archived' ? 'bg-sea-accent text-ocean-950' : 'text-slate-400 hover:text-white'}`}
            >
              Archived
            </button>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <select
              value={portFilter}
              onChange={(e) => setPortFilter(e.target.value)}
              className="bg-ocean-950 border border-ocean-700 rounded-lg px-3 py-2 text-white focus:border-sea-accent focus:outline-none"
            >
              <option value="">All Ports</option>
              {ports.map(p => (
                <option key={p.id} value={p.name}>{p.name} ({p.country})</option>
              ))}
            </select>
          </div>
        </div>
        {activeRole !== 'owner' && (
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 rounded-xl bg-sea-accent text-ocean-950 font-bold text-xs hover:bg-sea-accent/90 transition shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Voyage Plan
          </button>
        )}
      </div>

      {filteredVoyages.length === 0 ? (
        <div className="glass-panel rounded-2xl p-10 text-center space-y-2 border border-ocean-800">
          <Compass className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Voyage Plans</h3>
          <p className="text-slate-400">Plan upcoming voyages with multiple port legs and ETA tracking.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVoyages.map(voy => (
            <div key={voy.id} className="glass-panel rounded-xl overflow-hidden border border-ocean-800">
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-ocean-800/50 transition"
                onClick={() => toggleExpand(voy.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-sea-accent/10 text-sea-accent">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">Voyage {String(voy.voyageCount || 1).padStart(3, '0')} / {voy.year}</div>
                    <div className="text-slate-400">Status: <span className="text-sea-emerald">{voy.status}</span></div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-slate-400 text-right hidden sm:block">
                    {(voy.legs || []).length} Legs Planned
                  </div>
                  {activeRole !== 'owner' && (
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(voy);
                        }}
                        className="p-2 hover:bg-ocean-800 rounded-lg text-slate-400 hover:text-sea-blue transition"
                      >
                        <MapPin className="w-4 h-4" /> {/* Or Edit icon */}
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Delete this voyage plan?')) deleteVoyagePlan(voy.id);
                        }}
                        className="p-2 hover:bg-ocean-800 rounded-lg text-slate-400 hover:text-sea-rose transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {expandedVoyages[voy.id] && (
                <div className="p-4 border-t border-ocean-800 bg-ocean-900/50 space-y-2">
                  {!(voy.legs && voy.legs.length > 0) ? (
                    <div className="text-slate-500 italic py-2">No legs defined for this voyage.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="border-b border-ocean-700 text-slate-400">
                            <th className="pb-2 font-medium">Leg ID</th>
                            <th className="pb-2 font-medium">State</th>
                            <th className="pb-2 font-medium">Port</th>
                            <th className="pb-2 font-medium">ETA / ETD</th>
                            <th className="pb-2 font-medium">Distance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ocean-800/50">
                          {(voy.legs || []).map(leg => (
                            <tr key={leg.id} className="hover:bg-ocean-800/20 transition">
                              <td className="py-2 text-sea-accent font-bold">{leg.id}</td>
                              <td className="py-2">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wide ${
                                  leg.state === 'Loading' ? 'bg-sea-blue/20 text-sea-blue border border-sea-blue/30' :
                                  leg.state === 'Discharge' ? 'bg-sea-emerald/20 text-sea-emerald border border-sea-emerald/30' :
                                  leg.state === 'Bunker' ? 'bg-sea-rose/20 text-sea-rose border border-sea-rose/30' :
                                  'bg-slate-700 text-slate-300'
                                }`}>
                                  {leg.state}
                                </span>
                              </td>
                              <td className="py-2 text-slate-200">{leg.portName}</td>
                              <td className="py-2 text-slate-400">
                                <div className="flex flex-col gap-1">
                                  <div>
                                    <span className="text-slate-500 mr-1">ETA:</span> 
                                    {leg.eta} 
                                    {leg.ata && <span className="text-sea-emerald ml-2"><span className="text-slate-500 mr-1">ATA:</span>{leg.ata}</span>}
                                  </div>
                                  <div>
                                    <span className="text-slate-500 mr-1">ETD:</span> 
                                    {leg.etd}
                                    {leg.atd && <span className="text-sea-emerald ml-2"><span className="text-slate-500 mr-1">ATD:</span>{leg.atd}</span>}
                                  </div>
                                </div>
                              </td>
                              <td className="py-2 text-slate-400">{leg.distanceNm} nm</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-ocean-900 border border-ocean-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-ocean-800 flex justify-between items-center bg-ocean-950/50 shrink-0">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-sea-accent" /> Create Multi-Leg Voyage
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition">
                X
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[11px] uppercase tracking-wider font-bold">Voyage Count</label>
                  <input
                    type="number"
                    value={formData.voyageCount}
                    onChange={(e) => setFormData({...formData, voyageCount: parseInt(e.target.value) || 1})}
                    className="w-full bg-ocean-950 border border-ocean-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sea-accent"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[11px] uppercase tracking-wider font-bold">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: parseInt(e.target.value) || new Date().getFullYear()})}
                    className="w-full bg-ocean-950 border border-ocean-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sea-accent"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[11px] uppercase tracking-wider font-bold">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full bg-ocean-950 border border-ocean-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sea-accent"
                  >
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Voyage Legs</h3>
                  <button
                    type="button"
                    onClick={handleAddLeg}
                    className="px-3 py-1.5 rounded-lg bg-sea-accent/10 text-sea-accent hover:bg-sea-accent/20 transition flex items-center gap-1 text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Leg
                  </button>
                </div>

                {formData.legs.length === 0 ? (
                  <div className="text-center p-6 border border-dashed border-ocean-700 rounded-xl text-slate-500">
                    No legs added yet. Click "Add Leg" to build the voyage itinerary.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.legs.map((leg, idx) => (
                      <div key={leg.id} className="p-4 rounded-xl border border-ocean-700 bg-ocean-800/30 space-y-3 relative">
                        <button 
                          onClick={() => handleRemoveLeg(idx)}
                          className="absolute top-3 right-3 text-slate-500 hover:text-sea-rose transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        <div className="font-bold text-sea-accent text-xs">Leg {idx + 1}</div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="space-y-1 sm:col-span-1">
                            <label className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">State</label>
                            <select
                              value={leg.state}
                              onChange={(e) => handleUpdateLeg(idx, 'state', e.target.value)}
                              className="w-full bg-ocean-950 border border-ocean-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
                            >
                              <option value="Loading">Loading</option>
                              <option value="Discharge">Discharge</option>
                              <option value="Bunker">Bunker</option>
                              <option value="Docking">Docking</option>
                            </select>
                          </div>
                          <div className="space-y-1 sm:col-span-3">
                            <label className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Port Name</label>
                            <select
                              value={leg.portName}
                              onChange={(e) => handleUpdateLeg(idx, 'portName', e.target.value)}
                              className="w-full bg-ocean-950 border border-ocean-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
                            >
                              <option value="">-- Select Port --</option>
                              {ports.map((p) => (
                                <option key={p.id} value={p.name}>
                                  {p.name} ({p.country})
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">ETA</label>
                            <input
                              type="date"
                              value={leg.eta}
                              onChange={(e) => handleUpdateLeg(idx, 'eta', e.target.value)}
                              className="w-full bg-ocean-950 border border-ocean-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">ETD</label>
                            <input
                              type="date"
                              value={leg.etd}
                              onChange={(e) => handleUpdateLeg(idx, 'etd', e.target.value)}
                              className="w-full bg-ocean-950 border border-ocean-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-slate-400 text-[10px] uppercase font-bold tracking-wider text-sea-emerald">ATA</label>
                            <input
                              type="date"
                              value={leg.ata || ''}
                              onChange={(e) => handleUpdateLeg(idx, 'ata', e.target.value)}
                              className="w-full bg-ocean-950 border border-ocean-700 rounded-lg px-2 py-1.5 text-xs text-sea-emerald focus:border-sea-emerald"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-slate-400 text-[10px] uppercase font-bold tracking-wider text-sea-emerald">ATD</label>
                            <input
                              type="date"
                              value={leg.atd || ''}
                              onChange={(e) => handleUpdateLeg(idx, 'atd', e.target.value)}
                              className="w-full bg-ocean-950 border border-ocean-700 rounded-lg px-2 py-1.5 text-xs text-sea-emerald focus:border-sea-emerald"
                            />
                          </div>
                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Distance (nm)</label>
                            <input
                              type="number"
                              value={leg.distanceNm}
                              onChange={(e) => handleUpdateLeg(idx, 'distanceNm', parseFloat(e.target.value) || 0)}
                              className="w-full bg-ocean-950 border border-ocean-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-ocean-800 bg-ocean-950/50 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-ocean-800 transition text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={formData.legs.length === 0}
                className="px-6 py-2 rounded-xl bg-sea-accent text-ocean-950 font-bold text-xs hover:bg-sea-accent/90 transition shadow-lg shadow-sea-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingVoyageId ? 'Save Changes' : 'Create Voyage'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
