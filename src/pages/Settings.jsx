import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import {
  LayoutDashboard,
  FileText,
  PlusSquare,
  LayoutTemplate,
  PenTool,
  FileCheck,
  Sparkles,
  MessageSquare,
  FileSignature,
  BarChart2,
  User,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  Menu,
  Lock,
  Palette,
  Globe,
  Shield,
  ChevronRight,
  Info,
  Loader2,
  Accessibility
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "../hooks/useSettings";
import { useTheme } from "../hooks/useTheme";
import { useLanguage } from "../hooks/useLanguage";

// Functional Components
import SettingsModal from "../components/settings/SettingsModal";
import ChangePasswordModal from "../components/settings/ChangePasswordModal";
import NotificationSettings from "../components/settings/NotificationSettings";
import PrivacySettings from "../components/settings/PrivacySettings";
import ThemeSelector from "../components/settings/ThemeSelector";
import LanguageSelector from "../components/settings/LanguageSelector";
import AccessibilitySettings from "../components/settings/AccessibilitySettings";
import ProfileDropdown from "../components/ProfileDropdown";
import NotificationDropdown from "../components/NotificationDropdown";

export default function Settings() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { settings, loading: settingsLoading, error, updateSettings } = useSettings(user?.uid);
  
  // Theme & Language Hooks
  const { theme = "dark", setTheme } = useTheme(user?.uid, settings, updateSettings);
  const { language = "en", t, setLanguage } = useLanguage(user?.uid, settings, updateSettings);

  // Modal State
  const [activeModal, setActiveModal] = useState(null);

  const userFullName = user?.displayName || "Prageeth Gihan";
  const userEmail = user?.email || "prageeth@example.com";
  const userPhoto = user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'User'}`;

  const isLoading = authLoading || settingsLoading;

  const closeModal = () => setActiveModal(null);

  // Map settings data to UI options
  const settingsOptions = [
    {
      id: "password",
      title: t("settings.sections.password.title") || "Change Password",
      subtitle: t("settings.sections.password.subtitle") || "Update your security credentials",
      icon: Lock,
      color: "text-indigo-400",
      bg: "bg-indigo-400/10",
      action: () => setActiveModal("password")
    },
    {
      id: "notifications",
      title: t("settings.sections.notifications.title") || "Notifications",
      subtitle: t("settings.sections.notifications.subtitle") || "Manage your alerts",
      icon: Bell,
      color: "text-indigo-400",
      bg: "bg-indigo-400/10",
      action: () => setActiveModal("notifications")
    },
    {
      id: "appearance",
      title: t("settings.sections.appearance.title") || "Appearance",
      subtitle: t("settings.sections.appearance.subtitle") || "Theme and display options",
      icon: Palette,
      color: "text-indigo-400",
      bg: "bg-indigo-400/10",
      badge: (theme || "dark").charAt(0).toUpperCase() + (theme || "dark").slice(1),
      action: () => setActiveModal("appearance")
    },
    {
      id: "language",
      title: t("settings.sections.language.title") || "Language",
      subtitle: t("settings.sections.language.subtitle") || "Choose your language",
      icon: Globe,
      color: "text-indigo-400",
      bg: "bg-indigo-400/10",
      badge: settings?.language?.label || "English",
      action: () => setActiveModal("language")
    },
    {
      id: "privacy",
      title: t("settings.sections.privacy.title") || "Privacy",
      subtitle: t("settings.sections.privacy.subtitle") || "Manage your data",
      icon: Shield,
      color: "text-indigo-400",
      bg: "bg-indigo-400/10",
      action: () => setActiveModal("privacy")
    },
    {
      id: "accessibility",
      title: "Accessibility",
      subtitle: "Customize motion and contrast",
      icon: Accessibility,
      color: "text-indigo-400",
      bg: "bg-indigo-400/10",
      action: () => setActiveModal("accessibility")
    }
  ];

  if (authLoading) return <div className="p-6 text-white bg-[#0A0D14] min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0D14] text-white font-sans selection:bg-indigo-500/30">
      
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-[230px] flex-shrink-0 border-r border-white/5 bg-[#0A0D14] flex-col justify-between overflow-y-auto custom-scrollbar">
        <div>
          <div className="flex items-center gap-2 p-4 pb-2">
            <div className="bg-white/10 p-1.5 rounded-lg">
              <FileCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">ProCV Lite</span>
            <Menu className="w-5 h-5 ml-auto text-gray-400 cursor-pointer hover:text-white" />
          </div>

          <div className="px-3 mb-4 cursor-pointer" onClick={() => navigate('/profile')}>
            <div className="flex items-center gap-2 bg-[#111622] p-2 rounded-xl border border-white/5 hover:bg-white/5 transition-colors">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img src={userPhoto} alt="User" className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-semibold truncate text-gray-200">{userFullName}</div>
                <div className="text-[10px] text-gray-500 truncate">{userEmail}</div>
              </div>
            </div>
          </div>

          <div className="px-3 space-y-4">
            <div>
              <div className="text-[9px] font-bold text-gray-500 mb-1.5 px-2 uppercase tracking-wider">Main</div>
              <div className="space-y-1">
                <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </button>
                <button onClick={() => navigate('/my-cvs')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
                  <FileText className="w-4 h-4" /> My CVs
                </button>
                <button onClick={() => navigate('/builder')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
                  <PlusSquare className="w-4 h-4" /> Create New CV
                </button>
                <button onClick={() => navigate('/templates')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
                  <LayoutTemplate className="w-4 h-4" /> Templates
                </button>
              </div>
            </div>

            <div>
              <div className="text-[9px] font-bold text-gray-500 mb-1.5 px-2 uppercase tracking-wider">AI Tools</div>
              <div className="space-y-1">
                <button onClick={() => navigate('/ai-writer')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
                  <PenTool className="w-4 h-4" /> AI Writer
                </button>
                <button onClick={() => navigate('/ats-analyzer')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
                  <FileCheck className="w-4 h-4" /> ATS Analyzer
                </button>
                <button onClick={() => navigate('/job-match')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
                  <Sparkles className="w-4 h-4" /> Job Match
                </button>
                <button onClick={() => navigate('/interview-questions')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
                  <MessageSquare className="w-4 h-4" /> Interview Questions
                </button>
                <button onClick={() => navigate('/cover-letter-generator')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
                  <FileSignature className="w-4 h-4" /> Cover Letter Generator
                </button>
              </div>
            </div>

            <div>
              <div className="text-[9px] font-bold text-gray-500 mb-1.5 px-2 uppercase tracking-wider">Analytics</div>
              <button onClick={() => navigate('/insights')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
                <BarChart2 className="w-4 h-4" /> Insights & Analytics
              </button>
            </div>

            <div>
              <div className="text-[9px] font-bold text-gray-500 mb-1.5 px-2 uppercase tracking-wider">Manage</div>
              <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
                <User className="w-4 h-4" /> My Profile
              </button>
              <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-medium shadow-lg shadow-indigo-500/20 transition-colors">
                <SettingsIcon className="w-4 h-4" /> Settings
              </button>
            </div>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="p-3 mt-4">
          <div className="flex items-center justify-center gap-4 bg-[#111622] p-2 rounded-2xl border border-white/5">
            <button onClick={() => setTheme("light")} className={`${theme === 'light' ? 'text-white' : 'text-gray-400'} hover:text-white transition-colors`}><Sun className="w-4 h-4" /></button>
            <div onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-10 h-5 bg-indigo-600 rounded-full relative cursor-pointer">
              <motion.div animate={{ x: theme === 'dark' ? 22 : 4 }} className="absolute top-1 w-3 h-3 bg-white rounded-full" />
            </div>
            <button onClick={() => setTheme("dark")} className={`${theme === 'dark' ? 'text-white' : 'text-gray-400'} hover:text-white transition-colors`}><Moon className="w-4 h-4" /></button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-hidden bg-[#0A0D14] p-6 flex flex-col">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">{t("settings.title") || "Settings"}</h1>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <span className="hover:text-gray-300 cursor-pointer transition-colors" onClick={() => navigate('/dashboard')}>Dashboard</span>
              <span>&gt;</span>
              <span className="text-indigo-400">{t("settings.title") || "Settings"}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/builder')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm">
              <PlusSquare className="w-4 h-4" /> Create New CV
            </button>
            <NotificationDropdown />
            <ProfileDropdown />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center py-2 relative">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="text-xs text-gray-500 font-medium tracking-wide">Synchronizing preferences...</p>
              </motion.div>
            ) : error ? (
              <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-red-500/5 border border-red-500/10 text-center">
                <Info className="w-6 h-6 text-red-500" />
                <h3 className="text-sm font-bold text-white mb-1">Configuration Error</h3>
                <p className="text-xs text-gray-500 max-w-[240px]">{error}</p>
                <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold">Retry</button>
              </motion.div>
            ) : (
              <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl bg-[#111622] border border-white/5 rounded-[24px] overflow-hidden shadow-2xl shadow-black/50">
                <div className="divide-y divide-white/5">
                  {settingsOptions.map((option) => (
                    <div key={option.id} onClick={option.action} className="flex items-center justify-between p-4 hover:bg-white/[0.02] active:bg-white/[0.04] transition-all cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${option.bg} flex items-center justify-center ${option.color} border border-white/5 shadow-inner`}>
                          <option.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{option.title}</h3>
                          <p className="text-[11px] text-gray-500">{option.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {option.badge && <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400">{option.badge}</span>}
                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!isLoading && !error && (
            <div className="mt-6 w-full max-w-2xl p-4 rounded-[20px] bg-[#111622] border border-white/5 flex items-center justify-center gap-3">
              <Info className="w-4 h-4 text-indigo-400" />
              <p className="text-xs text-gray-400 font-medium">For account details, visit <span className="text-indigo-400 font-bold cursor-pointer hover:underline" onClick={() => navigate('/profile')}>My Profile</span>.</p>
            </div>
          )}
        </div>
      </main>

      {/* MODALS */}
      <SettingsModal isOpen={activeModal === "password"} onClose={closeModal} title="Change Password" subtitle="Update your security credentials" maxWidth="max-w-md">
        <ChangePasswordModal onClose={closeModal} />
      </SettingsModal>
      <SettingsModal isOpen={activeModal === "notifications"} onClose={closeModal} title="Notification Preferences" subtitle="Manage alerts" maxWidth="max-w-xl">
        <NotificationSettings settings={settings} onUpdate={updateSettings} />
      </SettingsModal>
      <SettingsModal isOpen={activeModal === "privacy"} onClose={closeModal} title="Privacy Settings" subtitle="Data visibility" maxWidth="max-w-xl">
        <PrivacySettings settings={settings} onUpdate={updateSettings} />
      </SettingsModal>
      <SettingsModal isOpen={activeModal === "appearance"} onClose={closeModal} title="Appearance settings" subtitle="Customize theme" maxWidth="max-w-md">
        <ThemeSelector currentTheme={theme} onSelect={setTheme} />
      </SettingsModal>
      <SettingsModal isOpen={activeModal === "language"} onClose={closeModal} title="Language Selection" subtitle="Interface language" maxWidth="max-w-md">
        <LanguageSelector currentLang={language} onSelect={setLanguage} />
      </SettingsModal>
      <SettingsModal isOpen={activeModal === "accessibility"} onClose={closeModal} title="Accessibility options" subtitle="Optimize experience" maxWidth="max-w-md">
        <AccessibilitySettings settings={settings} onUpdate={updateSettings} />
      </SettingsModal>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
      `}</style>
    </div>
  );
}
