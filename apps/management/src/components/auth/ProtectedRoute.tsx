import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@marineos/shared';
import { MANAGEMENT_ROLES } from '@marineos/shared';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, activeRole, setActiveRole } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isManagement = MANAGEMENT_ROLES.includes(activeRole as any);
  if (!isManagement) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full shadow-2xl">
          <h2 className="text-lg font-bold text-amber-400 mb-2">Crew Role Active ({activeRole})</h2>
          <p className="text-xs text-slate-400 mb-6">
            Your active session role belongs to the Crew Portal. You can switch to a management role to view this console or visit the Crew Portal.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setActiveRole('technical_superintendent')}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-semibold text-white transition-colors"
            >
              Switch Role to Technical Superintendent
            </button>
            <a
              href="http://localhost:3001"
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-colors"
            >
              Go to Crew Portal (Port 3001)
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
