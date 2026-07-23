import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { AuthModal } from './auth/AuthModal';
import { Anchor, ShieldCheck, UserCheck, RefreshCw, Radio, Layers, Cloud, CloudOff } from 'lucide-react';

export const Header: React.FC = () => {
  const { vessels, selectedVessel, selectedVesselId, setSelectedVesselId, activeRole, setActiveRole, resetToDefaultData } = useApp();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const roleLabels: Record<UserRole, { title: string; color: string }> = {
    chief_engineer: { title: 'Chief Engineer', color: 'bg-sea-accent/10 text-sea-accent border-sea-accent/30' },
    superintendent: { title: 'Technical Superintendent', color: 'bg-sea-amber/10 text-sea-amber border-sea-amber/30' },
    owner: { title: 'Shipowner (Read-Only)', color: 'bg-sea-purple/10 text-sea-purple border-sea-purple/30' },
    technical_manager: { title: 'Fleet Manager', color: 'bg-sea-emerald/10 text-sea-emerald border-sea-emerald/30' },
    supply_officer: { title: 'Supply & Logistics', color: 'bg-slate-700 text-slate-200 border-slate-600' },
    safety_officer: { title: 'Safety Officer', color: 'bg-sea-rose/10 text-sea-rose border-sea-rose/30' },
    crew_manager: { title: 'Crew Manager', color: 'bg-sea-accent/10 text-sea-accent border-sea-accent/30' },
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-ocean-950/80 backdrop-blur-md border-b border-ocean-800 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Brand logo & Vessel Switcher */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-ocean-700 to-sea-accent/30 border border-sea-accent/40 flex items-center justify-center shadow-lg shadow-sea-accent/10">
              <Anchor className="w-5 h-5 text-sea-accent animate-pulse-glow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-sea-accent">
                  MarineOS
                </span>
                <span className="text-[10px] font-mono tracking-widest uppercase bg-sea-accent/20 text-sea-accent px-1.5 py-0.5 rounded font-semibold border border-sea-accent/30">
                  v0.2 Platform
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">Open Ship Management Platform</p>
            </div>
          </div>

          {/* Vessel Dropdown with View All Option */}
          <div className="relative flex items-center bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-1.5 hover:border-sea-accent/40 transition">
            <div className="w-2 h-2 rounded-full bg-sea-emerald animate-ping mr-2.5" />
            <select
              value={selectedVesselId}
              onChange={(e) => setSelectedVesselId(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-100 focus:outline-none cursor-pointer pr-4"
            >
              <option value="all_vessels" className="bg-ocean-900 text-sea-accent font-bold">
                🌐 All Fleet Vessels (Combined Fleet View)
              </option>
              {vessels.map(v => (
                <option key={v.id} value={v.id} className="bg-ocean-900 text-slate-100">
                  {v.name} ({v.imoNumber}) — {v.vesselType}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Operational Status & Role Selector & Cloud Indicator */}
        <div className="flex items-center gap-3">
          {/* Cloud vs Local Connection Badge */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition ${
              isSupabaseConfigured 
                ? 'bg-sea-emerald/20 text-sea-emerald border-sea-emerald/40 hover:bg-sea-emerald/30' 
                : 'bg-ocean-900 text-sea-amber border-ocean-750 hover:bg-ocean-850'
            }`}
          >
            {isSupabaseConfigured ? <Cloud className="w-3.5 h-3.5" /> : <CloudOff className="w-3.5 h-3.5 text-sea-amber" />}
            <span>{isSupabaseConfigured ? 'Cloud Sync Active' : 'Local Mode'}</span>
          </button>

          {/* Role Selector Badge */}
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-slate-400" />
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as UserRole)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer transition focus:outline-none ${roleLabels[activeRole].color}`}
            >
              <option value="chief_engineer" className="bg-ocean-900 text-slate-100">Role: Chief Engineer</option>
              <option value="superintendent" className="bg-ocean-900 text-slate-100">Role: Technical Superintendent</option>
              <option value="technical_manager" className="bg-ocean-900 text-slate-100">Role: Fleet Manager</option>
              <option value="crew_manager" className="bg-ocean-900 text-slate-100">Role: Crew Manager</option>
              <option value="safety_officer" className="bg-ocean-900 text-slate-100">Role: Safety Officer</option>
              <option value="supply_officer" className="bg-ocean-900 text-slate-100">Role: Supply & Logistics</option>
              <option value="owner" className="bg-ocean-900 text-slate-100">Role: Shipowner (Read-Only)</option>
            </select>
          </div>

          {/* Reset Data Button */}
          <button
            onClick={resetToDefaultData}
            title="Reset to sample dataset"
            className="p-2 rounded-lg bg-ocean-900 hover:bg-ocean-800 border border-ocean-800 text-slate-400 hover:text-slate-200 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Auth & Session Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};
