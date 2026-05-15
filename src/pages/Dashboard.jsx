import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { useAuth } from "../auth/AuthProvider";
import { collection, onSnapshot, orderBy, query, where, getDocs } from "firebase/firestore";
import { 
  LayoutDashboard, FileText, PlusSquare, LayoutTemplate, PenTool, 
  FileCheck, Sparkles, MessageSquare, FileSignature, BarChart2, 
  User, Settings, Sun, Moon, Bell, ChevronDown, ArrowUpRight, 
  QrCode, Download, Eye, FilePlus, Share2, MoreVertical, 
  Lightbulb, ArrowRight, Menu 
} from "lucide-react";
import { motion } from "framer-motion";
import ProfileDropdown from "../components/ProfileDropdown";
import NotificationDropdown from "../components/NotificationDropdown";
import { useThemeContext } from "../context/ThemeContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { theme, setTheme } = useThemeContext();
  const [cvs, setCvs] = useState([]);
  const [viewLogData, setViewLogData] = useState([]);
  const [chartPeriod, setChartPeriod] = useState("thisMonth"); // thisMonth | lastMonth | last7
  const [chartLoading, setChartLoading] = useState(true);
  const chartContainerRef = useRef(null);
  const [chartMounted, setChartMounted] = useState(false);

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
      console.error("Dashboard Firestore listener error:", error);
    });
    
    return () => {
      if (typeof unsub === 'function') {
        unsub();
      }
    };
  }, [user, loading]);

  // Load real view log data from Firestore
  useEffect(() => {
    if (loading || !user) return;

    const fetchViewLogs = async () => {
      setChartLoading(true);
      try {
        const daysCol = collection(db, "viewLogs", user.uid, "days");
        const snap = await getDocs(daysCol);
        const map = {};
        snap.forEach((d) => {
          map[d.id] = d.data().views || 0;
        });
        setViewLogData(map);
      } catch (e) {
        console.warn("Failed to load viewLogs:", e);
        setViewLogData({});
      } finally {
        setChartLoading(false);
      }
    };

    fetchViewLogs();
  }, [user, loading]);

  // Mount chart after first paint to prevent Recharts negative-dimension errors
  useEffect(() => {
    const t = setTimeout(() => setChartMounted(true), 200);
    return () => clearTimeout(t);
  }, []);

  // Build chart data for the selected period
  const buildChartData = () => {
    const now = new Date();
    let startDate, endDate;

    if (chartPeriod === "last7") {
      endDate = new Date(now);
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 6);
    } else if (chartPeriod === "lastMonth") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    } else {
      // thisMonth
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    const days = [];
    const cur = new Date(startDate);
    while (cur <= endDate) {
      const key = cur.toISOString().slice(0, 10);
      const label = cur.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      days.push({ date: key, label, views: viewLogData[key] || 0 });
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  };

  const chartData = buildChartData();
  const maxViews = Math.max(...chartData.map((d) => d.views), 10);
  const chartPeriodLabel =
    chartPeriod === "last7" ? "Last 7 Days" :
    chartPeriod === "lastMonth" ? "Last Month" : "This Month";

  const userName = user?.displayName?.split(' ')[0] || "Nethma";
  const userFullName = user?.displayName || "Nethma Wanniarachchi";
  const userEmail = user?.email || "nethma@example.com";
  
  const totalCvs = cvs.length;
  const totalViews = cvs.reduce((sum, cv) => sum + (cv.views || 0), 0);
  const totalDownloads = cvs.reduce((sum, cv) => sum + (cv.downloads || 0), 0);
  const totalQrScans = cvs.reduce((sum, cv) => sum + (cv.qrScans || 0), 0);

  const displayCvs = cvs.map((c) => ({
    id: c.id,
    title: c.title || "Untitled CV",
    date: `Updated ${new Date(c.updatedAt?.seconds * 1000 || Date.now()).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}`,
    status: c.isPublished ? "Published" : "Draft",
    views: c.views || 0,
    downloads: c.downloads || 0
  })).slice(0, 4);

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval >= 1) return Math.floor(interval) + " minutes ago";
    return "Just now";
  };

  const recentActivity = cvs.map(cv => {
    const date = new Date(cv.updatedAt?.seconds * 1000 || Date.now());
    return {
      id: cv.id,
      action: cv.isPublished ? "Published" : "Updated",
      cv: cv.title || "Untitled CV",
      timestamp: date,
      time: timeAgo(date),
      icon: cv.isPublished ? FileCheck : FileText,
      color: cv.isPublished ? "text-emerald-400" : "text-blue-400",
      bg: cv.isPublished ? "bg-emerald-500/20" : "bg-blue-500/20"
    };
  })
  .sort((a, b) => b.timestamp - a.timestamp)
  .slice(0, 5);

  if (recentActivity.length === 0) {
    recentActivity.push({
      id: 'welcome',
      action: "Welcome to ProCV Lite",
      cv: "Create your first CV to see activity",
      time: "Just now",
      icon: Sparkles,
      color: "text-indigo-400",
      bg: "bg-indigo-500/20"
    });
  }

  if (loading) return <div className="p-6 text-white bg-[#0A0D14] min-h-screen">Loading...</div>;

  // Custom tooltip for chart
  const ChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1e2336] border border-white/10 px-3 py-2 rounded-lg text-xs shadow-xl text-center">
          <div className="text-gray-400 mb-0.5">{payload[0]?.payload?.label}</div>
          <div className="font-bold flex items-center justify-center gap-1.5 text-white">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            {payload[0]?.value?.toLocaleString()} Views
          </div>
        </div>
      );
    }
    return null;
  };

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

          {/* Profile */}
          <div className="px-3 mb-4 cursor-pointer" onClick={() => navigate('/profile')}>
            <div className="flex items-center gap-2 bg-[#111622] p-2 rounded-xl border border-white/5 hover:bg-white/5 transition-colors">

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
                <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-medium shadow-lg shadow-indigo-500/20 transition-colors">
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
          <div className="flex items-center justify-center gap-4 bg-[#111622] p-2 rounded-2xl border border-white/5 theme-sidebar-toggle">
            <button onClick={() => setTheme("light")} className={`${theme === 'light' ? 'text-white' : 'text-gray-400'} hover:text-white transition-colors`} title="Light theme">
              <Sun className="w-4 h-4" />
            </button>
            <div
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-10 h-5 bg-indigo-600 rounded-full relative cursor-pointer"
            >
              <motion.div
                animate={{ x: theme === 'dark' ? 22 : 4 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-3 h-3 bg-white rounded-full"
              />
            </div>
            <button onClick={() => setTheme("dark")} className={`${theme === 'dark' ? 'text-white' : 'text-gray-400'} hover:text-white transition-colors`} title="Dark theme">
              <Moon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto bg-[#0A0D14] custom-scrollbar p-8">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}! 👋</h1>
            <p className="text-gray-400 text-sm">Here's what's happening with your CVs today.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <button onClick={() => navigate('/builder')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm">
              <PlusSquare className="w-4 h-4" /> Create New CV
            </button>
            <NotificationDropdown />
            <ProfileDropdown />

          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
          <div className="bg-[#111622] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-500/20 p-2.5 rounded-xl text-indigo-400">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-sm font-semibold text-gray-300">Total CVs</div>
            </div>
            <div className="text-3xl font-bold mb-2">{totalCvs}</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <ArrowUpRight className="w-3 h-3" /> Total created
            </div>
          </div>
          <div className="bg-[#111622] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-500/20 p-2.5 rounded-xl text-blue-400">
                <Eye className="w-5 h-5" />
              </div>
              <div className="text-sm font-semibold text-gray-300">Profile Views</div>
            </div>
            <div className="text-3xl font-bold mb-2">{totalViews.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <ArrowUpRight className="w-3 h-3" /> Across all CVs
            </div>
          </div>
          <div className="bg-[#111622] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-500/20 p-2.5 rounded-xl text-emerald-400">
                <Download className="w-5 h-5" />
              </div>
              <div className="text-sm font-semibold text-gray-300">Downloads</div>
            </div>
            <div className="text-3xl font-bold mb-2">{totalDownloads.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <ArrowUpRight className="w-3 h-3" /> Across all CVs
            </div>
          </div>
          <div className="bg-[#111622] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-500/20 p-2.5 rounded-xl text-yellow-400">
                <QrCode className="w-5 h-5" />
              </div>
              <div className="text-sm font-semibold text-gray-300">QR Scans</div>
            </div>
            <div className="text-3xl font-bold mb-2">{totalQrScans.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <ArrowUpRight className="w-3 h-3" /> Across all CVs
            </div>
          </div>
        </div>

        {/* MIDDLE ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 mb-6">
          {/* GRAPH */}
          <div className="bg-[#111622] border border-white/5 rounded-2xl p-6 relative min-w-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Profile Views Overview</h2>
              <div className="flex items-center gap-2">
                {["thisMonth", "lastMonth", "last7"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setChartPeriod(p)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border ${
                      chartPeriod === p
                        ? "bg-indigo-600 text-white border-indigo-500"
                        : "text-gray-400 bg-[#1e2336] border-white/5 hover:text-white"
                    }`}
                  >
                    {p === "thisMonth" ? "This Month" : p === "lastMonth" ? "Last Month" : "Last 7 Days"}
                  </button>
                ))}
              </div>
            </div>

            {chartLoading ? (
              <div className="h-56 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600/30 border-t-indigo-600" />
              </div>
            ) : chartData.every((d) => d.views === 0) ? (
              <div className="h-56 flex flex-col items-center justify-center gap-3 text-center">
                <Eye className="w-8 h-8 text-gray-600" />
                <p className="text-sm text-gray-400">No views recorded yet.</p>
                <p className="text-xs text-gray-600">Share your CV link to start tracking.</p>
              </div>
            ) : chartMounted ? (
              <div className="h-56 w-full min-w-0" ref={chartContainerRef}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="viewGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#6b7280", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      interval={chartPeriod === "last7" ? 0 : Math.floor(chartData.length / 6)}
                    />
                    <YAxis
                      tick={{ fill: "#6b7280", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                      domain={[0, Math.ceil(maxViews * 1.2)]}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(99,102,241,0.2)", strokeWidth: 1 }} />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fill="url(#viewGradient)"
                      dot={false}
                      activeDot={{ r: 5, fill: "#6366f1", strokeWidth: 2, stroke: "#111622" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56" />
            )}
          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-[#111622] border border-white/5 rounded-2xl p-6 flex flex-col">
            <h2 className="text-lg font-semibold mb-5">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button onClick={() => navigate('/builder')} className="flex items-center gap-3 p-3.5 rounded-xl bg-[#1e2336] border border-white/5 hover:bg-white/10 transition-colors text-[13px] font-medium text-gray-200">
                <FilePlus className="w-4 h-4 text-indigo-400" /> Create New CV
              </button>
              <button onClick={() => navigate('/ai-writer')} className="flex items-center gap-3 p-3.5 rounded-xl bg-[#1e2336] border border-white/5 hover:bg-white/10 transition-colors text-[13px] font-medium text-gray-200 relative">
                <PenTool className="w-4 h-4 text-gray-400" /> AI Writer
              </button>
              <button onClick={() => navigate('/ats-analyzer')} className="flex items-center gap-3 p-3.5 rounded-xl bg-[#1e2336] border border-white/5 hover:bg-white/10 transition-colors text-[13px] font-medium text-gray-200">
                <FileCheck className="w-4 h-4 text-blue-400" /> ATS Analyzer
              </button>
              <button onClick={() => navigate('/job-match')} className="flex items-center gap-3 p-3.5 rounded-xl bg-[#1e2336] border border-white/5 hover:bg-white/10 transition-colors text-[13px] font-medium text-gray-200">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Job Match
              </button>
              <button onClick={() => navigate('/interview-questions')} className="flex items-center gap-3 p-3.5 rounded-xl bg-[#1e2336] border border-white/5 hover:bg-white/10 transition-colors text-[13px] font-medium text-gray-200 relative">
                <MessageSquare className="w-4 h-4 text-orange-400" /> Interview Questions
              </button>
              <button onClick={() => navigate('/cover-letter-generator')} className="flex items-center gap-3 p-3.5 rounded-xl bg-[#1e2336] border border-white/5 hover:bg-white/10 transition-colors text-[13px] font-medium text-gray-200 relative">
                <FileSignature className="w-4 h-4 text-gray-400" /> Cover Letter Generator
              </button>
            </div>
            <button onClick={() => navigate('/my-cvs')} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 transition-colors text-sm font-semibold border border-indigo-500/20 mt-auto">
              <Share2 className="w-4 h-4" /> Share My CV
            </button>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 mb-6">
          {/* RECENT CVS */}
          <div className="bg-[#111622] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Recent CVs</h2>
              <button onClick={() => navigate('/my-cvs')} className="text-xs font-semibold text-gray-300 hover:text-white bg-[#1e2336] px-4 py-2 rounded-xl border border-white/5 transition-colors">View All</button>
            </div>
            <div className="space-y-2">
              {displayCvs.length > 0 ? displayCvs.map(cv => (
                <div key={cv.id} className="flex items-center justify-between p-3.5 rounded-xl hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/5 group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-16 bg-white rounded-md flex-shrink-0 border border-gray-200 overflow-hidden relative shadow-sm">
                      <div className="absolute inset-1.5 space-y-1">
                        <div className="flex gap-1 mb-2">
                          <div className="w-3 h-3 bg-gray-300 rounded-sm"></div>
                          <div className="flex-1 space-y-0.5">
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
                    <div>
                      <div className="font-semibold text-[15px] mb-1.5">{cv.title}</div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-gray-400">{cv.date}</span>
                        <span className={`px-2 py-0.5 rounded uppercase text-[9px] font-bold tracking-wider ${cv.status === 'Published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {cv.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 pr-2">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-500" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-200 leading-tight">{cv.views}</span>
                        <span className="text-[10px] text-gray-500 font-medium">Views</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-gray-500" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-200 leading-tight">{cv.downloads}</span>
                        <span className="text-[10px] text-gray-500 font-medium">Downloads</span>
                      </div>
                    </div>
                    <button className="p-2 text-gray-500 hover:text-white bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all border border-white/5 ml-2">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center p-8 border border-white/5 rounded-xl bg-white/[0.02]">
                  <p className="text-sm text-gray-400 mb-3">No CVs created yet.</p>
                  <button onClick={() => navigate('/builder')} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors font-medium">
                    Create New CV
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RECENT ACTIVITY */}
          <div className="bg-[#111622] border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-6">Recent Activity</h2>
            <div className="space-y-6">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full ${activity.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <activity.icon className={`w-4 h-4 ${activity.color}`} />
                    </div>
                    <div>
                      <div className="text-[13px] text-gray-400">{activity.action}</div>
                      <div className="text-[13px] font-semibold text-gray-200 mt-0.5">{activity.cv}</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-500 font-medium whitespace-nowrap mt-1">{activity.time}</div>
                </div>
              ))}
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