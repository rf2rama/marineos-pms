import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@marineos/shared';
import { CREW_ROLES } from '@marineos/shared';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, activeRole, setActiveRole } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isCrew = CREW_ROLES.includes(activeRole as any);
  if (!isCrew) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full shadow-2xl">
          <h2 className="text-lg font-bold text-amber-400 mb-2">Management Role Active ({activeRole})</h2>
          <p className="text-xs text-slate-400 mb-6">
            Your active session role belongs to the Management Console. You can switch to a crew role to view the Crew Portal or visit the Management Console.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setActiveRole('chief_engineer')}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-semibold text-white transition-colors"
            >
              Switch Role to Chief Engineer
            </button>
            <a
              href="http://localhost:3000"
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-colors"
            >
              Go to Management Console (Port 3000)
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
