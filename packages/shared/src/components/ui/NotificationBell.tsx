import React, { useState } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markAsRead, markAllAsRead, dismissNotification } = useNotificationStore();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/40">
            <h4 className="text-sm font-semibold text-white">Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No notifications</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 text-xs flex justify-between gap-2 transition-colors ${
                    n.isRead ? 'bg-slate-900/40 text-slate-400' : 'bg-blue-950/20 text-slate-200 font-medium'
                  }`}
                  onClick={() => markAsRead(n.id)}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-white">{n.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{n.message}</p>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissNotification(n.id);
                    }}
                    className="text-slate-500 hover:text-red-400 p-1 self-start"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
