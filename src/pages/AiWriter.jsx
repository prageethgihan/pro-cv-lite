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
  Loader2,
  Trash2,
  RotateCcw,
  History,
} from "lucide-react";
import { generateAiWriterContent } from "../lib/ai";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import ProfileDropdown from "../components/ProfileDropdown";
import NotificationDropdown from "../components/NotificationDropdown";
import AIHistoryModal from "../components/AIHistoryModal";

export default function AiWriter() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Professional Summary");
  const [activeTone, setActiveTone] = useState("Professional");

  const userFullName = user?.displayName || "Prageeth Gihan";
  const userEmail = user?.email || "prageethgihan55@gmail.com";

  const [formData, setFormData] = useState({
    jobTitle: "",
    industry: "",
    experienceLevel: "mid",
    skills: "",
    customPrompt: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState({ generated: 0, words: 0, saved: 0 });
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
  const [cooldown, setCooldown] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Fetch real history from localStorage safely
  React.useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("procv_ai_history");
      let historyData = [];
      if (storedHistory) {
        historyData = JSON.parse(storedHistory);
        if (!Array.isArray(historyData)) {
          historyData = [];
        }
      }
      setHistory(historyData);
      
      // Calculate real stats
      let totalWords = 0;
      historyData.forEach(item => {
        if (item?.text && typeof item.text === 'string') {
          totalWords += item.text.split(/\s+/).length;
        }
      });
      
      setStats({
        generated: historyData.length,
        words: totalWords,
        saved: historyData.length * 0.1 // 6 mins (0.1 hrs) saved per generation
      });
    } catch (e) {
      console.error("Failed to load history from local storage", e);
      setHistory([]);
      localStorage.removeItem("procv_ai_history");
    }
  }, []);

  // Fetch favorites from Firestore
  React.useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "users", user.uid, "favorites"), (snap) => {
      const favs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      // Sort locally to prevent 400 Missing Index error
      favs.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setFavorites(favs);
    }, (error) => {
      console.error("Error loading favorites:", error);
    });
    return () => unsub();
  }, [user]);

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "success" }), 3000);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (activeTab !== "Custom Content" && !formData.jobTitle.trim()) {
      showToast("Please enter a Job Title / Role", "error");
      return;
    }
    if (activeTab === "Custom Content" && !formData.customPrompt.trim()) {
      showToast("Please enter your custom request", "error");
      return;
    }
    
    if (isGenerating || cooldown) return;

    setIsGenerating(true);
    setGeneratedContent("");

    try {
      const data = { ...formData, tone: activeTone };
      const response = await generateAiWriterContent(activeTab, data);
      
      if (!response) {
        throw new Error("No content generated");
      }

      setGeneratedContent(response);
      showToast("Content generated successfully!");

      // Start cooldown
      setCooldown(true);
      setTimeout(() => setCooldown(false), 3000);

      // Save to localStorage
      const newItem = {
        id: Date.now().toString(),
        title: `${formData.jobTitle || "Custom"} ${activeTab}`,
        type: activeTab,
        text: response,
        createdAt: Date.now()
      };
      
      setHistory(prev => {
        const newHistory = [newItem, ...prev].slice(0, 50); // Keep last 50
        localStorage.setItem("procv_ai_history", JSON.stringify(newHistory));
        
        // Update stats
        let totalWords = 0;
        newHistory.forEach(item => {
          if (item.text) totalWords += item.text.split(/\s+/).length;
        });
        setStats({
          generated: newHistory.length,
          words: totalWords,
          saved: newHistory.length * 0.1
        });
        
        return newHistory;
      });

    } catch (error) {
      showToast(error.message || "Failed to generate content. Please try again.", "error");
      setCooldown(true);
      setTimeout(() => setCooldown(false), 2000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedContent) return;
    navigator.clipboard.writeText(generatedContent);
    showToast("Copied to clipboard!");
  };

  const handleDownload = () => {
    if (!generatedContent) return;
    const blob = new Blob([generatedContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AI_Generated_${activeTab.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded as TXT");
  };

  const handleHistoryClick = (item) => {
    setGeneratedContent(item.text);
    setActiveTab(item.type);
    showToast("Loaded from history");
  };

  const handleFavorite = async () => {
    if (!generatedContent || !user) {
      if (!user) showToast("You must be logged in to save favorites", "error");
      return;
    }
    
    setIsSavingFavorite(true);
    try {
      await addDoc(collection(db, "users", user.uid, "favorites"), {
        type: activeTab,
        content: generatedContent,
        tone: activeTone,
        createdAt: serverTimestamp()
      });
      showToast("Saved to favorites!");
    } catch (error) {
      console.error("Failed to save favorite:", error);
      showToast("Failed to save favorite to cloud.", "error");
    } finally {
      setIsSavingFavorite(false);
    }
  };

  const handleRemoveFavorite = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, "users", user.uid, "favorites", id));
      showToast("Favorite removed");
    } catch (error) {
      console.error("Error removing favorite:", error);
      showToast("Failed to remove favorite", "error");
    }
  };

  const handleReuseFavorite = (item) => {
    setGeneratedContent(item.content);
    setActiveTab(item.type);
    setActiveTone(item.tone || "Professional");
    showToast("Loaded from favorites");
  };

  const handleClearContent = () => {
    setGeneratedContent("");
  };

  const handleDeleteHistory = (id) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem("procv_ai_history", JSON.stringify(updated));
      // Recalculate stats
      let totalWords = 0;
      updated.forEach(item => {
        if (item?.text) totalWords += item.text.split(/\s+/).length;
      });
      setStats({
        generated: updated.length,
        words: totalWords,
        saved: updated.length * 0.1,
      });
      return updated;
    });
    showToast("History item removed");
  };

  const tabs = [
    { name: "Professional Summary", icon: LayoutTemplate },
    { name: "Experience Bullets", icon: AlignLeft },
    { name: "Skills & Keywords", icon: Sparkles },
    { name: "Custom Content", icon: Edit3 },
  ];

  const tones = [
    { name: "Professional", desc: "Formal & corporate", icon: Target },
    { name: "Modern", desc: "Clean & contemporary", icon: FileText },
    { name: "Creative", desc: "Unique & engaging", icon: Zap },
    { name: "Concise", desc: "Short & impactful", icon: AlignLeft },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#070B14] text-white">
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
                <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-medium shadow-lg shadow-indigo-500/20 transition-colors">
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
      <main className="flex-1 overflow-y-auto bg-[#070B14] p-8 custom-scrollbar">
        {/* HEADER */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="mb-1 text-3xl font-bold">AI Writer</h1>
            <p className="text-sm text-gray-400">
              Create professional CV content with the power of AI
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
        <div className="mb-8 flex flex-col lg:flex-row justify-between gap-6">
          <div className="flex flex-col sm:flex-row flex-1 gap-4">
            {/* Stat Card 1 */}
            <div className="flex flex-1 items-center gap-4 rounded-2xl border border-white/5 bg-[#111622] p-5 min-w-0">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-400 truncate">Content Generated</p>
                <h3 className="text-2xl font-bold text-white truncate">{stats.generated}</h3>
                <p className="text-[10px] text-gray-500 truncate">This month</p>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="flex flex-1 items-center gap-4 rounded-2xl border border-white/5 bg-[#111622] p-5 min-w-0">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                <FileText className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-400 truncate">Words Written</p>
                <h3 className="text-2xl font-bold text-white truncate">{(stats.words / 1000).toFixed(1)}K</h3>
                <p className="text-[10px] text-gray-500 truncate">This month</p>
              </div>
            </div>

            {/* Stat Card 3 */}
            <div className="flex flex-1 items-center gap-4 rounded-2xl border border-white/5 bg-[#111622] p-5 min-w-0">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <Clock className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-400 truncate">Time Saved</p>
                <h3 className="text-2xl font-bold text-white truncate">{stats.saved.toFixed(1)} hrs</h3>
                <p className="text-[10px] text-gray-500 truncate">This month</p>
              </div>
            </div>
          </div>

          {/* Graphic Area */}
          <div className="relative flex w-full lg:w-[300px] items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-[#111622] bg-gradient-to-br from-[#111622] to-[#1e2336] p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.15),transparent_70%)]"></div>
            {/* Glowing 3D-like Document */}
            <div className="relative flex h-[100px] w-[80px] rotate-[15deg] flex-col items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_0_30px_rgba(99,102,241,0.5)]">
               {/* Document Lines */}
               <div className="mb-2 h-1.5 w-10 rounded-full bg-white/80"></div>
               <div className="mb-2 h-1.5 w-12 rounded-full bg-white/80"></div>
               <div className="mb-2 h-1.5 w-10 rounded-full bg-white/80"></div>
               <div className="h-1.5 w-8 rounded-full bg-white/80"></div>
               {/* Star Overlay */}
               <Sparkles className="absolute -right-3 -top-3 h-8 w-8 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
               <div className="absolute -left-6 top-1/2 h-1 w-12 rounded-full bg-indigo-400/50 blur-[1px]"></div>
               <div className="absolute -right-6 top-1/4 h-1 w-8 rounded-full bg-purple-400/50 blur-[1px]"></div>
            </div>
          </div>
        </div>

        {/* MAIN LAYOUT GRID */}
        <div className="flex flex-col xl:flex-row gap-6">
          {/* LEFT COLUMN */}
          <div className="flex flex-1 flex-col gap-6">
            
            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-[#111622] p-1.5 border border-white/5 w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                    activeTab === tab.name
                      ? "bg-[#1e2336] text-indigo-400 shadow-sm border border-white/5"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Form & Preview Area */}
            <div className="flex flex-col xl:flex-row gap-6">
              
              {/* Form Side */}
              <div className="w-full xl:w-[45%] flex-shrink-0 space-y-6 rounded-2xl border border-white/5 bg-[#111622] p-6">
                
                {/* Job Role & Details */}
                <div>
                  <div className="mb-5 flex items-center justify-between min-w-0">
                    <h3 className="font-semibold text-white truncate">Job Role & Details</h3>
                    <div className="text-[10px] text-gray-500 flex items-center gap-1 flex-shrink-0"><Sparkles className="w-3 h-3"/> AI</div>
                  </div>
                  
                    <div className="space-y-4">
                      {activeTab === "Custom Content" ? (
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-medium text-gray-400">What would you like AI to write?</label>
                          <textarea
                            value={formData.customPrompt}
                            onChange={(e) => handleInputChange("customPrompt", e.target.value)}
                            placeholder="e.g. Write a short cover letter intro for a Senior React Developer role at Google..."
                            className="w-full h-[142px] rounded-xl border border-white/10 bg-[#0A0D14] p-4 text-sm text-white outline-none placeholder:text-gray-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-medium text-gray-400">Job Title / Role <span className="text-red-400">*</span></label>
                              <input
                                type="text"
                                value={formData.jobTitle}
                                onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                                placeholder="e.g. Software Engineer"
                                className="w-full rounded-xl border border-white/10 bg-[#0A0D14] px-4 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-medium text-gray-400">Industry</label>
                              <div className="relative">
                                <select 
                                  value={formData.industry}
                                  onChange={(e) => handleInputChange("industry", e.target.value)}
                                  className="w-full appearance-none rounded-xl border border-white/10 bg-[#0A0D14] px-4 py-2.5 text-sm text-gray-300 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all cursor-pointer"
                                >
                                  <option value="">Select industry</option>
                                  <option value="Technology / IT">Technology / IT</option>
                                  <option value="Finance">Finance</option>
                                  <option value="Healthcare">Healthcare</option>
                                  <option value="Education">Education</option>
                                  <option value="Marketing">Marketing</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none" />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-medium text-gray-400">Experience Level</label>
                              <div className="relative">
                                <select 
                                  value={formData.experienceLevel}
                                  onChange={(e) => handleInputChange("experienceLevel", e.target.value)}
                                  className="w-full appearance-none rounded-xl border border-white/10 bg-[#0A0D14] px-4 py-2.5 text-sm text-gray-300 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all cursor-pointer"
                                >
                                  <option value="entry">Entry-Level (0-2 years)</option>
                                  <option value="mid">Mid-Level (2-5 years)</option>
                                  <option value="senior">Senior (5+ years)</option>
                                  <option value="executive">Executive</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none" />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-medium text-gray-400">Key Skills</label>
                              <input
                                type="text"
                                value={formData.skills}
                                onChange={(e) => handleInputChange("skills", e.target.value)}
                                placeholder="React, Node.js, UI Design"
                                className="w-full rounded-xl border border-white/10 bg-[#0A0D14] px-4 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                </div>

                <div className="h-px w-full bg-white/5"></div>

                {/* Tone & Style */}
                <div>
                  <h3 className="mb-4 font-semibold text-white">Tone & Style</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {tones.map((tone) => (
                      <button
                        key={tone.name}
                        onClick={() => setActiveTone(tone.name)}
                        className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                          activeTone === tone.name
                            ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(79,70,229,0.15)]"
                            : "border-white/5 bg-[#0A0D14] hover:border-white/10 hover:bg-white/5"
                        }`}
                      >
                        <tone.icon className={`mb-2 h-5 w-5 ${activeTone === tone.name ? "text-indigo-400" : "text-gray-400"}`} />
                        <span className="mb-1 text-xs font-semibold text-white">{tone.name}</span>
                        <span className="text-[9px] text-gray-500">{tone.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || cooldown}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
                >
                  {isGenerating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : cooldown ? (
                    <RotateCcw className="h-5 w-5 animate-spin" />
                  ) : (
                    <Sparkles className="h-5 w-5" />
                  )}
                  <div className="flex flex-col items-center">
                    <span>
                      {isGenerating ? "Generating..." : cooldown ? "Waiting..." : "Generate Content"}
                    </span>
                  </div>
                </button>
              </div>

              {/* Preview Side */}
              <div className="flex flex-1 flex-col rounded-2xl border border-white/5 bg-[#111622] p-6 min-w-0">
                <div className="mb-4 flex items-center justify-between min-w-0">
                  <h3 className="font-semibold text-white truncate">Generated Content</h3>
                  {generatedContent && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button 
                        onClick={handleClearContent} 
                        title="Clear current content"
                        className="rounded-lg p-2 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <button onClick={handleCopy} className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white transition">
                        <Copy className="h-4 w-4" />
                      </button>
                      <button onClick={handleDownload} className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white transition">
                        <Download className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={handleFavorite}
                        disabled={isSavingFavorite} 
                        className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white transition disabled:opacity-50"
                      >
                        {isSavingFavorite ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
                      </button>
                    </div>
                  )}
                </div>

                <div className={`flex flex-1 flex-col rounded-xl border border-white/10 bg-[#0A0D14] p-6 relative overflow-y-auto custom-scrollbar ${!generatedContent ? 'items-center justify-center text-center border-dashed' : ''}`}>
                  {!generatedContent ? (
                    <>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.05),transparent_50%)] pointer-events-none"></div>
                      
                      <div className="mb-6 relative">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
                        <FileText className="h-16 w-16 text-indigo-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] relative z-10" />
                        <Sparkles className="absolute -right-2 -top-2 h-6 w-6 text-indigo-300 z-20" />
                      </div>
                      
                      <h4 className="mb-3 text-lg font-bold text-white">Your AI-generated content will appear here</h4>
                      <p className="max-w-[300px] text-sm text-gray-400 leading-relaxed">
                        Fill in the details on the left and click 'Generate Content' to create professional CV content.
                      </p>

                      <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> ATS Optimized
                        </div>
                        <div className="flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[11px] font-medium text-indigo-400">
                          <Target className="h-3 w-3" /> Professional Tone
                        </div>
                        <div className="flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-[11px] font-medium text-purple-400">
                          <Edit3 className="h-3 w-3" /> Customizable
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed">
                      {generatedContent}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-full xl:w-[300px] flex-shrink-0 space-y-6 min-w-0">
            
            {/* AI Writer Tips */}
            <div className="rounded-2xl border border-white/5 bg-[#111622] p-5">
              <div className="mb-5 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <h2 className="text-[15px] font-semibold text-white">AI Writer Tips</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex gap-3 rounded-xl border border-white/5 bg-[#0A0D14] p-3 transition hover:border-white/10">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 flex-shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">Be specific about your role</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">Get more relevant content</p>
                  </div>
                </div>
                
                <div className="flex gap-3 rounded-xl border border-white/5 bg-[#0A0D14] p-3 transition hover:border-white/10 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 flex-shrink-0">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">Add 5-8 key skills</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">Helps AI understand your expertise</p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-xl border border-white/5 bg-[#0A0D14] p-3 transition hover:border-white/10 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 flex-shrink-0">
                    <Target className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">Choose the right tone</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">Match your target industry</p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-xl border border-white/5 bg-[#0A0D14] p-3 transition hover:border-white/10 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/20 text-pink-400 flex-shrink-0">
                    <Edit3 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">Edit & personalize</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">Make it uniquely yours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Generations */}
            <div className="rounded-2xl border border-white/5 bg-[#111622] p-5">
              <div className="mb-5 flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <h2 className="text-[15px] font-semibold text-white">Recent Generations</h2>
              </div>
              
              <div className="space-y-3">
                {history.length > 0 ? history.slice(0, 5).map((item) => {
                  const date = item.createdAt ? new Date(item.createdAt) : new Date();
                  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " · " + date.toLocaleDateString();
                  
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => handleHistoryClick(item)}
                      className="flex items-start gap-3 rounded-xl bg-[#0A0D14] p-3 border border-white/5 hover:border-white/10 cursor-pointer transition"
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 mt-0.5">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-semibold text-white truncate">{item.title}</h4>
                        <span className="text-[10px] text-gray-500">{timeStr}</span>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center p-4 border border-white/5 rounded-xl bg-white/[0.02]">
                    <p className="text-xs text-gray-500">No content generated yet.</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowHistoryModal(true)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] py-2.5 text-xs font-semibold text-gray-400 hover:border-indigo-500/30 hover:bg-indigo-500/5 hover:text-indigo-400 transition-all duration-200"
              >
                <History className="h-3.5 w-3.5" /> View All History
                {history.length > 0 && (
                  <span className="ml-1 rounded-full bg-indigo-500/20 border border-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold text-indigo-400">
                    {history.length}
                  </span>
                )}
              </button>
            </div>

            {/* Favorites Panel */}
            <div className="rounded-2xl border border-white/5 bg-[#111622] p-5 flex flex-col max-h-[400px]">
              <div className="mb-5 flex items-center gap-2 flex-shrink-0">
                <Heart className="h-4 w-4 text-pink-500" />
                <h2 className="text-[15px] font-semibold text-white">Saved Favorites</h2>
              </div>
              
              <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1 min-h-0">
                {favorites.length > 0 ? favorites.map((item) => {
                  const date = item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000) : new Date();
                  const timeStr = date.toLocaleDateString();
                  
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => handleReuseFavorite(item)}
                      className="group flex flex-col gap-2 rounded-xl bg-[#0A0D14] p-3 border border-white/5 hover:border-white/10 cursor-pointer transition relative"
                    >
                      <div className="flex items-center justify-between min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-pink-500/10 text-pink-400">
                            <Heart className="h-3 w-3" />
                          </div>
                          <h4 className="text-[11px] font-semibold text-white truncate">{item.type}</h4>
                        </div>
                        <span className="text-[9px] text-gray-500 flex-shrink-0">{timeStr}</span>
                      </div>
                      
                      <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
                        {item.content}
                      </p>
                      
                      <div className="flex items-center justify-between mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] px-1.5 py-0.5 rounded border border-white/5 bg-white/5 text-gray-400">
                          {item.tone}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(item.content);
                              showToast("Copied favorite!");
                            }}
                            className="p-1 text-gray-400 hover:text-white transition"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                          <button 
                            onClick={(e) => handleRemoveFavorite(item.id, e)}
                            className="p-1 text-gray-400 hover:text-red-400 transition"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center p-6 border border-white/5 rounded-xl bg-white/[0.02] flex flex-col items-center justify-center h-full">
                    <Heart className="h-6 w-6 text-gray-600 mb-2" />
                    <p className="text-xs text-gray-500 font-medium">No favorites yet</p>
                    <p className="text-[10px] text-gray-600 mt-1">Save your best generations to use later.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* History Modal */}
      <AIHistoryModal
        open={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        history={history}
        onReuse={(item) => {
          setGeneratedContent(item.text);
          setActiveTab(item.type);
          showToast("Loaded from history");
        }}
        onDelete={handleDeleteHistory}
      />

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#111622] border border-white/10 px-5 py-3 shadow-2xl shadow-black/50 animate-in slide-in-from-bottom-5">
          {toast.type === "error" ? (
            <div className="rounded-full bg-red-500/20 p-1">
              <CheckCircle2 className="h-4 w-4 text-red-500" />
            </div>
          ) : (
            <div className="rounded-full bg-emerald-500/20 p-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
          )}
          <p className="text-sm font-medium text-white">{toast.msg}</p>
        </div>
      )}

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
