import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IncidentReport, DrillRecord, NonConformity } from '../../types';
import { 
  ShieldAlert, Plus, AlertOctagon, Flame, ShieldCheck, FileCheck, 
  CheckCircle2, UserCheck, Users, Search, Edit3, Trash2, X, Ship 
} from 'lucide-react';

export const SafetyISM: React.FC = () => {
  const { 
    vessels, selectedVessel, incidents, addIncident, updateIncident, deleteIncident, 
    drills, addDrill, updateDrill, deleteDrill, nonConformities, addNonConformity, updateNonConformity, deleteNonConformity,
    crewMembers, activeRole 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'incidents' | 'drills' | 'non_conformities'>('incidents');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [editingIncidentId, setEditingIncidentId] = useState<string | null>(null);

  const [isDrillModalOpen, setIsDrillModalOpen] = useState(false);
  const [editingDrillId, setEditingDrillId] = useState<string | null>(null);

  const [isNCModalOpen, setIsNCModalOpen] = useState(false);
  const [editingNCId, setEditingNCId] = useState<string | null>(null);

  // Form states
  const [incidentFormData, setIncidentFormData] = useState({
    vesselId: selectedVessel.id === 'all_vessels' ? vessels[0].id : selectedVessel.id,
    title: '',
    incidentType: 'Near-Miss' as IncidentReport['incidentType'],
    dateReported: new Date().toISOString().split('T')[0],
    locationOnboard: 'Engine Room 2nd Deck',
    description: '',
    severity: 'Medium' as IncidentReport['severity'],
    rootCause: '',
    correctiveAction: '',
    selectedCrewNames: [] as string[],
    handledByCrewName: 'Chief Officer D. Rossi',
    status: 'Open' as IncidentReport['status'],
  });

  const [drillFormData, setDrillFormData] = useState({
    vesselId: selectedVessel.id === 'all_vessels' ? vessels[0].id : selectedVessel.id,
    drillType: 'Lifeboat & Launching' as DrillRecord['drillType'],
    dateConducted: new Date().toISOString().split('T')[0],
    drilledBy: 'Chief Officer D. Rossi',
    attendeesCount: 18,
    evaluation: 'Satisfactory' as DrillRecord['evaluation'],
    notes: 'All davit limit switches and engine startup verified satisfactory.',
  });

  const [ncFormData, setNcFormData] = useState({
    vesselId: selectedVessel.id === 'all_vessels' ? vessels[0].id : selectedVessel.id,
    auditType: 'PSC Inspection' as NonConformity['auditType'],
    findingDescription: 'Emergency generator auto-start relay failure during test',
    findingType: 'Minor NC' as NonConformity['findingType'],
    dateFound: new Date().toISOString().split('T')[0],
    dueDate: '2026-08-30',
    status: 'Open' as NonConformity['status'],
  });

  const isAllVessels = selectedVessel.id === 'all_vessels';
  const targetVesselId = isAllVessels ? undefined : selectedVessel.id;

  const vesselIncidents = incidents.filter(i => 
    (!targetVesselId || i.vesselId === targetVesselId) &&
    (i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     i.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (i.vesselName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
     i.locationOnboard.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const vesselDrills = drills.filter(d => 
    (!targetVesselId || d.vesselId === targetVesselId) &&
    (d.drillType.toLowerCase().includes(searchTerm.toLowerCase()) ||
     d.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (d.vesselName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
     d.drilledBy.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const vesselNCs = nonConformities.filter(nc => 
    (!targetVesselId || nc.vesselId === targetVesselId) &&
    (nc.findingDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
     nc.auditType.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleCrewSelection = (name: string) => {
    setIncidentFormData(prev => {
      const exists = prev.selectedCrewNames.includes(name);
      if (exists) {
        return { ...prev, selectedCrewNames: prev.selectedCrewNames.filter(n => n !== name) };
      } else {
        return { ...prev, selectedCrewNames: [...prev.selectedCrewNames, name] };
      }
    });
  };

  const openEditIncident = (inc: IncidentReport) => {
    setEditingIncidentId(inc.id);
    setIncidentFormData({
      vesselId: inc.vesselId,
      title: inc.title,
      incidentType: inc.incidentType,
      dateReported: inc.dateReported,
      locationOnboard: inc.locationOnboard,
      description: inc.description,
      severity: inc.severity,
      rootCause: inc.rootCause,
      correctiveAction: inc.correctiveAction,
      selectedCrewNames: inc.crewInvolvedNames ? inc.crewInvolvedNames.split(', ') : [],
      handledByCrewName: inc.handledByCrewName || 'Chief Officer D. Rossi',
      status: inc.status,
    });
    setIsIncidentModalOpen(true);
  };

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const joinedCrewNames = incidentFormData.selectedCrewNames.join(', ') || 'General Crew';
    const targetVessel = vessels.find(v => v.id === incidentFormData.vesselId) || selectedVessel;

    if (editingIncidentId) {
      updateIncident(editingIncidentId, {
        vesselId: targetVessel.id,
        vesselName: targetVessel.name,
        title: incidentFormData.title,
        incidentType: incidentFormData.incidentType,
        dateReported: incidentFormData.dateReported,
        locationOnboard: incidentFormData.locationOnboard,
        description: incidentFormData.description,
        severity: incidentFormData.severity,
        rootCause: incidentFormData.rootCause,
        correctiveAction: incidentFormData.correctiveAction,
        crewInvolvedNames: joinedCrewNames,
        handledByCrewName: incidentFormData.handledByCrewName,
        status: incidentFormData.status,
      });
      setEditingIncidentId(null);
    } else {
      addIncident({
        vesselId: targetVessel.id,
        vesselName: targetVessel.name,
        title: incidentFormData.title,
        incidentType: incidentFormData.incidentType,
        dateReported: incidentFormData.dateReported,
        locationOnboard: incidentFormData.locationOnboard,
        description: incidentFormData.description,
        severity: incidentFormData.severity,
        rootCause: incidentFormData.rootCause || 'Under Investigation',
        correctiveAction: incidentFormData.correctiveAction || 'Pending Safety Review',
        crewInvolvedNames: joinedCrewNames,
        handledByCrewName: incidentFormData.handledByCrewName,
        status: 'Open',
      });
    }

    setIsIncidentModalOpen(false);
  };

  const openAddDrillModal = () => {
    setEditingDrillId(null);
    setDrillFormData({
      vesselId: selectedVessel.id === 'all_vessels' ? vessels[0].id : selectedVessel.id,
      drillType: 'Lifeboat & Launching',
      dateConducted: new Date().toISOString().split('T')[0],
      drilledBy: 'Chief Officer D. Rossi',
      attendeesCount: 18,
      evaluation: 'Satisfactory',
      notes: 'All davit limit switches and engine startup verified satisfactory.',
    });
    setIsDrillModalOpen(true);
  };

  const openEditDrillModal = (drill: DrillRecord) => {
    setEditingDrillId(drill.id);
    setDrillFormData({
      vesselId: drill.vesselId,
      drillType: drill.drillType,
      dateConducted: drill.dateConducted,
      drilledBy: drill.drilledBy,
      attendeesCount: drill.attendeesCount,
      evaluation: drill.evaluation,
      notes: drill.notes,
    });
    setIsDrillModalOpen(true);
  };

  const handleDrillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDrillId) {
      updateDrill(editingDrillId, drillFormData);
      setEditingDrillId(null);
    } else {
      addDrill(drillFormData);
    }
    setIsDrillModalOpen(false);
  };

  const openAddNCModal = () => {
    setEditingNCId(null);
    setNcFormData({
      vesselId: selectedVessel.id === 'all_vessels' ? vessels[0].id : selectedVessel.id,
      auditType: 'PSC Inspection',
      findingDescription: 'Emergency generator auto-start relay failure during test',
      findingType: 'Minor NC',
      dateFound: new Date().toISOString().split('T')[0],
      dueDate: '2026-08-30',
      status: 'Open',
    });
    setIsNCModalOpen(true);
  };

  const openEditNCModal = (nc: NonConformity) => {
    setEditingNCId(nc.id);
    setNcFormData({
      vesselId: nc.vesselId,
      auditType: nc.auditType,
      findingDescription: nc.findingDescription,
      findingType: nc.findingType,
      dateFound: nc.dateFound,
      dueDate: nc.dueDate,
      status: nc.status,
    });
    setIsNCModalOpen(true);
  };

  const handleNCSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNCId) {
      updateNonConformity(editingNCId, ncFormData);
      setEditingNCId(null);
    } else {
      addNonConformity(ncFormData);
    }
    setIsNCModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Global Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-sea-rose" />
            Safety, ISM Code & Risk Management
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            {selectedVessel.name} — Near-miss reports, emergency drill logs, PSC audits & non-conformities
          </p>
        </div>

        {activeRole !== 'owner' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingIncidentId(null);
                setIncidentFormData({
                  vesselId: selectedVessel.id === 'all_vessels' ? vessels[0].id : selectedVessel.id,
                  title: '',
                  incidentType: 'Near-Miss',
                  dateReported: new Date().toISOString().split('T')[0],
                  locationOnboard: 'Engine Room 2nd Deck',
                  description: '',
                  severity: 'Medium',
                  rootCause: '',
                  correctiveAction: '',
                  selectedCrewNames: [crewMembers[0]?.fullName || 'Marek Kowalski'],
                  handledByCrewName: 'Chief Officer D. Rossi',
                  status: 'Open',
                });
                setIsIncidentModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-sea-rose text-white font-semibold text-xs hover:bg-sea-rose/90 transition shadow-lg shadow-sea-rose/15 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Report Incident / Near-Miss
            </button>
          </div>
        )}
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-ocean-900 border border-ocean-800 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('incidents')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'incidents' ? 'bg-sea-rose text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Incidents & Near-Misses ({vesselIncidents.length})
          </button>
          <button
            onClick={() => setActiveTab('drills')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'drills' ? 'bg-sea-rose text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Emergency Drills Log ({vesselDrills.length})
          </button>
          <button
            onClick={() => setActiveTab('non_conformities')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'non_conformities' ? 'bg-sea-rose text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            PSC & ISM Non-Conformities ({vesselNCs.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search safety records, vessel, findings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-ocean-900 border border-ocean-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sea-rose/50"
          />
        </div>
      </div>

      {/* TAB 1: INCIDENTS */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vesselIncidents.map(inc => {
              const incVessel = vessels.find(v => v.id === inc.vesselId);
              return (
                <div key={inc.id} className="glass-panel glass-panel-hover rounded-2xl p-5 space-y-3 border border-ocean-800 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                        inc.severity === 'High' ? 'bg-sea-rose/20 text-sea-rose border-sea-rose/40' : 'bg-sea-amber/20 text-sea-amber border-sea-amber/40'
                      }`}>
                        {inc.incidentType} • {inc.severity} Severity
                      </span>

                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-sea-purple/20 text-sea-purple border border-sea-purple/40 uppercase flex items-center gap-1">
                        <Ship className="w-3 h-3" />
                        {incVessel?.name || inc.vesselName || 'Vessel'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">{inc.title}</h3>
                    <p className="text-xs text-slate-300 font-mono">Location: <strong className="text-white">{inc.locationOnboard}</strong></p>
                    <p className="text-xs text-slate-400">{inc.description}</p>

                    <div className="p-3 rounded-xl bg-ocean-950/80 border border-ocean-850 space-y-1 text-xs">
                      <p className="text-slate-300">Root Cause: <strong className="text-sea-amber">{inc.rootCause}</strong></p>
                      <p className="text-slate-300">Corrective Action: <strong className="text-sea-emerald">{inc.correctiveAction}</strong></p>
                    </div>

                    {inc.crewInvolvedNames && (
                      <div className="p-2 rounded-lg bg-ocean-950/80 border border-ocean-850 text-xs font-mono text-slate-300">
                        <span>Crew Involved: <strong className="text-sea-accent">{inc.crewInvolvedNames}</strong></span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-ocean-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">Reported: {inc.dateReported}</span>
                    {activeRole !== 'owner' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditIncident(inc)}
                          className="p-1.5 rounded-lg bg-ocean-800 text-sea-accent hover:bg-ocean-750 transition"
                          title="Edit Incident Report"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete incident report "${inc.title}"?`)) {
                              deleteIncident(inc.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-sea-rose/10 text-sea-rose hover:bg-sea-rose/20 transition"
                          title="Delete Incident"
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
      )}

      {/* TAB 2: DRILLS */}
      {activeTab === 'drills' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            {activeRole !== 'owner' && (
              <button
                onClick={openAddDrillModal}
                className="px-4 py-2 rounded-xl bg-sea-rose text-white font-bold text-xs hover:bg-sea-rose/90 transition shadow-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Log Emergency Drill
              </button>
            )}
          </div>

          <div className="space-y-3 font-mono text-xs">
            {vesselDrills.map(drill => (
              <div key={drill.id} className="p-4 rounded-xl bg-ocean-900 border border-ocean-800 space-y-2 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-sm">{drill.drillType}</span>
                    <span className="text-sea-emerald font-bold">Conducted: {drill.dateConducted}</span>
                  </div>
                  <p className="text-slate-300">Drilled By: <strong>{drill.drilledBy}</strong> • Attendees: <strong>{drill.attendeesCount} crew</strong> • Evaluation: <strong className="text-sea-emerald">{drill.evaluation}</strong></p>
                  <p className="text-slate-400 italic bg-ocean-950 p-2.5 rounded-lg font-sans">"{drill.notes}"</p>
                </div>

                {activeRole !== 'owner' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditDrillModal(drill)}
                      className="p-1.5 rounded-lg bg-ocean-800 text-sea-accent hover:bg-ocean-750 transition"
                      title="Edit Drill Record"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete drill record for "${drill.drillType}"?`)) {
                          deleteDrill(drill.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-sea-rose/10 text-sea-rose hover:bg-sea-rose/20 transition"
                      title="Delete Drill Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: NON-CONFORMITIES */}
      {activeTab === 'non_conformities' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            {activeRole !== 'owner' && (
              <button
                onClick={openAddNCModal}
                className="px-4 py-2 rounded-xl bg-sea-rose text-white font-bold text-xs hover:bg-sea-rose/90 transition shadow-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Non-Conformity (NC)
              </button>
            )}
          </div>

          <div className="space-y-3 font-mono text-xs">
            {vesselNCs.map(nc => (
              <div key={nc.id} className="p-4 rounded-xl bg-ocean-900 border border-ocean-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{nc.auditType} — {nc.findingType}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      nc.status === 'Open' ? 'bg-sea-rose/20 text-sea-rose' : 'bg-sea-emerald/20 text-sea-emerald'
                    }`}>
                      {nc.status}
                    </span>
                    {activeRole !== 'owner' && (
                      <>
                        <button
                          onClick={() => updateNonConformity(nc.id, { status: nc.status === 'Closed' ? 'Open' : 'Closed' })}
                          className="px-2 py-0.5 rounded bg-ocean-800 hover:bg-ocean-750 text-sea-accent transition text-[11px]"
                        >
                          Toggle Status
                        </button>
                        <button
                          onClick={() => openEditNCModal(nc)}
                          className="p-1.5 rounded bg-ocean-800 hover:bg-ocean-750 text-sea-accent transition"
                          title="Edit Non-Conformity"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete non-conformity "${nc.findingDescription}"?`)) {
                              deleteNonConformity(nc.id);
                            }
                          }}
                          className="p-1 rounded bg-sea-rose/10 text-sea-rose hover:bg-sea-rose/20 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-slate-300 font-sans">{nc.findingDescription}</p>
                <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1">
                  <span>Date Found: {nc.dateFound}</span>
                  <span>Corrective Target: <strong className="text-white">{nc.dueDate}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit / Add Incident Modal */}
      {isIncidentModalOpen && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-sea-rose" />
              {editingIncidentId ? 'Edit Incident Report' : 'Report Incident / Near-Miss'}
            </h2>

            <form onSubmit={handleIncidentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Vessel Where Incident Occurred *</label>
                <select
                  value={incidentFormData.vesselId}
                  onChange={e => setIncidentFormData({ ...incidentFormData, vesselId: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                >
                  {vessels.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.vesselType})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Incident Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Auxiliary Engine Fuel Leak"
                  value={incidentFormData.title}
                  onChange={e => setIncidentFormData({ ...incidentFormData, title: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Type</label>
                  <select
                    value={incidentFormData.incidentType}
                    onChange={e => setIncidentFormData({ ...incidentFormData, incidentType: e.target.value as any })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Near-Miss">Near-Miss</option>
                    <option value="Minor Injury">Minor Injury</option>
                    <option value="Equipment Failure">Equipment Failure</option>
                    <option value="Environmental Spill">Environmental Spill</option>
                    <option value="Unsafe Act">Unsafe Act</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Severity</label>
                  <select
                    value={incidentFormData.severity}
                    onChange={e => setIncidentFormData({ ...incidentFormData, severity: e.target.value as any })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {/* Multi-Crew Checkbox Selection */}
              <div className="p-3 rounded-xl bg-ocean-900 border border-ocean-800 space-y-2">
                <label className="block text-sea-accent font-bold">Select Multiple Crew Members Involved *</label>
                <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                  {crewMembers.map(c => {
                    const isSelected = incidentFormData.selectedCrewNames.includes(c.fullName);
                    return (
                      <div 
                        key={c.id} 
                        onClick={() => toggleCrewSelection(c.fullName)}
                        className={`p-2 rounded-lg cursor-pointer flex items-center justify-between transition ${
                          isSelected ? 'bg-sea-rose/20 text-white font-bold border border-sea-rose/40' : 'bg-ocean-950 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span>{c.fullName} ({c.rank})</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sea-rose" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Handled / Investigated By *</label>
                <input
                  type="text"
                  required
                  value={incidentFormData.handledByCrewName}
                  onChange={e => setIncidentFormData({ ...incidentFormData, handledByCrewName: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  value={incidentFormData.description}
                  onChange={e => setIncidentFormData({ ...incidentFormData, description: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Root Cause Analysis</label>
                  <input
                    type="text"
                    value={incidentFormData.rootCause}
                    onChange={e => setIncidentFormData({ ...incidentFormData, rootCause: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Corrective Action Taken</label>
                  <input
                    type="text"
                    value={incidentFormData.correctiveAction}
                    onChange={e => setIncidentFormData({ ...incidentFormData, correctiveAction: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ocean-800">
                <button
                  type="button"
                  onClick={() => setIsIncidentModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-ocean-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sea-rose text-white font-bold"
                >
                  {editingIncidentId ? 'Save Changes' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Drill Modal */}
      {isDrillModalOpen && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-sea-rose" />
              {editingDrillId ? 'Edit Drill Record' : 'Log Emergency Drill'}
            </h2>

            <form onSubmit={handleDrillSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Drill Type</label>
                <select
                  value={drillFormData.drillType}
                  onChange={e => setDrillFormData({ ...drillFormData, drillType: e.target.value as any })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="Lifeboat & Launching">Lifeboat & Launching</option>
                  <option value="Fire & Smoke Emergency">Fire & Smoke Emergency</option>
                  <option value="SOPEP Oil Spill Response">SOPEP Oil Spill Response</option>
                  <option value="Enclosed Space Entry">Enclosed Space Entry</option>
                  <option value="Abandon Ship">Abandon Ship</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Date Conducted</label>
                  <input
                    type="date"
                    required
                    value={drillFormData.dateConducted}
                    onChange={e => setDrillFormData({ ...drillFormData, dateConducted: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Attendees Count</label>
                  <input
                    type="number"
                    value={drillFormData.attendeesCount}
                    onChange={e => setDrillFormData({ ...drillFormData, attendeesCount: Number(e.target.value) })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Drilled By Officer</label>
                <input
                  type="text"
                  required
                  value={drillFormData.drilledBy}
                  onChange={e => setDrillFormData({ ...drillFormData, drilledBy: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Evaluation Result</label>
                <select
                  value={drillFormData.evaluation}
                  onChange={e => setDrillFormData({ ...drillFormData, evaluation: e.target.value as any })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                >
                  <option value="Satisfactory">Satisfactory</option>
                  <option value="Needs Improvement">Needs Improvement</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Drill Evaluation Notes</label>
                <textarea
                  rows={2}
                  value={drillFormData.notes}
                  onChange={e => setDrillFormData({ ...drillFormData, notes: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ocean-800">
                <button
                  type="button"
                  onClick={() => setIsDrillModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-ocean-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sea-rose text-white font-bold"
                >
                  {editingDrillId ? 'Save Changes' : 'Log Drill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Non-Conformity Modal */}
      {isNCModalOpen && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-sea-rose" />
              {editingNCId ? 'Edit Non-Conformity' : 'Add Non-Conformity (NC)'}
            </h2>

            <form onSubmit={handleNCSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Audit Type</label>
                <select
                  value={ncFormData.auditType}
                  onChange={e => setNcFormData({ ...ncFormData, auditType: e.target.value as any })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="PSC Inspection">PSC Inspection</option>
                  <option value="Flag State Audit">Flag State Audit</option>
                  <option value="Internal ISM Audit">Internal ISM Audit</option>
                  <option value="Vetting (SIRE)">Vetting (SIRE)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Finding Description *</label>
                <textarea
                  rows={2}
                  required
                  value={ncFormData.findingDescription}
                  onChange={e => setNcFormData({ ...ncFormData, findingDescription: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Date Found</label>
                  <input
                    type="date"
                    required
                    value={ncFormData.dateFound}
                    onChange={e => setNcFormData({ ...ncFormData, dateFound: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Corrective Due Date</label>
                  <input
                    type="date"
                    required
                    value={ncFormData.dueDate}
                    onChange={e => setNcFormData({ ...ncFormData, dueDate: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ocean-800">
                <button
                  type="button"
                  onClick={() => setIsNCModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-ocean-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sea-rose text-white font-bold"
                >
                  {editingNCId ? 'Save Changes' : 'Add NC'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
