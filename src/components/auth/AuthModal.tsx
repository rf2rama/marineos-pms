import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { isSupabaseConfigured, supabase } from '../../services/supabaseClient';
import { ShieldCheck, Cloud, CloudOff, Key, Mail, Lock, UserCheck, XCircle, Database, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { activeRole, setActiveRole } = useApp();
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'setup'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(activeRole);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsError(false);

    if (!isSupabaseConfigured || !supabase) {
      // Local Mode Role Switch
      setActiveRole(selectedRole);
      setMessage(`Switched local user session to role: ${selectedRole}`);
      setTimeout(() => {
        onClose();
      }, 1000);
      return;
    }

    setLoading(true);
    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setActiveRole(selectedRole);
        setMessage('Successfully authenticated! Multi-device session active.');
        setTimeout(() => onClose(), 1200);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role: selectedRole }
          }
        });
        if (error) throw error;
        setActiveRole(selectedRole);
        setMessage('Account created! Please check your email for confirmation.');
        setTimeout(() => onClose(), 1500);
      }
    } catch (err: any) {
      setIsError(true);
      setMessage(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const rolesList: { role: UserRole; title: string; desc: string }[] = [
    { role: 'chief_engineer', title: 'Chief Engineer', desc: 'Full engine room & PMS authority' },
    { role: 'superintendent', title: 'Technical Superintendent', desc: 'Fleet management & drydock approvals' },
    { role: 'technical_manager', title: 'Technical Manager', desc: 'Purchasing & budget approvals' },
    { role: 'owner', title: 'Ship Owner / Executive', desc: 'Executive dashboard & high-level audit' },
    { role: 'safety_officer', title: 'Safety & Quality Officer', desc: 'ISM, Drills & NC management' },
    { role: 'crew_manager', title: 'Crewing Manager', desc: 'STCW & seafarer deployments' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl font-sans text-xs">
        <div className="flex items-center justify-between border-b border-ocean-800 pb-3">
          <div className="flex items-center gap-2">
            {isSupabaseConfigured ? (
              <Cloud className="w-5 h-5 text-sea-emerald" />
            ) : (
              <CloudOff className="w-5 h-5 text-sea-amber" />
            )}
            <h2 className="text-base font-bold text-white">
              {isSupabaseConfigured ? 'MarineOS Supabase Cloud Session' : 'MarineOS Multi-Role User Switcher'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Status Indicator Banner */}
        <div className={`p-3 rounded-xl border flex items-center gap-2.5 font-mono text-[11px] ${
          isSupabaseConfigured ? 'bg-sea-emerald/10 border-sea-emerald/30 text-sea-emerald' : 'bg-sea-amber/10 border-sea-amber/30 text-sea-amber'
        }`}>
          {isSupabaseConfigured ? (
            <>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Supabase Cloud Connected • Multi-Device Real-Time Sync Active</span>
            </>
          ) : (
            <>
              <Database className="w-4 h-4 shrink-0" />
              <span>Running in Local Mode • Add Supabase credentials in .env.local for Cloud Mode</span>
            </>
          )}
        </div>

        {/* Auth Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-3">
          <div>
            <label className="block text-slate-400 mb-1 font-mono">Select User Role</label>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value as UserRole)}
              className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
            >
              {rolesList.map(r => (
                <option key={r.role} value={r.role}>{r.title} — {r.desc}</option>
              ))}
            </select>
          </div>

          {isSupabaseConfigured && (
            <>
              {authMode === 'signup' && (
                <div>
                  <label className="block text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Chief Engineer H. Vance"
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="chief@marineos.app"
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>
            </>
          )}

          {message && (
            <div className={`p-2.5 rounded-lg text-xs font-mono ${isError ? 'bg-sea-rose/20 text-sea-rose' : 'bg-sea-emerald/20 text-sea-emerald'}`}>
              {message}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-ocean-800">
            {isSupabaseConfigured ? (
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-sea-accent hover:underline text-xs"
              >
                {authMode === 'login' ? 'Need an account? Sign Up' : 'Already registered? Sign In'}
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg bg-ocean-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 rounded-lg bg-sea-accent text-ocean-950 font-bold"
              >
                {loading ? 'Authenticating...' : isSupabaseConfigured ? (authMode === 'login' ? 'Sign In' : 'Sign Up') : 'Switch Active Role'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
