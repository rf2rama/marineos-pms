import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, ClipboardList, Clock, AlertTriangle, Wrench, User, Anchor } from 'lucide-react';
import { OfflineBanner, NotificationBell } from '@marineos/shared';
import { useAuthStore } from '@marineos/shared';
import { useVesselStore } from '@marineos/shared';

export const CrewPortalLayout: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { vessels, selectedVesselId } = useVesselStore();
  const activeVessel = vessels.find((v) => v.id === selectedVesselId) || vessels[0];

  const navItems = [
    { to: '/dashboard', label: 'Home', icon: Home },
    { to: '/daily-log/new', label: 'Log', icon: ClipboardList },
    { to: '/rest-hours/new', label: 'Rest', icon: Clock },
    { to: '/defects/new', label: 'Defects', icon: AlertTriangle },
    { to: '/jobs', label: 'Jobs', icon: Wrench },
    { to: '/my-profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20">
      <OfflineBanner />

      {/* Top Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
            <Anchor className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-none">MarineOS Crew</h1>
            <span className="text-[10px] text-blue-400 font-medium">
              {activeVessel ? activeVessel.name : 'MV Antigravity'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <div className="text-right">
            <p className="text-xs font-semibold text-white">{currentUser?.fullName || 'Crew Member'}</p>
            <p className="text-[10px] text-slate-400 capitalize">{currentUser?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        <Outlet />
      </main>

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-40 px-2 py-2">
        <div className="max-w-lg mx-auto flex items-center justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-medium transition-all ${
                  isActive ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};
