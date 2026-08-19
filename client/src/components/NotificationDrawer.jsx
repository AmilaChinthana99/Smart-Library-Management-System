import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, X, CheckCheck, Clock, AlertTriangle, BookCheck } from 'lucide-react';

const NotificationDrawer = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead } = useNotifications();

  if (!isOpen) return null;

  const getNotifIcon = (type) => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      case 'reservation_ready':
        return <BookCheck className="w-5 h-5 text-emerald-400" />;
      case 'due_reminder':
        return <Clock className="w-5 h-5 text-amber-400" />;
      default:
        return <Bell className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md glass-panel border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-outfit">Notifications</h3>
                <p className="text-xs text-slate-400">
                  {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAsRead('read-all')}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark Read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-semibold text-slate-300">No notifications yet</p>
                <p className="text-xs text-slate-500 mt-1">Due dates, reservation alerts and receipts will appear here.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => !n.isRead && markAsRead(n._id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    n.isRead
                      ? 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                      : 'bg-slate-800/80 border-blue-500/30 text-white shadow-md shadow-blue-500/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getNotifIcon(n.type)}</div>
                    <div className="flex-1">
                      <p className="text-xs font-medium leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"></span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDrawer;
