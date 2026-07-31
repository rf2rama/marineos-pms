import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, FormField, useOperationsStore } from '@marineos/shared';
import { Activity, Plus, Trash2, Navigation } from 'lucide-react';

export const ShipStateLogger: React.FC = () => {
  const navigate = useNavigate();
  const { addActivity } = useOperationsStore();
  
  const [voyageId, setVoyageId] = useState('');
  const [description, setDescription] = useState('');
  const [activities, setActivities] = useState([{ time: '', activityName: '', date: '', rob: '' }]);
  const [cargoType, setCargoType] = useState('');
  const [cargoBL, setCargoBL] = useState('');
  const [cargoAd, setCargoAd] = useState('');
  const [fw, setFw] = useState('');
  const [lo, setLo] = useState('');

  // Removed Smart Paste feature per request

  const handleAddActivity = () => {
    setActivities([...activities, { time: '', activityName: '', date: '', rob: '' }]);
  };

  const handleRemoveActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const handleActivityChange = (index: number, field: 'time' | 'activityName' | 'date' | 'rob', value: string) => {
    const newActivities = [...activities];
    newActivities[index][field] = value;
    setActivities(newActivities);
  };

  const deriveState = (activityName: string): import('@marineos/shared/src/types').ShipState => {
    const lower = activityName.toLowerCase();
    if (lower.includes('bosv') || lower.includes('full away') || lower.includes('atd')) return 'Sailing';
    if (lower.includes('sbe') || lower.includes('eosv') || lower.includes('ata')) return 'Shifting';
    if (lower.includes('fwe') || lower.includes('all fast') || lower.includes('anchor')) return 'Waiting';
    if (lower.includes('loading')) return 'Loading';
    if (lower.includes('discharge')) return 'Discharge';
    if (lower.includes('bunker')) return 'Bunkering';
    return 'Waiting'; // Default fallback
  };

  const getValidDate = (dStr: string) => {
    // Handle Indonesian month names for JS Date parser
    const cleanStr = dStr
       .replace(/JANUARI/i, 'JAN')
       .replace(/FEBRUARI/i, 'FEB')
       .replace(/MARET/i, 'MAR')
       .replace(/MEI/i, 'MAY')
       .replace(/JUNI/i, 'JUN')
       .replace(/JULI/i, 'JUL')
       .replace(/AGUSTUS/i, 'AUG')
       .replace(/OKTOBER/i, 'OCT')
       .replace(/NOPEMBER/i, 'NOV')
       .replace(/DESEMBER/i, 'DEC');
    const ms = Date.parse(cleanStr);
    return isNaN(ms) ? new Date() : new Date(ms);
  };

  const parseTimeStr = (timeStr: string, dateStr: string) => {
     const timeMatch = timeStr.match(/(\d{2})\.(\d{2})/);
     const d = getValidDate(dateStr);
     if (timeMatch) {
        d.setHours(parseInt(timeMatch[1], 10), parseInt(timeMatch[2], 10), 0, 0);
     }
     return d;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Filter out empty
    const validActivities = activities.filter(a => a.activityName || a.time || a.date || a.rob);
    if (validActivities.length === 0) return;

    // 2. Sort chronologically
    const sorted = [...validActivities].sort((a, b) => {
       const dA = parseTimeStr(a.time, a.date || '');
       const dB = parseTimeStr(b.time, b.date || '');
       return dA.getTime() - dB.getTime();
    });

    // 3. Pair into periods
    for (let i = 0; i < sorted.length; i++) {
       const current = sorted[i];
       const next = sorted[i + 1];

       const startDt = parseTimeStr(current.time, current.date || '');
       let endDt: Date | undefined = undefined;
       let durationHours = 0;
       
       if (next) {
          endDt = parseTimeStr(next.time, next.date || '');
          durationHours = (endDt.getTime() - startDt.getTime()) / (1000 * 60 * 60);
          if (durationHours < 0) durationHours += 24; // Handle midnight rollover safely
       }

       const startRob = parseFloat(current.rob) || 0;
       const endRob = next ? (parseFloat(next.rob) || startRob) : startRob;
       let consumed = startRob - endRob;
       if (consumed < 0) consumed = 0; // Bunker scenario or misentry

       const cargoDetails = cargoType ? ` | Cargo: ${cargoType} (B/L: ${cargoBL}, A/d: ${cargoAd})` : '';
       const consumables = ` | FW: ${fw} | LO: ${lo}`;

       addActivity({
          id: crypto.randomUUID(),
          vesselId: 'samugara_1',
          voyageId: voyageId || 'N/A',
          state: deriveState(current.activityName),
          startTime: startDt.toISOString(),
          endTime: endDt ? endDt.toISOString() : undefined,
          durationHours: Number(durationHours.toFixed(2)),
          startROB_MT: startRob,
          endROB_MT: endRob,
          fuelConsumedMT: Number(consumed.toFixed(3)),
          locationOrPort: current.activityName,
          loggedBy: 'Crew Reporter',
          remarks: `Desc: ${description}${cargoDetails}${consumables}`
       });
    }
    
    alert('Chronological periods submitted to Management successfully!');
    navigate('/dashboard');
  };

  return (
    <div className="space-y-4 font-sans max-w-lg mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white">
        <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          Ship Operational State Logger
        </h2>
        <p className="text-xs text-slate-400">
          Input your daily vessel report using the standardized point-and-click form.
        </p>
      </div>

      <Card className="p-4 bg-slate-900 border-slate-800 text-white">
        <form onSubmit={handleSubmit} className="space-y-6">
            
            <FormField label="Voyage ID">
              <input 
                type="text" 
                value={voyageId} 
                onChange={e => setVoyageId(e.target.value)} 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-medium" 
              />
            </FormField>

            <FormField label="Description">
              <input 
                type="text" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-medium" 
              />
            </FormField>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-400">Activities</label>
                <button type="button" onClick={handleAddActivity} className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1">
                  <Plus className="w-3 h-3"/> Add Row
                </button>
              </div>

              {activities.map((act, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    <input 
                      type="time" 
                      value={act.time}
                      onChange={(e) => handleActivityChange(idx, 'time', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-medium [color-scheme:dark]"
                    />
                    <select 
                      value={act.activityName}
                      onChange={(e) => handleActivityChange(idx, 'activityName', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-medium"
                    >
                      <option className="bg-slate-900 text-white" value="">Select Activity...</option>
                      <option className="bg-slate-900 text-white" value="OHN">OHN</option>
                      <option className="bg-slate-900 text-white" value="SBE">SBE</option>
                      <option className="bg-slate-900 text-white" value="POB">POB</option>
                      <option className="bg-slate-900 text-white" value="ANCHOR UP">ANCHOR UP</option>
                      <option className="bg-slate-900 text-white" value="TUG ON">TUG ON</option>
                      <option className="bg-slate-900 text-white" value="FIRST LINE">FIRST LINE</option>
                      <option className="bg-slate-900 text-white" value="IN POST">IN POST</option>
                      <option className="bg-slate-900 text-white" value="ALL FAST">ALL FAST</option>
                      <option className="bg-slate-900 text-white" value="START DISCHARGE">START DISCHARGE</option>
                      <option className="bg-slate-900 text-white" value="STOP DISCHARGE">STOP DISCHARGE</option>
                      <option className="bg-slate-900 text-white" value="START LOADING">START LOADING</option>
                      <option className="bg-slate-900 text-white" value="STOP LOADING">STOP LOADING</option>
                      <option className="bg-slate-900 text-white" value="TUG OFF">TUG OFF</option>
                      <option className="bg-slate-900 text-white" value="PILOT OFF">PILOT OFF</option>
                      <option className="bg-slate-900 text-white" value="FWE">FWE</option>
                      <option className="bg-slate-900 text-white" value="SINGLE UP">SINGLE UP</option>
                      <option className="bg-slate-900 text-white" value="CAST OFF">CAST OFF</option>
                      <option className="bg-slate-900 text-white" value="DROP ANCHOR">DROP ANCHOR</option>
                      <option className="bg-slate-900 text-white" value="BOSV / FULL AWAY">BOSV / FULL AWAY</option>
                      <option className="bg-slate-900 text-white" value="ATA">ATA</option>
                      <option className="bg-slate-900 text-white" value="OTHER">OTHER</option>
                    </select>
                    <input 
                      type="date" 
                      value={act.date}
                      onChange={(e) => handleActivityChange(idx, 'date', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-medium"
                    />
                    <input 
                      type="number"
                      step="0.001"
                      placeholder="ROB"
                      value={act.rob}
                      onChange={(e) => handleActivityChange(idx, 'rob', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-medium"
                    />
                  </div>
                  {activities.length > 1 && (
                    <button type="button" onClick={() => handleRemoveActivity(idx)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg mt-0.5">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-400">Cargo on board</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField label="Type">
                  <input 
                    type="text" 
                    value={cargoType} 
                    onChange={e => setCargoType(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-medium" 
                  />
                </FormField>
                <FormField label="B/L (Kl obs)">
                  <input 
                    type="number" 
                    step="0.001"
                    value={cargoBL} 
                    onChange={e => setCargoBL(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-medium" 
                  />
                </FormField>
                <FormField label="A/d (Kl obs)">
                  <input 
                    type="number" 
                    step="0.001"
                    value={cargoAd} 
                    onChange={e => setCargoAd(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-medium" 
                  />
                </FormField>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
              <FormField label="Fresh Water (Ton)">
                <input 
                  type="number" 
                  step="0.001"
                  value={fw} 
                  onChange={e => setFw(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-medium" 
                />
              </FormField>
              <FormField label="Lube Oil (Ton)">
                <input 
                  type="number" 
                  step="0.001"
                  value={lo} 
                  onChange={e => setLo(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-medium" 
                />
              </FormField>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 mt-4">
              <Navigation className="w-4 h-4" />
              Submit to Management
            </Button>
          </form>
      </Card>
    </div>
  );
};
