import React from "react";
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
  Target,
  Briefcase,
  Star,
  Send,
  Bookmark,
  Search,
  MapPin,
  Clock,
  UploadCloud,
  CheckCircle2,
  Building2,
  Code2,
  Lightbulb,
  ArrowRight,
  Zap,
  RefreshCw,
  XCircle,
  RotateCcw,
  X
} from "lucide-react";
import { extractCvText, validateCvForAts } from "../lib/atsAnalysis";
import { getFriendlyAiError } from "../lib/ai";
import { analyzeJobMatch } from "../lib/jobMatch";
import jobsData from "../data/jobs.json";
import ProfileDropdown from "../components/ProfileDropdown";
import NotificationDropdown from "../components/NotificationDropdown";

export default function JobMatch() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = React.useRef(null);

  const userFullName = user?.displayName || "Prageeth Gihan";
  const userEmail = user?.email || "prageethgihan55@gmail.com";

  // Form State
  const [file, setFile] = React.useState(null);
  const [cvText, setCvText] = React.useState("");
  const [targetJob, setTargetJob] = React.useState("");
  const [location, setLocation] = React.useState("Any Location");
  const [expLevel, setExpLevel] = React.useState("Any Experience");

  // Analysis State
  const [analyzing, setAnalyzing] = React.useState(false);
  const [error, setError] = React.useState("");
  const [result, setResult] = React.useState(null);
  const [jobMatches, setJobMatches] = React.useState([]);
  const [showLongRequest, setShowLongRequest] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState("Searching matching jobs...");
  
  // Saved Jobs State
  const [savedJobIds, setSavedJobIds] = React.useState(() => {
    const saved = localStorage.getItem("procv_saved_jobs");
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    localStorage.setItem("procv_saved_jobs", JSON.stringify(savedJobIds));
  }, [savedJobIds]);

  // Loading Message Rotation
  React.useEffect(() => {
    if (!analyzing) return;
    const messages = [
      "Searching matching jobs...",
      "Analyzing your CV...",
      "This may take up to a minute...",
      "Extracting skills...",
      "Matching skills...",
      "Calculating compatibility...",
      "Finding opportunities...",
      "Generating recommendations..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      setLoadingMessage(prev => {
        if (prev.includes("Retrying")) return prev;
        i = (i + 1) % messages.length;
        return messages[i];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [analyzing]);

  const toggleSaveJob = (jobId) => {
    setSavedJobIds(prev => 
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  const handleFileUpload = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    
    setError("");
    setResult(null);
    setJobMatches([]);
    
    try {
      const validation = await validateCvForAts(f);
      if (!validation.isValid) {
        setError(validation.error || "Invalid CV format.");
        return;
      }
      setFile(f);
      setCvText(validation.text);
    } catch (err) {
      setError("Failed to process file.");
    }
  };


  /**
   * Skeleton components for loading states
   */
  const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-white/5 rounded-lg ${className}`}></div>
  );

  const MatchCardSkeleton = () => (
    <div className="p-4 rounded-xl border border-white/5 bg-[#0A0D14] flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <Skeleton className="w-10 h-10" />
          <div className="flex flex-col gap-2">
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-24 h-3" />
          </div>
        </div>
        <Skeleton className="w-12 h-12 rounded-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="w-16 h-4 rounded-full" />
        <Skeleton className="w-16 h-4 rounded-full" />
      </div>
    </div>
  );

  const findMatches = async () => {
    if (!cvText || analyzing) return;

    setAnalyzing(true);
    setError("");
    setShowLongRequest(false);
    
    // Long request timer - triggered at 25s
    const longRequestTimer = setTimeout(() => {
      setShowLongRequest(true);
    }, 25000);

    try {
      const data = await analyzeJobMatch(
        cvText, 
        targetJob, 
        location, 
        expLevel,
        (retryCount) => {
          setLoadingMessage(`AI servers are busy. Retrying analysis (Attempt ${retryCount}/3)...`);
        }
      );
      
      setResult(data);
      setJobMatches(data.matchedJobs || []);
    } catch (err) {
      console.error("Job Match Error:", err);
      setError(err.message || "Analysis failed temporarily. Please try again.");
    } finally {
      setAnalyzing(false);
      clearTimeout(longRequestTimer);
    }
  };

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
                <button onClick={() => navigate('/ats-analyzer')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
                  <FileCheck className="w-4 h-4" /> ATS Analyzer
                </button>
                <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-medium shadow-lg shadow-indigo-500/20 transition-colors">
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
            <h1 className="mb-1 text-3xl font-bold">Job Match</h1>
            <p className="text-sm text-gray-400">
              Find the best job matches for your skills and experience.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/builder")}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] transition hover:bg-indigo-700"
            >
              <PlusSquare className="h-4 w-4" />
              Create New CV
            </button>

            <NotificationDropdown />
            <ProfileDropdown />
          </div>
        </div>

        {/* TOP SCORE CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {/* Card 1: Overall Match Score */}
          <div className="rounded-2xl border border-white/5 bg-[#111622] p-4 flex flex-col items-center justify-center relative shadow-lg">
            <div className="absolute top-3 left-3 p-1.5 rounded-lg bg-indigo-500/10"><Target className="w-4 h-4 text-indigo-400" /></div>
            <div className="text-[11px] text-gray-400 font-medium mb-3 mt-1">Overall Match Score</div>
            <div className="relative flex h-20 w-20 items-center justify-center mb-3">
              <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#6366f1" strokeWidth="6" strokeDasharray="264" strokeDashoffset={264 - (264 * (result?.overallMatchScore || 0) / 100)} strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(99,102,241,0.6)] transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-white">{result?.overallMatchScore || 0}%</span>
              </div>
            </div>
            <div className={`text-[11px] font-semibold ${result?.overallMatchScore >= 80 ? "text-emerald-400" : result?.overallMatchScore >= 50 ? "text-yellow-400" : "text-gray-500"}`}>
              {result?.overallMatchScore >= 80 ? "Excellent Match" : result?.overallMatchScore >= 50 ? "Good Match" : result ? "Needs Improvement" : "Waiting for Analysis"}
            </div>
          </div>

          {/* Card 2: Jobs Matched */}
          <div className="rounded-2xl border border-white/5 bg-[#111622] p-5 flex flex-col justify-center relative shadow-lg">
            <div className="absolute top-4 left-4 p-2 rounded-lg bg-blue-500/10"><Briefcase className="w-4 h-4 text-blue-400" /></div>
            <div className="text-[11px] text-gray-400 font-medium mb-1 mt-8">Jobs Matched</div>
            <div className="text-3xl font-bold text-white mb-1">{jobMatches.length}</div>
            <div className="text-[11px] text-gray-500">Available Results</div>
          </div>

          {/* Card 3: Top Matched Job */}
          <div className="rounded-2xl border border-white/5 bg-[#111622] p-5 flex flex-col justify-center relative shadow-lg">
            <div className="absolute top-4 left-4 p-2 rounded-lg bg-purple-500/10"><Star className="w-4 h-4 text-purple-400" /></div>
            <div className="text-[11px] text-gray-400 font-medium mb-1 mt-8">Top Matched Job</div>
            <div className="text-lg font-bold text-white truncate mb-1">{result?.topMatchedJob?.title || "None"}</div>
            <div className="text-[11px] font-semibold text-emerald-400">{result?.topMatchedJob?.matchScore || 0}% Match</div>
          </div>

          {/* Card 4: Shortlisted */}
          <div className="rounded-2xl border border-white/5 bg-[#111622] p-5 flex flex-col justify-center relative shadow-lg">
            <div className="absolute top-4 left-4 p-2 rounded-lg bg-emerald-500/10"><Bookmark className="w-4 h-4 text-emerald-400" /></div>
            <div className="text-[11px] text-gray-400 font-medium mb-1 mt-8">Shortlisted</div>
            <div className="text-3xl font-bold text-white mb-1">{savedJobIds.length}</div>
            <div className="text-[11px] text-gray-500">Saved Jobs</div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr_1.1fr] gap-6 mb-6">
          
          {/* COLUMN 1 */}
          <div className="flex flex-col gap-6">
            {/* Your CV & Target Job combined form-like card */}
            <div className="rounded-2xl border border-white/5 bg-[#111622] p-5 flex flex-col">
              <h3 className="text-[15px] font-semibold text-white mb-4">Your CV</h3>
              
              {/* Selected File */}
              {file ? (
                <div className="flex items-center justify-between bg-[#0A0D14] border border-emerald-500/20 p-3 rounded-xl mb-4">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400 flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-semibold text-gray-200 truncate">{file.name}</div>
                      <div className="text-[10px] text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</div>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                </div>
              ) : (
                <div className="border border-dashed border-white/10 bg-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center mb-6 hover:border-indigo-500/30 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <UploadCloud className="w-6 h-6 text-gray-400 mb-2" />
                  <p className="text-[11px] text-gray-300 mb-1">Upload your CV to start</p>
                  <p className="text-[9px] text-gray-500 mb-3">PDF, DOCX (Max 10MB)</p>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-medium px-4 py-1.5 rounded-lg transition">Upload CV</button>
                </div>
              )}

              {file && (
                <button onClick={() => fileInputRef.current?.click()} className="text-[10px] text-gray-500 hover:text-indigo-400 mb-4 transition text-center underline">
                  Upload a different CV
                </button>
              )}
              
              <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileUpload} />
              
              <h3 className="text-[13px] font-semibold text-gray-300 mb-3">Target Job <span className="text-gray-500 font-normal">(Optional)</span></h3>
              
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-500" />
                  </div>
                  <input 
                    type="text" 
                    value={targetJob}
                    onChange={(e) => setTargetJob(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-xl leading-5 bg-[#0A0D14] text-gray-300 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs" 
                    placeholder="e.g. Frontend Developer, UI/UX Designer" 
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1">Location</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-4 w-4 text-gray-500" />
                    </div>
                    <select 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-xl leading-5 bg-[#0A0D14] text-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs appearance-none"
                    >
                      <option>Any Location</option>
                      <option>Remote</option>
                      <option>Colombo, Sri Lanka</option>
                      <option>Worldwide</option>
                      <option>Hybrid</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDown className="h-3 w-3 text-gray-500" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1">Experience Level</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-4 w-4 text-gray-500" />
                    </div>
                    <select 
                      value={expLevel}
                      onChange={(e) => setExpLevel(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-xl leading-5 bg-[#0A0D14] text-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs appearance-none"
                    >
                      <option>Any Experience</option>
                      <option>Entry Level</option>
                      <option>Junior</option>
                      <option>Mid-Level</option>
                      <option>Senior</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDown className="h-3 w-3 text-gray-500" />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-[11px] text-red-400">
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
              
              <button 
                onClick={findMatches}
                disabled={analyzing || !file}
                className={`w-full mt-auto flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-500 shadow-lg relative overflow-hidden ${
                  analyzing 
                    ? "bg-indigo-600 cursor-wait" 
                    : file 
                      ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/40 scale-[1.02] ring-2 ring-indigo-500/50" 
                      : "bg-indigo-600/50 cursor-not-allowed grayscale opacity-50"
                }`}
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="animate-pulse">{loadingMessage}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className={`w-4 h-4 ${file ? "animate-pulse text-yellow-300" : ""}`} />
                    <span>{file ? "Find Job Matches Now" : "Find Job Matches"}</span>
                  </>
                )}
                {file && !analyzing && (
                  <div className="absolute inset-0 bg-white/5 animate-pulse pointer-events-none"></div>
                )}
              </button>

              {analyzing && showLongRequest && (
                <div className="mt-3 text-center animate-fade-in">
                  <p className="text-[10px] text-gray-400 font-medium">Analyzing complex data...</p>
                  <p className="text-[9px] text-gray-500">This takes a bit longer for large CVs. Please stay with us.</p>
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 2 */}
          <div className="flex flex-col gap-6">
            {/* Top Job Matches List */}
            <div className="rounded-2xl border border-white/5 bg-[#111622] p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[15px] font-semibold text-white">Top Job Matches</h3>
                <button className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition">
                  View All Jobs <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="flex-1 space-y-4 min-h-[400px]">
                {analyzing ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-fade-in py-20">
                    <div className="relative mb-8">
                      {/* Background Glow */}
                      <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full animate-pulse"></div>
                      
                      {/* Animated Search Icon */}
                      <div className="relative bg-[#0A0D14] border border-white/10 p-8 rounded-3xl shadow-2xl overflow-hidden group">
                        <Search className="w-16 h-16 text-indigo-400 animate-bounce transition-transform" />
                        
                        {/* Scanning Line */}
                        <div className="absolute left-0 right-0 h-1 bg-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-scan top-0"></div>
                        
                        {/* Sparkles around icon */}
                        <Sparkles className="absolute top-2 right-2 w-5 h-5 text-indigo-300 animate-pulse" />
                        <Sparkles className="absolute bottom-4 left-4 w-4 h-4 text-indigo-500 animate-pulse delay-700" />
                      </div>
                    </div>
                    
                    <h4 className="text-xl font-bold text-white mb-3 transition-all duration-500 min-h-[28px]">
                      {loadingMessage}
                    </h4>
                    
                    <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
                      Our AI is scanning thousands of jobs to find your perfect professional match.
                    </p>
                    
                    {/* Fake progress bar dots */}
                    <div className="flex gap-2 mt-8">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-150"></div>
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-300"></div>
                    </div>
                  </div>
                ) : jobMatches.length > 0 ? jobMatches.map((job) => (
                  <div key={job.id} className="p-4 rounded-xl border border-white/5 bg-[#0A0D14] flex flex-col relative group hover:border-indigo-500/30 transition-colors animate-fade-in">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                          <Code2 className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-sm font-bold text-white mb-0.5 truncate">{job.title}</h4>
                          <div className="text-[11px] text-gray-400 flex items-center gap-2 flex-wrap">
                            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {job.company}</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 border border-white/10 text-gray-300">{job.location}</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 border border-white/10 text-gray-300">{job.type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="relative flex h-12 w-12 items-center justify-center mb-1">
                          <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                            <circle cx="50" cy="50" r="44" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="276" strokeDashoffset={276 - (276 * job.matchScore / 100)} strokeLinecap="round" />
                          </svg>
                          <span className="absolute text-[11px] font-bold text-white">{job.matchScore}%</span>
                        </div>
                        <span className="text-[9px] font-bold text-emerald-400">Match</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-400 flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-gray-500">Key Match:</span>
                      {job.keyMatches?.slice(0, 4).map((skill, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 text-[10px]">{skill}</span>
                      ))}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      <span className="text-gray-500">Experience Relevance:</span> <span className="text-emerald-400">{job.experienceRelevance}</span>
                    </div>
                    <button 
                      onClick={() => toggleSaveJob(job.id)}
                      className={`absolute top-4 right-16 p-1.5 transition ${savedJobIds.includes(job.id) ? "text-emerald-400 opacity-100" : "text-gray-500 hover:text-white opacity-0 group-hover:opacity-100"}`}
                    >
                      <Bookmark className={`w-4 h-4 ${savedJobIds.includes(job.id) ? "fill-current" : ""}`} />
                    </button>
                  </div>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50 p-8">
                    <Search className="w-12 h-12 mb-4 text-gray-600" />
                    <p className="text-sm font-medium text-gray-400">No matches yet</p>
                    <p className="text-xs text-gray-500">Upload your CV and click "Find Job Matches"</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COLUMN 3 */}
          <div className="flex flex-col gap-6">
            {/* Match Insights */}
             <div className="rounded-2xl border border-white/5 bg-[#111622] p-5">
              <h3 className="text-[15px] font-semibold text-white mb-6">Match Insights</h3>
              
              {analyzing ? (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center">
                    <Skeleton className="w-32 h-16 rounded-t-full mb-2" />
                    <Skeleton className="w-16 h-3" />
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="w-full h-2" />
                    <Skeleton className="w-full h-2" />
                    <Skeleton className="w-full h-2" />
                    <Skeleton className="w-full h-2" />
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <div className="flex flex-col items-center mb-6">
                    {/* Half Gauge Arc */}
                    <div className="relative w-40 h-20 overflow-hidden mb-2">
                      <svg className="w-full h-full" viewBox="0 0 100 50">
                        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" strokeLinecap="round" />
                        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#gradient)" strokeWidth="12" strokeDasharray="125.6" strokeDashoffset={125.6 - (125.6 * (result?.overallMatchScore || 0) / 100)} strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000" />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#10b981" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
                        <span className="text-3xl font-bold text-white leading-none">{result?.overallMatchScore || 0}%</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium">Overall Match Score</div>
                  </div>

                  <p className="text-[11px] text-gray-300 text-center leading-relaxed mb-6 px-2 animate-fade-in">
                    {result ? (result.overallMatchScore >= 70 ? "Great! Your profile matches highly with many relevant job opportunities." : "You have some potential matches. Consider improving your skills for better results.") : "Analyze your CV to see how well you match with available job opportunities."}
                  </p>

                  <div className="space-y-4">
                    {[
                      { name: "Skills Match", score: result?.skillsMatch || 0 },
                      { name: "Experience Match", score: result?.experienceMatch || 0 },
                      { name: "Education Match", score: result?.educationMatch || 0 },
                      { name: "Keyword Match", score: result?.keywordMatch || 0 },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center gap-3 text-[11px] animate-fade-in">
                        <div className="w-5 h-5 rounded bg-[#0A0D14] border border-white/5 flex items-center justify-center flex-shrink-0">
                          <Target className="w-3 h-3 text-indigo-400" />
                        </div>
                        <span className="w-24 text-gray-300 truncate">{item.name}</span>
                        <div className="flex-1 h-1.5 bg-[#0A0D14] rounded-full overflow-hidden border border-white/5">
                          <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${item.score}%` }}></div>
                        </div>
                        <span className="w-6 text-right text-gray-400 font-medium">{item.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Your Top Skills */}
            <div className="rounded-2xl border border-white/5 bg-[#111622] p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[15px] font-semibold text-white">Your Top Skills</h3>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Matched</span>
              </div>
              
              {analyzing ? (
                <div className="flex flex-wrap gap-2 mb-6">
                  <Skeleton className="w-16 h-6" />
                  <Skeleton className="w-20 h-6" />
                  <Skeleton className="w-14 h-6" />
                  <Skeleton className="w-18 h-6" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mb-6 animate-fade-in">
                  {result?.userSkills?.length > 0 ? result.userSkills.map(skill => (
                    <span key={skill} className="px-2.5 py-1 rounded-lg bg-[#0A0D14] border border-white/5 text-[10px] text-indigo-300 cursor-default">
                      {skill}
                    </span>
                  )) : <span className="text-[10px] text-gray-600">No skills identified yet</span>}
                </div>
              )}

              <h4 className="text-[13px] font-semibold text-white mb-1">Skills to Improve</h4>
              <p className="text-[10px] text-gray-500 mb-3">Add these skills to get better matches</p>
              
              {analyzing ? (
                <div className="flex flex-wrap gap-2 mb-6">
                  <Skeleton className="w-20 h-6" />
                  <Skeleton className="w-16 h-6" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mb-6 animate-fade-in">
                  {result?.missingSkills?.length > 0 ? result.missingSkills.map(skill => (
                    <span key={skill} className="px-2.5 py-1 rounded-lg bg-[#0A0D14] border border-white/5 text-[10px] text-purple-400 border-purple-500/20 cursor-default">
                      {skill}
                    </span>
                  )) : <span className="text-[10px] text-gray-600">No suggestions yet</span>}
                </div>
              )}

              <h4 className="text-[13px] font-semibold text-white mb-2">Suggested Roles</h4>
              {analyzing ? (
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="w-24 h-6" />
                  <Skeleton className="w-24 h-6" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 animate-fade-in">
                  {result?.suggestedRoles?.length > 0 ? result.suggestedRoles.map(role => (
                    <span key={role} className="px-2.5 py-1 rounded-lg bg-indigo-500/5 border border-indigo-500/20 text-[10px] text-indigo-200 cursor-default">
                      {role}
                    </span>
                  )) : <span className="text-[10px] text-gray-600">No role suggestions yet</span>}
                </div>
              )}
            </div>

            {/* Recommended For You */}
            <div className="rounded-2xl border border-white/5 bg-[#111622] p-5 flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <h3 className="text-[15px] font-semibold text-white">Recommended For You</h3>
              </div>
              <p className="text-[11px] text-gray-400 mb-3">Improve your match score by:</p>
              
              {analyzing ? (
                <div className="space-y-3">
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-full h-4" />
                </div>
              ) : (
                <div className="animate-fade-in">
                  <ul className="space-y-3">
                  {result?.recommendations?.length > 0 ? result.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" /> 
                      {rec}
                    </li>
                  )) : (
                    <>
                      <li className="flex items-start gap-2 text-xs text-gray-300 opacity-40"><CheckCircle2 className="w-3.5 h-3.5 text-gray-600 mt-0.5 flex-shrink-0" /> Add more quantified achievements</li>
                      <li className="flex items-start gap-2 text-xs text-gray-300 opacity-40"><CheckCircle2 className="w-3.5 h-3.5 text-gray-600 mt-0.5 flex-shrink-0" /> Include more industry keywords</li>
                    </>
                  )}
                </ul>
              </div>
            )}
            </div>

          </div>
        </div>

        {/* BOTTOM BANNER */}
        <div className="rounded-2xl border border-indigo-500/20 bg-[#111622] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_20px_rgba(79,70,229,0.1)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="h-12 w-12 rounded-xl bg-indigo-600/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-0.5">Get better matches</h3>
              <p className="text-xs text-gray-400">Optimize your CV with AI to increase your match score even more.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/ats-analyzer')} 
            disabled={!result}
            className="relative z-10 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20"
          >
            <Sparkles className="w-4 h-4" /> Optimize with AI
          </button>
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
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 2s infinite linear;
        }
      `}</style>
    </div>
  );
}
