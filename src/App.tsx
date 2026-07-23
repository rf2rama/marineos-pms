import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Overview } from './components/Overview';
import { EquipmentRegistry } from './components/pms/EquipmentRegistry';
import { MaintenanceSchedules } from './components/pms/MaintenanceSchedules';
import { DailyParametersLog } from './components/pms/DailyParametersLog';
import { DrydockManager } from './components/drydock/DrydockManager';
import { ClassSurveys } from './components/pms/ClassSurveys';

// v0.2 Module Components
import { InventoryProcurement } from './components/inventory/InventoryProcurement';
import { CrewManagement } from './components/crew/CrewManagement';
import { SafetyISM } from './components/safety/SafetyISM';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const { selectedVessel, jobs } = useApp();

  const overdueJobsCount = jobs.filter(j => j.vesselId === selectedVessel.id && j.status === 'Overdue').length;

  return (
    <div className="min-h-screen flex flex-col bg-ocean-950 text-slate-100 font-sans">
      <Header />

      <div className="flex-1 flex flex-col lg:flex-row">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          overdueJobsCount={overdueJobsCount} 
        />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'overview' && <Overview setActiveTab={setActiveTab} />}
          {activeTab === 'equipment' && <EquipmentRegistry />}
          {activeTab === 'jobs' && <MaintenanceSchedules />}
          {activeTab === 'daily_log' && <DailyParametersLog />}
          {activeTab === 'drydock' && <DrydockManager />}
          {activeTab === 'class_survey' && <ClassSurveys />}
          
          {/* v0.2 Modules */}
          {activeTab === 'inventory' && <InventoryProcurement />}
          {activeTab === 'crew' && <CrewManagement />}
          {activeTab === 'safety' && <SafetyISM />}
          {activeTab === 'analytics' && <AnalyticsDashboard />}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
