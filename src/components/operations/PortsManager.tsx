import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, Plus, Trash2, Edit2, Anchor } from 'lucide-react';
import { Port } from '../../types';

export const PortsManager: React.FC = () => {
  const { ports, addPort, updatePort, deletePort, activeRole } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPort, setEditingPort] = useState<Port | null>(null);
  const [formData, setFormData] = useState<Omit<Port, 'id'>>({
    name: '',
    unlocode: '',
    country: '',
  });

  const handleOpenModal = (port?: Port) => {
    if (port) {
      setEditingPort(port);
      setFormData({
        name: port.name,
        unlocode: port.unlocode || '',
        country: port.country,
        latitude: port.latitude,
        longitude: port.longitude
      });
    } else {
      setEditingPort(null);
      setFormData({ name: '', unlocode: '', country: '', latitude: undefined, longitude: undefined });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPort) {
      updatePort(editingPort.id, formData);
    } else {
      addPort(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this port?')) {
      deletePort(id);
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="flex justify-end">
        {activeRole !== 'owner' && (
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 rounded-xl bg-sea-accent text-ocean-950 font-bold text-xs hover:bg-sea-accent/90 transition shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add New Port
          </button>
        )}
      </div>

      {ports.length === 0 ? (
        <div className="glass-panel rounded-2xl p-10 text-center space-y-2 border border-ocean-800">
          <Anchor className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Ports Available</h3>
          <p className="text-slate-400">Add ports to begin planning voyages and filtering locations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ports.map((port) => (
            <div key={port.id} className="glass-panel p-4 rounded-xl border border-ocean-800 space-y-3 relative group">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-sea-blue/10 text-sea-blue shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{port.name}</h4>
                  <div className="text-slate-400 mt-1">Country: {port.country}</div>
                  {port.unlocode && (
                    <div className="text-sea-emerald mt-1 font-bold">UN/LOCODE: {port.unlocode}</div>
                  )}
                  {(port.latitude !== undefined && port.longitude !== undefined) && (
                    <div className="text-slate-500 mt-1 text-[10px]">Lat: {port.latitude} / Lon: {port.longitude}</div>
                  )}
                </div>
              </div>
              
              {activeRole !== 'owner' && (
                <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button 
                    onClick={() => handleOpenModal(port)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-sea-blue hover:bg-ocean-800 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(port.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-sea-rose hover:bg-ocean-800 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-ocean-900 border border-ocean-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-ocean-800 flex justify-between items-center bg-ocean-950/50">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-sea-accent" /> {editingPort ? 'Edit Port' : 'Add New Port'}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition">
                X
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Port Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Port of Singapore"
                  className="w-full bg-ocean-950 border border-ocean-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sea-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Country *</label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={e => setFormData({ ...formData, country: e.target.value })}
                  placeholder="e.g. Singapore"
                  className="w-full bg-ocean-950 border border-ocean-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sea-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">UN/LOCODE</label>
                <input
                  type="text"
                  value={formData.unlocode}
                  onChange={e => setFormData({ ...formData, unlocode: e.target.value })}
                  placeholder="e.g. SGSIN"
                  className="w-full bg-ocean-950 border border-ocean-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sea-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.latitude !== undefined ? formData.latitude : ''}
                    onChange={e => setFormData({ ...formData, latitude: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="e.g. 1.290270"
                    className="w-full bg-ocean-950 border border-ocean-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sea-accent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.longitude !== undefined ? formData.longitude : ''}
                    onChange={e => setFormData({ ...formData, longitude: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="e.g. 103.851959"
                    className="w-full bg-ocean-950 border border-ocean-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sea-accent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-ocean-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-ocean-800 transition text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-sea-accent text-ocean-950 font-bold text-xs hover:bg-sea-accent/90 transition shadow-lg shadow-sea-accent/20"
                >
                  {editingPort ? 'Save Changes' : 'Add Port'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
