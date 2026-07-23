import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DailyLog } from '../../types';
import { Activity, Plus, LineChart as ChartIcon, Calendar, Gauge, Thermometer, Flame, Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const DailyParametersLog: React.FC = () => {
  const { selectedVessel, dailyLogs, addDailyLog, activeRole } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const isAllVessels = selectedVessel.id === 'all_vessels';
  const targetVesselId = isAllVessels ? undefined : selectedVessel.id;

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    loggedBy: activeRole === 'chief_engineer' ? 'Chief Engineer H. Vance' : '2nd Engineer M. Kowalski',
    mainEngineRPM: 114,
    mainEngineLoadPercent: 78,
    exhaustTempAvg: 365,
    lubeOilPressureBar: 4.2,
    fuelConsumptionTonsPerDay: 28.4,
    auxGen1Hours: (selectedVessel.totalRunningHours || 24000) / 2,
    auxGen2Hours: (selectedVessel.totalRunningHours || 24000) / 3,
    remarks: 'Main engine running parameters operating within normal parameters.',
  });

  const vesselLogs = dailyLogs
    .filter(log => (!targetVesselId || log.vesselId === targetVesselId) &&
                   (log.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    log.loggedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (log.remarks || '').toLowerCase().includes(searchTerm.toLowerCase())))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const chartData = vesselLogs.map(log => ({
    date: log.date.slice(5),
    RPM: log.mainEngineRPM,
    'Exhaust Temp (°C)': log.exhaustTempAvg,
    'Fuel (T/day)': log.fuelConsumptionTonsPerDay,
    'Lube Press (bar)': log.lubeOilPressureBar * 20,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAllVessels) return;
    addDailyLog({
      ...formData,
      vesselId: selectedVessel.id,
      mainEngineRPM: Number(formData.mainEngineRPM),
      mainEngineLoadPercent: Number(formData.mainEngineLoadPercent),
      exhaustTempAvg: Number(formData.exhaustTempAvg),
      lubeOilPressureBar: Number(formData.lubeOilPressureBar),
      fuelConsumptionTonsPerDay: Number(formData.fuelConsumptionTonsPerDay),
      auxGen1Hours: Number(formData.auxGen1Hours),
      auxGen2Hours: Number(formData.auxGen2Hours),
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-sea-accent" />
            Engine Room Watchkeeping Parameter Log
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            {selectedVessel.name} — Daily main engine RPM, exhaust temp, lube oil pressure & fuel consumption trends
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search daily logs by date, engineer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-ocean-900 border border-ocean-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sea-accent/50"
            />
          </div>

          {activeRole !== 'owner' && (
            <button
              disabled={isAllVessels}
              onClick={() => setIsModalOpen(true)}
              title={isAllVessels ? 'Please select a specific vessel to log daily parameters' : 'Log daily engine watchkeeping parameters'}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition shadow-lg flex items-center gap-2 shrink-0 ${
                isAllVessels 
                  ? 'bg-ocean-800 text-slate-500 cursor-not-allowed border border-ocean-700' 
                  : 'bg-sea-accent text-ocean-950 hover:bg-sea-accent/90 shadow-sea-accent/15'
              }`}
            >
              <Plus className="w-4 h-4" />
              {isAllVessels ? 'Select Specific Vessel to Log' : 'Log Daily Parameters'}
            </button>
          )}
        </div>
      </div>

      {/* Trend Line Chart */}
      <div className="glass-panel rounded-2xl p-6 space-y-4 border border-ocean-800">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <ChartIcon className="w-5 h-5 text-sea-accent" />
          Main Engine Performance Trends (Recharts)
        </h2>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#38bdf8' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="RPM" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Exhaust Temp (°C)" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Fuel (T/day)" stroke="#eab308" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Log History */}
      <div className="glass-panel rounded-2xl p-6 space-y-4 border border-ocean-800">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-sea-accent" />
          Watchkeeping Parameter History ({vesselLogs.length})
        </h2>

        <div className="space-y-3 font-mono text-xs">
          {vesselLogs.map(log => (
            <div key={log.id} className="p-4 rounded-xl bg-ocean-900 border border-ocean-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{log.date}</span>
                <span className="text-slate-400">Logged by: <strong className="text-sea-accent">{log.loggedBy}</strong></span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[11px] pt-1">
                <span className="text-slate-300">RPM: <strong className="text-sea-accent">{log.mainEngineRPM}</strong></span>
                <span className="text-slate-300">Engine Load: <strong className="text-white">{log.mainEngineLoadPercent}%</strong></span>
                <span className="text-slate-300">Exhaust Temp: <strong className="text-sea-rose">{log.exhaustTempAvg}°C</strong></span>
                <span className="text-slate-300">Lube Press: <strong className="text-sea-emerald">{log.lubeOilPressureBar} bar</strong></span>
                <span className="text-slate-300">Fuel: <strong className="text-sea-amber">{log.fuelConsumptionTonsPerDay} MT/day</strong></span>
              </div>
              {log.remarks && (
                <p className="text-[11px] text-slate-400 font-sans italic border-t border-ocean-850 pt-1.5 mt-1">
                  "{log.remarks}"
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-xl rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-sea-accent" />
              Log Daily Engine Watchkeeping Parameters
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Watch Engineer *</label>
                  <input
                    type="text"
                    required
                    value={formData.loggedBy}
                    onChange={e => setFormData({ ...formData, loggedBy: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Main Engine RPM</label>
                  <input
                    type="number"
                    value={formData.mainEngineRPM}
                    onChange={e => setFormData({ ...formData, mainEngineRPM: Number(e.target.value) })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Engine Load (%)</label>
                  <input
                    type="number"
                    value={formData.mainEngineLoadPercent}
                    onChange={e => setFormData({ ...formData, mainEngineLoadPercent: Number(e.target.value) })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Exhaust Temp (°C)</label>
                  <input
                    type="number"
                    value={formData.exhaustTempAvg}
                    onChange={e => setFormData({ ...formData, exhaustTempAvg: Number(e.target.value) })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Lube Oil Press (bar)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.lubeOilPressureBar}
                    onChange={e => setFormData({ ...formData, lubeOilPressureBar: Number(e.target.value) })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Fuel Cons (MT/day)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.fuelConsumptionTonsPerDay}
                    onChange={e => setFormData({ ...formData, fuelConsumptionTonsPerDay: Number(e.target.value) })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Aux Gen #1 Hours</label>
                  <input
                    type="number"
                    value={formData.auxGen1Hours}
                    onChange={e => setFormData({ ...formData, auxGen1Hours: Number(e.target.value) })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Aux Gen #2 Hours</label>
                  <input
                    type="number"
                    value={formData.auxGen2Hours}
                    onChange={e => setFormData({ ...formData, auxGen2Hours: Number(e.target.value) })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Watchkeeping Remarks</label>
                <textarea
                  rows={2}
                  value={formData.remarks}
                  onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Engine operating condition notes..."
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ocean-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-ocean-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sea-accent text-ocean-950 font-bold"
                >
                  Submit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
