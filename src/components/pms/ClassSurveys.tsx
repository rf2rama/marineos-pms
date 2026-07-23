import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, CheckCircle2, Clock, AlertTriangle, FileText, Search } from 'lucide-react';

export const ClassSurveys: React.FC = () => {
  const { selectedVessel, jobs, completeJob, activeRole } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [surveyorName, setSurveyorName] = useState('DNV Senior Surveyor H. Weber');
  const [surveyNotes, setSurveyNotes] = useState('Satisfactory internal inspection & pressure test.');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const isAllVessels = selectedVessel.id === 'all_vessels';
  const targetVesselId = isAllVessels ? undefined : selectedVessel.id;

  const classSurveyJobs = jobs.filter(j => 
    j.classSurveyRequired &&
    (!targetVesselId || j.vesselId === targetVesselId) &&
    (j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     j.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (j.classSocietyRef || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCompleteSurvey = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const todayStr = new Date().toISOString().split('T')[0];
    completeJob({
      jobId: job.id,
      jobTitle: job.title,
      equipmentName: job.equipmentName,
      vesselId: job.vesselId,
      startDate: todayStr,
      dateCompleted: todayStr,
      runningHoursAtExecution: selectedVessel.totalRunningHours || 24000,
      completedBy: surveyorName,
      findings: `Class Survey Verified: ${surveyNotes}`,
      partsUsed: [],
      actualManHours: 4,
      estimatedManHours: job.estimatedManHours,
      signedOffByChief: true,
    });
    setSelectedJobId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-sea-amber" />
            Class Society & Statutory Survey Registry
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            {selectedVessel.name} — Mandatory classification survey items ({selectedVessel.classSociety || 'DNV'})
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search class survey items, DNV refs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-ocean-900 border border-ocean-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sea-amber/50"
          />
        </div>
      </div>

      {/* Class Society & 5-Year Special Survey Cycle Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-6 space-y-2 border border-ocean-800 md:col-span-2">
          <span className="text-[10px] font-mono text-sea-amber uppercase font-bold">ASSIGNED CLASSIFICATION SOCIETY</span>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{selectedVessel.classSociety || 'DNV Marine'}</h2>
            <span className="px-3 py-1.5 rounded-xl bg-sea-amber/20 text-sea-amber font-bold text-xs border border-sea-amber/40">
              {classSurveyJobs.length} Survey Items Required
            </span>
          </div>
          <p className="text-xs text-slate-400">Continuous Machinery Survey (CMS) cycle active. Surveys subject to annual surveyor endorsement.</p>
        </div>

        <div className="glass-panel rounded-2xl p-6 space-y-2 border border-ocean-800">
          <span className="text-[10px] font-mono text-sea-accent uppercase font-bold">SPECIAL SURVEY CYCLE</span>
          <p className="text-lg font-bold text-white">5-Year Renewal: 2028</p>
          <p className="text-xs text-slate-400">Next Intermediate Survey window opens in 14 months.</p>
        </div>
      </div>

      {/* Class Survey Jobs List */}
      <div className="space-y-3 font-mono text-xs">
        {classSurveyJobs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 glass-panel rounded-2xl border border-ocean-800">
            No pending Class Society survey items found.
          </div>
        ) : (
          classSurveyJobs.map(job => (
            <div key={job.id} className="p-4 rounded-xl bg-ocean-900 border border-ocean-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{job.title}</span>
                <span className="text-sea-amber font-bold">{job.classSocietyRef || 'CLASS-SURV-REQ'}</span>
              </div>

              <p className="text-slate-300 font-sans">Machinery: <strong>{job.equipmentName}</strong></p>
              <div className="p-2.5 rounded-lg bg-ocean-950 border border-ocean-850 flex items-center justify-between">
                <span className="text-slate-400">Target Survey Due Date: <strong className="text-white">{job.nextDueDate}</strong></span>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    job.status === 'Overdue' ? 'bg-sea-rose/20 text-sea-rose' : 'bg-sea-emerald/20 text-sea-emerald'
                  }`}>
                    {job.status}
                  </span>
                  {activeRole !== 'owner' && (
                    <button
                      onClick={() => setSelectedJobId(job.id)}
                      className="px-3 py-1 rounded-lg bg-sea-amber hover:bg-sea-amber/90 text-ocean-950 font-bold text-xs flex items-center gap-1 transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Surveyor Endorse
                    </button>
                  )}
                </div>
              </div>

              {selectedJobId === job.id && (
                <div className="p-4 rounded-xl bg-ocean-950 border border-sea-amber/40 space-y-3 font-sans mt-2">
                  <h4 className="font-bold text-white text-xs">Record Surveyor Endorsement & Close Survey Item</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">Class Surveyor Name & ID</label>
                      <input
                        type="text"
                        value={surveyorName}
                        onChange={e => setSurveyorName(e.target.value)}
                        className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Survey Remarks & Certificate Ref</label>
                      <input
                        type="text"
                        value={surveyNotes}
                        onChange={e => setSurveyNotes(e.target.value)}
                        className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-1.5 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setSelectedJobId(null)}
                      className="px-3 py-1.5 rounded-lg bg-ocean-800 text-slate-300 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleCompleteSurvey(job.id)}
                      className="px-3 py-1.5 rounded-lg bg-sea-emerald text-ocean-950 font-bold text-xs"
                    >
                      Confirm Endorsement
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
