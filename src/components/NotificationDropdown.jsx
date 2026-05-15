import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Check, 
  Circle, 
  Clock, 
  FileText, 
  Sparkles, 
  MessageSquare,
  TrendingUp,
  X
} from "lucide-react";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Mock notifications data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "cv_view",
      title: "CV Viewed!",
      message: "Someone from Colombo just viewed your Software Engineer CV.",
      time: "2 mins ago",
      isRead: false,
      icon: <TrendingUp className="w-4 h-4" />,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10"
    },
    {
      id: 2,
      type: "job_match",
      title: "New Job Match",
      message: "We found a 95% match for a Senior Developer role at WSO2.",
      time: "1 hour ago",
      isRead: false,
      icon: <Sparkles className="w-4 h-4" />,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10"
    },
    {
      id: 3,
      type: "tip",
      title: "Profile Tip",
      message: "Add your LinkedIn profile to increase visibility by 40%.",
      time: "5 hours ago",
      isRead: true,
      icon: <FileText className="w-4 h-4" />,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-full border transition-all duration-300 ${
          isOpen 
            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
            : 'bg-[#111622] border-white/5 text-gray-300 hover:text-white hover:border-white/10'
        }`}
      >
        <Bell className={`w-5 h-5 ${isOpen ? 'animate-none' : ''}`} />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full text-[10px] flex items-center justify-center border-2 border-[#0A0D14] font-bold shadow-lg">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-[380px] bg-[#111622]/95 backdrop-blur-xl border border-white/5 rounded-[24px] shadow-2xl shadow-black/50 overflow-hidden z-[110]"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="bg-indigo-600/20 text-indigo-400 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {unreadCount} New
                    </span>
                  )}
                </h3>
              </div>
              <button 
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar py-2">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`relative p-4 mx-2 rounded-2xl transition-all duration-300 cursor-pointer group mb-1 ${
                      notification.isRead 
                        ? 'hover:bg-white/[0.03]' 
                        : 'bg-indigo-600/[0.03] hover:bg-indigo-600/[0.06] border border-indigo-500/10'
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border border-white/5 ${notification.bgColor} ${notification.color}`}>
                        {notification.icon}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-xs font-bold truncate ${notification.isRead ? 'text-gray-200' : 'text-white'}`}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/40"></div>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-1.5 text-[9px] text-gray-500 font-medium">
                          <Clock className="w-3 h-3" />
                          {notification.time}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Bell className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-sm font-bold text-gray-300 mb-1">All caught up!</p>
                  <p className="text-xs text-gray-500">No new notifications at the moment.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-white/[0.02] border-t border-white/5">
              <button className="w-full py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all text-center">
                View All Activity
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

export default NotificationDropdown;
