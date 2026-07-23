import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MaintenanceJob, JobExecution } from '../../types';
import { 
  CalendarCheck, Plus, CheckCircle2, Clock, AlertTriangle, 
  Search, ShieldCheck, Filter, Wrench, ChevronRight, FileText, UserCheck, Ship, Edit3, Trash2
} from 'lucide-react';

export const MaintenanceSchedules: React.FC = () => {
  const { vessels, selectedVessel, jobs, addJob, updateJob, deleteJob, completeJob, executions, deleteJobExecution, equipment, spareParts, activeRole } = useApp();
  
  const [activeTab, setActiveTab] = useState<'upcoming' | 'overdue' | 'history'>('upcoming');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  const [completeJobModalTarget, setCompleteJobModalTarget] = useState<MaintenanceJob | null>(null);

  // Form states
  const [jobFormData, setJobFormData] = useState({
    equipmentId: equipment[0]?.id || 'eq-101',
    title: '30-Day Periodic Fuel Filter Cleaning & Inspection',
    description: 'Dismantle duplex fuel strainer, inspect mesh element, replace O-ring seal.',
    intervalType: 'Calendar' as MaintenanceJob['intervalType'],
    intervalDays: 30,
    intervalHours: 500,
    completionWindowDays: 7,
    nextDueDate: '2026-08-15',
    priority: 'High' as MaintenanceJob['priority'],
    classSurveyRequired: false,
    estimatedManHours: 3,
  });

  const [execFormData, setExecFormData] = useState({
    runningHoursAtExecution: 24650,
    completedBy: activeRole === 'chief_engineer' ? 'Chief Engineer H. Vance' : '2nd Engineer M. Kowalski',
    findings: 'Filter mesh clean. Minor carbon sediment removed. Satisfactory performance.',
    selectedPartId: spareParts[0]?.id || '',
    partQty: 1,
    actualManHours: 3.5,
  });

  const isAllVessels = selectedVessel.id === 'all_vessels';
  const targetVesselId = isAllVessels ? undefined : selectedVessel.id;

  const filteredJobs = jobs.filter(job => {
    const matchesVessel = !targetVesselId || job.vesselId === targetVesselId;

    let matchesTab = true;
    if (activeTab === 'upcoming') matchesTab = job.status === 'Upcoming' || job.status === 'Due';
    if (activeTab === 'overdue') matchesTab = job.status === 'Overdue';

    const matchesPriority = priorityFilter === 'All' || job.priority === priorityFilter;
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.equipmentName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesVessel && matchesTab && matchesPriority && matchesSearch;
  });

  const filteredExecutions = executions.filter(exec => {
    const matchesVessel = !targetVesselId || exec.vesselId === targetVesselId;
    const matchesSearch = exec.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exec.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exec.completedBy.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesVessel && matchesSearch;
  });

  const openAddModal = () => {
    setEditingJobId(null);
    setJobFormData({
      equipmentId: equipment[0]?.id || 'eq-101',
      title: '',
      description: '',
      intervalType: 'Calendar',
      intervalDays: 30,
      intervalHours: 500,
      completionWindowDays: 7,
      nextDueDate: new Date().toISOString().split('T')[0],
      priority: 'High',
      classSurveyRequired: false,
      estimatedManHours: 3,
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (job: MaintenanceJob) => {
    setEditingJobId(job.id);
    setJobFormData({
      equipmentId: job.equipmentId,
      title: job.title,
      description: job.description,
      intervalType: job.intervalType,
      intervalDays: job.intervalDays || 30,
      intervalHours: job.intervalHours || 500,
      completionWindowDays: job.completionWindowDays || 7,
      nextDueDate: job.nextDueDate,
      priority: job.priority,
      classSurveyRequired: job.classSurveyRequired,
      estimatedManHours: job.estimatedManHours,
    });
    setIsAddModalOpen(true);
  };

  const handleAddJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEq = equipment.find(eq => eq.id === jobFormData.equipmentId) || equipment[0];

    if (editingJobId) {
      updateJob(editingJobId, {
        equipmentId: jobFormData.equipmentId,
        equipmentName: targetEq ? targetEq.name : 'Main Engine',
        title: jobFormData.title,
        description: jobFormData.description,
        intervalType: jobFormData.intervalType,
        intervalDays: Number(jobFormData.intervalDays),
        intervalHours: Number(jobFormData.intervalHours),
        completionWindowDays: Number(jobFormData.completionWindowDays),
        nextDueDate: jobFormData.nextDueDate,
        priority: jobFormData.priority,
        classSurveyRequired: jobFormData.classSurveyRequired,
        estimatedManHours: Number(jobFormData.estimatedManHours),
      });
    } else {
      addJob({
        ...jobFormData,
        vesselId: selectedVessel.id === 'all_vessels' ? targetEq.vesselId : selectedVessel.id,
        equipmentName: targetEq ? targetEq.name : 'Main Engine',
        status: 'Upcoming',
        requiredParts: ['Filter Seal O-Ring'],
      });
    }
    setIsAddModalOpen(false);
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeJobModalTarget) return;

    const usedPartObj = spareParts.find(p => p.id === execFormData.selectedPartId);
    const partsUsed = usedPartObj ? [{
      partId: usedPartObj.id,
      name: usedPartObj.partName,
      qty: Number(execFormData.partQty),
      isNonConsumableSpare: usedPartObj.itemCategory === 'Spare Part (Non-Consumable)'
    }] : [];

    const todayStr = new Date().toISOString().split('T')[0];

    completeJob({
      jobId: completeJobModalTarget.id,
      jobTitle: completeJobModalTarget.title,
      equipmentName: completeJobModalTarget.equipmentName,
      vesselId: completeJobModalTarget.vesselId,
      startDate: todayStr,
      dateCompleted: todayStr,
      runningHoursAtExecution: Number(execFormData.runningHoursAtExecution),
      completedBy: execFormData.completedBy,
      findings: execFormData.findings,
      partsUsed,
      actualManHours: Number(execFormData.actualManHours),
      estimatedManHours: completeJobModalTarget.estimatedManHours,
      signedOffByChief: activeRole === 'chief_engineer' || activeRole === 'superintendent',
      signedOffDate: todayStr,
    });

    setCompleteJobModalTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Global Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-sea-accent" />
            Planned Maintenance System (PMS) Schedules
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            {selectedVessel.name} — Machinery overhaul intervals, SLA calendar due dates & completed execution logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs, equipment..."
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
              Create Job Schedule
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Priority Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-ocean-900 border border-ocean-800 w-fit">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'upcoming' ? 'bg-sea-accent text-ocean-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Upcoming & Scheduled
          </button>
          <button
            onClick={() => setActiveTab('overdue')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'overdue' ? 'bg-sea-rose text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Overdue Maintenance
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'history' ? 'bg-sea-accent text-ocean-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Completed Job History ({filteredExecutions.length})
          </button>
        </div>

        {activeTab !== 'history' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-mono">Priority:</span>
            {['All', 'High', 'Medium', 'Low'].map(p => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  priorityFilter === p ? 'bg-ocean-800 text-sea-accent border border-ocean-700' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {activeTab !== 'history' ? (
        /* Jobs List */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.map(job => {
              const jobVessel = vessels.find(v => v.id === job.vesselId);
              return (
                <div key={job.id} className="glass-panel glass-panel-hover rounded-2xl p-5 space-y-4 flex flex-col justify-between border border-ocean-800">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                        job.priority === 'High' ? 'bg-sea-rose/20 text-sea-rose border-sea-rose/40' : 'bg-sea-amber/20 text-sea-amber border-sea-amber/40'
                      }`}>
                        {job.priority} Priority • {job.intervalType} ({job.intervalDays}d / {job.intervalHours}h)
                      </span>

                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-sea-purple/20 text-sea-purple border border-sea-purple/40 uppercase flex items-center gap-1">
                        <Ship className="w-3 h-3" />
                        {jobVessel?.name || job.vesselName || 'Vessel'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">{job.title}</h3>
                    <p className="text-xs text-slate-300 font-mono">Machinery: <strong className="text-white">{job.equipmentName}</strong></p>
                    <p className="text-xs text-slate-400">{job.description}</p>

                    <div className="p-3 rounded-xl bg-ocean-950/80 border border-ocean-850 space-y-1 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Target Next Due Date:</span>
                        <span className={`font-bold ${job.status === 'Overdue' ? 'text-sea-rose' : 'text-sea-accent'}`}>{job.nextDueDate}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Est Man Hours: {job.estimatedManHours} hrs</span>
                        <span>Class Survey Req: <strong className={job.classSurveyRequired ? 'text-sea-amber' : 'text-slate-500'}>{job.classSurveyRequired ? 'YES' : 'NO'}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-ocean-800 flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
                      job.status === 'Overdue' ? 'bg-sea-rose/20 text-sea-rose' : 'bg-sea-emerald/20 text-sea-emerald'
                    }`}>
                      {job.status}
                    </span>

                    {activeRole !== 'owner' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCompleteJobModalTarget(job)}
                          className="px-3 py-1.5 rounded-xl bg-sea-accent hover:bg-sea-accent/90 text-ocean-950 font-bold text-xs flex items-center gap-1 transition shadow-lg shadow-sea-accent/10"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Complete & Log</span>
                        </button>

                        <button
                          onClick={() => openEditModal(job)}
                          className="p-1.5 rounded-xl bg-ocean-800 hover:bg-ocean-750 text-sea-accent border border-ocean-700 text-xs transition"
                          title="Edit Job Schedule"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Delete maintenance schedule "${job.title}"?`)) {
                              deleteJob(job.id);
                            }
                          }}
                          className="p-1.5 rounded-xl bg-sea-rose/10 hover:bg-sea-rose/20 text-sea-rose border border-sea-rose/30 text-xs transition"
                          title="Delete Job Schedule"
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
        </div>
      ) : (
        /* History Logbook Tab */
        <div className="space-y-3 font-mono text-xs">
          {filteredExecutions.map(exec => (
            <div key={exec.id} className="p-4 rounded-xl bg-ocean-900 border border-ocean-800 space-y-2 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white text-sm">{exec.jobTitle}</span>
                  <span className="text-sea-emerald font-bold">Done: {exec.dateCompleted}</span>
                </div>
                <p className="text-slate-300">Machinery: <strong>{exec.equipmentName}</strong> at <strong>{exec.runningHoursAtExecution.toLocaleString()} hrs</strong> • Completed By: <strong>{exec.completedBy}</strong></p>
                <p className="text-slate-400 italic bg-ocean-950 p-2.5 rounded-lg font-sans">"{exec.findings}"</p>
              </div>

              {activeRole !== 'owner' && (
                <button
                  onClick={() => {
                    if (confirm(`Delete execution history entry for "${exec.jobTitle}"?`)) {
                      deleteJobExecution(exec.id);
                    }
                  }}
                  className="p-2 rounded-lg bg-sea-rose/10 hover:bg-sea-rose/20 text-sea-rose border border-sea-rose/30"
                  title="Delete Execution Log"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Complete Job Modal */}
      {completeJobModalTarget && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-sea-accent" />
              Complete & Log Maintenance Job
            </h2>
            <p className="text-xs text-slate-400 font-mono">{completeJobModalTarget.title}</p>

            <form onSubmit={handleCompleteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Running Hours at Execution *</label>
                <input
                  type="number"
                  required
                  value={execFormData.runningHoursAtExecution}
                  onChange={e => setExecFormData({ ...execFormData, runningHoursAtExecution: Number(e.target.value) })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Completed By Engineer *</label>
                <input
                  type="text"
                  required
                  value={execFormData.completedBy}
                  onChange={e => setExecFormData({ ...execFormData, completedBy: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Spare Part Used (Optional)</label>
                <select
                  value={execFormData.selectedPartId}
                  onChange={e => setExecFormData({ ...execFormData, selectedPartId: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">No Spares Used</option>
                  {spareParts.filter(p => !targetVesselId || p.vesselId === targetVesselId || p.locationType === 'Land Storage').map(p => (
                    <option key={p.id} value={p.id}>{p.partName} (P/N: {p.partNumber} • Stock: {p.stockQty})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Work Findings & Overhaul Notes *</label>
                <textarea
                  rows={2}
                  required
                  value={execFormData.findings}
                  onChange={e => setExecFormData({ ...execFormData, findings: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ocean-800">
                <button
                  type="button"
                  onClick={() => setCompleteJobModalTarget(null)}
                  className="px-4 py-2 rounded-lg bg-ocean-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sea-accent text-ocean-950 font-bold"
                >
                  Complete Job & Reschedule Cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Job Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-sea-accent" />
              {editingJobId ? 'Edit Maintenance Schedule' : 'Create PMS Maintenance Schedule'}
            </h2>

            <form onSubmit={handleAddJobSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Equipment / Machinery Unit *</label>
                <select
                  value={jobFormData.equipmentId}
                  onChange={e => setJobFormData({ ...jobFormData, equipmentId: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                >
                  {equipment.filter(eq => !targetVesselId || eq.vesselId === targetVesselId).map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name} ({eq.maker} {eq.model})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500-Hour Fuel Injector Testing & Overhaul"
                  value={jobFormData.title}
                  onChange={e => setJobFormData({ ...jobFormData, title: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Interval Type</label>
                  <select
                    value={jobFormData.intervalType}
                    onChange={e => setJobFormData({ ...jobFormData, intervalType: e.target.value as any })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Calendar">Calendar Days</option>
                    <option value="RunningHours">Running Hours</option>
                    <option value="Both">Both (Whichever First)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Interval (Days)</label>
                  <input
                    type="number"
                    value={jobFormData.intervalDays}
                    onChange={e => setJobFormData({ ...jobFormData, intervalDays: Number(e.target.value) })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Interval (Hours)</label>
                  <input
                    type="number"
                    value={jobFormData.intervalHours}
                    onChange={e => setJobFormData({ ...jobFormData, intervalHours: Number(e.target.value) })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Next Due Date *</label>
                  <input
                    type="date"
                    required
                    value={jobFormData.nextDueDate}
                    onChange={e => setJobFormData({ ...jobFormData, nextDueDate: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Priority</label>
                  <select
                    value={jobFormData.priority}
                    onChange={e => setJobFormData({ ...jobFormData, priority: e.target.value as any })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Job Scope Description</label>
                <textarea
                  rows={2}
                  value={jobFormData.description}
                  onChange={e => setJobFormData({ ...jobFormData, description: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
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
                  {editingJobId ? 'Save Changes' : 'Schedule Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
