import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Menu, X } from 'lucide-react';
import api from '../../api/axios';
import NotificationDropdown from './NotificationDropdown';

const TopBar = ({ onMenuClick, sidebarOpen }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [profilePic, setProfilePic] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) {
      api.get('?action=get_profile').then(res => {
        if (res.data.status === 'success' && res.data.data.profile_picture_url) {
          setProfilePic(res.data.data.profile_picture_url);
        }
      }).catch(err => console.error(err));
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('?action=get_notifications');
      if (res.data.status === 'success') {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.post('?action=mark_notif_read', { id });
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error('Failed to mark notification as read');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="h-16 bg-white border-b border-chase-border flex items-center justify-between px-4 md:px-8 z-30 relative">
      <div className="flex items-center gap-3">

        {/* Hamburger / Close — mobile only */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        >
          {sidebarOpen
            ? <X size={20} className="text-gray-600" />
            : <Menu size={20} className="text-gray-600" />
          }
        </button>

        <div className="text-gray-500 text-sm">
          Welcome back,{' '}
          <span className="font-semibold text-chase-navy">{user?.full_name}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Bell size={20} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <NotificationDropdown
              notifications={notifications}
              onClose={() => setShowNotifications(false)}
              onMarkRead={markAsRead}
            />
          )}
        </div>

        {profilePic ? (
          <img
            src={profilePic}
            alt={user?.full_name}
            className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm"
          />
        ) : (
          <div className="w-8 h-8 bg-chase-blue text-white rounded-full flex items-center justify-center text-sm font-bold select-none">
            {user?.full_name?.charAt(0)}
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;