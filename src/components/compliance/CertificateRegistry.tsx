import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useCertificateStore } from '@marineos/shared';
import { ShieldAlert, Plus, ShieldCheck, FileText, Calendar, Trash2, Edit3, Ship } from 'lucide-react';

export const CertificateRegistry: React.FC = () => {
  const { vessels, selectedVessel, activeRole } = useApp();
  const { certificates, addCertificate, updateCertificate, deleteCertificate, checkExpirations } = useCertificateStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    vesselId: vessels[0]?.id || '',
    certificateName: '',
    certificateNumber: '',
    issuingAuthority: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0],
  });

  useEffect(() => {
    // Initial check for expirations
    checkExpirations();
  }, [checkExpirations]);

  const targetVesselId = selectedVessel.id === 'all_vessels' ? undefined : selectedVessel.id;
  
  const filteredCerts = certificates.filter(cert => {
    const matchesVessel = !targetVesselId || cert.vesselId === targetVesselId;
    const matchesStatus = statusFilter === 'All' || cert.status === statusFilter;
    const matchesSearch = 
      (cert.certificateName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (cert.certificateNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cert.issuingAuthority || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    return matchesVessel && matchesStatus && matchesSearch;
  });

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      vesselId: targetVesselId || vessels[0]?.id || '',
      certificateName: '',
      certificateNumber: '',
      issuingAuthority: '',
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cert: any) => {
    setEditingId(cert.id);
    setFormData({
      vesselId: cert.vesselId,
      certificateName: cert.certificateName,
      certificateNumber: cert.certificateNumber,
      issuingAuthority: cert.issuingAuthority,
      issueDate: new Date(cert.issueDate).toISOString().split('T')[0],
      expiryDate: new Date(cert.expiryDate).toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vName = vessels.find(v => v.id === formData.vesselId)?.name || 'Unknown Vessel';
    
    if (editingId) {
      updateCertificate(editingId, {
        vesselId: formData.vesselId,
        vesselName: vName,
        certificateName: formData.certificateName,
        certificateNumber: formData.certificateNumber,
        issuingAuthority: formData.issuingAuthority,
        issueDate: new Date(formData.issueDate),
        expiryDate: new Date(formData.expiryDate),
      });
    } else {
      addCertificate({
        id: crypto.randomUUID(),
        vesselId: formData.vesselId,
        vesselName: vName,
        certificateName: formData.certificateName,
        certificateNumber: formData.certificateNumber,
        issuingAuthority: formData.issuingAuthority,
        issueDate: new Date(formData.issueDate),
        expiryDate: new Date(formData.expiryDate),
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sea-emerald" />
            Vessel Certificate Registry
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            {selectedVessel.name} — Track statutory certificates and automated renewal reminders
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search certificates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 bg-ocean-900 border border-ocean-700 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sea-accent"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-ocean-900 border border-ocean-700 rounded-xl px-3 py-2 text-xs text-slate-100"
          >
            <option value="All">All Statuses</option>
            <option value="Valid">Valid</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Expired">Expired</option>
          </select>

          {activeRole !== 'owner' && (
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-sea-accent text-ocean-950 font-semibold text-xs hover:bg-sea-accent/90 transition shadow-lg shadow-sea-accent/15 flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Certificate
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCerts.map(cert => (
          <div key={cert.id} className="glass-panel p-5 rounded-2xl border border-ocean-800 space-y-4 relative overflow-hidden group">
            {/* Status indicator line */}
            <div className={`absolute top-0 left-0 w-full h-1 ${
              cert.status === 'Valid' ? 'bg-sea-emerald' : 
              cert.status === 'Expiring Soon' ? 'bg-sea-amber animate-pulse' : 'bg-sea-rose'
            }`} />
            
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-ocean-950 text-slate-300 border border-ocean-800 uppercase mb-2 inline-block">
                  {cert.certificateNumber}
                </span>
                <h3 className="text-sm font-bold text-white">{cert.certificateName}</h3>
                <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-1">
                  <Ship className="w-3 h-3" /> {cert.vesselName}
                </p>
              </div>
              <span className={`px-2 py-1 text-[10px] font-bold rounded-lg ${
                cert.status === 'Valid' ? 'bg-sea-emerald/20 text-sea-emerald border border-sea-emerald/30' : 
                cert.status === 'Expiring Soon' ? 'bg-sea-amber/20 text-sea-amber border border-sea-amber/30' : 
                'bg-sea-rose/20 text-sea-rose border border-sea-rose/30'
              }`}>
                {cert.status}
              </span>
            </div>

            <div className="p-3 bg-ocean-900/50 rounded-xl space-y-2 border border-ocean-800 text-xs font-mono">
              <div className="flex justify-between items-center text-slate-400">
                <span>Authority:</span>
                <strong className="text-slate-200">{cert.issuingAuthority}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Issued:</span>
                <strong className="text-slate-200">{new Date(cert.issueDate).toLocaleDateString()}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Expires:</span>
                <strong className={`flex items-center gap-1 ${
                  cert.status === 'Valid' ? 'text-sea-emerald' : 
                  cert.status === 'Expiring Soon' ? 'text-sea-amber font-bold' : 'text-sea-rose font-bold'
                }`}>
                  <Calendar className="w-3 h-3" />
                  {new Date(cert.expiryDate).toLocaleDateString()}
                </strong>
              </div>
            </div>

            {activeRole !== 'owner' && (
              <div className="pt-2 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(cert)}
                  className="p-1.5 rounded-lg bg-ocean-800 text-sea-accent hover:bg-ocean-700 transition"
                  title="Edit/Renew"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete certificate ${cert.certificateName}?`)) {
                      deleteCertificate(cert.id);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-sea-rose/10 text-sea-rose hover:bg-sea-rose/20 transition"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-sea-accent" />
              {editingId ? 'Edit Certificate' : 'Add New Certificate'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Vessel (Point & Click) *</label>
                <select
                  required
                  value={formData.vesselId}
                  onChange={e => setFormData({ ...formData, vesselId: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                >
                  <option value="" disabled>Select Vessel...</option>
                  {vessels.filter(v => v.id !== 'all_vessels').map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Certificate Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Safety Construction Certificate"
                  value={formData.certificateName}
                  onChange={e => setFormData({ ...formData, certificateName: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Certificate Number</label>
                  <input
                    type="text"
                    required
                    value={formData.certificateNumber}
                    onChange={e => setFormData({ ...formData, certificateNumber: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Issuing Authority</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DNV, ABS, BKI"
                    value={formData.issuingAuthority}
                    onChange={e => setFormData({ ...formData, issuingAuthority: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Issue Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.issueDate}
                    onChange={e => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-ocean-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sea-accent text-ocean-950 font-bold hover:bg-sea-accent/90"
                >
                  {editingId ? 'Save Changes' : 'Register Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
