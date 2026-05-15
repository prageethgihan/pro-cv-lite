import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

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
  Settings,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  Menu,
  Mail,
  AtSign,
  Clock,
  Info,
  Camera,
  Loader2
} from "lucide-react";

import { motion } from "framer-motion";
import ProfileDropdown from "../components/ProfileDropdown";
import NotificationDropdown from "../components/NotificationDropdown";

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const userFullName = user?.displayName || "Prageeth Gihan";
  const userEmail = user?.email || "prageeth@example.com";
  const userPhoto = user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'User'}`;
  const username = user?.displayName?.toLowerCase().replace(/\s+/g, '') || "prageethgihan";
  
  // Format creation date if available, else use a mock date
  const memberSince = user?.metadata?.creationTime 
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : "May 12, 2024";

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file.");
      return;
    }

    // Validate file size (e.g., max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Image size should be less than 2MB.");
      return;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      // 1. Create a reference in Firebase Storage
      const storageRef = ref(storage, `profile_photos/${user.uid}`);
      
      // 2. Upload the file
      await uploadBytes(storageRef, file);
      
      // 3. Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // 4. Update Firebase User Profile
      await updateProfile(user, {
        photoURL: downloadURL
      });
      
      // Refresh the page to show new photo or rely on useAuth state if it updates
      window.location.reload(); 
    } catch (error) {
      console.error("Error uploading photo:", error);
      setUploadError("Failed to upload photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };


  if (loading) return <div className="p-6 text-white bg-[#0A0D14] min-h-screen">Loading...</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0D14] text-white font-sans selection:bg-indigo-500/30">
      
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-[230px] flex-shrink-0 border-r border-white/5 bg-[#0A0D14] flex-col justify-between overflow-y-auto custom-scrollbar">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2 p-4 pb-2">
            <div className="bg-white/10 p-1.5 rounded-lg">
              <FileCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">ProCV Lite</span>
            <Menu className="w-5 h-5 ml-auto text-gray-400 cursor-pointer hover:text-white" />
          </div>

          {/* User Preview */}
          <div className="px-3 mb-4">
            <div className="flex items-center gap-2 bg-[#111622] p-2 rounded-xl border border-white/5">
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
            {/* MAIN */}
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

            {/* AI TOOLS */}
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

            {/* ANALYTICS */}
            <div>
              <div className="text-[9px] font-bold text-gray-500 mb-1.5 px-2 uppercase tracking-wider">Analytics</div>
              <button onClick={() => navigate('/insights')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
                <BarChart2 className="w-4 h-4" /> Insights & Analytics
              </button>
            </div>

            {/* MANAGE */}
            <div>
              <div className="text-[9px] font-bold text-gray-500 mb-1.5 px-2 uppercase tracking-wider">Manage</div>
              <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-medium shadow-lg shadow-indigo-500/20 transition-colors">
                <User className="w-4 h-4" /> My Profile
              </button>
              <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
                <Settings className="w-4 h-4" /> Settings
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Theme Toggle */}
        <div className="p-3 mt-4">
          <div className="flex items-center justify-center gap-4 bg-[#111622] p-2 rounded-2xl border border-white/5">
            <button className="text-gray-400 hover:text-white"><Sun className="w-4 h-4" /></button>
            <div className="w-10 h-5 bg-indigo-600 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
            </div>
            <button className="text-white"><Moon className="w-4 h-4" /></button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-hidden bg-[#0A0D14] p-6 flex flex-col">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">My Profile</h1>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <span className="hover:text-gray-300 cursor-pointer transition-colors" onClick={() => navigate('/dashboard')}>Dashboard</span>
              <span>&gt;</span>
              <span className="text-indigo-400">My Profile</span>
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

        {/* PROFILE CARD - Centered in remaining space */}
        <div className="flex-1 flex items-center justify-center py-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl bg-[#111622] border border-white/5 rounded-[24px] p-8 relative overflow-hidden"
          >


          {/* Top Section with Avatar */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative group cursor-pointer mb-4" onClick={handlePhotoClick}>
              <div className="w-24 h-24 rounded-full border-2 border-white/10 p-1 overflow-hidden transition-transform duration-300 group-hover:scale-105 relative">
                <img src={userPhoto} alt="Profile" className={`w-full h-full object-cover rounded-full ${isUploading ? 'opacity-40' : ''}`} />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 bg-[#1e2336] border border-white/10 p-1.5 rounded-full text-gray-300 hover:text-white transition-colors shadow-lg">
                <Camera className="w-4 h-4" />
              </div>
            </div>

            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoChange} 
              className="hidden" 
              accept="image/*"
            />
            
            {uploadError && (
              <div className="text-[10px] text-red-400 mb-2 font-medium bg-red-400/10 px-3 py-1 rounded-full border border-red-400/20">
                {uploadError}
              </div>
            )}
            
            <h2 className="text-2xl font-bold text-white mb-1">{userFullName}</h2>

            <div className="inline-flex items-center px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold rounded-full mb-3 uppercase tracking-wider">
              Active
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-xs">
              <Mail className="w-3.5 h-3.5" />
              <span>{userEmail}</span>
            </div>
          </div>

          <div className="h-px bg-white/5 w-full mb-6"></div>

          {/* Details List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1e2336] flex items-center justify-center text-indigo-400 border border-white/5">
                  <User className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-medium text-gray-400 group-hover:text-gray-300 transition-colors">Full Name</span>
              </div>
              <span className="text-xs font-semibold text-gray-200">{userFullName}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1e2336] flex items-center justify-center text-indigo-400 border border-white/5">
                  <AtSign className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-medium text-gray-400 group-hover:text-gray-300 transition-colors">Username</span>
              </div>
              <span className="text-xs font-semibold text-gray-200">{username}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1e2336] flex items-center justify-center text-indigo-400 border border-white/5">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-medium text-gray-400 group-hover:text-gray-300 transition-colors">Email</span>
              </div>
              <span className="text-xs font-semibold text-gray-200">{userEmail}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1e2336] flex items-center justify-center text-indigo-400 border border-white/5">
                  <Clock className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-medium text-gray-400 group-hover:text-gray-300 transition-colors">Member Since</span>
              </div>
              <span className="text-xs font-semibold text-gray-200">{memberSince}</span>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-4 rounded-[16px] bg-[#1a2030] border border-white/5 flex items-center justify-center gap-3 text-center">
            <Info className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <p className="text-xs text-gray-400">
              To update your account details, password, or preferences, please go to <span className="text-indigo-400 font-semibold cursor-pointer hover:underline" onClick={() => navigate('/settings')}>Settings</span>.
            </p>
          </div>
        </motion.div>
      </div>

      </main>


      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
