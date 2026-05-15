import React, { useState, useEffect } from "react";
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
  Settings,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  Menu,
  Clock,
  CheckCircle2,
  Copy,
  Download,
  Heart,
  Lightbulb,
  ArrowRight,
  Zap,
  Target,
  Edit3,
  AlignLeft,
  ChevronRight,
  Plus,
  MoreVertical,
  Check,
  Loader2,
  XCircle,
  RefreshCw,
  Trash2,
  ExternalLink
} from "lucide-react";
import { generateCoverLetterAi, improveCoverLetterAi, analyzeCoverLetterAi, getContextualTipsAi } from "../lib/coverLetterAiService";
import { coverLetterStorage } from "../lib/coverLetterStorage";
import { calculateSuccessRate, estimateTimeSaved } from "../lib/coverLetterAnalysis";
import { exportService } from "../lib/exportService";
import { motion, AnimatePresence } from "framer-motion";
import ProfileDropdown from "../components/ProfileDropdown";
import NotificationDropdown from "../components/NotificationDropdown";

export default function CoverLetterGenerator() {
  const navigate = useNavigate();
  const { user } = useAuth();
  

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    jobTitle: "",
    company: "",
    hiringManager: "",
    companyAddress: "",
    companyEmail: "",
    companyLocation: "",
    greetingStyle: "Auto (Recommended)",
    letterDate: new Date().toISOString().split('T')[0],
    tone: "Professional",
    experience: "Entry Level",
    skills: [],
    notes: ""
  });

  const [activeTemplate, setActiveTemplate] = useState("Modern Professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [error, setError] = useState("");
  const [recentLetters, setRecentLetters] = useState(() => coverLetterStorage.getRecentLetters());
  const [analysis, setAnalysis] = useState({ score: 0, status: "Empty", checklist: [], wordCount: 0, metrics: { ats: 0, keywords: 0, tone: 0, personalization: 0 } });
  const [loadingMessage, setLoadingMessage] = useState("");
  const [aiTips, setAiTips] = useState([
    "Add more specific achievements",
    "Include relevant metrics and results",
    "Customize for the company",
    "Keep it concise and focused"
  ]);
  const [toast, setToast] = useState(null);
  const [activeLetterId, setActiveLetterId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // Stores ID of letter to delete

  // Memoized stats for performance
  const successRate = React.useMemo(() => calculateSuccessRate(recentLetters), [recentLetters]);
  const timeSaved = React.useMemo(() => estimateTimeSaved(recentLetters.length), [recentLetters.length]);
  const distinctTemplates = React.useMemo(() => 
    [...new Set(recentLetters.map(l => l.template))].filter(Boolean).length || 0
  , [recentLetters]);


  // Real-time analysis update (using real AI for final score)
  useEffect(() => {
    if (generatedLetter) {
      // Basic count update immediately
      setAnalysis(prev => ({ ...prev, wordCount: generatedLetter.trim().split(/\s+/).length }));
    }
  }, [generatedLetter]);

  // Fetch contextual tips when job details change
  useEffect(() => {
    const fetchTips = async () => {
      if (formData.jobTitle && formData.company) {
        try {
          const tips = await getContextualTipsAi(formData);
          if (tips && tips.length >= 2) setAiTips(tips);
        } catch (e) {}
      }
    };
    const timer = setTimeout(fetchTips, 2000);
    return () => clearTimeout(timer);
  }, [formData.jobTitle, formData.company]);

  const templates = [
    { name: "Modern Professional", desc: "Clean and professional layout", icon: FileText },
    { name: "Executive", desc: "Formal and executive style", icon: FileSignature },
    { name: "Creative", desc: "Modern and creative layout", icon: Zap },
    { name: "Friendly", desc: "Warm and approachable style", icon: MessageSquare },
    { name: "Minimal", desc: "Concise and direct layout", icon: AlignLeft },
  ];

  const tips = [
    "Add more specific achievements",
    "Include relevant metrics and results",
    "Customize for the company",
    "Keep it concise and focused"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.jobTitle || !formData.company) {
      setError("Please enter both Job Title and Company Name.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setLoadingMessage("Researching company profile...");
    
    try {
      // Step 1: Generate
      setTimeout(() => setLoadingMessage("Tailoring content to your skills..."), 2000);
      setTimeout(() => setLoadingMessage("Optimizing for ATS systems..."), 4000);
      setTimeout(() => setLoadingMessage("Finalizing professional tone..."), 7000);
      
      const result = await generateCoverLetterAi({
        ...formData,
        skills: formData.skills.join(", ")
      }, activeTemplate);
      
      setGeneratedLetter(result);
      
      // Step 2: Real AI Analysis
      setLoadingMessage("Analyzing strength and quality...");
      const realAnalysis = await analyzeCoverLetterAi(result, {
        ...formData,
        skills: formData.skills.join(", ")
      });
      
      setAnalysis({
        ...realAnalysis,
        wordCount: result.trim().split(/\s+/).length
      });
      
      // Save to storage
      const newLetter = {
        title: `${formData.jobTitle} at ${formData.company}`,
        content: result,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        score: realAnalysis.score,
        template: activeTemplate,
        formData: { ...formData }
      };
      
      const updated = coverLetterStorage.saveLetter(newLetter);
      setRecentLetters(updated);
      
      // Set as active so it can be favorited/improved
      if (updated.length > 0) {
        setActiveLetterId(updated[0].id);
      }
    } catch (err) {
      setError(err.message || "Failed to generate cover letter. Please try again.");
    } finally {
      setIsGenerating(false);
      setLoadingMessage("");
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleImprove = async () => {
    if (!generatedLetter) return;

    setIsGenerating(true);
    setError("");
    setLoadingMessage("Polishing language and flow...");
    
    try {
      const result = await improveCoverLetterAi(generatedLetter, {
        ...formData,
        skills: formData.skills.join(", ")
      });
      setGeneratedLetter(result);
      
      // Re-analyze
      setLoadingMessage("Updating strength score...");
      const realAnalysis = await analyzeCoverLetterAi(result, {
        ...formData,
        skills: formData.skills.join(", ")
      });
      
      setAnalysis({
        ...realAnalysis,
        wordCount: result.trim().split(/\s+/).length
      });
      
      // Update saved version if it exists
      if (activeLetterId) {
        const updated = coverLetterStorage.updateLetter(activeLetterId, { 
          content: result, 
          score: realAnalysis.score 
        });
        setRecentLetters(updated);
      }
      
      showToast("AI Improvement applied!");
    } catch (err) {
      setError(err.message || "Failed to improve cover letter.");
    } finally {
      setIsGenerating(false);
      setLoadingMessage("");
    }
  };

  const handleExport = async (format) => {
    if (!generatedLetter) return;
    setIsExporting(true);
    const filename = `Cover_Letter_${formData.company.replace(/\s+/g, '_')}`;
    
    let success = false;
    if (format === 'pdf') {
      success = await exportService.exportToPDF("letter-preview", filename);
    } else if (format === 'docx') {
      success = exportService.exportToDOCX(generatedLetter, filename);
    } else {
      success = exportService.exportToTXT(generatedLetter, filename);
    }

    if (success) showToast(`Exported as ${format.toUpperCase()}`);
    else setError("Export failed. Please try again.");
    setIsExporting(false);
  };

  const handleDuplicate = (id) => {
    const updated = coverLetterStorage.duplicateLetter(id);
    setRecentLetters(updated);
    showToast("Letter duplicated");
  };

  const handleFavorite = (id) => {
    const updated = coverLetterStorage.toggleFavorite(id);
    setRecentLetters(updated);
    const letter = updated.find(l => l.id === id);
    showToast(letter.isFavorite ? "Added to favorites" : "Removed from favorites");
  };

  const handleDelete = (id) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (!showDeleteConfirm) return;
    const updated = coverLetterStorage.deleteLetter(showDeleteConfirm);
    setRecentLetters(updated);
    if (activeLetterId === showDeleteConfirm) {
      setActiveLetterId(null);
      setGeneratedLetter("");
    }
    showToast("Letter deleted", "error");
    setShowDeleteConfirm(null);
  };

  const loadLetter = (letter) => {
    setGeneratedLetter(letter.content || "");
    
    // Ensure all fields are controlled by merging with defaults
    const defaultData = {
      name: "", email: "", phone: "", location: "",
      jobTitle: "", company: "", hiringManager: "",
      companyAddress: "", companyEmail: "", companyLocation: "",
      greetingStyle: "Auto (Recommended)",
      letterDate: new Date().toISOString().split('T')[0],
      tone: "Professional", experience: "Entry Level",
      skills: [], notes: ""
    };
    
    setFormData({
      ...defaultData,
      ...(letter.formData || {})
    });
    
    setActiveTemplate(letter.template || "Modern Professional");
    setActiveLetterId(letter.id);
    showToast("Letter loaded to editor");
  };

  const handleCopy = () => {
    if (!generatedLetter) return;
    navigator.clipboard.writeText(generatedLetter);
    showToast("Copied to clipboard");
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
      setSkillInput("");
      setIsAddingSkill(false);
    }
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#070B14] text-white font-sans selection:bg-indigo-500/30">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              toast.type === "error" ? "bg-red-500/20 border-red-500/30 text-red-400" : "bg-indigo-600 border-indigo-400 text-white"
            }`}
          >
            {toast.type === "error" ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            <span className="text-sm font-semibold">{toast.message}</span>
          </motion.div>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#111622] p-6 shadow-2xl"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">Delete Cover Letter?</h3>
              <p className="mb-6 text-sm text-gray-400">
                Are you sure you want to delete this cover letter? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 rounded-xl bg-white/5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors border border-white/5"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
          <div className="px-3 mb-4 cursor-pointer" onClick={() => navigate('/profile')}>
            <div className="flex items-center gap-2 bg-[#111622] p-2 rounded-xl border border-white/5 hover:bg-white/5 transition-colors">

              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'User'}`} alt="User" className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-semibold truncate text-gray-200">{user?.displayName || "ProCV User"}</div>
                <div className="text-[10px] text-gray-500 truncate">{user?.email || "Account Active"}</div>
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
                <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-medium shadow-lg shadow-indigo-500/20 transition-colors">
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
      <main className="flex-1 overflow-y-auto bg-[#070B14] p-8 custom-scrollbar">
        {/* HEADER */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="mb-1 text-3xl font-bold">Cover Letter Generator</h1>
            <p className="text-sm text-gray-400">
              Create a professional cover letter tailored to the job and your experience.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/builder")}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700"
            >
              <PlusSquare className="h-4 w-4" />
              Create New CV
            </button>

            <NotificationDropdown />
            <ProfileDropdown />
          </div>
        </div>

        {/* STATS OVERVIEW */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-4 rounded-2xl border border-white/5 bg-[#111622] p-5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <FileSignature className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Letters Generated</p>
              <h3 className="text-2xl font-bold text-white">{recentLetters.length}</h3>
              <p className="text-[10px] text-gray-500">Total</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 rounded-2xl border border-white/5 bg-[#111622] p-5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Time Saved</p>
              <h3 className="text-2xl font-bold text-white">{timeSaved}h</h3>
              <p className="text-[10px] text-gray-500">Estimated</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-4 rounded-2xl border border-white/5 bg-[#111622] p-5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
              <LayoutTemplate className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Templates Used</p>
              <h3 className="text-2xl font-bold text-white">{distinctTemplates}</h3>
              <p className="text-[10px] text-gray-500">Distinct Styles</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-4 rounded-2xl border border-white/5 bg-[#111622] p-5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Success Rate</p>
              <h3 className="text-2xl font-bold text-white">{successRate}%</h3>
              <p className="text-[10px] text-gray-500">Avg. Strength</p>
            </div>
          </motion.div>
        </div>

        {/* MAIN LAYOUT GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Cover Letter Details */}
          <div className="col-span-1 xl:col-span-4 space-y-6">
            <div className="rounded-2xl border border-white/5 bg-[#111622] p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-semibold text-white">Cover Letter Details</h3>
                <button className="flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-2 py-1 text-[10px] font-medium text-indigo-400 border border-indigo-500/20">
                  <Lightbulb className="w-3 h-3" /> Tips
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-white/10 bg-[#0A0D14] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Your Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-white/10 bg-[#0A0D14] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-white/10 bg-[#0A0D14] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-white/10 bg-[#0A0D14] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Job Title</label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      placeholder="e.g. Software Engineer"
                      className="w-full rounded-xl border border-white/10 bg-[#0A0D14] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Company Name</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="e.g. Tech Solutions"
                      className="w-full rounded-xl border border-white/10 bg-[#0A0D14] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>

                {/* Recipient / Company Details */}
                <div className="pt-2">
                  <div className="text-[10px] font-bold text-gray-500 mb-3 uppercase tracking-widest border-b border-white/5 pb-1">Company / Recipient Details</div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-gray-400">Hiring Manager Name (Optional)</label>
                      <input
                        type="text"
                        name="hiringManager"
                        value={formData.hiringManager}
                        onChange={handleInputChange}
                        placeholder="e.g. John Doe or 'Hiring Manager'"
                        className="w-full rounded-xl border border-white/10 bg-[#0A0D14] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-gray-400">Company Address (Optional)</label>
                      <input
                        type="text"
                        name="companyAddress"
                        value={formData.companyAddress}
                        onChange={handleInputChange}
                        placeholder="Street address, Office #"
                        className="w-full rounded-xl border border-white/10 bg-[#0A0D14] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-gray-400">Greeting Style</label>
                        <div className="relative">
                          <select 
                            name="greetingStyle"
                            value={formData.greetingStyle}
                            onChange={handleInputChange}
                            className="w-full appearance-none rounded-xl border border-white/10 bg-[#0A0D14] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
                          >
                            <option>Auto (Recommended)</option>
                            <option>Use Recipient Name</option>
                            <option>Dear Hiring Manager</option>
                            <option>Dear Sir/Madam</option>
                            <option>Dear Recruitment Team</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-gray-400">Letter Date</label>
                        <input
                          type="date"
                          name="letterDate"
                          value={formData.letterDate}
                          onChange={handleInputChange}
                          className="w-full rounded-xl border border-white/10 bg-[#0A0D14] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-all [color-scheme:dark]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-gray-400">Company Email (Optional)</label>
                        <input
                          type="text"
                          name="companyEmail"
                          value={formData.companyEmail}
                          onChange={handleInputChange}
                          placeholder="hr@company.com"
                          className="w-full rounded-xl border border-white/10 bg-[#0A0D14] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-gray-400">Company City / Country (Optional)</label>
                        <input
                          type="text"
                          name="companyLocation"
                          value={formData.companyLocation}
                          onChange={handleInputChange}
                          placeholder="City, Country"
                          className="w-full rounded-xl border border-white/10 bg-[#0A0D14] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Tone</label>
                    <div className="relative">
                      <select 
                        name="tone"
                        value={formData.tone}
                        onChange={handleInputChange}
                        className="w-full appearance-none rounded-xl border border-white/10 bg-[#0A0D14] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
                      >
                        <option>Professional</option>
                        <option>Casual</option>
                        <option>Creative</option>
                        <option>Persuasive</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Experience Level</label>
                    <div className="relative">
                      <select 
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="w-full appearance-none rounded-xl border border-white/10 bg-[#0A0D14] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
                      >
                        <option>3+ Years</option>
                        <option>Entry Level</option>
                        <option>Junior</option>
                        <option>Mid-Level</option>
                        <option>Senior</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-400">Key Skills (Optional)</label>
                  <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-[#0A0D14] p-2 min-h-[46px] items-center">
                    <AnimatePresence>
                      {formData.skills.map((skill, index) => (
                        <motion.span 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          key={index} 
                          className="flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-300 border border-indigo-500/20 group"
                        >
                          {skill}
                          <button onClick={() => removeSkill(index)} className="hover:text-red-400 text-gray-500 transition">
                            <XCircle className="w-3 h-3" />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                    
                    {isAddingSkill ? (
                      <motion.div 
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "auto", opacity: 1 }}
                        className="flex items-center gap-1"
                      >
                        <input
                          autoFocus
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
                            if (e.key === 'Escape') setIsAddingSkill(false);
                          }}
                          onBlur={() => { if (!skillInput) setIsAddingSkill(false); }}
                          placeholder="Type skill..."
                          className="bg-transparent border-none outline-none text-xs text-white w-24 px-1"
                        />
                        <button onClick={addSkill} className="text-emerald-400 hover:text-emerald-300">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ) : (
                      <button 
                        onClick={() => setIsAddingSkill(true)}
                        className="flex items-center justify-center rounded-lg bg-white/5 w-7 h-7 text-gray-400 hover:text-white border border-white/5 hover:bg-white/10 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-400">Additional Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Add any specific requirements or details about the position..."
                    className="w-full rounded-xl border border-white/10 bg-[#0A0D14] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 transition-all h-24 resize-none"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-[11px] text-red-400">
                    <XCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:scale-[1.02] disabled:opacity-70"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {isGenerating ? "Generating..." : "Generate Cover Letter"}
                </button>
              </div>
            </div>
          </div>

          {/* MIDDLE COLUMN: Generated Cover Letter */}
          <div className="col-span-1 xl:col-span-5 space-y-6">
            <div className="rounded-2xl border border-white/5 bg-[#111622] p-6 h-full flex flex-col">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-semibold text-white">Generated Cover Letter</h3>
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white transition" title="Copy to clipboard">
                    <Copy className="h-4 w-4" />
                  </button>
                  <div className="relative group/export">
                    <button className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white transition" title="Export options">
                      {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-40 bg-[#111622] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all z-10 p-1">
                      <button onClick={() => handleExport('docx')} className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-white/5 flex items-center gap-2">
                        <FileSignature className="w-3.5 h-3.5 text-blue-400" /> Export as DOCX
                      </button>
                      <button onClick={() => handleExport('txt')} className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-white/5 flex items-center gap-2">
                        <AlignLeft className="w-3.5 h-3.5 text-gray-400" /> Export as TXT
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={() => activeLetterId && handleFavorite(activeLetterId)}
                    disabled={!activeLetterId}
                    className={`rounded-lg p-2 transition ${
                      activeLetterId && recentLetters.find(l => l.id === activeLetterId)?.isFavorite
                        ? "text-pink-500 bg-pink-500/10"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                    title={activeLetterId && recentLetters.find(l => l.id === activeLetterId)?.isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart className={`h-4 w-4 ${activeLetterId && recentLetters.find(l => l.id === activeLetterId)?.isFavorite ? "fill-current" : ""}`} />
                  </button>
                </div>
              </div>

              <div id="letter-preview" className={`flex-1 rounded-xl bg-[#0A0D14] p-8 text-sm leading-relaxed text-gray-300 relative overflow-y-auto custom-scrollbar ${!generatedLetter && !isGenerating ? 'flex items-center justify-center text-center italic' : ''}`}>
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                    <p className="animate-pulse text-indigo-400 font-medium">{loadingMessage || "AI is writing your cover letter..."}</p>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                    </div>
                  </div>
                ) : generatedLetter ? (
                  <>
                    <div className="absolute top-6 right-6 flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                      Personalized
                    </div>
                    <div className="whitespace-pre-wrap">{generatedLetter}</div>
                  </>
                ) : (
                  <div className="max-w-[250px] space-y-4">
                    <FileSignature className="w-12 h-12 text-indigo-500/30 mx-auto" />
                    <p className="text-gray-500 text-xs">Your AI-generated cover letter will appear here once you fill the details and click generate.</p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                  <FileText className="w-3.5 h-3.5" /> {generatedLetter ? generatedLetter.split(/\s+/).length : 0} words
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> ATS Optimized
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Tools & Tips */}
          <div className="col-span-1 xl:col-span-3 space-y-6">
            
            {/* Cover Letter Strength */}
            <div className="rounded-2xl border border-white/5 bg-[#111622] p-5">
              <h3 className="mb-6 text-[15px] font-semibold text-white">Cover Letter Strength</h3>
              <div className="flex flex-col items-center mb-6">
                <div className="relative flex items-center justify-center w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 * (1 - (analysis.score / 100))} className="text-indigo-500 transition-all duration-1000" strokeLinecap="round" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold">{analysis.score}%</span>
                    <span className={`text-[10px] font-bold ${analysis.score >= 80 ? "text-emerald-400" : analysis.score >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                      {analysis.status}
                    </span>
                  </div>
                </div>
              </div>

              {analysis.metrics && analysis.score > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-center">
                    <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">ATS</div>
                    <div className="text-sm font-bold text-indigo-400">{analysis.metrics.ats}%</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-center">
                    <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">Keywords</div>
                    <div className="text-sm font-bold text-emerald-400">{analysis.metrics.keywords}%</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-center">
                    <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">Tone</div>
                    <div className="text-sm font-bold text-blue-400">{analysis.metrics.tone}%</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-center">
                    <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">Custom</div>
                    <div className="text-sm font-bold text-purple-400">{analysis.metrics.personalization}%</div>
                  </div>
                </div>
              )}

              <div className="space-y-2 mb-6">
                {analysis.checklist && analysis.checklist.length > 0 ? (
                  analysis.checklist.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-gray-300">
                      <div className={`flex h-4 w-4 items-center justify-center rounded-full ${item.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-500'}`}>
                        {item.passed ? <Check className="h-2.5 w-2.5" /> : <div className="w-1 h-1 rounded-full bg-gray-500" />}
                      </div>
                      {item.label}
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-gray-500 text-center italic">Generate a letter to see analysis</p>
                )}
              </div>

              <button 
                onClick={handleImprove}
                disabled={isGenerating || !generatedLetter}
                className="flex w-full items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 transition-colors text-xs font-semibold border border-indigo-500/20 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" /> Improve with AI
              </button>
            </div>

            {/* Template Style */}
            <div className="rounded-2xl border border-white/5 bg-[#111622] p-5">
              <h3 className="mb-4 text-[15px] font-semibold text-white">Template Style</h3>
              <div className="space-y-2">
                {templates.map(tpl => (
                  <button
                    key={tpl.name}
                    onClick={() => setActiveTemplate(tpl.name)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      activeTemplate === tpl.name
                        ? "bg-indigo-600/10 border-indigo-500/50"
                        : "bg-[#0A0D14] border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${activeTemplate === tpl.name ? "bg-indigo-500 text-white" : "bg-white/5 text-gray-400"}`}>
                      <tpl.icon className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-white">{tpl.name}</div>
                      <div className="text-[9px] text-gray-500">{tpl.desc}</div>
                    </div>
                    {activeTemplate === tpl.name && <div className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-white"><Check className="h-2.5 w-2.5" /></div>}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Writing Tips */}
            <div className="rounded-2xl border border-white/5 bg-[#111622] p-5">
              <div className="mb-4 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <h3 className="text-[15px] font-semibold text-white">AI Writing Tips</h3>
              </div>
              <div className="space-y-3">
                {aiTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] text-gray-400 leading-tight">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                    {tip}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* RECENT COVER LETTERS */}
        <div className="mt-8 rounded-2xl border border-white/5 bg-[#111622] p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-semibold text-white">Recent Cover Letters</h3>
            <div className="text-xs text-gray-500">{recentLetters.length} saved letters</div>
          </div>
          
          {recentLetters.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {recentLetters.map((letter, i) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={letter.id || i} 
                    className={`flex flex-col p-4 rounded-xl bg-[#0A0D14] border hover:border-indigo-500/30 group transition-all relative ${activeLetterId === letter.id ? 'border-indigo-500/50 ring-1 ring-indigo-500/20' : 'border-white/5'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 flex-shrink-0">
                          <FileSignature className="h-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-white truncate">{letter.title}</h4>
                          <p className="text-[10px] text-gray-500">{letter.date}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleFavorite(letter.id)}
                        className={`p-1.5 rounded-lg transition-colors ${letter.isFavorite ? 'text-pink-500 bg-pink-500/10' : 'text-gray-500 hover:text-white bg-white/5'}`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${letter.isFavorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/10">
                          {letter.score}%
                        </div>
                        <div className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">
                          {letter.template?.split(' ')[0]}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => loadLetter(letter)}
                          className="p-1.5 text-gray-400 hover:text-indigo-400 bg-white/5 rounded-lg border border-white/5 transition-colors"
                          title="Load to editor"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDuplicate(letter.id)}
                          className="p-1.5 text-gray-400 hover:text-emerald-400 bg-white/5 rounded-lg border border-white/5 transition-colors"
                          title="Duplicate"
                        >
                          <PlusSquare className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(letter.id)}
                          className="p-1.5 text-red-500/50 hover:text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded-lg border border-red-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-600" />
              </div>
              <h4 className="text-sm font-medium text-gray-400">No cover letters generated yet</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">Fill in your job details above and click generate to create your first professional cover letter.</p>
            </div>
          )}
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
