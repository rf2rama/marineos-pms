import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Wrench, CalendarCheck, Activity,
  Ship, ShieldAlert, ShoppingCart, Users, BarChart3, Compass, CheckSquare, ShieldCheck
} from 'lucide-react';
import { Header } from '../../../../../src/components/Header';
import { OfflineBanner } from '@marineos/shared';
import { useApp } from '../../../../../src/context/AppContext';

export const ManagementLayout: React.FC = () => {
  const overdueJobsCount = 0; // Temporarily stubbed
  const location = useLocation();

  const fleetNavItems = [
    { to: '/overview', label: 'Fleet Overview', icon: LayoutDashboard },
    { to: '/operations/voyages', label: 'Voyage & Fleet Operations', icon: Compass },
    { to: '/pms/equipment', label: 'Equipment Registry', icon: Wrench },
    {
      to: '/pms/jobs',
      label: 'Maintenance Jobs',
      icon: CalendarCheck,
      badge: overdueJobsCount > 0 ? `${overdueJobsCount} Overdue` : undefined,
    },
    { to: '/pms/daily-log', label: 'Daily Engine Parameters', icon: Activity },
    { to: '/drydock/projects', label: 'Drydock Management', icon: Ship },
    { to: '/pms/surveys', label: 'Class & Survey Jobs', icon: ShieldAlert },
  ];

  const opsNavItems = [
    { to: '/inventory/parts', label: 'Inventory & Procurement', icon: ShoppingCart },
    { to: '/crew/roster', label: 'Crew & STCW Certificates', icon: Users },
    { to: '/compliance/certificates', label: 'Vessel Certificates', icon: ShieldCheck },
    { to: '/safety/incidents', label: 'Safety, Risk & ISM/SMS', icon: ShieldAlert },
    { to: '/approvals', label: 'Approval Inbox', icon: CheckSquare },
    { to: '/analytics', label: 'Fleet Analytics & Reports', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <OfflineBanner />
      <Header />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 bg-slate-900/60 border-r border-slate-800 flex flex-col justify-between shrink-0 p-4">
          <div className="space-y-6">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-3 mb-2">
                Fleet & Maintenance
              </p>
              <nav className="space-y-1">
                {fleetNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.to);
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium text-xs transition-all ${
                        isActive
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-3 mb-2">
                Operations & Compliance
              </p>
              <nav className="space-y-1">
                {opsNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.to);
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium text-xs transition-all ${
                        isActive
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 px-3">
            MarineOS v2.0 Enterprise
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
