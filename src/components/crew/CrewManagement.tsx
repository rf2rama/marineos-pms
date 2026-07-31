import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CrewMember, SeafarerMedicalRecord, SeafarerAccidentRecord, SeafarerStatus, SeafarerCertificate, MLCRestHourLog } from '../../types';
import { 
  Users, Plus, ShieldCheck, AlertTriangle, Calendar, UserCheck, Award, Filter, Search, 
  Anchor, ArrowRight, History, CheckCircle2, HeartPulse, ShieldAlert, FileText, Edit3, XCircle, Save, LogOut, RefreshCw, Trash2, Ship, Clock, Scale
} from 'lucide-react';

export const CrewManagement: React.FC = () => {
  const { 
    vessels, selectedVessel, crewMembers, addCrewMember, updateCrewMember, deleteCrewMember,
    assignSeafarerToVessel, releaseSeafarerFromVessel, updateCrewStatus,
    addCrewCertificate, updateCrewCertificate, deleteCrewCertificate,
    addCrewMedicalRecord, deleteCrewMedicalRecord, addCrewAccidentRecord, deleteCrewAccidentRecord,
    deleteAssignmentHistory, updateCrewNotes, activeRole, mlcLogs, addMLCRestHourLog, deleteMLCRestHourLog 
  } = useApp();
  
  const [activeMainTab, setActiveMainTab] = useState<'crew_list' | 'mlc_calculator'>('crew_list');
  const [viewMode, setViewMode] = useState<'onboard' | 'pool' | 'all'>('onboard');
  const [filterRank, setFilterRank] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedSeafarerDetail, setSelectedSeafarerDetail] = useState<CrewMember | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'certs' | 'history' | 'medical' | 'accidents' | 'notes'>('certs');

  // MLC Rest Log Modal Form
  const [isMlcModalOpen, setIsMlcModalOpen] = useState(false);
  const [mlcFormData, setMlcFormData] = useState({
    crewId: crewMembers[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    workHours: 10.0,
    restHours: 14.0,
    loggedBy: 'Chief Officer D. Rossi',
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCrewId, setEditingCrewId] = useState<string | null>(null);

  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [isAccidentModalOpen, setIsAccidentModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  const [assignModalCrewId, setAssignModalCrewId] = useState<string | null>(null);
  const [releaseModalCrewId, setReleaseModalCrewId] = useState<string | null>(null);

  // Forms
  const [assignFormData, setAssignFormData] = useState({
    vesselId: selectedVessel.id === 'all_vessels' ? vessels[0].id : selectedVessel.id,
    signOnDate: new Date().toISOString().split('T')[0],
    signOffDatePlanned: '2026-12-01',
  });

  const [releaseFormData, setReleaseFormData] = useState({
    signOffDate: new Date().toISOString().split('T')[0],
    rating: 'Excellent' as 'Excellent' | 'Good' | 'Satisfactory',
    remarks: 'Completed contract with excellent performance and clean safety record.',
  });

  const [formData, setFormData] = useState({
    fullName: '',
    rank: '2nd Officer' as CrewMember['rank'],
    nationality: 'Philippines (PH)',
    seamanBookNo: 'SB-991029',
    status: 'Waiting for Deployment' as SeafarerStatus,
    certName: 'STCW Officer in Charge of Navigational Watch',
    certNumber: 'PH-COC-84920',
    certExpiryDate: '2028-05-15',
  });

  const [certFormData, setCertFormData] = useState({
    certName: 'STCW Advanced Firefighting',
    certNumber: 'STCW-AFF-2026',
    issueDate: '2023-01-10',
    expiryDate: '2028-01-10',
    issuingAuthority: 'Maritime & Port Authority of Singapore',
    status: 'Valid' as SeafarerCertificate['status'],
  });

  const [medicalFormData, setMedicalFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    conditionType: 'Illness' as SeafarerMedicalRecord['conditionType'],
    description: 'Dehydration & mild heat exhaustion after boiler room maintenance',
    fitForDuty: true,
    doctorNotes: 'Prescribed 48 hours bed rest and oral rehydration salts.',
    treatedByCrewName: 'Chief Officer D. Rossi',
  });

  const [accidentFormData, setAccidentFormData] = useState({
    incidentTitle: 'Steam Line Valve Scald Injury',
    date: new Date().toISOString().split('T')[0],
    description: 'Minor steam burn to forearm while purging glass gauge',
    injuryType: 'First Degree Thermal Burn',
    handledByCrewName: 'Chief Officer D. Rossi',
    treatmentDetails: 'Burn salve & sterile dressing applied onboard',
    status: 'Recovered' as SeafarerAccidentRecord['status'],
  });

  const [notesInput, setNotesInput] = useState('');

  const ranks = [
    'All', 'Master', 'Chief Engineer', '2nd Engineer', '3rd Engineer', '4th Engineer', 
    'Electrician', 'Motorman', 'Chief Officer', '2nd Officer', '3rd Officer', 
    'Deck Cadet', 'Engine Cadet', 'Bosun', 'AB Seaman', 'Chief Cook', 'Cook', 'Messman', 'Pumpman'
  ];

  const statusOptions: SeafarerStatus[] = [
    'Available', 'Waiting for Deployment', 'Onboard', 
    'On Leave', 'In Transit', 'Fired / Terminated', 'Blacklisted', 'Medical Hold'
  ];

  const isAllVessels = selectedVessel.id === 'all_vessels';
  const targetVesselId = isAllVessels ? undefined : selectedVessel.id;

  const filteredCrew = crewMembers.filter(member => {
    if (viewMode === 'onboard') {
      if (targetVesselId && member.currentVesselId !== targetVesselId) return false;
      if (!targetVesselId && member.status !== 'Onboard') return false;
    }
    if (viewMode === 'pool' && member.status !== 'Available' && member.status !== 'Waiting for Deployment') return false;

    const matchesSearch = member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          member.seamanBookNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.nationality.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRank = filterRank === 'All' || member.rank === filterRank;
    const matchesStatus = filterStatus === 'All' || member.status === filterStatus;

    return matchesSearch && matchesRank && matchesStatus;
  });

  const openAddModal = () => {
    setEditingCrewId(null);
    setFormData({
      fullName: '',
      rank: '2nd Officer',
      nationality: 'Philippines (PH)',
      seamanBookNo: 'SB-991029',
      status: 'Waiting for Deployment',
      certName: 'STCW Officer in Charge of Navigational Watch',
      certNumber: 'PH-COC-84920',
      certExpiryDate: '2028-05-15',
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (crew: CrewMember) => {
    setEditingCrewId(crew.id);
    setFormData({
      fullName: crew.fullName,
      rank: crew.rank,
      nationality: crew.nationality,
      seamanBookNo: crew.seamanBookNo,
      status: crew.status,
      certName: crew.certificates[0]?.certName || '',
      certNumber: crew.certificates[0]?.certNumber || '',
      certExpiryDate: crew.certificates[0]?.expiryDate || '',
    });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCrewId) {
      updateCrewMember(editingCrewId, {
        fullName: formData.fullName,
        rank: formData.rank,
        nationality: formData.nationality,
        seamanBookNo: formData.seamanBookNo,
        status: formData.status,
      });
    } else {
      addCrewMember({
        fullName: formData.fullName,
        rank: formData.rank,
        nationality: formData.nationality,
        seamanBookNo: formData.seamanBookNo,
        certificates: [{
          id: `cert-${Date.now()}`,
          certName: formData.certName,
          certNumber: formData.certNumber,
          issueDate: new Date().toISOString().split('T')[0],
          expiryDate: formData.certExpiryDate,
          issuingAuthority: 'Maritime Authority',
          status: 'Valid',
        }],
      });
    }
    setIsAddModalOpen(false);
  };

  const handleCertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeafarerDetail) return;
    addCrewCertificate(selectedSeafarerDetail.id, certFormData);
    setIsCertModalOpen(false);
  };

  const handleMedicalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeafarerDetail) return;
    addCrewMedicalRecord(selectedSeafarerDetail.id, medicalFormData);
    setIsMedicalModalOpen(false);
  };

  const handleAccidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeafarerDetail) return;
    addCrewAccidentRecord(selectedSeafarerDetail.id, accidentFormData);
    setIsAccidentModalOpen(false);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalCrewId) return;
    const vesselObj = vessels.find(v => v.id === assignFormData.vesselId) || vessels[0];
    assignSeafarerToVessel(assignModalCrewId, vesselObj.id, vesselObj.name, assignFormData.signOnDate, assignFormData.signOffDatePlanned);
    setAssignModalCrewId(null);
  };

  const handleReleaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!releaseModalCrewId) return;
    releaseSeafarerFromVessel(releaseModalCrewId, releaseFormData.remarks, releaseFormData.rating, releaseFormData.signOffDate);
    setReleaseModalCrewId(null);
  };

  const handleSaveNotes = () => {
    if (!selectedSeafarerDetail) return;
    updateCrewNotes(selectedSeafarerDetail.id, notesInput);
    setSelectedSeafarerDetail(prev => prev ? { ...prev, personalNotes: notesInput } : null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Global Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-sea-accent" />
            Crewing & Maritime Human Resources Management
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            {selectedVessel.name} — STCW Certificate Compliance, Integrated Voyage & Accident History, Medical Records
          </p>
        </div>

        {activeRole !== 'owner' && (
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-sea-accent text-ocean-950 font-semibold text-xs hover:bg-sea-accent/90 transition shadow-lg shadow-sea-accent/15 flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Register Seafarer
          </button>
        )}
      </div>

      {/* Main Subtabs Navigation: Crew List vs MLC Rest Hours Calculator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-ocean-900 border border-ocean-800 w-fit">
          <button
            onClick={() => setActiveMainTab('crew_list')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeMainTab === 'crew_list' ? 'bg-sea-accent text-ocean-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Seafarers & STCW Certificates ({crewMembers.length})</span>
          </button>

          <button
            onClick={() => setActiveMainTab('mlc_calculator')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeMainTab === 'mlc_calculator' ? 'bg-sea-accent text-ocean-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>MLC 2006 Work & Rest Hours Logbook ({mlcLogs.length})</span>
          </button>
        </div>

        {activeMainTab === 'crew_list' && (
          <div className="flex items-center gap-2">
            <select
              value={filterRank}
              onChange={e => setFilterRank(e.target.value)}
              className="bg-ocean-900 border border-ocean-700 text-xs text-white rounded-xl px-3 py-2 font-mono"
            >
              {ranks.map(r => (
                <option key={r} value={r}>Rank: {r}</option>
              ))}
            </select>

            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search seafarer, book no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-ocean-900 border border-ocean-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sea-accent/50"
              />
            </div>
          </div>
        )}
      </div>

      {activeMainTab === 'crew_list' && (
        <div className="space-y-4">
          {/* Mode Buttons */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-ocean-900 border border-ocean-800 w-fit">
            <button
              onClick={() => setViewMode('onboard')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                viewMode === 'onboard' ? 'bg-sea-accent text-ocean-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Onboard Crew
            </button>
            <button
              onClick={() => setViewMode('pool')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                viewMode === 'pool' ? 'bg-sea-accent text-ocean-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Available Pool
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                viewMode === 'all' ? 'bg-sea-accent text-ocean-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Fleet Seafarers ({crewMembers.length})
            </button>
          </div>

          {/* Crew Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCrew.map(crew => {
          const accidentCount = crew.accidentRecords ? crew.accidentRecords.length : 0;
          return (
            <div key={crew.id} className="glass-panel glass-panel-hover rounded-2xl p-5 space-y-4 flex flex-col justify-between border border-ocean-800">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-ocean-800 text-sea-accent border border-ocean-700 uppercase">
                    {crew.rank}
                  </span>

                  <div className="flex items-center gap-2">
                    <select
                      value={crew.status}
                      onChange={e => updateCrewStatus(crew.id, e.target.value as SeafarerStatus)}
                      className="bg-ocean-950 border border-ocean-750 text-[10px] font-mono text-white rounded px-2 py-0.5"
                    >
                      {statusOptions.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">{crew.fullName}</h3>
                <p className="text-xs text-slate-400 font-mono">Nationality: {crew.nationality} • Seaman Book: {crew.seamanBookNo}</p>

                {/* Safety & Accident Integration Badge */}
                <div className="flex items-center gap-2 pt-1 font-mono text-[11px]">
                  {accidentCount > 0 ? (
                    <span className="px-2 py-0.5 rounded bg-sea-rose/20 text-sea-rose border border-sea-rose/40 font-bold flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      {accidentCount} Safety Incident{accidentCount > 1 ? 's' : ''} Logged
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-sea-emerald/20 text-sea-emerald border border-sea-emerald/40 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Clean Safety Record
                    </span>
                  )}
                </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-ocean-800 text-sea-accent border border-ocean-700 uppercase">
                        {crew.rank}
                      </span>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        crew.status === 'Onboard' ? 'bg-sea-emerald/20 text-sea-emerald' : 'bg-sea-amber/20 text-sea-amber'
                      }`}>
                        {crew.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white tracking-tight flex items-center justify-between">
                      <span>{crew.fullName}</span>
                      <span className="text-xs text-slate-400 font-mono font-normal">({crew.nationality})</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">Seaman Book: {crew.seamanBookNo}</p>

                    {crew.status === 'Onboard' ? (
                      <div className="p-3 rounded-xl bg-ocean-950/80 border border-ocean-850 font-mono text-xs space-y-1">
                        <div className="flex items-center justify-between text-sea-accent font-bold">
                          <span className="flex items-center gap-1"><Ship className="w-3.5 h-3.5" /> {crew.currentVesselName}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Signed On: {crew.signOnDate}</span>
                          <span>Planned Off: {crew.signOffDatePlanned}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-ocean-950/80 border border-ocean-850 font-mono text-xs">
                        {crew.assignmentHistory && crew.assignmentHistory.length > 0 ? (
                          <p className="text-[11px] text-slate-400">
                            Last Ship: <strong className="text-white">{crew.assignmentHistory[0].vesselName}</strong> • Signed Off: <strong className="text-sea-amber">{crew.assignmentHistory[0].signOffDate}</strong>
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-500 italic">No previous vessel assignments recorded.</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-ocean-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedSeafarerDetail(crew);
                        setNotesInput(crew.personalNotes || '');
                      }}
                      className="text-xs text-sea-accent font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>View Full Profile & History</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {activeRole !== 'owner' && (
                      <div className="flex items-center gap-2">
                        {crew.status === 'Onboard' ? (
                          <button
                            onClick={() => setReleaseModalCrewId(crew.id)}
                            className="px-2.5 py-1 rounded-lg bg-sea-amber/20 hover:bg-sea-amber/30 text-sea-amber text-xs font-bold transition"
                          >
                            Sign Off
                          </button>
                        ) : (
                          <button
                            onClick={() => setAssignModalCrewId(crew.id)}
                            className="px-2.5 py-1 rounded-lg bg-sea-emerald/20 hover:bg-sea-emerald/30 text-sea-emerald text-xs font-bold transition"
                          >
                            Assign
                          </button>
                        )}

                        <button
                          onClick={() => openEditModal(crew)}
                          className="p-1.5 rounded-xl bg-ocean-800 hover:bg-ocean-750 text-sea-accent border border-ocean-700 text-xs transition"
                          title="Edit Seafarer Profile"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Delete seafarer "${crew.fullName}" from registry?`)) {
                              deleteCrewMember(crew.id);
                            }
                          }}
                          className="p-1.5 rounded-xl bg-sea-rose/10 hover:bg-sea-rose/20 text-sea-rose border border-sea-rose/30 text-xs transition"
                          title="Delete Seafarer"
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

      {activeMainTab === 'mlc_calculator' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-sea-accent" />
                MLC 2006 / STCW 2010 Seafarer Work & Rest Hours Logbook
              </h3>
              <p className="text-slate-400 text-xs font-sans">
                Monitors mandatory minimum 10 hours rest per 24-hour period and 77 hours rest in any 7-day period to prevent Port State Control (PSC) detentions.
              </p>
            </div>

            {activeRole !== 'owner' && (
              <button
                onClick={() => setIsMlcModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-sea-accent text-ocean-950 font-bold text-xs hover:bg-sea-accent/90 transition shadow-lg flex items-center gap-2 shrink-0 font-sans"
              >
                <Plus className="w-4 h-4" /> Log Seafarer Rest Hours
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {mlcLogs.length === 0 ? (
              <div className="glass-panel rounded-2xl p-10 text-center space-y-2 border border-ocean-800">
                <Scale className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="text-base font-bold text-white font-sans">No MLC Rest Hour Logs Recorded</h3>
                <p className="text-slate-400 font-sans">Log daily work and rest hours to ensure STCW 2010 compliance.</p>
              </div>
            ) : (
              mlcLogs.map(log => (
                <div key={log.id} className={`glass-panel rounded-2xl p-4 space-y-3 border transition ${
                  log.isCompliant ? 'border-ocean-800' : 'border-sea-rose/60 bg-sea-rose/5'
                }`}>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white text-sm">{log.crewName} ({log.rank})</span>
                      <span className="text-slate-400 text-xs">Date: {log.date}</span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      log.isCompliant ? 'bg-sea-emerald/20 text-sea-emerald border border-sea-emerald/40' : 'bg-sea-rose/20 text-sea-rose border border-sea-rose/40'
                    }`}>
                      {log.isCompliant ? 'STCW COMPLIANT' : 'STCW NON-COMPLIANT VIOLATION'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-ocean-950 border border-ocean-850 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">DAILY WORK HOURS:</span>
                      <strong className="text-white">{log.workHours} hrs</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">DAILY REST HOURS:</span>
                      <strong className={log.restHours >= 10 ? 'text-sea-emerald' : 'text-sea-rose'}>
                        {log.restHours} hrs (Min 10.0h required)
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">LOGGED BY OFFICER:</span>
                      <strong className="text-slate-300">{log.loggedBy}</strong>
                    </div>
                  </div>

                  {!log.isCompliant && log.violationRemarks && (
                    <div className="p-3 rounded-xl bg-sea-rose/10 border border-sea-rose/30 text-sea-rose text-xs space-y-1 font-sans">
                      <span className="font-bold uppercase flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> MLC 2006 Non-Conformity Notice
                      </span>
                      <p className="text-slate-300">{log.violationRemarks}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Assign Seafarer Modal */}
      {assignModalCrewId && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-sea-emerald" />
              Assign Seafarer to Vessel Voyage
            </h2>

            <form onSubmit={handleAssignSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Vessel</label>
                <select
                  value={assignFormData.vesselId}
                  onChange={e => setAssignFormData({ ...assignFormData, vesselId: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                >
                  {vessels.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.vesselType})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Sign On Date</label>
                  <input
                    type="date"
                    required
                    value={assignFormData.signOnDate}
                    onChange={e => setAssignFormData({ ...assignFormData, signOnDate: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Planned Sign Off</label>
                  <input
                    type="date"
                    required
                    value={assignFormData.signOffDatePlanned}
                    onChange={e => setAssignFormData({ ...assignFormData, signOffDatePlanned: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ocean-800">
                <button
                  type="button"
                  onClick={() => setAssignModalCrewId(null)}
                  className="px-4 py-2 rounded-lg bg-ocean-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sea-emerald text-ocean-950 font-bold"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sign Off Seafarer Modal */}
      {releaseModalCrewId && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <LogOut className="w-5 h-5 text-sea-amber" />
              Sign Off Seafarer & Record Appraisal
            </h2>

            <form onSubmit={handleReleaseSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Actual Sign Off Date</label>
                  <input
                    type="date"
                    required
                    value={releaseFormData.signOffDate}
                    onChange={e => setReleaseFormData({ ...releaseFormData, signOffDate: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Performance Rating</label>
                  <select
                    value={releaseFormData.rating}
                    onChange={e => setReleaseFormData({ ...releaseFormData, rating: e.target.value as any })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Satisfactory">Satisfactory</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Voyage & Master Remarks</label>
                <textarea
                  rows={2}
                  required
                  value={releaseFormData.remarks}
                  onChange={e => setReleaseFormData({ ...releaseFormData, remarks: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ocean-800">
                <button
                  type="button"
                  onClick={() => setReleaseModalCrewId(null)}
                  className="px-4 py-2 rounded-lg bg-ocean-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sea-amber text-ocean-950 font-bold"
                >
                  Sign Off Seafarer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seafarer Profile Detail Modal with Integrated History & Accident Timeline */}
      {selectedSeafarerDetail && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-3xl rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex items-center justify-between border-b border-ocean-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  {selectedSeafarerDetail.fullName} ({selectedSeafarerDetail.rank})
                </h2>
                <p className="text-xs text-slate-400 font-mono">Nationality: {selectedSeafarerDetail.nationality} • Seaman Book: {selectedSeafarerDetail.seamanBookNo}</p>
              </div>
              <button onClick={() => setSelectedSeafarerDetail(null)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 border-b border-ocean-800 pb-2 text-xs font-mono overflow-x-auto">
              <button
                onClick={() => setActiveModalTab('history')}
                className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap flex items-center gap-1.5 ${activeModalTab === 'history' ? 'bg-sea-accent text-ocean-950' : 'text-slate-400'}`}
              >
                <History className="w-3.5 h-3.5" />
                Integrated Voyage & Safety Log ({selectedSeafarerDetail.assignmentHistory.length + selectedSeafarerDetail.accidentRecords.length})
              </button>
              <button
                onClick={() => setActiveModalTab('certs')}
                className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap ${activeModalTab === 'certs' ? 'bg-sea-accent text-ocean-950' : 'text-slate-400'}`}
              >
                STCW Certificates ({selectedSeafarerDetail.certificates.length})
              </button>
              <button
                onClick={() => setActiveModalTab('medical')}
                className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap ${activeModalTab === 'medical' ? 'bg-sea-accent text-ocean-950' : 'text-slate-400'}`}
              >
                Medical Records ({selectedSeafarerDetail.medicalRecords.length})
              </button>
              <button
                onClick={() => setActiveModalTab('accidents')}
                className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap ${activeModalTab === 'accidents' ? 'bg-sea-accent text-ocean-950' : 'text-slate-400'}`}
              >
                Accident Directives ({selectedSeafarerDetail.accidentRecords.length})
              </button>
              <button
                onClick={() => setActiveModalTab('notes')}
                className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap ${activeModalTab === 'notes' ? 'bg-sea-accent text-ocean-950' : 'text-slate-400'}`}
              >
                Personal Notes
              </button>
            </div>

            {/* Tab 1: INTEGRATED VOYAGE & SAFETY ACCIDENT TIMELINE */}
            {activeModalTab === 'history' && (
              <div className="space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-300">Unified Service History & Safety Incident Log</h4>
                  <button
                    onClick={() => setIsAccidentModalOpen(true)}
                    className="px-3 py-1 rounded-lg bg-sea-rose text-white font-bold text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Direct Log Accident
                  </button>
                </div>

                {selectedSeafarerDetail.assignmentHistory.length === 0 && selectedSeafarerDetail.accidentRecords.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-ocean-900 rounded-xl">
                    No voyage history or safety incidents recorded for this seafarer.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Render Current Active Voyage if Onboard */}
                    {selectedSeafarerDetail.status === 'Onboard' && (
                      <div className="p-4 rounded-xl bg-ocean-900 border-2 border-sea-emerald/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm flex items-center gap-2">
                            <Ship className="w-4 h-4 text-sea-emerald" />
                            CURRENT ACTIVE VOYAGE: {selectedSeafarerDetail.currentVesselName}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-sea-emerald/20 text-sea-emerald font-bold">ACTIVE ONBOARD</span>
                        </div>
                        <p className="text-slate-300">Rank: <strong>{selectedSeafarerDetail.rank}</strong> • Signed On: <strong>{selectedSeafarerDetail.signOnDate}</strong> • Target Sign Off: <strong>{selectedSeafarerDetail.signOffDatePlanned}</strong></p>
                      </div>
                    )}

                    {/* Integrated Chronological Log Entries */}
                    <div className="space-y-2">
                      <h5 className="text-[11px] font-bold text-slate-400 uppercase">Historical Logs & Safety Events</h5>
                      
                      {/* Combine and sort entries */}
                      {[
                        ...selectedSeafarerDetail.assignmentHistory.map(h => ({ type: 'voyage' as const, date: h.signOffDate, data: h })),
                        ...selectedSeafarerDetail.accidentRecords.map(a => ({ type: 'accident' as const, date: a.date, data: a }))
                      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry, idx) => (
                        entry.type === 'voyage' ? (
                          <div key={`v-${idx}`} className="p-3.5 rounded-xl bg-ocean-900 border border-ocean-800 flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-sea-emerald shrink-0" />
                                <span className="font-bold text-white">{entry.data.vesselName} ({entry.data.rank})</span>
                                <span className="text-sea-amber font-bold text-[11px]">Rating: {entry.data.performanceRating}</span>
                              </div>
                              <p className="text-slate-400 text-[11px]">Sign On: {entry.data.signOnDate} → Sign Off: {entry.data.signOffDate}</p>
                              <p className="text-slate-300 italic text-[11px] font-sans">"{entry.data.remarks}"</p>
                            </div>
                            <button
                              onClick={() => deleteAssignmentHistory(selectedSeafarerDetail.id, entry.data.id)}
                              className="p-1 rounded text-sea-rose hover:bg-sea-rose/10"
                              title="Delete Voyage Entry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div key={`a-${idx}`} className="p-3.5 rounded-xl bg-sea-rose/10 border border-sea-rose/30 space-y-1 flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-sea-rose shrink-0" />
                                <span className="font-bold text-sea-rose">SAFETY ACCIDENT: {entry.data.incidentTitle}</span>
                                <span className="text-slate-300 text-[11px]">({entry.data.date})</span>
                              </div>
                              <p className="text-slate-200 text-[11px]">Injury/Type: <strong>{entry.data.injuryType}</strong> • Status: <strong className="text-sea-amber">{entry.data.status}</strong></p>
                              <p className="text-slate-300 font-sans text-[11px]">{entry.data.description}</p>
                              <p className="text-slate-400 italic text-[11px]">Treatment: "{entry.data.treatmentDetails}" — Handled by {entry.data.handledByCrewName}</p>
                            </div>
                            <button
                              onClick={() => deleteCrewAccidentRecord(selectedSeafarerDetail.id, entry.data.id)}
                              className="p-1 rounded text-sea-rose hover:bg-sea-rose/20"
                              title="Delete Accident Entry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Certificates */}
            {activeModalTab === 'certs' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsCertModalOpen(true)}
                    className="px-3 py-1 rounded-lg bg-sea-accent text-ocean-950 font-bold text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add STCW Certificate
                  </button>
                </div>
                {selectedSeafarerDetail.certificates.map(cert => (
                  <div key={cert.id} className="p-3 rounded-xl bg-ocean-900 border border-ocean-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{cert.certName}</p>
                      <p className="text-slate-400 text-[11px]">No: {cert.certNumber} • Expires: {cert.expiryDate} • Authority: {cert.issuingAuthority}</p>
                    </div>
                    <button
                      onClick={() => deleteCrewCertificate(selectedSeafarerDetail.id, cert.id)}
                      className="p-1 rounded text-sea-rose hover:bg-sea-rose/10"
                      title="Delete Certificate"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Medical */}
            {activeModalTab === 'medical' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsMedicalModalOpen(true)}
                    className="px-3 py-1 rounded-lg bg-sea-accent text-ocean-950 font-bold text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Log Medical Record
                  </button>
                </div>
                {selectedSeafarerDetail.medicalRecords.map(med => (
                  <div key={med.id} className="p-3 rounded-xl bg-ocean-900 border border-ocean-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{med.conditionType} — {med.date} {med.fitForDuty ? <span className="text-sea-emerald font-bold">(Fit for Duty)</span> : <span className="text-sea-rose font-bold">(Unfit)</span>}</p>
                      <p className="text-slate-300 text-[11px]">{med.description}</p>
                      <p className="text-slate-400 italic text-[11px]">"{med.doctorNotes}"</p>
                    </div>
                    <button
                      onClick={() => deleteCrewMedicalRecord(selectedSeafarerDetail.id, med.id)}
                      className="p-1 rounded text-sea-rose hover:bg-sea-rose/10"
                      title="Delete Medical Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 4: Accidents Directives */}
            {activeModalTab === 'accidents' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsAccidentModalOpen(true)}
                    className="px-3 py-1 rounded-lg bg-sea-rose text-white font-bold text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Log Accident Record
                  </button>
                </div>
                {selectedSeafarerDetail.accidentRecords.map(acc => (
                  <div key={acc.id} className="p-3 rounded-xl bg-ocean-900 border border-ocean-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{acc.incidentTitle} ({acc.injuryType}) — {acc.date}</p>
                      <p className="text-slate-300 text-[11px]">{acc.description}</p>
                      <p className="text-slate-400 italic text-[11px]">Treatment: "{acc.treatmentDetails}" • Status: {acc.status}</p>
                    </div>
                    <button
                      onClick={() => deleteCrewAccidentRecord(selectedSeafarerDetail.id, acc.id)}
                      className="p-1 rounded text-sea-rose hover:bg-sea-rose/10"
                      title="Delete Accident Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 5: Personal Notes */}
            {activeModalTab === 'notes' && (
              <div className="space-y-3 font-mono text-xs">
                <textarea
                  rows={4}
                  value={notesInput}
                  onChange={e => setNotesInput(e.target.value)}
                  placeholder="Enter confidential crewing notes, appraisal performance remarks..."
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg p-3 text-white font-sans text-xs"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotes}
                    className="px-3.5 py-1.5 rounded-lg bg-sea-accent text-ocean-950 font-bold text-xs flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Personal Notes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Seafarer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-sea-accent" />
              {editingCrewId ? 'Edit Seafarer Profile' : 'Register New Seafarer'}
            </h2>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Rank</label>
                  <select
                    value={formData.rank}
                    onChange={e => setFormData({ ...formData, rank: e.target.value as any })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  >
                    {ranks.filter(r => r !== 'All').map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Nationality</label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Seaman Book Number</label>
                <input
                  type="text"
                  value={formData.seamanBookNo}
                  onChange={e => setFormData({ ...formData, seamanBookNo: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
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
                  {editingCrewId ? 'Save Changes' : 'Register Seafarer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Medical Event Modal */}
      {isMedicalModalOpen && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-sea-accent" />
              Log Medical Event / Consultation
            </h2>

            <form onSubmit={handleMedicalSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Condition Type</label>
                  <select
                    value={medicalFormData.conditionType}
                    onChange={e => setMedicalFormData({ ...medicalFormData, conditionType: e.target.value as any })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Routine Medical">Routine Medical</option>
                    <option value="Illness">Illness</option>
                    <option value="Injury">Injury</option>
                    <option value="Vaccination">Vaccination</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Fit for Duty?</label>
                  <select
                    value={medicalFormData.fitForDuty ? 'true' : 'false'}
                    onChange={e => setMedicalFormData({ ...medicalFormData, fitForDuty: e.target.value === 'true' })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                  >
                    <option value="true">YES — Fit for Duty</option>
                    <option value="false">NO — Medical Hold / Unfit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={medicalFormData.description}
                  onChange={e => setMedicalFormData({ ...medicalFormData, description: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Doctor Notes & Treatment</label>
                <textarea
                  rows={2}
                  value={medicalFormData.doctorNotes}
                  onChange={e => setMedicalFormData({ ...medicalFormData, doctorNotes: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ocean-800">
                <button
                  type="button"
                  onClick={() => setIsMedicalModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-ocean-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sea-accent text-ocean-950 font-bold"
                >
                  Save Medical Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Accident Event Modal */}
      {isAccidentModalOpen && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-sea-rose" />
              Log Seafarer Accident Record
            </h2>

            <form onSubmit={handleAccidentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Incident Title *</label>
                <input
                  type="text"
                  required
                  value={accidentFormData.incidentTitle}
                  onChange={e => setAccidentFormData({ ...accidentFormData, incidentTitle: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Injury Type</label>
                  <input
                    type="text"
                    value={accidentFormData.injuryType}
                    onChange={e => setAccidentFormData({ ...accidentFormData, injuryType: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Status</label>
                  <select
                    value={accidentFormData.status}
                    onChange={e => setAccidentFormData({ ...accidentFormData, status: e.target.value as any })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                  >
                    <option value="Recovered">Recovered</option>
                    <option value="Under Treatment">Under Treatment</option>
                    <option value="Repatriated">Repatriated</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Treatment Details</label>
                <textarea
                  rows={2}
                  value={accidentFormData.treatmentDetails}
                  onChange={e => setAccidentFormData({ ...accidentFormData, treatmentDetails: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ocean-800">
                <button
                  type="button"
                  onClick={() => setIsAccidentModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-ocean-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sea-rose text-white font-bold"
                >
                  Save Accident Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add STCW Certificate Modal */}
      {isCertModalOpen && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-sea-accent" />
              Add STCW Certificate
            </h2>

            <form onSubmit={handleCertSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Certificate Name *</label>
                <input
                  type="text"
                  required
                  value={certFormData.certName}
                  onChange={e => setCertFormData({ ...certFormData, certName: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Certificate Number</label>
                <input
                  type="text"
                  value={certFormData.certNumber}
                  onChange={e => setCertFormData({ ...certFormData, certNumber: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={certFormData.issueDate}
                    onChange={e => setCertFormData({ ...certFormData, issueDate: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={certFormData.expiryDate}
                    onChange={e => setCertFormData({ ...certFormData, expiryDate: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Issuing Authority</label>
                <input
                  type="text"
                  value={certFormData.issuingAuthority}
                  onChange={e => setCertFormData({ ...certFormData, issuingAuthority: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ocean-800">
                <button
                  type="button"
                  onClick={() => setIsCertModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-ocean-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sea-accent text-ocean-950 font-bold"
                >
                  Save Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MLC 2006 Rest Hour Log Modal Dialog */}
      {isMlcModalOpen && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl font-sans">
            <div className="flex items-center justify-between border-b border-ocean-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                  <Scale className="w-5 h-5 text-sea-accent" />
                  Log MLC 2006 / STCW Seafarer Rest Hours
                </h2>
                <p className="text-xs text-slate-400 font-mono">STCW mandatory minimum: 10 hours rest in any 24-hour period</p>
              </div>
              <button onClick={() => setIsMlcModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const crewObj = crewMembers.find(c => c.id === mlcFormData.crewId) || crewMembers[0];
                const restHrs = Number(mlcFormData.restHours);
                const workHrs = Number(mlcFormData.workHours);
                const isCompliant = restHrs >= 10.0;

                addMLCRestHourLog({
                  vesselId: selectedVessel.id === 'all_vessels' ? vessels[0].id : selectedVessel.id,
                  crewId: crewObj.id,
                  crewName: crewObj.fullName,
                  rank: crewObj.rank,
                  date: mlcFormData.date,
                  workHours: workHrs,
                  restHours: restHrs,
                  isCompliant,
                  violationRemarks: !isCompliant ? `STCW 2010 Non-Conformity: Seafarer rested only ${restHrs}h (<10h minimum required).` : undefined,
                  loggedBy: mlcFormData.loggedBy,
                });
                setIsMlcModalOpen(false);
              }}
              className="space-y-3 text-xs font-mono"
            >
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Select Seafarer *</label>
                <select
                  value={mlcFormData.crewId}
                  onChange={e => setMlcFormData({ ...mlcFormData, crewId: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                >
                  {crewMembers.map(c => (
                    <option key={c.id} value={c.id}>{c.rank} {c.fullName} ({c.status})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Date Logged *</label>
                <input
                  type="date"
                  required
                  value={mlcFormData.date}
                  onChange={e => setMlcFormData({ ...mlcFormData, date: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="block text-slate-400 mb-1">Daily Work Hours *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={mlcFormData.workHours}
                    onChange={e => {
                      const work = Number(e.target.value);
                      const rest = Math.max(0, 24 - work);
                      setMlcFormData({ ...mlcFormData, workHours: work, restHours: rest });
                    }}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Calculated Rest Hours *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={mlcFormData.restHours}
                    onChange={e => setMlcFormData({ ...mlcFormData, restHours: Number(e.target.value) })}
                    className={`w-full bg-ocean-900 border rounded-lg px-3 py-2 font-bold ${
                      mlcFormData.restHours >= 10 ? 'text-sea-emerald border-sea-emerald/40' : 'text-sea-rose border-sea-rose/40'
                    }`}
                  />
                </div>
              </div>

              {mlcFormData.restHours < 10 && (
                <div className="p-2.5 rounded-xl bg-sea-rose/20 border border-sea-rose/40 text-sea-rose text-[11px] font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>WARNING: Rest hours &lt; 10h breaches STCW 2010 / MLC 2006 mandatory rest limit!</span>
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Logged By Officer</label>
                <input
                  type="text"
                  required
                  value={mlcFormData.loggedBy}
                  onChange={e => setMlcFormData({ ...mlcFormData, loggedBy: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ocean-800 font-sans">
                <button
                  type="button"
                  onClick={() => setIsMlcModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-ocean-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sea-accent text-ocean-950 font-bold"
                >
                  Save MLC Rest Hour Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrewManagement;
