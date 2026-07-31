import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate, Link } from 'react-router-dom';
import { LoadingSpinner, ErrorBoundary } from '@marineos/shared';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { CrewPortalLayout } from './components/layout/CrewPortalLayout';
import { ShipStateLogger } from './components/operations/ShipStateLogger';
import { RequisitionForm } from './pages/requisitions/RequisitionForm';
import { RequisitionTracker } from './pages/requisitions/RequisitionTracker';

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingSpinner fullPage />}>{children}</Suspense>
  </ErrorBoundary>
);

export const crewRouter = createBrowserRouter([
  {
    path: '/login',
    element: (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <h2 className="text-xl font-bold mb-2">MarineOS Crew Portal Login</h2>
        <p className="text-sm text-slate-400 max-w-sm mb-6">Enter your seafarer credentials to log in.</p>
        <Link
          to="/dashboard"
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-semibold"
        >
          Demo Login as Chief Engineer / Crew
        </Link>
      </div>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <CrewPortalLayout />,
        children: [
          {
            path: '/',
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: '/dashboard',
            element: (
              <SuspenseWrapper>
                <div className="space-y-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                    <h2 className="text-base font-bold text-white mb-1">Today's Overview</h2>
                    <p className="text-xs text-slate-400">Welcome aboard. Here are your assigned tasks for today.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/daily-log/new" className="p-4 bg-blue-950/40 border border-blue-800/40 rounded-2xl text-left block hover:border-blue-700 transition-colors">
                      <span className="text-xs font-semibold text-blue-400 block mb-1">Ship Logs</span>
                      <span className="text-sm font-bold text-white">Log Operational State</span>
                    </Link>
                    <Link to="/rest-hours/new" className="p-4 bg-emerald-950/40 border border-emerald-800/40 rounded-2xl text-left block hover:border-emerald-700 transition-colors">
                      <span className="text-xs font-semibold text-emerald-400 block mb-1">MLC 2006</span>
                      <span className="text-sm font-bold text-white">Log Rest Hours</span>
                    </Link>
                    <Link to="/requisitions/track" className="p-4 bg-amber-950/40 border border-amber-800/40 rounded-2xl text-left block hover:border-amber-700 transition-colors col-span-2">
                      <span className="text-xs font-semibold text-amber-400 block mb-1">Procurement</span>
                      <span className="text-sm font-bold text-white">Track & Order Requisitions</span>
                    </Link>
                  </div>
                </div>
              </SuspenseWrapper>
            ),
          },
          {
            path: '/daily-log/new',
            element: (
              <SuspenseWrapper>
                <ShipStateLogger />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/rest-hours/new',
            element: (
              <SuspenseWrapper>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white">
                  <h2 className="text-base font-bold mb-2">MLC 2006 Rest Hours Entry</h2>
                  <p className="text-xs text-slate-400 mb-4">Log your work and rest hours for today.</p>
                </div>
              </SuspenseWrapper>
            ),
          },
          {
            path: '/defects/new',
            element: (
              <SuspenseWrapper>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white">
                  <h2 className="text-base font-bold mb-2">Report Equipment Defect</h2>
                  <p className="text-xs text-slate-400 mb-4">Submit new defect report with severity and photos.</p>
                </div>
              </SuspenseWrapper>
            ),
          },
          {
            path: '/jobs',
            element: (
              <SuspenseWrapper>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white">
                  <h2 className="text-base font-bold mb-2">My Assigned Maintenance Jobs</h2>
                  <p className="text-xs text-slate-400 mb-4">Select a job to execute step-by-step checklist.</p>
                </div>
              </SuspenseWrapper>
            ),
          },
          {
            path: '/my-profile',
            element: (
              <SuspenseWrapper>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white">
                  <h2 className="text-base font-bold mb-2">My Seafarer Profile</h2>
                  <p className="text-xs text-slate-400 mb-4">View your certificates, assignments, and compliance stats.</p>
                </div>
              </SuspenseWrapper>
            ),
          },
          {
            path: '/requisitions/new',
            element: (
              <SuspenseWrapper>
                <RequisitionForm />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/requisitions/track',
            element: (
              <SuspenseWrapper>
                <RequisitionTracker />
              </SuspenseWrapper>
            ),
          },
        ],
      },
    ],
  },
]);
