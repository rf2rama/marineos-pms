import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Equipment, MaintenanceJob, JobExecution, DailyLog, MachineryRunSession, PMSchedule } from '../types';

interface PMSState {
  equipment: Equipment[];
  jobs: MaintenanceJob[];
  executions: JobExecution[];
  dailyLogs: DailyLog[];
  runSessions: MachineryRunSession[];
  pmSchedules: PMSchedule[];
  setEquipment: (eq: Equipment[]) => void;
  addEquipment: (eq: Equipment) => void;
  updateEquipment: (id: string, eq: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;

  setJobs: (jobs: MaintenanceJob[]) => void;
  addJob: (job: MaintenanceJob) => void;
  updateJob: (id: string, job: Partial<MaintenanceJob>) => void;
  deleteJob: (id: string) => void;

  setExecutions: (execs: JobExecution[]) => void;
  addExecution: (exec: JobExecution) => void;

  setDailyLogs: (logs: DailyLog[]) => void;
  addDailyLog: (log: DailyLog) => void;

  setRunSessions: (sessions: MachineryRunSession[]) => void;
  addRunSession: (session: MachineryRunSession) => void;

  setPMSchedules: (schedules: PMSchedule[]) => void;
  addPMSchedule: (schedule: PMSchedule) => void;
  updatePMSchedule: (id: string, updates: Partial<PMSchedule>) => void;
}

export const usePMSStore = create<PMSState>()(
  persist(
    (set) => ({
      equipment: [],
      jobs: [],
      executions: [],
      dailyLogs: [],
      runSessions: [],
      pmSchedules: [],

      setEquipment: (equipment) => set({ equipment }),
      addEquipment: (eq) => set((state) => ({ equipment: [eq, ...state.equipment] })),
      updateEquipment: (id, updates) =>
        set((state) => ({
          equipment: state.equipment.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),
      deleteEquipment: (id) => set((state) => ({ equipment: state.equipment.filter((e) => e.id !== id) })),

      setJobs: (jobs) => set({ jobs }),
      addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
      updateJob: (id, updates) =>
        set((state) => ({
          jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...updates } : j)),
        })),
      deleteJob: (id) => set((state) => ({ jobs: state.jobs.filter((j) => j.id !== id) })),

      setExecutions: (executions) => set({ executions }),
      addExecution: (exec) => set((state) => ({ executions: [exec, ...state.executions] })),

      setDailyLogs: (dailyLogs) => set({ dailyLogs }),
      addDailyLog: (log) => set((state) => ({ dailyLogs: [log, ...state.dailyLogs] })),

      setRunSessions: (runSessions) => set({ runSessions }),
      addRunSession: (session) => set((state) => ({ runSessions: [session, ...state.runSessions] })),

      setPMSchedules: (pmSchedules) => set({ pmSchedules }),
      addPMSchedule: (schedule) => set((state) => ({ pmSchedules: [schedule, ...state.pmSchedules] })),
      updatePMSchedule: (id, updates) =>
        set((state) => ({
          pmSchedules: state.pmSchedules.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        })),
    }),
    {
      name: 'marineos_pms_store',
    }
  )
);
