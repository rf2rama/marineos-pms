import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { InAppNotification } from '../types';

interface NotificationState {
  notifications: InAppNotification[];
  setNotifications: (notifications: InAppNotification[]) => void;
  addNotification: (notification: InAppNotification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      setNotifications: (notifications) => set({ notifications }),
      addNotification: (notification) => set((state) => ({ notifications: [notification, ...state.notifications] })),
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        })),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        })),
      dismissNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
    }),
    {
      name: 'marineos_notification_store',
    }
  )
);
