import React, { useEffect, useState, useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { useAuth } from "../auth/AuthProvider";
import { collection, onSnapshot, orderBy, query, where, deleteDoc, doc, getDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { 
  LayoutDashboard, FileText, PlusSquare, LayoutTemplate, PenTool, 
  FileCheck, Sparkles, MessageSquare, FileSignature, BarChart2, 
  User, Settings, Sun, Moon, Bell, ChevronDown, Search, Filter,
  LayoutGrid, List, Eye, Edit, MoreVertical, QrCode, Download,
  Lightbulb, ChevronRight, ChevronLeft, Menu, Trash2, Copy, Share2
} from "lucide-react";
import ProfileDropdown from "../components/ProfileDropdown";
import NotificationDropdown from "../components/NotificationDropdown";

// Hook for detecting clicks outside to close dropdowns
function useOutsideAlerter(ref, callback) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
}

export default function MyCVs() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [cvs, setCvs] = useState([]);

  // States for functions
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All CVs");
  const [sortBy, setSortBy] = useState("Latest");
  const [viewMode, setViewMode] = useState("list");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [shareModal, setShareModal] = useState(null); // { id, title }
  const [linkCopied, setLinkCopied] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, title }
  const [isDeleting, setIsDeleting] = useState(false);

  const filterRef = useRef(null);
  const sortRef = useRef(null);
  
  useOutsideAlerter(filterRef, () => setShowFilterDropdown(false));
  useOutsideAlerter(sortRef, () => setShowSortDropdown(false));

  useEffect(() => {
    if (loading || !user) return;
    
    // Removed orderBy to prevent Firestore 400 Missing Index errors
    const q = query(collection(db, "cvs"), where("ownerId", "==", user.uid));
    
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Sort locally
      docs.sort((a, b) => {
        const timeA = a.updatedAt?.seconds || 0;
        const timeB = b.updatedAt?.seconds || 0;
        return timeB - timeA;
      });
      setCvs(docs);
    }, (error) => {
      console.error("MyCVs Firestore listener error:", error);
    });
    
    return () => {
      if (typeof unsub === 'function') {
        unsub();
      }
    };
  }, [user, loading]);

  const handleDelete = (cvId, cvTitle) => {
    setOpenDropdownId(null);
    setDeleteConfirm({ id: cvId, title: cvTitle || "this CV" });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "cvs", deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting CV:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async (cvId) => {
    try {
      const cvRef = doc(db, "cvs", cvId);
      const snap = await getDoc(cvRef);
      if (snap.exists()) {
        const data = snap.data();
        const newCv = {
          ...data,
          title: `${data.title || "Untitled CV"} (Copy)`,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          views: 0,
          downloads: 0,
          scans: 0
        };
        await addDoc(collection(db, "cvs"), newCv);
        setOpenDropdownId(null);
      }
    } catch (error) {
      console.error("Error duplicating CV:", error);
      alert("Failed to duplicate CV.");
    }
  };

  const handleShareLink = (cvId, cvTitle) => {
    setOpenDropdownId(null);
    setLinkCopied(false);
    setShareModal({ id: cvId, title: cvTitle || "My CV" });
  };

  const handleCopyLink = (cvId) => {
    const link = `${window.location.origin}/cv/${cvId}`;
    navigator.clipboard.writeText(link).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    }).catch((err) => console.error("Copy failed:", err));
  };


  const userName = user?.displayName?.split(' ')[0] || "User";
  const userFullName = user?.displayName || "User Name";
  const userEmail = user?.email || "user@example.com";
  
  // Calculate Totals
  const totalCvs = cvs.length;
  const totalViews = cvs.reduce((sum, cv) => sum + (cv.views || 0), 0);
  const totalDownloads = cvs.reduce((sum, cv) => sum + (cv.downloads || 0), 0);
  const totalScans = cvs.reduce((sum, cv) => sum + (cv.scans || 0), 0);

  // Storage estimation (assuming ~250KB per CV metadata, very roughly, just to have dynamic data)
  const estimatedStorageUsedMB = (totalCvs * 0.25).toFixed(1);
  const storagePercentage = Math.min((estimatedStorageUsedMB / 1024) * 100, 100).toFixed(1);

  // Process and Filter CVs
  let processedCvs = cvs.map((c) => ({
    id: c.id,
    title: c.title || "Untitled CV",
    date: `Updated ${new Date(c.updatedAt?.seconds * 1000 || Date.now()).toLocaleString('en-US', {month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'})}`,
    timestamp: c.updatedAt?.seconds || 0,
    status: c.isPublished ? "Published" : "Draft",
    views: c.views || 0,
    downloads: c.downloads || 0,
    scans: c.scans || 0,
    privacy: c.isPublic ? "Public" : "Private"
  }));

  if (searchQuery) {
    processedCvs = processedCvs.filter(cv => cv.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  if (filter === "Published") {
    processedCvs = processedCvs.filter(cv => cv.status === "Published");
  } else if (filter === "Drafts") {
    processedCvs = processedCvs.filter(cv => cv.status === "Draft");
  }

  if (sortBy === "Latest") {
    processedCvs.sort((a, b) => b.timestamp - a.timestamp);
  } else if (sortBy === "Oldest") {
    processedCvs.sort((a, b) => a.timestamp - b.timestamp);
  } else if (sortBy === "A-Z") {
    processedCvs.sort((a, b) => a.title.localeCompare(b.title));
  }

  const totalPages = Math.max(1, Math.ceil(processedCvs.length / itemsPerPage));
  
  // Ensure current page is valid after filtering
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [processedCvs.length, totalPages, currentPage]);

  const paginatedCvs = processedCvs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <div className="p-6 text-white bg-[#0A0D14] min-h-screen">Loading...</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0D14] text-white font-sans selection:bg-indigo-500/30">

      {/* ── Share Modal ── */}
      {shareModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShareModal(null)}
          />
          {/* Modal card */}
          <div className="relative w-[90%] max-w-sm rounded-2xl bg-[#111622] border border-white/10 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[17px] font-bold text-white">Share CV</h3>
                  <p className="text-[13px] text-gray-400 mt-0.5 truncate max-w-[220px]">{shareModal.title}</p>
                </div>
                <button
                  onClick={() => setShareModal(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Link bar */}
              <div className="mt-4 flex items-center gap-2 bg-[#0A0D14] border border-white/5 rounded-xl px-3 py-2.5">
                <svg className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                <span className="text-[11px] text-gray-300 truncate flex-1">{window.location.origin}/cv/{shareModal.id}</span>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center pb-5 px-6">
              <div className="bg-white p-3 rounded-2xl shadow-lg">
                <QRCodeSVG
                  value={`${window.location.origin}/cv/${shareModal.id}`}
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#0a0d14"
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => handleCopyLink(shareModal.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                  linkCopied
                    ? "bg-emerald-500 text-white"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white"
                }`}
              >
                {linkCopied ? (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/></svg> Copied!</>
                ) : (
                  <><Copy className="w-4 h-4" /> Copy Link</>
                )}
              </button>
              <button
                onClick={() => window.open(`/cv/${shareModal.id}`, '_blank')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 transition-colors"
              >
                <Eye className="w-4 h-4" /> Open
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isDeleting && setDeleteConfirm(null)}
          />
          <div className="relative w-[90%] max-w-sm rounded-2xl bg-[#111622] border border-white/10 shadow-2xl overflow-hidden">
            {/* Red top accent line */}
            <div className="h-0.5 w-full bg-gradient-to-r from-red-600 via-red-400 to-orange-400" />

            <div className="px-6 pt-6 pb-6">
              {/* Icon + Title */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-white">Delete CV</h3>
                  <p className="text-[12px] text-gray-500 mt-0.5">This action cannot be undone</p>
                </div>
              </div>

              {/* Message */}
              <div className="bg-[#0A0D14] border border-white/5 rounded-xl px-4 py-3 mb-5">
                <p className="text-[13px] text-gray-300 leading-relaxed">
                  You are about to permanently delete{" "}
                  <span className="font-semibold text-white">{deleteConfirm.title}</span>.
                  All associated data will be removed.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-60 shadow-lg shadow-red-900/30"
                >
                  {isDeleting ? (
                    <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Deleting…</>
                  ) : (
                    <><Trash2 className="w-4 h-4" /> Delete CV</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

          {/* Profile */}
          <div className="px-3 mb-4">
            <div className="flex items-center gap-2 bg-[#111622] p-2 rounded-xl border border-white/5">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'User'}`} alt="User" className="w-full h-full object-cover" />
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
                <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-medium shadow-lg shadow-indigo-500/20 transition-colors">
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
              <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
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
      <main className="flex-1 overflow-y-auto bg-[#0A0D14] custom-scrollbar p-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">MyCVs</h1>
            <p className="text-gray-400 text-sm">Manage, view and track all your CVs in one place.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <button onClick={() => navigate('/builder')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm shadow-[0_0_15px_rgba(79,70,229,0.3)]">
              <PlusSquare className="w-4 h-4" /> Create New CV
            </button>
            <NotificationDropdown />
            <ProfileDropdown />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* LEFT SIDE - CV LIST */}
          <div className="flex-1 flex flex-col gap-5">
            {/* Filters Bar */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your CVs..." 
                  className="w-full bg-[#111622] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              {/* Filter Dropdown */}
              <div className="relative" ref={filterRef}>
                <button onClick={() => setShowFilterDropdown(!showFilterDropdown)} className="flex items-center gap-2 bg-[#111622] border border-white/5 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  {filter} <ChevronDown className="w-4 h-4" />
                </button>
                {showFilterDropdown && (
                  <div className="absolute top-full mt-2 w-32 bg-[#111622] border border-white/5 rounded-xl shadow-xl overflow-hidden z-20">
                    {["All CVs", "Published", "Drafts"].map((option) => (
                      <button 
                        key={option} 
                        onClick={() => { setFilter(option); setShowFilterDropdown(false); setCurrentPage(1); }} 
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 ${filter === option ? 'text-indigo-400 font-medium' : 'text-gray-300'}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative" ref={sortRef}>
                <button onClick={() => setShowSortDropdown(!showSortDropdown)} className="flex items-center gap-2 bg-[#111622] border border-white/5 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  Sort by: {sortBy} <ChevronDown className="w-4 h-4" />
                </button>
                {showSortDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-40 bg-[#111622] border border-white/5 rounded-xl shadow-xl overflow-hidden z-20">
                    {["Latest", "Oldest", "A-Z"].map((option) => (
                      <button 
                        key={option} 
                        onClick={() => { setSortBy(option); setShowSortDropdown(false); setCurrentPage(1); }} 
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 ${sortBy === option ? 'text-indigo-400 font-medium' : 'text-gray-300'}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center bg-[#111622] border border-white/5 rounded-xl p-1">
                <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-500 hover:text-white'}`}>
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-500 hover:text-white'}`}>
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CV Items List */}
            {paginatedCvs.length > 0 ? (
              <div className={`bg-[#111622] border border-white/5 rounded-2xl ${viewMode === 'list' ? 'flex flex-col p-2' : 'grid grid-cols-2 gap-4 p-4'}`}>
                {paginatedCvs.map((cv, idx) => (
                  <div key={cv.id} className={`flex ${viewMode === 'list' ? 'flex-col sm:flex-row sm:items-start justify-between p-4 gap-4' : 'flex-col p-4 bg-[#0A0D14] rounded-xl border border-white/5'} ${viewMode === 'list' && idx !== paginatedCvs.length - 1 ? 'border-b border-white/5' : ''}`}>
                    <div className={`flex ${viewMode === 'list' ? 'flex-col sm:flex-row sm:items-start gap-3 sm:gap-5' : 'flex-col gap-4 mb-4'}`}>
                      {/* CV Thumbnail */}
                      <div className={`bg-white rounded-md flex-shrink-0 border border-gray-200 overflow-hidden relative shadow-sm ${viewMode === 'list' ? 'w-16 h-[88px] mt-1' : 'w-full h-32'}`}>
                        <div className="absolute inset-1.5 space-y-1">
                          <div className="flex gap-1.5 mb-2">
                            <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
                            <div className="flex-1 space-y-0.5 mt-0.5">
                               <div className="h-1 bg-gray-300 w-full rounded-full"></div>
                               <div className="h-1 bg-gray-200 w-2/3 rounded-full"></div>
                            </div>
                          </div>
                          <div className="h-1 bg-gray-200 w-full rounded-full"></div>
                          <div className="h-1 bg-gray-200 w-5/6 rounded-full"></div>
                          <div className="h-1 bg-gray-200 w-4/6 rounded-full"></div>
                          <div className="mt-2 h-1 bg-gray-200 w-full rounded-full"></div>
                          <div className="h-1 bg-gray-200 w-full rounded-full"></div>
                          <div className="h-1 bg-gray-200 w-3/4 rounded-full"></div>
                        </div>
                      </div>
                      
                      {/* Info */}
                      <div className="py-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-base text-gray-100">{cv.title}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium tracking-wide ${cv.status === 'Published' ? 'bg-indigo-600/20 text-indigo-400' : 'bg-gray-600/20 text-gray-400'}`}>
                            {cv.status}
                          </span>
                        </div>
                        <div className="text-[12px] text-gray-400 mb-3">{cv.date}</div>
                        
                        <div className="flex items-center gap-5 text-[12px] text-gray-400">
                          <div className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> <span className="text-gray-300 font-medium">{cv.views} Views</span></div>
                          <div className="flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> <span className="text-gray-300 font-medium">{cv.downloads} Downloads</span></div>
                          <div className="flex items-center gap-1.5"><QrCode className="w-3.5 h-3.5" /> <span className="text-gray-300 font-medium">{cv.scans} Scans</span></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className={`flex ${viewMode === 'list' ? 'flex-col items-end gap-2 py-1' : 'items-center justify-between mt-auto pt-4 border-t border-white/5'}`}>
                      <div className={`flex items-center gap-2 ${viewMode === 'grid' ? 'w-full justify-between' : ''}`}>
                        <div className="flex gap-2">
                          <button onClick={() => window.open(`/cv/${cv.id}`, '_blank')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-[12px] font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </button>
                          <button onClick={() => navigate(`/builder/${cv.id}`)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-[12px] font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </button>
                        </div>
                        <div className="relative">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === cv.id ? null : cv.id); }}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {openDropdownId === cv.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); }} 
                              />
                              <div className="absolute right-0 top-full mt-2 w-40 bg-[#111622] border border-white/5 rounded-xl shadow-xl overflow-hidden z-20">
                                <button onClick={() => handleDuplicate(cv.id)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                                  <Copy className="w-4 h-4 text-gray-400" /> Duplicate
                                </button>
                                {cv.privacy === 'Public' && (
                                  <button onClick={() => handleShareLink(cv.id, cv.title)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                                    <Share2 className="w-4 h-4 text-gray-400" /> Share Link
                                  </button>
                                )}
                                <div className="border-t border-white/5 my-1"></div>
                                <button onClick={() => handleDelete(cv.id, cv.title)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                                  <Trash2 className="w-4 h-4" /> Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      {viewMode === 'list' && (
                        <div className={`text-[11px] font-bold mt-2 pr-1 ${cv.privacy === 'Public' ? 'text-emerald-400' : 'text-orange-400'}`}>
                          {cv.privacy}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#111622] border border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                <div className="bg-[#0A0D14] p-4 rounded-full border border-white/5 mb-4">
                  <FileText className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-200 mb-2">No CVs Found</h3>
                <p className="text-sm text-gray-400 max-w-sm mb-6">
                  {searchQuery || filter !== "All CVs" ? "Try adjusting your search or filters to find what you're looking for." : "You haven't created any CVs yet. Start building your professional profile now."}
                </p>
                {!(searchQuery || filter !== "All CVs") && (
                  <button onClick={() => navigate('/builder')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm">
                    <PlusSquare className="w-4 h-4" /> Create New CV
                  </button>
                )}
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/5 text-gray-500 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg border text-sm font-medium transition-colors ${currentPage === i + 1 ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-white/5 text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/5 text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* RIGHT SIDE - SIDE PANELS */}
          <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-5">
            
            {/* CV Overview */}
            <div className="bg-[#111622] border border-white/5 rounded-2xl p-5">
              <h2 className="text-[15px] font-semibold text-gray-100 mb-4">CV Overview</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0A0D14] rounded-xl p-4 flex flex-col items-center justify-center border border-white/5">
                  <div className="bg-indigo-500/10 p-2 rounded-lg mb-2"><FileText className="w-4 h-4 text-indigo-400" /></div>
                  <div className="text-xl font-bold mb-0.5">{totalCvs}</div>
                  <div className="text-[11px] text-gray-400 font-medium">Total CVs</div>
                </div>
                <div className="bg-[#0A0D14] rounded-xl p-4 flex flex-col items-center justify-center border border-white/5">
                  <div className="bg-blue-500/10 p-2 rounded-lg mb-2"><Eye className="w-4 h-4 text-blue-400" /></div>
                  <div className="text-xl font-bold mb-0.5">{totalViews.toLocaleString()}</div>
                  <div className="text-[11px] text-gray-400 font-medium">Total Views</div>
                </div>
                <div className="bg-[#0A0D14] rounded-xl p-4 flex flex-col items-center justify-center border border-white/5">
                  <div className="bg-emerald-500/10 p-2 rounded-lg mb-2"><Download className="w-4 h-4 text-emerald-400" /></div>
                  <div className="text-xl font-bold mb-0.5">{totalDownloads.toLocaleString()}</div>
                  <div className="text-[11px] text-gray-400 font-medium">Total Downloads</div>
                </div>
                <div className="bg-[#0A0D14] rounded-xl p-4 flex flex-col items-center justify-center border border-white/5">
                  <div className="bg-yellow-500/10 p-2 rounded-lg mb-2"><QrCode className="w-4 h-4 text-yellow-400" /></div>
                  <div className="text-xl font-bold mb-0.5">{totalScans.toLocaleString()}</div>
                  <div className="text-[11px] text-gray-400 font-medium">Total Scans</div>
                </div>
              </div>
            </div>

            {/* Storage Usage */}
            <div className="bg-[#111622] border border-white/5 rounded-2xl p-5">
              <h2 className="text-[15px] font-semibold text-gray-100 mb-4">Storage Usage</h2>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2 font-medium">
                <span>{estimatedStorageUsedMB} MB / 1 GB Used</span>
                <span>{storagePercentage}%</span>
              </div>
              <div className="w-full bg-[#0A0D14] rounded-full h-1.5 border border-white/5 overflow-hidden">
                <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${storagePercentage}%` }}></div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#111622] border border-white/5 rounded-2xl p-5">
              <h2 className="text-[15px] font-semibold text-gray-100 mb-4">Quick Actions</h2>
              <div className="flex flex-col gap-2">
                <button onClick={() => navigate('/builder')} className="flex items-center justify-between p-3 rounded-xl bg-[#0A0D14] border border-white/5 hover:border-white/10 transition-colors group">
                  <div className="flex items-center gap-3 text-sm text-gray-300 group-hover:text-white transition-colors">
                    <PlusSquare className="w-4 h-4 text-indigo-400" /> Create New CV
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
                </button>

                <button onClick={() => navigate('/templates')} className="flex items-center justify-between p-3 rounded-xl bg-[#0A0D14] border border-white/5 hover:border-white/10 transition-colors group">
                  <div className="flex items-center gap-3 text-sm text-gray-300 group-hover:text-white transition-colors">
                    <LayoutTemplate className="w-4 h-4 text-gray-400" /> View Templates
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-[#111622] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-[15px] text-gray-100">Tips</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Keep your CV updated and optimized to get better opportunities!
              </p>
            </div>

          </div>
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
