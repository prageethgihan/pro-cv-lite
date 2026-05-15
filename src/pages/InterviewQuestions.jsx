import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { db } from "../firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion,
  increment,
  serverTimestamp
} from "firebase/firestore";
import { safeAiCall, getFriendlyAiError } from "../lib/ai";
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
  BrainCircuit,
  Volume2,
  Video,
  ListChecks,
  AlertCircle,
  ChevronLeft,
  Timer,
  CheckCircle,
  Trophy,
  History,
  TrendingUp,
  X,
  RefreshCw,
  Trash2
} from "lucide-react";
import ProfileDropdown from "../components/ProfileDropdown";
import NotificationDropdown from "../components/NotificationDropdown";

export default function InterviewQuestions() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  // -- State --
  const [cvs, setCvs] = useState([]);
  const [selectedCvId, setSelectedCvId] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [interviewType, setInterviewType] = useState("Technical Round");
  
  const [questions, setQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Analyzing your CV...");
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");

  // -- Mock Interview State --
  const [mockMode, setMockMode] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isAnalyzingAnswer, setIsAnalyzingAnswer] = useState(false);
  const [lastFeedback, setLastFeedback] = useState(null);

  // -- Stats State --
  const [stats, setStats] = useState({
    confidenceLevel: 0,
    questionsMastered: 0,
    totalAnswered: 0,
    mockSessions: 0,
    videoReviews: 0
  });

  const [savedSessions, setSavedSessions] = useState([]);
  const [proTips, setProTips] = useState([]);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCurrentSessionSaved, setIsCurrentSessionSaved] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const userFullName = user?.displayName || "User";
  const userEmail = user?.email || "";

  // -- Loading Message Rotation --
  useEffect(() => {
    if (!isGenerating) return;
    const messages = [
      "Analyzing your CV...",
      "Identifying key skills...",
      "Preparing interview questions...",
      "Generating personalized tips...",
      "Finalizing your prep kit..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      setLoadingMessage(messages[i]);
    }, 3000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // -- Fetch CVs --
  useEffect(() => {
    if (authLoading || !user) return;
    const q = query(collection(db, "cvs"), where("ownerId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCvs(docs);
      if (docs.length > 0 && !selectedCvId) {
        setSelectedCvId(docs[0].id);
      }
    });
    return () => unsub();
  }, [user, authLoading]);

  // -- Fetch Stats & Saved Sessions --
  useEffect(() => {
    if (authLoading || !user) return;
    const unsub = onSnapshot(doc(db, "interviewData", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setStats({
          confidenceLevel: data.confidenceLevel || 0,
          questionsMastered: data.questionsMastered || 0,
          totalAnswered: data.totalAnswered || 0,
          mockSessions: data.mockSessions || 0,
          videoReviews: data.videoReviews || 0
        });
        
        // Only load saved sessions, NOT current questions (for clear on refresh)
        if (data.savedSessions) {
          setSavedSessions(data.savedSessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        }
      }
    });
    return () => unsub();
  }, [user, authLoading]);

  // -- Generation Logic --
  const generateQuestions = async () => {
    if (!user) return;
    setIsGenerating(true);
    setError(null);
    setIsCurrentSessionSaved(false);
    setCurrentSessionId(null);

    try {
      const selectedCv = cvs.find(c => c.id === selectedCvId);
      const cvText = selectedCv ? JSON.stringify(selectedCv) : "No CV selected";
      
      const prompt = `
        You are an expert technical recruiter. Generate exactly 6 professional interview questions and 3 pro tips based on the following:
        
        CV DATA: ${cvText}
        TARGET ROLE: ${targetRole || "Software Engineer"}
        JOB DESCRIPTION: ${jobDescription || "N/A"}
        INTERVIEW TYPE: ${interviewType}
        
        Return a valid JSON object:
        {
          "questions": [
            {
              "id": 1,
              "category": "Technical",
              "question": "...",
              "tips": "...",
              "difficulty": "Easy",
              "strategy": "...",
              "starGuidance": "..."
            }
          ],
          "proTips": ["tip 1", "tip 2", "tip 3"]
        }
        
        Rules:
        - Questions must be REAL and challenging.
        - Tailor technical questions to the skills in the CV.
        - Return ONLY the JSON object.
      `;

      const response = await safeAiCall(prompt);
      const cleanedResponse = response.replace(/```json|```/g, "").trim();
      const result = JSON.parse(cleanedResponse);

      // Save to Firestore
      await setDoc(doc(db, "interviewData", user.uid), {
        currentQuestions: result.questions,
        proTips: result.proTips,
        lastGenerated: serverTimestamp()
      }, { merge: true });

      setQuestions(result.questions);
      setProTips(result.proTips);
    } catch (err) {
      console.error("Generation error:", err);
      setError(getFriendlyAiError(err));
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSaveSession = async () => {
    if (questions.length === 0 || !user || isSaving) return;
    
    setIsSaving(true);

    try {
      const docRef = doc(db, "interviewData", user.uid);
      
      if (isCurrentSessionSaved && currentSessionId) {
        // UNSAVE LOGIC
        const updatedSessions = savedSessions.filter(s => s.id !== currentSessionId);
        await updateDoc(docRef, {
          savedSessions: updatedSessions
        });
        setIsCurrentSessionSaved(false);
        setCurrentSessionId(null);
      } else {
        // SAVE LOGIC
        const newId = Date.now().toString();
        const newSession = {
          id: newId,
          role: targetRole || "General Role",
          type: interviewType,
          questions: questions,
          proTips: proTips,
          timestamp: new Date().toISOString()
        };

        await setDoc(docRef, {
          savedSessions: arrayUnion(newSession)
        }, { merge: true });
        
        setCurrentSessionId(newId);
        setIsCurrentSessionSaved(true);
      }
    } catch (err) {
      console.error("Toggle save error:", err);
      setError("Failed to update collection.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSession = async (sessionId) => {
    if (!user) return;
    try {
      const updatedSessions = savedSessions.filter(s => s.id !== sessionId);
      await updateDoc(doc(db, "interviewData", user.uid), {
        savedSessions: updatedSessions
      });
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const loadSession = (session) => {
    setQuestions(session.questions);
    setProTips(session.proTips);
    setTargetRole(session.role);
    setInterviewType(session.type);
    setIsCurrentSessionSaved(true);
    setCurrentSessionId(session.id);
    setError(null);
  };

  const markAsMastered = async (qId) => {
    if (!user) return;
    const updatedQuestions = questions.map(q => 
      q.id === qId ? { ...q, isMastered: !q.isMastered } : q
    );
    setQuestions(updatedQuestions);
    
    const masteredCount = updatedQuestions.filter(q => q.isMastered).length;
    
    await updateDoc(doc(db, "interviewData", user.uid), {
      currentQuestions: updatedQuestions,
      questionsMastered: masteredCount,
      confidenceLevel: Math.min(100, stats.confidenceLevel + 5)
    });
  };

  // -- Filter Questions --
  const filteredQuestions = useMemo(() => {
    if (activeFilter === "All") return questions;
    return questions.filter(q => q.category === activeFilter);
  }, [questions, activeFilter]);

  // -- Mock Interview Handlers --
  const startMockInterview = () => {
    if (questions.length === 0) {
      setError("Please generate questions first.");
      return;
    }
    setMockMode(true);
    setCurrentIdx(0);
    setUserAnswer("");
    setLastFeedback(null);
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim() || !user) return;
    setIsAnalyzingAnswer(true);
    try {
      const q = questions[currentIdx];
      const prompt = `
        Analyze this interview answer:
        QUESTION: ${q.question}
        ANSWER: ${userAnswer}
        
        Return a JSON object:
        {
          "feedback": "...",
          "strengths": ["...", "..."],
          "improvements": ["...", "..."],
          "score": 0-100,
          "starAdvice": "..."
        }
      `;
      const response = await safeAiCall(prompt);
      const result = JSON.parse(response.replace(/```json|```/g, "").trim());
      
      setLastFeedback(result);

      // Update stats
      const scoreWeight = result.score / 100;
      const currentConfidence = stats.confidenceLevel;
      // Weighted average or simple increment for confidence
      const newConfidence = Math.min(100, Math.round(currentConfidence * 0.8 + result.score * 0.2));
      const isLast = currentIdx === questions.length - 1;
      
      const statsUpdate = {
        totalAnswered: increment(1),
        confidenceLevel: newConfidence
      };

      if (isLast) {
        statsUpdate.mockSessions = increment(1);
        statsUpdate.videoReviews = increment(1); // Assuming completing a session counts as a review
      }

      await updateDoc(doc(db, "interviewData", user.uid), statsUpdate);

    } catch (err) {
      setError("Failed to analyze answer. Please try again.");
    } finally {
      setIsAnalyzingAnswer(false);
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
                <button onClick={() => navigate('/job-match')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
                  <Sparkles className="w-4 h-4" /> Job Match
                </button>
                <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-medium shadow-lg shadow-indigo-500/20 transition-colors">
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
            <h1 className="mb-1 text-3xl font-bold">Interview Prep AI</h1>
            <p className="text-sm text-gray-400">
              Generate personalized interview questions based on your CV and job role.
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

        {/* MODAL FOR SAVED SESSIONS */}
        {showSavedModal && (
          <SavedSessionsModal 
            sessions={savedSessions} 
            onClose={() => setShowSavedModal(false)} 
            onLoad={(s) => {
              loadSession(s);
              setShowSavedModal(false);
            }}
            onDelete={deleteSession}
          />
        )}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="rounded-2xl border border-white/5 bg-[#111622] p-4 flex flex-col items-center justify-center shadow-lg">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 mb-2"><BrainCircuit className="w-5 h-5 text-indigo-400" /></div>
            <div className="text-[11px] text-gray-400 font-medium">Confidence Level</div>
            <div className="text-xl font-bold text-white">{stats.confidenceLevel > 0 ? `${stats.confidenceLevel}%` : "--"}</div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-[#111622] p-4 flex flex-col items-center justify-center shadow-lg">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 mb-2"><ListChecks className="w-5 h-5 text-emerald-400" /></div>
            <div className="text-[11px] text-gray-400 font-medium">Questions Mastered</div>
            <div className="text-xl font-bold text-white">{stats.questionsMastered}/{questions.length || 0}</div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-[#111622] p-4 flex flex-col items-center justify-center shadow-lg">
            <div className="p-1.5 rounded-lg bg-orange-500/10 mb-2"><Volume2 className="w-5 h-5 text-orange-400" /></div>
            <div className="text-[11px] text-gray-400 font-medium">Mock Sessions</div>
            <div className="text-xl font-bold text-white">{stats.mockSessions}</div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-[#111622] p-4 flex flex-col items-center justify-center shadow-lg">
            <div className="p-1.5 rounded-lg bg-purple-500/10 mb-2"><Video className="w-5 h-5 text-purple-400" /></div>
            <div className="text-[11px] text-gray-400 font-medium">Video Reviews</div>
            <div className="text-xl font-bold text-white">{stats.videoReviews}</div>
          </div>
          <button 
            onClick={() => setShowSavedModal(true)}
            className="rounded-2xl border border-white/5 bg-[#111622] p-4 flex flex-col items-center justify-center shadow-lg hover:border-indigo-500/50 transition-all group"
          >
            <div className="p-1.5 rounded-lg bg-indigo-500/10 mb-2 group-hover:bg-indigo-500/20"><Bookmark className="w-5 h-5 text-indigo-400" /></div>
            <div className="text-[11px] text-gray-400 font-medium">Saved Prep</div>
            <div className="text-xl font-bold text-white">{savedSessions.length}</div>
          </button>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
          {/* LEFT: INPUTS */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/5 bg-[#111622] p-5">
              <h3 className="text-base font-semibold mb-4">Preparation Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1.5">Select CV</label>
                  <select 
                    value={selectedCvId}
                    onChange={(e) => setSelectedCvId(e.target.value)}
                    className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 appearance-none"
                  >
                    {cvs.length > 0 ? cvs.map(cv => (
                      <option key={cv.id} value={cv.id}>{cv.title || "Untitled CV"}</option>
                    )) : (
                      <option value="">No CVs found</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1.5">Target Job Role</label>
                  <input 
                    type="text" 
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500" 
                    placeholder="e.g. Senior Frontend Developer"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1.5">Job Description (Optional)</label>
                  <textarea 
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 min-h-[120px]" 
                    placeholder="Paste the job description here for better results..."
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1.5">Interview Type</label>
                  <select 
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 appearance-none"
                  >
                    <option>Technical Round</option>
                    <option>HR / Behavioral</option>
                    <option>System Design</option>
                    <option>Managerial</option>
                    <option>Mixed Round</option>
                  </select>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <button 
                  onClick={generateQuestions}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl text-sm font-semibold text-white transition shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {loadingMessage}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Generate Questions
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* QUICK TIPS */}
            <div className="rounded-2xl border border-white/5 bg-[#111622] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <h3 className="text-sm font-semibold text-white">Interview Pro Tips</h3>
              </div>
              <ul className="space-y-3">
                {proTips.length > 0 ? proTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[11px] text-gray-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 flex-shrink-0"></div>
                    {tip}
                  </li>
                )) : (
                  <li className="text-[11px] text-gray-500 italic">No tips generated yet. Start by generating questions.</li>
                )}
              </ul>
            </div>
          </div>

          {/* RIGHT: QUESTIONS */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/5 bg-[#111622] p-6 min-h-[500px] flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold">Generated Questions</h3>
                  {questions.length > 0 && (
                    <button 
                      onClick={toggleSaveSession}
                      disabled={isSaving}
                      className={`mt-1 flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md transition-all ${
                        isCurrentSessionSaved 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                        : "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                      }`}
                    >
                      {isSaving ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : isCurrentSessionSaved ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Bookmark className="w-3 h-3" />
                      )}
                      {isSaving ? "Updating..." : isCurrentSessionSaved ? "Saved to Collection" : "Save this preparation"}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500">Filters:</span>
                  {["All", "Technical", "Behavioral", "HR"].map(filter => (
                    <button 
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] transition-all ${
                        activeFilter === filter 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                        : "bg-[#0A0D14] border border-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {filteredQuestions.length > 0 ? (
                <div className="space-y-4">
                  {filteredQuestions.map((q, idx) => (
                    <QuestionCard 
                      key={q.id} 
                      q={q} 
                      idx={idx}
                      isSaved={isCurrentSessionSaved}
                      onMaster={() => markAsMastered(q.id)}
                      onSave={toggleSaveSession}
                      onPractice={() => {
                        setMockMode(true);
                        setCurrentIdx(questions.findIndex(quest => quest.id === q.id));
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-gray-500" />
                  </div>
                  <h4 className="text-base font-semibold text-white mb-2">
                    {isGenerating ? "AI is working..." : "Ready to Prep?"}
                  </h4>
                  <p className="text-xs text-gray-500 max-w-[250px]">
                    {isGenerating 
                      ? "Generating your personalized interview questions based on your CV." 
                      : "Fill in your details and generate custom interview questions to start practicing."}
                  </p>
                </div>
              )}
            </div>

            {/* MOCK INTERVIEW BANNER */}
            <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">AI Mock Interview</h3>
                  <p className="text-xs text-gray-400">Practice real-time with our AI interviewer.</p>
                </div>
              </div>
              <button 
                onClick={startMockInterview}
                className="bg-white text-indigo-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-100 transition shadow-lg"
              >
                Start Mock Interview
              </button>
            </div>
          </div>
        </div>

        {/* MOCK INTERVIEW OVERLAY */}
        {mockMode && (
          <MockInterviewOverlay 
            questions={questions}
            currentIdx={currentIdx}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isAnalyzing={isAnalyzingAnswer}
            lastFeedback={lastFeedback}
            onClose={() => setMockMode(false)}
            onSubmit={submitAnswer}
            onNext={() => {
              if (currentIdx < questions.length - 1) {
                setCurrentIdx(prev => prev + 1);
                setUserAnswer("");
                setLastFeedback(null);
              } else {
                setMockMode(false);
              }
            }}
          />
        )}
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

// --- Helper Components ---

function QuestionCard({ q, idx, onMaster, onPractice, onSave, isSaved }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="p-5 rounded-2xl border border-white/5 bg-[#0A0D14] hover:border-indigo-500/30 transition group relative overflow-hidden">
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Q{idx + 1}</span>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400">
              {q.category}
            </span>
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
              q.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400' : 
              q.difficulty === 'Medium' ? 'bg-orange-500/10 text-orange-400' : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              {q.difficulty}
            </span>
            {q.isMastered && (
              <span className="flex items-center gap-1 text-emerald-400 text-[9px] font-bold">
                <CheckCircle className="w-3 h-3" /> Mastered
              </span>
            )}
          </div>
          <h4 className="text-sm font-semibold text-white leading-relaxed">{q.question}</h4>
        </div>
        <button 
          onClick={onSave}
          disabled={isSaved}
          className={`p-2 transition rounded-lg ${
            isSaved 
            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
            : "text-gray-500 hover:text-white group-hover:bg-white/5"
          }`}
          title={isSaved ? "Saved" : "Save this session"}
        >
          <Bookmark className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>
      
      <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl mb-3">
        <AlertCircle className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
        <div className="text-[11px] text-gray-400 italic">
          <span className="text-gray-300 font-semibold block mb-1">Expert Tip:</span>
          {q.tips}
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 py-2 animate-in fade-in slide-in-from-top-1">
          <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
            <h5 className="text-[10px] font-bold text-indigo-400 uppercase mb-2">Answer Strategy</h5>
            <p className="text-[11px] text-gray-300 leading-relaxed">{q.strategy}</p>
          </div>
          {q.starGuidance && (
            <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
              <h5 className="text-[10px] font-bold text-purple-400 uppercase mb-2">STAR Guidance</h5>
              <p className="text-[11px] text-gray-300 leading-relaxed">{q.starGuidance}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/5 pt-4">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[10px] font-medium text-gray-500 hover:text-white transition flex items-center gap-1"
        >
          {isExpanded ? "Show Less" : "Show Strategy"}
          <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </button>
        <div className="flex items-center gap-3">
          <button 
            onClick={onMaster}
            className={`text-[10px] font-medium transition ${q.isMastered ? 'text-emerald-400' : 'text-gray-400 hover:text-white'}`}
          >
            {q.isMastered ? "Mastered" : "Mark as Mastered"}
          </button>
          <button 
            onClick={onPractice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 text-[10px] font-bold hover:bg-indigo-600 hover:text-white transition"
          >
            Practice with AI <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MockInterviewOverlay({ questions, currentIdx, userAnswer, setUserAnswer, isAnalyzing, lastFeedback, onClose, onSubmit, onNext }) {
  const q = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#070B14]/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-[#0A0D14] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-indigo-600/5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">AI Mock Interview</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
                <span className="text-[10px] text-gray-500 font-bold uppercase">Question {currentIdx + 1} of {questions.length}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition hover:bg-white/5 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400">
                  {q.category}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  q.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400' : 
                  q.difficulty === 'Medium' ? 'bg-orange-500/10 text-orange-400' : 'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {q.difficulty}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white leading-tight">{q.question}</h3>
              <p className="text-sm text-gray-400 italic">“Take your time to answer. Try to use the STAR method if it's behavioral.”</p>
            </div>

            {!lastFeedback ? (
              <div className="space-y-4">
                <div className="relative">
                  <textarea 
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full bg-[#111622] border border-white/10 rounded-2xl p-6 text-sm text-white focus:outline-none focus:border-indigo-500 min-h-[200px] placeholder:text-gray-600 transition-all"
                    placeholder="Type your answer here..."
                  />
                  <div className="absolute bottom-4 right-4 flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                    <Timer className="w-3 h-3" /> Practice Mode
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4">
                  <button onClick={onClose} className="text-sm font-semibold text-gray-500 hover:text-white transition">Skip for now</button>
                  <button 
                    onClick={onSubmit}
                    disabled={!userAnswer.trim() || isAnalyzing}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-8 py-3 rounded-xl text-sm font-bold text-white transition shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing...
                      </>
                    ) : (
                      <>Submit Answer <Send className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in zoom-in-95 duration-300">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">AI Feedback</h4>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-black text-white">{lastFeedback.score}</div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase">Score</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{lastFeedback.feedback}</p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div>
                      <h5 className="text-[10px] font-bold text-emerald-400 uppercase mb-2 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Strengths
                      </h5>
                      <ul className="space-y-1">
                        {lastFeedback.strengths.map((s, i) => (
                          <li key={i} className="text-[11px] text-gray-400 flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold text-orange-400 uppercase mb-2 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Improvements
                      </h5>
                      <ul className="space-y-1">
                        {lastFeedback.improvements.map((s, i) => (
                          <li key={i} className="text-[11px] text-gray-400 flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {lastFeedback.starAdvice && (
                    <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 mt-4">
                      <h5 className="text-[10px] font-bold text-purple-400 uppercase mb-1">STAR Method Tip</h5>
                      <p className="text-[11px] text-gray-300">{lastFeedback.starAdvice}</p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={onNext}
                  className="w-full flex items-center justify-center gap-2 bg-white text-black py-4 rounded-2xl text-sm font-bold hover:bg-gray-100 transition shadow-xl"
                >
                  {currentIdx < questions.length - 1 ? "Next Question" : "Finish Session"} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SavedSessionsModal({ sessions, onClose, onLoad, onDelete }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#070B14]/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-[#0A0D14] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Saved Preparations</h2>
              <p className="text-xs text-gray-400">View and load your previously saved interview prep kits.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition hover:bg-white/10 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {sessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map((session) => (
                <div 
                  key={session.id}
                  className="group relative bg-[#111622] border border-white/5 rounded-2xl p-5 hover:border-indigo-500/40 transition-all hover:bg-[#151b2b] shadow-lg"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                      {session.type}
                    </div>
                    <span className="text-[10px] text-gray-500">{new Date(session.timestamp).toLocaleDateString()}</span>
                  </div>
                  
                  <h3 className="text-sm font-bold text-white mb-1 leading-tight">{session.role}</h3>
                  <p className="text-[11px] text-gray-500 mb-4 line-clamp-1 opacity-60">
                    {session.questions.length} Questions • {session.proTips.length} Tips
                  </p>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => onLoad(session)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-[11px] font-bold transition shadow-lg shadow-indigo-500/10"
                    >
                      Load Session
                    </button>
                    <button 
                      onClick={() => onDelete(session.id)}
                      className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition"
                      title="Delete Session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center opacity-40">
              <Bookmark className="w-12 h-12 mb-4" />
              <h3 className="text-lg font-bold">No saved sessions yet</h3>
              <p className="text-sm max-w-[250px]">Your saved interview preparations will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

