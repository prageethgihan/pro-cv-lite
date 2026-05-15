import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../auth/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Loader2 
} from "lucide-react";

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const userPhoto = user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'User'}`;
  const userFullName = user?.displayName || "User";
  const userEmail = user?.email || "";

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

  // Close on ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Trigger */}
      <div 
        className="flex items-center gap-2 cursor-pointer group select-none" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="relative">
          <img 
            src={userPhoto} 
            alt="User" 
            className="w-10 h-10 rounded-full border border-white/10 group-hover:border-indigo-500/50 transition-colors object-cover" 
          />
          <div className="absolute inset-0 rounded-full bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 group-hover:text-white transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-64 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden z-[110]"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-default)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
            }}
          >
            {/* User Info Section */}
            <div className="p-4" style={{ borderBottom: "1px solid var(--border-default)" }}>
              <div className="flex items-center gap-3">
                <img src={userPhoto} alt="" className="w-10 h-10 rounded-full" style={{ border: "1px solid var(--border-subtle)" }} />
                <div className="overflow-hidden">
                  <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>{userFullName}</p>
                  <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>{userEmail}</p>
                </div>
              </div>
            </div>

            {/* Actions Section */}
            <div className="p-2">
              <button
                onClick={() => { navigate('/profile'); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                My Profile
              </button>
              
              <button
                onClick={() => { navigate('/settings'); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors">
                  <Settings className="w-4 h-4" />
                </div>
                Settings
              </button>
            </div>

            {/* Logout Section */}
            <div className="p-2 border-t border-white/5 bg-white/[0.01]">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-sm font-semibold group"
              >
                <div className="w-8 h-8 rounded-lg bg-red-500/5 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                  {isLoggingOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                </div>
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;
