import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole } from '../constants/roles';
import { UserProfile } from '../types';

interface AuthState {
  currentUser: UserProfile | null;
  activeRole: UserRole;
  isAuthenticated: boolean;
  setCurrentUser: (user: UserProfile | null) => void;
  setActiveRole: (role: UserRole) => void;
  login: (user: UserProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: {
        id: 'usr-1',
        fullName: 'Tech. Supt. Sarah Chen',
        role: 'technical_superintendent',
        department: 'Technical',
        isActive: true,
      },
      activeRole: 'technical_superintendent',
      isAuthenticated: true,
      setCurrentUser: (user) =>
        set({
          currentUser: user,
          activeRole: user?.role || 'technical_superintendent',
          isAuthenticated: !!user,
        }),
      setActiveRole: (role) =>
        set((state) => ({
          activeRole: role,
          currentUser: state.currentUser
            ? { ...state.currentUser, role }
            : {
                id: 'usr-1',
                fullName: 'User',
                role,
                isActive: true,
              },
        })),
      login: (user) => set({ currentUser: user, activeRole: user.role, isAuthenticated: true }),
      logout: () => set({ currentUser: null, isAuthenticated: false }),
    }),
    {
      name: 'marineos_auth_store',
    }
  )
);
