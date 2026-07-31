import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkOrderCard, DrydockProject } from '../../types';
import { Ship, Plus, Share2, FileText, CheckCircle2, Clock, DollarSign, ExternalLink, Search, Printer, Download, Eye, Edit3, Trash2, XCircle } from 'lucide-react';

export const DrydockManager: React.FC = () => {
  const { vessels, selectedVessel, drydockProjects, addDrydockProject, updateDrydockProject, deleteDrydockProject, workOrders, addWorkOrder, updateWorkOrder, updateWorkOrderStatus, deleteWorkOrder, activeRole } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWorkOrderId, setEditingWorkOrderId] = useState<string | null>(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  const [shareModalToken, setShareModalToken] = useState<string | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    department: 'Hull & Steel' as WorkOrderCard['department'],
    equipmentRef: 'Underwater Outer Shell Plating',
    scopeDescription: '',
    plannedBudgetIDR: 50000,
    contractorName: 'Damen Shiprepair Rotterdam',
    deadline: '2026-08-15',
    status: 'Draft' as WorkOrderCard['status'],
  });

  const [projectFormData, setProjectFormData] = useState({
    vesselId: selectedVessel.id === 'all_vessels' ? vessels[0].id : selectedVessel.id,
    shipyardName: 'Damen Shiprepair Rotterdam',
    location: 'Rotterdam, Netherlands',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    totalPlannedBudgetIDR: 450000,
    totalActualCostIDR: 410000,
    status: 'Planning' as DrydockProject['status'],
  });

  const isAllVessels = selectedVessel.id === 'all_vessels';
  const targetVesselId = isAllVessels ? undefined : selectedVessel.id;

  const currentProject = drydockProjects.find(p => !targetVesselId || p.vesselId === targetVesselId) || drydockProjects[0];
  const projectWorkOrders = workOrders.filter(wo => 
    (!targetVesselId || wo.vesselId === targetVesselId) &&
    (wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     wo.scopeDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (wo.contractorName || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openAddWorkOrderModal = () => {
    setEditingWorkOrderId(null);
    setFormData({
      title: '',
      department: 'Hull & Steel',
      equipmentRef: 'Underwater Outer Shell Plating',
      scopeDescription: '',
      plannedBudgetIDR: 50000,
      contractorName: 'Damen Shiprepair Rotterdam',
      deadline: '2026-08-15',
      status: 'Draft',
    });
    setIsAddModalOpen(true);
  };

  const openEditWorkOrderModal = (wo: WorkOrderCard) => {
    setEditingWorkOrderId(wo.id);
    setFormData({
      title: wo.title,
      department: wo.department,
      equipmentRef: wo.equipmentRef,
      scopeDescription: wo.scopeDescription,
      plannedBudgetIDR: wo.plannedBudgetIDR,
      contractorName: wo.contractorName || '',
      deadline: wo.deadline,
      status: wo.status,
    });
    setIsAddModalOpen(true);
  };

  const handleWorkOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWorkOrderId) {
      updateWorkOrder(editingWorkOrderId, {
        title: formData.title,
        department: formData.department,
        equipmentRef: formData.equipmentRef,
        scopeDescription: formData.scopeDescription,
        plannedBudgetIDR: Number(formData.plannedBudgetIDR),
        contractorName: formData.contractorName,
        deadline: formData.deadline,
        status: formData.status,
      });
    } else {
      addWorkOrder({
        projectId: currentProject ? currentProject.id : 'dd-proj-1',
        vesselId: selectedVessel.id === 'all_vessels' ? vessels[0].id : selectedVessel.id,
        title: formData.title,
        department: formData.department,
        equipmentRef: formData.equipmentRef,
        scopeDescription: formData.scopeDescription,
        plannedBudgetIDR: Number(formData.plannedBudgetIDR),
        contractorName: formData.contractorName,
        deadline: formData.deadline,
        status: 'Draft',
      });
    }
    setIsAddModalOpen(false);
  };

  const openAddProjectModal = () => {
    setEditingProjectId(null);
    setProjectFormData({
      vesselId: selectedVessel.id === 'all_vessels' ? vessels[0].id : selectedVessel.id,
      shipyardName: 'Damen Shiprepair Rotterdam',
      location: 'Rotterdam, Netherlands',
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      totalPlannedBudgetIDR: 450000,
      totalActualCostIDR: 410000,
      status: 'Planning',
    });
    setIsProjectModalOpen(true);
  };

  const openEditProjectModal = (proj: DrydockProject) => {
    setEditingProjectId(proj.id);
    setProjectFormData({
      vesselId: proj.vesselId,
      shipyardName: proj.shipyardName,
      location: proj.location,
      startDate: proj.startDate,
      endDate: proj.endDate,
      totalPlannedBudgetIDR: proj.totalPlannedBudgetIDR,
      totalActualCostIDR: proj.totalActualCostIDR,
      status: proj.status,
    });
    setIsProjectModalOpen(true);
  };

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProjectId) {
      updateDrydockProject(editingProjectId, projectFormData);
    } else {
      addDrydockProject(projectFormData);
    }
    setIsProjectModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Ship className="w-5 h-5 text-sea-accent" />
            Drydock Repair & Shipyard Management Module
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            {selectedVessel.name} — Work order specifications, contractor tender quotes & budget tracking
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search work orders, contractor quotes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-ocean-900 border border-ocean-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sea-accent/50"
            />
          </div>

          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-ocean-900 hover:bg-ocean-850 border border-ocean-700 text-sea-accent font-semibold text-xs transition flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Drydock Spec Report</span>
          </button>

          {activeRole !== 'owner' && (
            <>
              <button
                onClick={openAddProjectModal}
                className="px-3.5 py-2 rounded-xl bg-ocean-900 border border-ocean-700 text-sea-accent font-semibold text-xs hover:bg-ocean-850 transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>New Project</span>
              </button>

              <button
                onClick={openAddWorkOrderModal}
                className="px-4 py-2 rounded-xl bg-sea-accent text-ocean-950 font-semibold text-xs hover:bg-sea-accent/90 transition shadow-lg shadow-sea-accent/15 flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>New Work Order Card</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Drydock Project Header Card */}
      {currentProject && (
        <div className="glass-panel rounded-2xl p-6 space-y-4 border border-ocean-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-ocean-800 pb-4">
            <div>
              <span className="text-[10px] font-mono text-sea-accent font-bold uppercase">ACTIVE DRYDOCK PROJECT</span>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {currentProject.shipyardName} ({currentProject.location})
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Duration: {currentProject.startDate} to {currentProject.endDate} • Status: <strong className="text-sea-accent">{currentProject.status}</strong>
              </p>
            </div>

            {activeRole !== 'owner' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditProjectModal(currentProject)}
                  className="px-3 py-1.5 rounded-xl bg-ocean-900 hover:bg-ocean-850 border border-ocean-700 text-sea-accent text-xs font-semibold transition flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Project</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete drydock project at "${currentProject.shipyardName}"?`)) {
                      deleteDrydockProject(currentProject.id);
                    }
                  }}
                  className="p-1.5 rounded-xl bg-sea-rose/10 hover:bg-sea-rose/20 text-sea-rose border border-sea-rose/30 text-xs transition"
                  title="Delete Project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs pt-1">
            <div className="p-3 rounded-xl bg-ocean-900 border border-ocean-850">
              <span className="text-slate-400 block text-[10px]">PLANNED BUDGET</span>
              <span className="font-bold text-white text-sm">${(currentProject.totalPlannedBudgetIDR || 0).toLocaleString()} IDR</span>
            </div>
            <div className="p-3 rounded-xl bg-ocean-900 border border-ocean-850">
              <span className="text-slate-400 block text-[10px]">ACTUAL QUOTED COST</span>
              <span className="font-bold text-sea-accent text-sm">${(currentProject.totalActualCostIDR || 0).toLocaleString()} IDR</span>
            </div>
            <div className="p-3 rounded-xl bg-ocean-900 border border-ocean-850">
              <span className="text-slate-400 block text-[10px]">TOTAL WORK CARDS</span>
              <span className="font-bold text-sea-emerald text-sm">{projectWorkOrders.length} Cards</span>
            </div>
            <div className="p-3 rounded-xl bg-ocean-900 border border-ocean-850">
              <span className="text-slate-400 block text-[10px]">COMPLETED CARDS</span>
              <span className="font-bold text-sea-amber text-sm">{projectWorkOrders.filter(w => w.status === 'Completed').length} / {projectWorkOrders.length}</span>
            </div>
          </div>

          {/* VISUAL YARD GANTT CHART TIMELINE & BUDGET BURN RATE */}
          <div className="p-4 rounded-xl bg-ocean-950 border border-ocean-850 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white uppercase text-[11px]">SHIPYARD WORK ORDERS GANTT TIMELINE & BUDGET BURN</span>
              <span className="text-[10px] text-sea-accent">Tender Deadline: {currentProject.endDate}</span>
            </div>

            <div className="space-y-2">
              {projectWorkOrders.map(wo => {
                const percentDone = wo.status === 'Completed' ? 100 : (wo.status === 'In Progress' ? 65 : (wo.status === 'Inspection Ready' ? 90 : 20));
                return (
                  <div key={wo.id} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-200 font-bold truncate max-w-[200px]">{wo.title}</span>
                      <span className="text-slate-400">
                        {wo.contractorName || 'Yard Contractor'} • <strong className="text-sea-amber">${(wo.contractorQuoteIDR || wo.plannedBudgetIDR || 0).toLocaleString()} IDR</strong>
                      </span>
                    </div>

                    <div className="w-full bg-ocean-900 rounded-lg h-3 p-0.5 border border-ocean-800 relative overflow-hidden flex items-center">
                      <div 
                        className={`h-full rounded transition-all duration-700 ${
                          wo.status === 'Completed' ? 'bg-sea-emerald' :
                          wo.status === 'In Progress' ? 'bg-sea-accent animate-pulse' :
                          'bg-sea-amber'
                        }`}
                        style={{ width: `${percentDone}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white drop-shadow">
                        {wo.department} — {wo.status} ({percentDone}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Work Order Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projectWorkOrders.map(wo => (
          <div key={wo.id} className="glass-panel glass-panel-hover rounded-2xl p-5 space-y-4 flex flex-col justify-between border border-ocean-800">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-ocean-800 text-sea-accent border border-ocean-700 uppercase">
                  {wo.department}
                </span>

                <select
                  value={wo.status}
                  onChange={e => updateWorkOrderStatus(wo.id, e.target.value as WorkOrderCard['status'])}
                  className="bg-ocean-950 border border-ocean-750 text-[10px] font-mono text-white rounded px-2 py-0.5"
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent for Tender">Sent for Tender</option>
                  <option value="Approved">Approved</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Inspection Ready">Inspection Ready</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <h3 className="text-base font-bold text-white tracking-tight">{wo.title}</h3>
              <p className="text-xs text-slate-400 font-mono">Ref: {wo.equipmentRef}</p>
              <p className="text-xs text-slate-300">{wo.scopeDescription}</p>

              <div className="p-3 rounded-xl bg-ocean-950/80 border border-ocean-850 space-y-1 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Planned Budget:</span>
                  <span className="font-bold text-white">${(wo.plannedBudgetIDR || 0).toLocaleString()} IDR</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Contractor: {wo.contractorName || 'TBD'}</span>
                  <span>Deadline: {wo.deadline}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-ocean-800 flex items-center justify-between">
              <button
                onClick={() => setShareModalToken(wo.publicToken)}
                className="text-xs text-sea-accent font-semibold hover:underline flex items-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Public Vendor Link</span>
              </button>

              {activeRole !== 'owner' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditWorkOrderModal(wo)}
                    className="p-1.5 rounded-xl bg-ocean-800 hover:bg-ocean-750 text-sea-accent border border-ocean-700 text-xs transition"
                    title="Edit Work Order Card"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete work order card "${wo.title}"?`)) {
                        deleteWorkOrder(wo.id);
                      }
                    }}
                    className="p-1.5 rounded-xl bg-sea-rose/10 hover:bg-sea-rose/20 text-sea-rose border border-sea-rose/30 text-xs transition"
                    title="Delete Work Order Card"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Share Public Vendor Link Modal */}
      {shareModalToken && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-sea-accent" /> Public Contractor Portal Access Link
              </h3>
              <button onClick={() => setShareModalToken(null)} className="text-slate-400 hover:text-white">
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-300 font-sans">
              External shipyard contractors can submit tender quotes and upload completion photos directly using this secure token link:
            </p>

            <div className="p-3 rounded-xl bg-ocean-950 border border-ocean-800 break-all text-sea-accent font-bold">
              https://marineos.app/tender/work-order?token={shareModalToken}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://marineos.app/tender/work-order?token=${shareModalToken}`);
                  alert('Vendor tender link copied to clipboard!');
                  setShareModalToken(null);
                }}
                className="px-4 py-2 rounded-xl bg-sea-accent text-ocean-950 font-bold"
              >
                Copy Link to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Specification PDF Tender Report Modal */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-3xl rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex items-center justify-between border-b border-ocean-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Drydock Repair Specification Tender Document</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedVessel.name} • {currentProject?.shipyardName || 'Shipyard Specification'}</p>
              </div>
              <button onClick={() => setIsPdfModalOpen(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-white text-slate-900 rounded-xl space-y-4 font-mono text-xs shadow-inner">
              <div className="border-b border-slate-300 pb-3 flex justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">TECHNICAL REPAIR SPECIFICATION REPORT</h2>
                  <p className="text-slate-600">Vessel: {selectedVessel.name} (IMO: {selectedVessel.imoNumber})</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">Class: {selectedVessel.classSociety}</p>
                  <p className="text-slate-500">Date: {new Date().toISOString().split('T')[0]}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 underline uppercase">WORK CARDS SUMMARY ({projectWorkOrders.length} ITEMS)</h4>
                {projectWorkOrders.map((wo, i) => (
                  <div key={wo.id} className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                    <p className="font-bold text-slate-900">{i + 1}. [{wo.department}] {wo.title}</p>
                    <p className="text-slate-700">Ref: {wo.equipmentRef} • Budget: ${(wo.plannedBudgetIDR || 0).toLocaleString()} IDR</p>
                    <p className="text-slate-600 italic">Scope: "{wo.scopeDescription}"</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-ocean-800">
              <button
                onClick={() => {
                  window.print();
                  setIsPdfModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-sea-accent text-ocean-950 font-bold text-xs flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print / Export PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Work Order Card Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-sea-accent" />
              {editingWorkOrderId ? 'Edit Drydock Work Order Card' : 'New Drydock Work Order Card'}
            </h2>

            <form onSubmit={handleWorkOrderSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Work Card Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value as any })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Hull & Steel">Hull & Steel</option>
                    <option value="Engine">Engine</option>
                    <option value="Deck">Deck</option>
                    <option value="Electrical">Electrical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Equipment / Hull Ref</label>
                  <input
                    type="text"
                    value={formData.equipmentRef}
                    onChange={e => setFormData({ ...formData, equipmentRef: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Scope Description</label>
                <textarea
                  rows={2}
                  required
                  value={formData.scopeDescription}
                  onChange={e => setFormData({ ...formData, scopeDescription: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Planned Budget ($)</label>
                  <input
                    type="number"
                    value={formData.plannedBudgetIDR}
                    onChange={e => setFormData({ ...formData, plannedBudgetIDR: Number(e.target.value) })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Deadline Date</label>
                  <input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
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
                  {editingWorkOrderId ? 'Save Changes' : 'Save Work Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Project Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Ship className="w-5 h-5 text-sea-accent" />
              {editingProjectId ? 'Edit Drydock Project' : 'Create Drydock Project'}
            </h2>

            <form onSubmit={handleProjectSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Shipyard Name *</label>
                <input
                  type="text"
                  required
                  value={projectFormData.shipyardName}
                  onChange={e => setProjectFormData({ ...projectFormData, shipyardName: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={projectFormData.location}
                  onChange={e => setProjectFormData({ ...projectFormData, location: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={projectFormData.startDate}
                    onChange={e => setProjectFormData({ ...projectFormData, startDate: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={projectFormData.endDate}
                    onChange={e => setProjectFormData({ ...projectFormData, endDate: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Planned Budget ($)</label>
                  <input
                    type="number"
                    value={projectFormData.totalPlannedBudgetIDR}
                    onChange={e => setProjectFormData({ ...projectFormData, totalPlannedBudgetIDR: Number(e.target.value) })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Actual Quoted ($)</label>
                  <input
                    type="number"
                    value={projectFormData.totalActualCostIDR}
                    onChange={e => setProjectFormData({ ...projectFormData, totalActualCostIDR: Number(e.target.value) })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ocean-800">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-ocean-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sea-accent text-ocean-950 font-bold"
                >
                  {editingProjectId ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
