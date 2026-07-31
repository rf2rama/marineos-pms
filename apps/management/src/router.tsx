import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoadingSpinner, ErrorBoundary } from '@marineos/shared';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ManagementLayout } from './components/layout/ManagementLayout';

const Overview = lazy(() => import('../../../src/components/Overview').then(m => ({ default: m.Overview })));
const EquipmentRegistry = lazy(() => import('../../../src/components/pms/EquipmentRegistry').then(m => ({ default: m.EquipmentRegistry })));
const MaintenanceSchedules = lazy(() => import('../../../src/components/pms/MaintenanceSchedules').then(m => ({ default: m.MaintenanceSchedules })));
const ClassSurveys = lazy(() => import('../../../src/components/pms/ClassSurveys').then(m => ({ default: m.ClassSurveys })));
const DailyParametersLog = lazy(() => import('../../../src/components/pms/DailyParametersLog').then(m => ({ default: m.DailyParametersLog })));
const CertificateRegistry = lazy(() => import('../../../src/components/compliance/CertificateRegistry').then(m => ({ default: m.CertificateRegistry })));
const InventoryProcurement = lazy(() => import('../../../src/components/inventory/InventoryProcurement').then(m => ({ default: m.InventoryProcurement })));
const Operations = lazy(() => import('../../../src/components/operations/Operations').then(m => ({ default: m.Operations })));
const CrewManagement = lazy(() => import('../../../src/components/crew/CrewManagement').then(m => ({ default: m.CrewManagement })));
const SafetyISM = lazy(() => import('../../../src/components/safety/SafetyISM').then(m => ({ default: m.SafetyISM })));
const DrydockManager = lazy(() => import('../../../src/components/drydock/DrydockManager').then(m => ({ default: m.DrydockManager })));
const AnalyticsDashboard = lazy(() => import('../../../src/components/analytics/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })));
const AuthModal = lazy(() => import('../../../src/components/auth/AuthModal').then(m => ({ default: m.AuthModal })));

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingSpinner fullPage />}>{children}</Suspense>
  </ErrorBoundary>
);

export const managementRouter = createBrowserRouter([
  {
    path: '/login',
    element: <SuspenseWrapper><AuthModal isOpen={true} onClose={() => {}} /></SuspenseWrapper>,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <ManagementLayout />,
        children: [
          {
            path: '/',
            element: <Navigate to="/overview" replace />,
          },
          {
            path: '/overview',
            element: <SuspenseWrapper><Overview setActiveTab={() => {}} /></SuspenseWrapper>,
          },
          {
            path: '/pms/equipment',
            element: <SuspenseWrapper><EquipmentRegistry /></SuspenseWrapper>,
          },
          {
            path: '/pms/jobs',
            element: <SuspenseWrapper><MaintenanceSchedules /></SuspenseWrapper>,
          },
          {
            path: '/pms/surveys',
            element: <SuspenseWrapper><ClassSurveys /></SuspenseWrapper>,
          },
          {
            path: '/pms/daily-log',
            element: <SuspenseWrapper><DailyParametersLog /></SuspenseWrapper>,
          },
          {
            path: '/compliance/certificates',
            element: <SuspenseWrapper><CertificateRegistry /></SuspenseWrapper>,
          },
          {
            path: '/inventory/parts',
            element: <SuspenseWrapper><InventoryProcurement /></SuspenseWrapper>,
          },
          {
            path: '/inventory/requisitions',
            element: <SuspenseWrapper><InventoryProcurement /></SuspenseWrapper>,
          },
          {
            path: '/operations/voyages',
            element: <SuspenseWrapper><Operations /></SuspenseWrapper>,
          },
          {
            path: '/crew/roster',
            element: <SuspenseWrapper><CrewManagement /></SuspenseWrapper>,
          },
          {
            path: '/safety/incidents',
            element: <SuspenseWrapper><SafetyISM /></SuspenseWrapper>,
          },
          {
            path: '/drydock/projects',
            element: <SuspenseWrapper><DrydockManager /></SuspenseWrapper>,
          },
          {
            path: '/analytics',
            element: <SuspenseWrapper><AnalyticsDashboard /></SuspenseWrapper>,
          },
          {
            path: '/approvals',
            element: (
              <SuspenseWrapper>
                <div className="p-6 text-white">
                  <h2 className="text-xl font-bold mb-2">Universal Approval Inbox</h2>
                  <p className="text-sm text-slate-400">Aggregated pending approval tasks for your role.</p>
                </div>
              </SuspenseWrapper>
            ),
          },
        ],
      },
    ],
  },
]);
