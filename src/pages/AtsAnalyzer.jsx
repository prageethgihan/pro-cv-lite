import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import ProfileDropdown from "../components/ProfileDropdown";
import NotificationDropdown from "../components/NotificationDropdown";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  LayoutDashboard, FileText, PlusSquare, LayoutTemplate, PenTool,
  FileCheck, Sparkles, MessageSquare, FileSignature, BarChart2,
  User, Settings, Sun, Moon, Bell, ChevronDown, Menu, UploadCloud,
  CheckCircle2, XCircle, Lightbulb, ArrowRight, ShieldCheck,
  Target, FileDigit, Eye, Zap, RotateCcw, Loader2, X, Copy,
  Info
} from "lucide-react";
import { extractCvText, analyzeWithGemini, improveSection, validateCvForAts } from "../lib/atsAnalysis";
import Template1 from "../templates/Template1";

const EMPTY_CV = {
  fullName: "",
  jobTitle: "",
  summary: "",
  contact: { phone: "", email: "", address: "", website: "" },
  education: [],
  skills: [],
  experience: [],
  projects: [],
  certifications: [],
  achievements: [],
  languages: [],
  themeMode: "auto",
  themeManual: {
    primary: "#6366f1",
    secondary: "#4f46e5",
    accent: "#818cf8",
    bg: "#ffffff",
    card: "#f9fafb",
    text: "#111827"
  }
};

function ScoreRing({ score, color, size = 80, strokeW = 6 }) {
  const r = (size / 2) - strokeW;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  return (
    <svg width={size} height={size} className="rotate-[-90deg]" viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeW} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeW}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  );
}

export default function AtsAnalyzer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  
  // Auto-scan states
  const [isAutoLoading, setIsAutoLoading] = useState(false);
  const [autoLoadingStep, setAutoLoadingStep] = useState("");
  const autoScanDone = useRef(false);

  const userFullName = user?.displayName || "Prageeth Gihan";
  const userEmail = user?.email || "prageethgihan55@gmail.com";

  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [cvText, setCvText] = useState("");
  const [cooldown, setCooldown] = useState(false);

  const [isOptimizeModalOpen, setIsOptimizeModalOpen] = useState(false);
  const [optimizationLoading, setOptimizationLoading] = useState(false);
  const [aiImprovementResult, setAiImprovementResult] = useState(null);
  const [optimizationError, setOptimizationError] = useState("");

  // Validation state
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [validationWarning, setValidationWarning] = useState("");
  const [isInvalidFile, setIsInvalidFile] = useState(false);

  // CV Data state for direct importing and optimization
  const [cvData, setCvData] = useState(EMPTY_CV);
  const [history, setHistory] = useState([]); // For Undo support
  const [showUndoToast, setShowUndoToast] = useState(false);
  const [lastUpdatedSection, setLastUpdatedSection] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const validateFile = async (f) => {
    setIsValidating(true);
    setValidationError("");
    setValidationWarning("");
    setIsInvalidFile(false);
    setResult(null);

    try {
      const validation = await validateCvForAts(f);
      
      if (!validation.isValid) {
        setIsInvalidFile(true);
        setValidationError(validation.error || "Profile photo or heavy graphics detected. Please remove images and upload a text-based CV for accurate ATS analysis.");
        setFile(null);
        return;
      }

      setFile(f);
      setCvText(validation.text);
      if (validation.warning) {
        setValidationWarning(validation.warning);
      }
    } catch (err) {
      console.error("Validation error:", err);
      setValidationError("Failed to read file. Please ensure it is a valid PDF or DOCX.");
      setIsInvalidFile(true);
      setFile(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleFile = (f) => {
    if (!f) return;
    const ok = f.name.endsWith(".pdf") || f.name.endsWith(".docx");
    if (!ok) { 
      setValidationError("Only PDF or DOCX files are supported."); 
      setIsInvalidFile(true);
      return; 
    }
    if (f.size > 10 * 1024 * 1024) { 
      setValidationError("File must be under 10MB."); 
      setIsInvalidFile(true);
      return; 
    }
    
    validateFile(f);
  };

  const handleDrop = (e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); };

  const processingRef = useRef(false);
  const abortControllerRef = useRef(null);

  React.useEffect(() => {
    return () => {
      // Abort any ongoing request on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // --- Automated Workflow Detection ---
  React.useEffect(() => {
    if (autoScanDone.current || !location.state?.autoScan || !location.state?.cvId || !user) return;

    const runAutoScan = async () => {
      autoScanDone.current = true;
      setIsAutoLoading(true);
      setAutoLoadingStep("Preparing ATS analysis...");

      try {
        // 1. Fetch CV from Firestore
        const cvRef = doc(db, "cvs", location.state.cvId);
        const cvSnap = await getDoc(cvRef);
        
        if (!cvSnap.exists()) {
          throw new Error("CV not found. Please select a different resume.");
        }

        const data = cvSnap.data();
        setAutoLoadingStep("Analyzing resume structure...");

        // 2. Format CV data for analysis
        const formattedText = `
          Full Name: ${data.fullName || ""}
          Job Title: ${data.jobTitle || ""}
          Summary: ${data.summary || ""}
          Skills: ${Array.isArray(data.skills) ? data.skills.map(s => typeof s === 'string' ? s : s.name).join(', ') : ""}
          Experience: ${Array.isArray(data.experience) ? data.experience.map(e => `${e.role} at ${e.company}: ${e.description}`).join('\n') : ""}
          Education: ${Array.isArray(data.education) ? data.education.map(ed => `${ed.degree} from ${ed.school}`).join('\n') : ""}
        `;

        // 3. Set states for analysis
        setCvText(formattedText);
        setFile({ name: data.title || "Selected CV", size: 0, isAuto: true });
        
        // Use a short delay for UX smoothness
        setTimeout(() => {
          setAutoLoadingStep("Optimizing ATS compatibility...");
          analyzeAuto(formattedText, data.title || "Selected CV");
        }, 1500);

      } catch (err) {
        console.error("Auto-scan failed:", err);
        setError(err.message);
        setIsAutoLoading(false);
      }
    };

    runAutoScan();
  }, [location.state, user]);

  const analyzeAuto = async (text, fileName) => {
    setAnalyzing(true);
    setIsAutoLoading(true);
    setError("");

    try {
      const data = await analyzeWithGemini(text, jobDesc);
      setResult(data);
      
      // Persist ATS history
      const savedHistory = JSON.parse(localStorage.getItem("procv_ats_history") || "[]");
      const newEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        atsScore: data.atsScore,
        resumeMatch: data.resumeMatch,
        keywordMatch: data.keywordMatch,
        fileName: fileName
      };
      localStorage.setItem("procv_ats_history", JSON.stringify([newEntry, ...savedHistory].slice(0, 50)));

      if (data.parsedCv) {
        // Map parsed CV to builder format (optional, keeping current behavior)
        const mappedCv = {
          ...EMPTY_CV,
          fullName: data.parsedCv.fullName || "Your Name",
          jobTitle: data.parsedCv.jobTitle || "Professional Title",
          summary: data.parsedCv.summary || "",
          contact: { ...EMPTY_CV.contact, ...data.parsedCv.contact },
          education: data.parsedCv.education || [],
          skills: data.parsedCv.skills || [],
          experience: data.parsedCv.experience || [],
          projects: data.parsedCv.projects || [],
        };
        setCvData(mappedCv);
      }
    } catch (e) {
      setError(e.message || "Auto-analysis failed.");
    } finally {
      setAnalyzing(false);
      setIsAutoLoading(false);
    }
  };

  const analyze = async () => {
    if (!file || !cvText) { setError("Please upload a valid CV file first."); return; }
    if (analyzing || cooldown || processingRef.current) return; 

    processingRef.current = true;
    setAnalyzing(true); 
    setError(""); 
    setResult(null);
    
    abortControllerRef.current = new AbortController();

    try {
      const data = await analyzeWithGemini(cvText, jobDesc);
      
      if (processingRef.current) {
        setResult(data);
        
        // Persist ATS history for Analytics
        try {
          const savedHistory = JSON.parse(localStorage.getItem("procv_ats_history") || "[]");
          const newEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            atsScore: data.atsScore,
            resumeMatch: data.resumeMatch,
            keywordMatch: data.keywordMatch,
            fileName: file?.name || "Uploaded CV"
          };
          localStorage.setItem("procv_ats_history", JSON.stringify([newEntry, ...savedHistory].slice(0, 50)));
        } catch (err) {
          console.error("Failed to save ATS history", err);
        }

        if (data.parsedCv) {
          // Map parsed CV to builder format
          const mappedCv = {
            ...EMPTY_CV,
            fullName: data.parsedCv.fullName || "Your Name",
            jobTitle: data.parsedCv.jobTitle || "Professional Title",
            summary: data.parsedCv.summary || "",
            contact: { ...EMPTY_CV.contact, ...data.parsedCv.contact },
            education: data.parsedCv.education || [],
            skills: data.parsedCv.skills || [],
            experience: data.parsedCv.experience || [],
            projects: data.parsedCv.projects || [],
            certifications: data.parsedCv.certifications || [],
            achievements: data.parsedCv.achievements || [],
          };
          setCvData(mappedCv);
        }
        setCooldown(true);
        setTimeout(() => setCooldown(false), 3000);
      }
    } catch (e) {
      if (e.name === 'AbortError') return;
      console.error("Analysis process error:", e);
      setError(e.message || "Analysis failed. Please try again.");
      setCooldown(true);
      setTimeout(() => setCooldown(false), 2000);
    } finally {
      processingRef.current = false;
      setAnalyzing(false);
      abortControllerRef.current = null;
    }
  };

  const applyImprovement = (section, improvedContent) => {
    if (!improvedContent) return;

    // Save current state for undo
    setHistory(prev => [...prev, { section, data: { ...cvData } }]);
    
    const newCvData = { ...cvData };
    let sectionNameForToast = section;

    if (section === "summary") {
      newCvData.summary = improvedContent;
      sectionNameForToast = "Professional Summary";
    } else if (section === "skills") {
      // Intelligent merge: split by comma or newline, trim, remove empty, and filter duplicates
      const newSkills = improvedContent
        .split(/[,\n]/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      const existingSkills = Array.isArray(newCvData.skills) ? newCvData.skills : [];
      const mergedSkills = [...new Set([...existingSkills, ...newSkills])];
      newCvData.skills = mergedSkills;
      sectionNameForToast = "Skills";
    } else if (section === "experience") {
      // Update first experience item description or handle carefully
      if (newCvData.experience && newCvData.experience.length > 0) {
        newCvData.experience = [
          { ...newCvData.experience[0], description: improvedContent },
          ...newCvData.experience.slice(1)
        ];
      } else {
        newCvData.experience = [{ role: "Role", company: "Company", start: "", end: "", description: improvedContent }];
      }
      sectionNameForToast = "Work Experience";
    } else if (section === "projects") {
      if (newCvData.projects && newCvData.projects.length > 0) {
        newCvData.projects = [
          { ...newCvData.projects[0], description: improvedContent },
          ...newCvData.projects.slice(1)
        ];
      } else {
        newCvData.projects = [{ title: "Project", description: improvedContent }];
      }
      sectionNameForToast = "Projects";
    }

    setCvData(newCvData);
    setLastUpdatedSection(sectionNameForToast);
    setSuccessMessage(`CV updated successfully: ${sectionNameForToast} section.`);
    setShowUndoToast(true);
    
    // Clear highlight after 2 seconds
    setTimeout(() => setLastUpdatedSection(""), 2000);
    // Hide toast after 6 seconds
    setTimeout(() => setShowUndoToast(false), 6000);
  };

  const undoLastAction = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setCvData(lastState.data);
    setHistory(prev => prev.slice(0, -1));
    setShowUndoToast(false);
    setSuccessMessage("Undo successful.");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const reset = () => { 
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setFile(null); setResult(null); setError(""); setJobDesc(""); setCvText("");
    setValidationError(""); setValidationWarning(""); setIsInvalidFile(false);
    setCvData(EMPTY_CV); setHistory([]); setShowUndoToast(false);
  };

  const handleAutoImprove = async (section) => {
    if (!cvText || optimizationLoading) return;
    setOptimizationLoading(true);
    setOptimizationError("");
    setAiImprovementResult(null);
    try {
      const res = await improveSection(cvText, result?.missingKeywords || [], section);
      setAiImprovementResult({ section, content: res });
    } catch (err) {
      setOptimizationError(err.message);
    } finally {
      setOptimizationLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const verdictColor = (score) => score >= 80 ? "text-emerald-400" : score >= 60 ? "text-yellow-400" : "text-red-400";
  const ringColor   = (score) => score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";

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
                <button onClick={() => navigate('/ai-writer')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
                  <PenTool className="w-4 h-4" /> AI Writer
                </button>
                <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-medium shadow-lg shadow-indigo-500/20 transition-colors">
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
      <main className="flex-1 overflow-y-auto bg-[#070B14] p-8 custom-scrollbar relative">
        {/* HEADER */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="mb-1 text-3xl font-bold">ATS Analyzer</h1>
            <p className="text-sm text-gray-400">Analyze your CV for ATS compatibility and get actionable AI-powered insights.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/builder")} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] transition hover:bg-indigo-700">
              <PlusSquare className="h-4 w-4" /> Create New CV
            </button>
            <NotificationDropdown />
            <ProfileDropdown />
          </div>
        </div>

        {/* ── SCORE CARDS (show when result available) ── */}
        {result && (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
            {[
              { label: "ATS Score",      score: result.atsScore,        color: "#6366f1", icon: <Target className="w-4 h-4 text-indigo-400" />, bg: "bg-indigo-500/10" },
              { label: "Resume Match",   score: result.resumeMatch,     color: "#3b82f6", icon: <FileText className="w-4 h-4 text-blue-400" />,   bg: "bg-blue-500/10" },
              { label: "Keyword Match",  score: result.keywordMatch,    color: "#10b981", icon: <FileDigit className="w-4 h-4 text-emerald-400" />, bg: "bg-emerald-500/10" },
              { label: "Formatting",     score: result.formattingScore, color: "#10b981", icon: <LayoutTemplate className="w-4 h-4 text-emerald-400" />, bg: "bg-emerald-500/10" },
              { label: "Readability",    score: result.readabilityScore,color: "#6366f1", icon: <Eye className="w-4 h-4 text-indigo-400" />,    bg: "bg-indigo-500/10" },
            ].map(c => (
              <div key={c.label} className="rounded-2xl border border-white/5 bg-[#111622] p-4 flex flex-col items-center justify-center relative shadow-lg">
                <div className={`absolute top-3 left-3 p-1.5 rounded-lg ${c.bg}`}>{c.icon}</div>
                <div className="text-[11px] text-gray-400 font-medium mb-3 mt-1">{c.label}</div>
                <div className="relative flex items-center justify-center mb-3">
                  <ScoreRing score={c.score} color={c.color} size={80} strokeW={6} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">{c.score}%</span>
                  </div>
                </div>
                <div className={`text-[11px] font-semibold ${verdictColor(c.score)}`}>
                  {c.score >= 80 ? "Excellent" : c.score >= 60 ? "Good" : "Needs Work"}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── MAIN GRID ── */}
        <div className={`gap-6 mb-6 ${result ? "grid grid-cols-1 lg:grid-cols-[1fr_1.5fr_1.1fr]" : "flex justify-center"}`}>

          {/* COLUMN 1 — Upload + Keyword analysis */}
          <div className="flex flex-col gap-6">
            {/* Upload */}
            <div className="rounded-2xl border border-white/5 bg-[#111622] p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-semibold text-white">Upload Your CV</h3>
                {(file || result) && (
                  <button onClick={reset} className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition">
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                )}
              </div>

               {/* Drop zone */}
              {isAutoLoading ? (
                 <div className="border-2 border-indigo-500/30 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center mb-4 bg-indigo-500/5 min-h-[160px]">
                    <div className="relative mb-6">
                       <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                       <Sparkles className="w-6 h-6 text-indigo-300 absolute -top-1 -right-1 animate-pulse" />
                    </div>
                    <h4 className="text-sm font-bold text-white mb-2">{autoLoadingStep}</h4>
                    <p className="text-[11px] text-gray-500 animate-pulse">Running AI-powered ATS diagnostic...</p>
                 </div>
              ) : (
                <div
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => !file && !isValidating && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 py-8 flex flex-col items-center justify-center text-center mb-4 transition-colors cursor-pointer ${
                    isValidating ? "border-indigo-500/20 bg-indigo-500/5 animate-pulse" :
                    file ? "border-emerald-500/40 bg-emerald-500/5" : 
                    isInvalidFile ? "border-red-500/40 bg-red-500/5" :
                    "border-indigo-500/30 bg-indigo-500/5 hover:border-indigo-500/50"
                  }`}
                >
                  <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={e => handleFile(e.target.files[0])} />
                  {isValidating ? (
                    <>
                      <Loader2 className="w-10 h-10 text-indigo-400 mb-3 animate-spin" />
                      <p className="text-[13px] text-gray-300 mb-1">Validating CV...</p>
                    </>
                  ) : file ? (
                    <>
                      {file.isAuto ? <FileDigit className="w-10 h-10 text-indigo-400 mb-2" /> : <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />}
                      <p className={`text-[13px] font-semibold mb-1 truncate max-w-[180px] ${file.isAuto ? 'text-indigo-300' : 'text-emerald-300'}`}>{file.name}</p>
                      <p className="text-[11px] text-gray-500">{file.isAuto ? 'AI Selected Profile' : (file.size / 1024).toFixed(0) + ' KB'}</p>
                    </>
                  ) : isInvalidFile ? (
                    <>
                      <XCircle className="w-10 h-10 text-red-400 mb-3" />
                      <p className="text-[13px] text-red-300 mb-1">Invalid CV Format</p>
                      <button className="mt-2 bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg transition">Try Another</button>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-10 h-10 text-indigo-400 mb-3" />
                      <p className="text-[13px] text-gray-300 mb-1">Drag & drop your CV here</p>
                      <p className="text-[11px] text-gray-500 mb-3">or</p>
                      <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition">Choose File</button>
                    </>
                  )}
                </div>
              )}

              <div className="text-[10px] text-gray-500 mb-3 text-center">Supported: PDF, DOCX · Max 10MB</div>

              {/* Optional job description */}
              <textarea
                value={jobDesc}
                onChange={e => setJobDesc(e.target.value)}
                placeholder="Paste job description here (optional — improves keyword matching)"
                rows={3}
                className="w-full bg-[#0A0D14] border border-white/5 rounded-xl p-3 text-xs text-gray-300 placeholder:text-gray-600 outline-none resize-none mb-4 focus:border-indigo-500/40"
              />

              {validationError && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-xs text-red-400">
                  <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {validationError}
                </div>
              )}

              {validationWarning && !error && (
                <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4 text-xs text-amber-400">
                  <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" /> {validationWarning}
                </div>
              )}

              {error && (
                <div className="flex flex-col gap-1 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-xs text-red-400">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
                  </div>
                  {error.includes("Daily AI limit reached") && (
                    <p className="text-[10px] text-red-400/60 ml-6 italic">The free AI limit resets automatically.</p>
                  )}
                </div>
              )}

              <button
                onClick={analyze}
                disabled={analyzing || cooldown || !file || isValidating}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 py-3 rounded-xl text-sm font-semibold text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {analyzing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</>
                ) : cooldown ? (
                  <><RotateCcw className="w-4 h-4 animate-spin" /> Waiting...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Analyze CV</>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] text-emerald-400/80">
                <ShieldCheck className="w-3.5 h-3.5" /> Your data is processed securely
              </div>
            </div>

            {/* Keyword chart — only when result */}
            {result && (() => {
              const matched = result.matchedKeywords?.length || 0;
              const missing = result.missingKeywords?.length || 0;
              const partial = result.partialKeywords?.length || 0;
              const total   = matched + missing + partial || 1;
              const circ = 2 * Math.PI * 40;
              const matchedD = circ * (matched / total);
              const partialD = circ * (partial / total);
              return (
                <div className="rounded-2xl border border-white/5 bg-[#111622] p-5">
                  <h3 className="text-[15px] font-semibold text-white mb-5">Keyword Analysis</h3>
                  <div className="flex items-center gap-6">
                    <div className="relative flex h-24 w-24 items-center justify-center flex-shrink-0">
                      <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="12" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="12" strokeDasharray={`${partialD} ${circ - partialD}`} strokeDashoffset={-(matchedD)} />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray={`${matchedD} ${circ - matchedD}`} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-white leading-tight">{result.keywordMatch}%</span>
                        <span className="text-[9px] text-gray-400">Matched</span>
                      </div>
                    </div>
                    <div className="space-y-3 w-full">
                      {[
                        { label: "Matched", color: "bg-emerald-500", count: matched, pct: Math.round(matched/total*100) },
                        { label: "Missing",  color: "bg-red-500",     count: missing, pct: Math.round(missing/total*100) },
                        { label: "Partial",  color: "bg-yellow-500",  count: partial, pct: Math.round(partial/total*100) },
                      ].map(r => (
                        <div key={r.label} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2"><div className={`w-2.5 h-2.5 rounded-sm ${r.color}`} /><span className="text-gray-300">{r.label} Keywords</span></div>
                          <div className="flex gap-2"><span className="text-gray-400">{r.pct}%</span><span className="text-gray-500">({r.count})</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* COLUMN 2 — Score overview + Section analysis + Strengths */}
          {result && (
            <div className="flex flex-col gap-6">
              {/* Score Overview */}
              <div className="rounded-2xl border border-white/5 bg-[#111622] p-6 shadow-lg flex flex-col">
                <h3 className="text-[15px] font-semibold text-white mb-6">Score Overview</h3>
                <div className="flex items-center gap-8 mb-6">
                  <div className="relative flex h-40 w-40 items-center justify-center flex-shrink-0 ml-2">
                    <ScoreRing score={result.atsScore} color={ringColor(result.atsScore)} size={160} strokeW={8} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-white mb-1">{result.atsScore}%</span>
                      <span className="text-xs text-gray-400 font-medium">ATS Score</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-[15px] font-bold mb-2 ${verdictColor(result.atsScore)}`}>
                      {result.overallVerdict || (result.atsScore >= 80 ? "Great Job! 🎉" : result.atsScore >= 60 ? "Good Start 👍" : "Needs Improvement ⚠️")}
                    </h4>
                    <p className="text-[13px] text-gray-400 leading-relaxed mb-6">{result.summaryMessage}</p>
                    <div className="flex items-start justify-between border-t border-white/5 pt-5 pr-2">
                      <div><div className="text-[10px] text-gray-400 mb-1">Total Issues</div><div className="text-xl font-bold text-yellow-500 mb-0.5">{result.totalIssues}</div><div className="text-[9px] text-yellow-500/80">Needs Fix</div></div>
                      <div><div className="text-[10px] text-gray-400 mb-1">Strengths</div><div className="text-xl font-bold text-emerald-400 mb-0.5">{result.strengthsFound}</div><div className="text-[9px] text-emerald-400/80">Good Points</div></div>
                      <div><div className="text-[10px] text-gray-400 mb-1">Optimized</div><div className="text-xl font-bold text-indigo-400 mb-0.5">{result.optimizedSections}<span className="text-sm text-gray-500 font-medium">/{result.totalSections}</span></div><div className="text-[9px] text-indigo-400/80">Sections</div></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Section Analysis */}
                <div className="rounded-2xl border border-white/5 bg-[#111622] p-5 flex flex-col">
                  <h3 className="text-[15px] font-semibold text-white mb-6">Section Analysis</h3>
                  <div className="space-y-4 flex-1">
                    {Object.entries(result.sections || {}).map(([name, score]) => (
                      <div key={name} className="flex items-center gap-3 text-xs">
                        <span className="w-28 text-gray-300 capitalize truncate">{name}</span>
                        <div className="flex-1 h-1.5 bg-[#0A0D14] rounded-full overflow-hidden border border-white/5">
                          <div className={`h-full rounded-full ${score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${score}%` }} />
                        </div>
                        <span className="w-8 text-right text-gray-400 font-medium">{score}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strengths */}
                <div className="rounded-2xl border border-white/5 bg-[#111622] p-5 flex flex-col">
                  <h3 className="text-[15px] font-semibold text-white mb-5">Top Strengths</h3>
                  <ul className="space-y-3 flex-1">
                    {(result.strengths || []).slice(0, 6).map((s, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-xs text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />{s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* COLUMN 3 — Keywords + Suggestions + Tips */}
          {result && (
            <div className="flex flex-col gap-6">
              {/* Missing Keywords */}
              <div className="rounded-2xl border border-white/5 bg-[#111622] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[15px] font-semibold text-white">Missing Keywords</h3>
                  <span className="px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 text-[10px] font-bold">{result.missingKeywords?.length || 0}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(result.missingKeywords || []).map(kw => (
                    <span key={kw} className="px-2.5 py-1 rounded-lg bg-[#0A0D14] border border-white/5 text-[10px] text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-colors cursor-default">{kw}</span>
                  ))}
                </div>
                {(result.matchedKeywords || []).length > 0 && (
                  <>
                    <div className="text-[10px] text-emerald-400 font-semibold mb-2 mt-3">✓ Matched Keywords</div>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedKeywords.slice(0, 12).map(kw => (
                        <span key={kw} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300">{kw}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Suggestions */}
              <div className="rounded-2xl border border-white/5 bg-[#111622] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-[15px] font-semibold text-white">Top Suggestions</h3>
                </div>
                <div className="space-y-3 mb-4">
                  {(result.suggestions || []).slice(0, 4).map((s, i) => (
                    <div key={i} className="flex items-start justify-between gap-3 text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-start gap-2">
                        <Zap className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 leading-snug">{s.text}</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 whitespace-nowrap">{s.impact}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weaknesses */}
              {(result.weaknesses || []).length > 0 && (
                <div className="rounded-2xl border border-white/5 bg-[#111622] p-5 flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    <h3 className="text-[15px] font-semibold text-white">Areas to Improve</h3>
                  </div>
                  <ul className="space-y-3">
                    {result.weaknesses.slice(0, 5).map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                        <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />{w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── BOTTOM BANNER ── */}
        <div className="rounded-2xl border border-indigo-500/20 bg-[#111622] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_20px_rgba(79,70,229,0.1)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="h-12 w-12 rounded-xl bg-indigo-600/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-0.5">Want to improve your score?</h3>
              <p className="text-xs text-gray-400">Let AI optimize your CV and make it ATS-friendly.</p>
            </div>
          </div>
          <button 
            onClick={() => result && setIsOptimizeModalOpen(true)} 
            disabled={!result}
            className={`relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg ${
              result 
                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20" 
                : "bg-white/5 text-gray-500 cursor-not-allowed opacity-50"
            }`}
            title={!result ? "Analyze a CV first to unlock AI optimization" : ""}
          >
            <Sparkles className="w-4 h-4" /> Optimize with AI
          </button>
        </div>
      </main>

      {/* AI OPTIMIZATION MODAL */}
      {isOptimizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0A0D14] border border-white/10 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#111622]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Optimize with AI</h2>
                  <p className="text-xs text-gray-400">Enhance your CV using ATS analysis data</p>
                </div>
              </div>
              <button onClick={() => setIsOptimizeModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#070B14]">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-8">
                
                {/* Left: Improvement Tips */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Improvement Tips</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-[#111622] border border-white/5">
                      <div className="text-[10px] text-gray-500 font-bold uppercase mb-2">Critical Actions</div>
                      <div className="space-y-3">
                        {result?.missingKeywords?.length > 0 && (
                          <div className="flex items-start gap-2 text-xs">
                            <ArrowRight className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300">Incorporate missing keywords: <span className="text-indigo-400">{result.missingKeywords.slice(0, 3).join(", ")}</span></span>
                          </div>
                        )}
                        {Object.entries(result?.sections || {}).filter(([_, s]) => s < 70).map(([name, _]) => (
                          <div key={name} className="flex items-start gap-2 text-xs">
                            <ArrowRight className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300 capitalize">Improve your {name} section.</span>
                          </div>
                        ))}
                        <div className="flex items-start gap-2 text-xs">
                          <ArrowRight className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">Add more measurable achievements (numbers, %).</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#111622] border border-white/5">
                      <div className="text-[10px] text-gray-500 font-bold uppercase mb-2">Top Suggestions</div>
                      <div className="space-y-2">
                        {(result?.suggestions || []).slice(0, 3).map((s, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300">{s.text} <span className="text-emerald-400 font-bold ml-1">{s.impact}</span></span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#111622] border border-white/5">
                      <div className="text-[10px] text-gray-500 font-bold uppercase mb-2">Weak Sections</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(result?.sections || {}).map(([name, score]) => (
                          <div key={name} className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${score >= 80 ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5" : score >= 60 ? "border-yellow-500/20 text-yellow-400 bg-yellow-500/5" : "border-red-500/20 text-red-400 bg-red-500/5"}`}>
                            {name.toUpperCase()}: {score}%
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: AI Auto-Improve */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Auto-Improve</h3>
                  </div>

                  {!aiImprovementResult && !optimizationLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-white/5 border-dashed rounded-3xl bg-[#111622]/50">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8 text-indigo-500" />
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2">Generate AI Improvements</h4>
                      <p className="text-xs text-gray-400 mb-6 max-w-xs">Select a section to have AI rewrite it professionally while including missing keywords.</p>
                      
                      <div className="grid grid-cols-2 gap-3 w-full">
                        {["summary", "experience", "skills", "projects"].map(section => (
                          <button
                            key={section}
                            onClick={() => handleAutoImprove(section)}
                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/5 text-xs font-semibold text-gray-300 transition-all capitalize"
                          >
                            Improve {section}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : optimizationLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-white/5 rounded-3xl bg-[#111622]">
                      <div className="relative mb-6">
                        <div className="w-16 h-16 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                        <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-indigo-500 animate-pulse" />
                      </div>
                      <h4 className="text-lg font-bold text-white mb-1">Optimizing Content...</h4>
                      <p className="text-xs text-gray-400">Rewriting your section using AI</p>
                      <div className="mt-6 w-full max-w-xs h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 animate-shimmer" style={{ width: '100%', background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.4), transparent)', backgroundSize: '200% 100%' }} />
                      </div>
                    </div>
                  ) : optimizationError ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-red-500/20 rounded-3xl bg-red-500/5">
                      <XCircle className="w-12 h-12 text-red-500 mb-4" />
                      <h4 className="text-lg font-bold text-white mb-2">Optimization Failed</h4>
                      <p className="text-xs text-red-400 mb-6">{optimizationError}</p>
                      <button onClick={() => setAiImprovementResult(null)} className="px-6 py-2 rounded-xl bg-white/5 text-xs font-bold text-white hover:bg-white/10 transition-colors">Try Again</button>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest px-2 py-1 rounded bg-indigo-400/10 border border-indigo-400/20">
                          Improved {aiImprovementResult.section}
                        </span>
                        <button onClick={() => setAiImprovementResult(null)} className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors">
                          ← Back to options
                        </button>
                      </div>
                      <div className="flex-1 p-5 rounded-2xl bg-[#0A0D14] border border-white/5 text-xs text-gray-300 leading-relaxed overflow-y-auto max-h-[300px] whitespace-pre-wrap custom-scrollbar">
                        {aiImprovementResult.content}
                      </div>
                      <div className="mt-4 flex flex-col gap-3">
                        <div className="flex gap-3">
                          <button 
                            onClick={() => applyImprovement(aiImprovementResult.section, aiImprovementResult.content)}
                            className="flex-[2] flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                          >
                            <Sparkles className="w-4 h-4" /> Apply to CV
                          </button>
                          <button 
                            onClick={() => copyToClipboard(aiImprovementResult.content)}
                            className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl text-xs font-bold transition-all border border-white/10"
                          >
                            <Copy className="w-4 h-4" /> Copy
                          </button>
                          <button 
                            onClick={() => handleAutoImprove(aiImprovementResult.section)}
                            className="px-4 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10"
                            title="Regenerate"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {showUndoToast && (
                          <div className="flex items-center justify-between px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl animate-in slide-in-from-bottom-2">
                            <span className="text-[10px] text-indigo-300 font-medium">{successMessage}</span>
                            <button onClick={undoLastAction} className="text-[10px] font-bold text-white bg-indigo-600 px-2 py-1 rounded-lg hover:bg-indigo-700 transition-colors">Undo</button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* LIVE PREVIEW SECTION IN MODAL */}
              {cvData.fullName && (
                <div className="mt-8 pt-8 border-t border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Preview Sync</h3>
                    </div>
                    <div className="text-[10px] text-gray-500 font-medium bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                      Updates instantly as you apply improvements
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-white/10 bg-white overflow-hidden shadow-2xl origin-top scale-[0.6] -mb-[30%] mx-auto w-[794px] transition-all duration-500">
                    <div className={`p-0 transition-all duration-700 ${lastUpdatedSection ? 'ring-8 ring-emerald-500/30' : ''}`}>
                      <Template1 cv={{...cvData, theme: cvData.themeManual}} />
                    </div>
                  </div>
                  {lastUpdatedSection && (
                    <div className="text-center mt-4 text-emerald-400 text-xs font-bold animate-pulse">
                      Section "{lastUpdatedSection}" updated!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/5 bg-[#111622] flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] text-gray-500 italic">
                <ShieldCheck className="w-3.5 h-3.5" />
                Existing data only. No PDF re-upload.
              </div>
              <button onClick={() => setIsOptimizeModalOpen(false)} className="px-6 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
}

