import React from 'react';
import { 
  LayoutDashboard, Wrench, CalendarCheck, Activity, 
  Ship, ShieldAlert, ShoppingCart, Users, BarChart3, Layers, Compass 
} from 'lucide-react';

export type ActiveTab = 'overview' | 'operations' | 'equipment' | 'jobs' | 'daily_log' | 'drydock' | 'class_survey' | 'inventory' | 'crew' | 'safety' | 'analytics';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  overdueJobsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, overdueJobsCount }) => {
  const fleetNavItems = [
    { id: 'overview', label: 'Fleet Overview', icon: LayoutDashboard },
    { id: 'operations', label: 'Voyage & Fleet Operations', icon: Compass },
    { id: 'equipment', label: 'Equipment Registry', icon: Wrench },
    { 
      id: 'jobs', 
      label: 'Maintenance Jobs', 
      icon: CalendarCheck,
      badge: overdueJobsCount > 0 ? `${overdueJobsCount} Overdue` : undefined,
      badgeColor: 'bg-sea-rose/20 text-sea-rose border-sea-rose/40'
    },
    { id: 'daily_log', label: 'Daily Engine Parameters', icon: Activity },
    { id: 'drydock', label: 'Drydock Management', icon: Ship },
    { id: 'class_survey', label: 'Class & Survey Jobs', icon: ShieldAlert },
  ];

  const opsNavItems = [
    { id: 'inventory', label: 'Inventory & Procurement', icon: ShoppingCart },
    { id: 'crew', label: 'Crew & STCW Certificates', icon: Users },
    { id: 'safety', label: 'Safety, Risk & ISM/SMS', icon: ShieldAlert },
    { id: 'analytics', label: 'Fleet Analytics & Reports', icon: BarChart3 },
  ];

  return (
    <aside className="w-full lg:w-64 bg-ocean-900/60 border-r border-ocean-800 flex flex-col justify-between shrink-0 p-4">
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-3 mb-2">
            Fleet & Maintenance
          </p>
          <nav className="space-y-1">
            {fleetNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium text-xs transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-sea-accent/20 to-ocean-800 text-sea-accent border border-sea-accent/30 shadow-md shadow-sea-accent/5' 
                      : 'text-slate-300 hover:bg-ocean-850 hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sea-accent' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-sea-accent font-semibold px-3 mb-2">
            Operations & Compliance
          </p>
          <nav className="space-y-1">
            {opsNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium text-xs transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-sea-accent/20 to-ocean-800 text-sea-accent border border-sea-accent/30 shadow-md shadow-sea-accent/5' 
                      : 'text-slate-300 hover:bg-ocean-850 hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sea-accent' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Architecture Note */}
        <div className="p-3.5 rounded-xl bg-ocean-950/80 border border-ocean-800 space-y-2">
          <div className="flex items-center gap-2 text-sea-accent text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Modular Monolith</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            MarineOS integrated vessel management platform with multi-tenancy support.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-ocean-800 text-[11px] font-mono text-slate-500 text-center">
        MarineOS Open Vessel PMS
      </div>
    </aside>
  );
};
