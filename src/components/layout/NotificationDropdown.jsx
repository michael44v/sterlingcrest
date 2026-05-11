import React from 'react';
import { Bell, CheckCircle2, Info, X } from 'lucide-react';

const NotificationDropdown = ({ notifications, onClose, onMarkRead }) => {
  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-chase-border z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
      <div className="p-4 border-b border-chase-border flex justify-between items-center bg-gray-50">
        <h3 className="font-bold text-chase-navy flex items-center gap-2">
          <Bell size={18} /> Notifications
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && onMarkRead(n.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                n.is_read ? 'opacity-60' : 'bg-chase-light/20 hover:bg-chase-light/40'
              }`}
            >
              <div className="flex gap-3">
                <div className={`mt-1 p-2 rounded-full shrink-0 ${
                  n.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {n.type === 'credit' ? <CheckCircle2 size={16} /> : <Info size={16} />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${n.is_read ? 'text-gray-600' : 'text-chase-navy'}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-2 uppercase font-bold tracking-tighter">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
                {!n.is_read && (
                  <div className="w-2 h-2 bg-chase-blue rounded-full mt-2 shrink-0" />
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-gray-400 italic">
            <Bell size={40} className="mx-auto mb-4 opacity-10" />
            No notifications yet.
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 bg-gray-50 text-center border-t border-chase-border">
          <button className="text-xs font-bold text-chase-blue hover:underline">
            View All Notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
