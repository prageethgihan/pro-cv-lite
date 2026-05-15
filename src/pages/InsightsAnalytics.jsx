import React, { useState, useEffect, useMemo } from "react";
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
  Download,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Target,
  Search,
  ExternalLink,
  MoreVertical,
  Filter,
  Calendar,
  Zap,
  Globe,
  Lock,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  Award,
  History,
  FilePlus,
  Loader2,
  Info,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ZapOff
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { analyticsEngine } from "../lib/analyticsEngine";
import { analyticsInsights } from "../lib/analyticsInsights";
import { exportAnalyticsReport } from "../lib/exportAnalyticsReport";
import { analyticsRecommendationActions } from "../lib/analyticsRecommendationActions";
import ProfileDropdown from "../components/ProfileDropdown";
import NotificationDropdown from "../components/NotificationDropdown";

export default function InsightsAnalytics() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const userFullName = user?.displayName || "User";
  const userEmail = user?.email || "";

  useEffect(() => {
    if (authLoading) return;
    
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const data = await analyticsEngine.getAnalytics(user);
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, authLoading]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- Real Data Processing & Memoization ---

  const insights = useMemo(() => {
    if (!analytics) return analyticsInsights.getEmptyState();
    return analyticsInsights.generate(analytics);
  }, [analytics]);

  const activityData = useMemo(() => {
    if (!analytics || !analytics.ai.activityTrend.length) return [];
    return analytics.ai.activityTrend;
  }, [analytics]);

  const atsTrendData = useMemo(() => {
    if (!analytics || !analytics.ats.trend.length) return [];
    return analytics.ats.trend.map(d => ({
      ...d,
      score: d.score === null ? undefined : Math.round(d.score)
    }));
  }, [analytics]);

  const engagementData = useMemo(() => {
    if (!analytics) return [];
    return [
      { name: "CVs", value: analytics.overview.totalCvs, color: "#6366f1" },
      { name: "AI Writer", value: analytics.ai.totalGenerations, color: "#3b82f6" },
      { name: "Cover Letters", value: analytics.ai.coverLettersCount, color: "#10b981" },
      { name: "Job Matches", value: analytics.ai.jobMatchesCount, color: "#f59e0b" },
    ].filter(d => d.value > 0);
  }, [analytics]);

  const skillData = useMemo(() => {
    if (!analytics || !analytics.skills.top.length) return [];
    return analytics.skills.top.map(s => ({
      subject: s.name,
      A: s.count,
      fullMark: Math.max(...analytics.skills.top.map(x => x.count), 5)
    }));
  }, [analytics]);

  const statsCards = useMemo(() => {
    if (!analytics) return [];
    return [
      { label: "CV Views", val: analytics.overview.totalViews.toLocaleString(), trend: "Lifetime", icon: Eye, color: "text-indigo-400", bg: "bg-indigo-500/10" },
      { label: "Downloads", val: analytics.overview.totalDownloads.toLocaleString(), trend: "Real-time", icon: Download, color: "text-blue-400", bg: "bg-blue-500/10" },
      { label: "Avg. ATS", val: `${analytics.overview.avgAtsScore}%`, trend: "Calculated", icon: Award, color: "text-emerald-400", bg: "bg-emerald-500/10" },
      { label: "Confidence", val: `${analytics.interview.confidence}%`, trend: "Interview", icon: Target, color: "text-purple-400", bg: "bg-purple-500/10" },
      { label: "Reach", val: analytics.overview.profileReach.toLocaleString(), trend: "Aggregated", icon: Globe, color: "text-sky-400", bg: "bg-sky-500/10" },
      { label: "AI Usage", val: analytics.overview.aiUsageCount.toLocaleString(), trend: "Tool Hits", icon: Zap, color: "text-teal-400", bg: "bg-teal-500/10" },
    ];
  }, [analytics]);

  const handleExport = async () => {
    if (isExporting || !analytics) return;
    setIsExporting(true);
    try {
      await exportAnalyticsReport.generatePDF(analytics, insights, userFullName);
    } catch (err) {
      alert("Failed to generate report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleRecommendationClick = (rec) => {
    if (!analytics) return;

    if (rec.action === "Run ATS Scan") {
      const state = analyticsRecommendationActions.prepareAtsScan(analytics);
      if (state.error) {
        alert(state.error);
        navigate('/builder');
      } else {
        navigate('/ats-analyzer', { state });
      }
      return;
    }

    if (rec.action === "Open ATS Analyzer") {
      navigate('/ats-analyzer');
      return;
    }

    if (rec.action === "Manage My CVs" || rec.action === "Edit Top CV") {
      navigate('/my-cvs');
      return;
    }

    if (rec.action === "Go to Builder") {
      navigate('/builder');
      return;
    }

    if (rec.action === "Explore AI Tools") {
      navigate('/ai-writer');
      return;
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#070B14]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-gray-400 text-sm animate-pulse">Running AI diagnostic algorithms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#070B14] text-white selection:bg-indigo-500/30 font-sans">
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-[230px] flex-shrink-0 border-r border-white/5 bg-[#0A0D14] flex-col justify-between overflow-y-auto custom-scrollbar z-20">
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
              <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-medium shadow-lg shadow-indigo-500/20 transition-colors">
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
      <main className="flex-1 overflow-y-auto bg-[#070B14] p-6 custom-scrollbar relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] -z-10 rounded-full"></div>

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1 tracking-tight">AI Insights & Report</h1>
            <p className="text-gray-400 text-xs">Evidence-based analysis of your professional trajectory.</p>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={handleExport}
                disabled={isExporting || analytics.overview.totalCvs === 0}
                className="flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-xl font-bold transition-all text-xs shadow-xl shadow-white/5"
             >
                {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                {isExporting ? "Generating PDF..." : "Export Analytics Report"}
             </button>
             <div className="h-8 w-px bg-white/5 mx-1 hidden sm:block"></div>
             <NotificationDropdown />
             <ProfileDropdown />
          </div>
        </div>

        {/* TOP ROW: Health Score & Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
           {/* Analytics Health Score */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="col-span-1 lg:col-span-4 bg-gradient-to-br from-[#111622] to-[#1e2336] border border-white/5 rounded-3xl p-6 relative overflow-hidden flex flex-col items-center justify-center shadow-2xl"
           >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <ShieldCheck className="w-24 h-24 text-indigo-400"/>
              </div>
              <h3 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-widest">Analytics Health Score</h3>
              
              <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                 <svg className="w-full h-full -rotate-90">
                    <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="10" className="text-white/5" />
                    <circle 
                       cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="10" 
                       strokeDasharray="440" 
                       strokeDashoffset={440 - (440 * (insights.healthScore || 0)) / 100}
                       strokeLinecap="round"
                       className="text-indigo-500 transition-all duration-1000 ease-out" 
                    />
                 </svg>
                 <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-white">{insights.healthScore}%</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Efficiency</span>
                 </div>
              </div>
              
              <p className="text-[11px] text-gray-400 text-center leading-relaxed px-4">
                 {insights.summary}
              </p>
           </motion.div>

           {/* Smart Recommendations */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="col-span-1 lg:col-span-8 bg-[#111622] border border-white/5 rounded-3xl p-6 flex flex-col shadow-2xl"
           >
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Priority Recommendations</h3>
                 <div className="p-2 bg-indigo-500/10 rounded-xl">
                    <Lightbulb className="w-5 h-5 text-indigo-400"/>
                 </div>
              </div>
              
              <div className="space-y-4 flex-1">
                 {insights.recommendations.map((rec, i) => (
                    <div 
                       key={i} 
                       onClick={() => handleRecommendationClick(rec)}
                       className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-indigo-500/20 transition-all cursor-pointer active:scale-[0.98]"
                    >
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          rec.type === 'critical' ? 'bg-red-500/10 text-red-400' : 
                          rec.type === 'visibility' ? 'bg-blue-500/10 text-blue-400' : 
                          'bg-indigo-500/10 text-indigo-400'
                       }`}>
                          {rec.type === 'critical' ? <AlertCircle className="w-5 h-5"/> : <CheckCircle2 className="w-5 h-5"/>}
                       </div>
                       <div className="flex-1">
                          <h4 className="text-[13px] font-bold text-white mb-1">{rec.text}</h4>
                          <p className="text-[11px] text-gray-500 leading-relaxed">{rec.desc}</p>
                       </div>
                       <button className="text-[10px] font-black text-indigo-400 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                          {rec.action} <ArrowRight className="inline w-3 h-3 ml-1"/>
                       </button>
                    </div>
                 ))}
                 
                 {insights.recommendations.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                       <ShieldCheck className="w-12 h-12 mb-3" />
                       <p className="text-sm font-bold">Your profile is performing at peak optimization.</p>
                       <p className="text-xs">No critical recommendations found.</p>
                    </div>
                 )}
              </div>
           </motion.div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {statsCards.map((s, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-[#111622] border border-white/5 rounded-2xl p-4 relative overflow-hidden group hover:border-white/10 transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`${s.bg} ${s.color} p-1.5 rounded-xl`}>
                  <s.icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</span>
              </div>
              <div className="text-2xl font-bold mb-0.5">{s.val}</div>
              <div className="text-[10px] text-indigo-400/80 font-bold">{s.trend}</div>
            </motion.div>
          ))}
        </div>

        {/* MIDDLE SECTION: Charts & Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Main Activity Chart */}
          <div className="col-span-1 lg:col-span-8 bg-[#111622] border border-white/5 rounded-3xl p-6 shadow-xl min-w-0">
            <h3 className="text-sm font-bold text-gray-400 mb-8 uppercase tracking-widest">Growth Trajectory</h3>
            <div className="h-[300px] w-full">
              {isMounted && activityData.length > 0 && activityData.some(d => d.activity > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData}>
                    <defs>
                      <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                    <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} interval={4} />
                    <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }} />
                    <Area type="monotone" dataKey="activity" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorActivity)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/5 rounded-3xl">
                   <ZapOff className="w-12 h-12 text-gray-700 mb-4" />
                   <h4 className="text-sm font-bold text-gray-400">Activity Engine Standby</h4>
                   <p className="text-[11px] text-gray-600 max-w-[200px] mt-2">Start using ProCV tools to generate real activity data for analysis.</p>
                </div>
              )}
            </div>
          </div>

          {/* Skill Intelligence */}
          <div className="col-span-1 lg:col-span-4 bg-[#111622] border border-white/5 rounded-3xl p-6 shadow-xl min-w-0">
             <h3 className="text-sm font-bold text-gray-400 mb-8 uppercase tracking-widest">Skill Intelligence</h3>
             <div className="h-[200px] w-full mb-8">
                {isMounted && skillData.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                         <PolarGrid stroke="#ffffff08" />
                         <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                         <Radar name="Usage" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
                      </RadarChart>
                   </ResponsiveContainer>
                ) : (
                   <div className="h-full flex items-center justify-center opacity-10">
                      <Target className="w-20 h-20"/>
                   </div>
                )}
             </div>
             
             <div className="space-y-4">
                {insights.insights.map((insight, i) => (
                   <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter">{insight.label}</span>
                      <span className={`text-[12px] font-black ${insight.color}`}>{insight.value}</span>
                   </div>
                ))}
             </div>
          </div>
        </div>

        {/* BOTTOM ROW: Heatmap & Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
           {/* Engagement Heatmap */}
           <div className="col-span-1 lg:col-span-8 bg-[#111622] border border-white/5 rounded-3xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-gray-400 mb-8 uppercase tracking-widest">Recruiter Engagement Window</h3>
              <div className="overflow-x-auto custom-scrollbar pb-2">
                 <div className="min-w-[600px]">
                    <div className="flex mb-2 ml-8">
                       {Array.from({ length: 24 }).map((_, i) => (
                          <div key={i} className="flex-1 text-center text-[8px] text-gray-600 font-bold">
                             {i % 4 === 0 ? `${i}:00` : ''}
                          </div>
                       ))}
                    </div>
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, dIdx) => (
                       <div key={day} className="flex items-center gap-1 mb-1.5">
                          <div className="w-8 text-[9px] font-black text-gray-500 uppercase">{day}</div>
                          <div className="flex-1 flex gap-1">
                             {analytics.heatmap[dIdx].map((val, hIdx) => {
                                const opacity = val === 0 ? 'bg-white/5' : val > 5 ? 'bg-indigo-500' : val > 2 ? 'bg-indigo-700/60' : 'bg-indigo-900/40';
                                return (
                                   <div key={hIdx} className={`flex-1 h-4 rounded-sm ${opacity} transition-all cursor-help relative group`}>
                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-[9px] font-bold text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-2xl border border-white/10">
                                         {val} Interactions at {hIdx}:00
                                      </div>
                                   </div>
                                );
                             })}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Activity Timeline */}
           <div className="col-span-1 lg:col-span-4 bg-[#111622] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col">
              <h3 className="text-sm font-bold text-gray-400 mb-8 uppercase tracking-widest">Real-time Activity</h3>
              <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2 max-h-[300px]">
                 {analytics.recentActivity.length > 0 ? analytics.recentActivity.map((a, i) => {
                    const Icon = a.icon === 'file-text' ? FileText : a.icon === 'file-signature' ? FileSignature : a.icon === 'pen-tool' ? PenTool : FileCheck;
                    return (
                       <div key={i} className="flex gap-4 relative">
                          {i !== analytics.recentActivity.length - 1 && <div className="absolute left-[15px] top-8 bottom-[-24px] w-[2px] bg-white/[0.03]"></div>}
                          <div className="w-8 h-8 rounded-full border-4 border-[#111622] bg-[#1a1f2e] text-indigo-400 flex items-center justify-center flex-shrink-0 z-10">
                             <Icon className="w-4 h-4"/>
                          </div>
                          <div>
                             <div className="flex items-center gap-2 mb-1">
                                <span className="text-[11px] font-black text-white">{a.action}</span>
                                <span className="text-[8px] text-gray-600 font-bold uppercase">{new Date(a.timestamp).toLocaleDateString()}</span>
                             </div>
                             <p className="text-[10px] text-gray-500 truncate">{a.type}: {a.target}</p>
                          </div>
                       </div>
                    );
                 }) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-20">
                       <History className="w-12 h-12 mb-3" />
                       <p className="text-xs">No activity logged.</p>
                    </div>
                 )}
              </div>
           </div>
        </div>

      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.1); }
      `}</style>
    </div>
  );
}
