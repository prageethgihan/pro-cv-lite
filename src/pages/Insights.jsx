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
  Award
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
import ProfileDropdown from "../components/ProfileDropdown";
import NotificationDropdown from "../components/NotificationDropdown";

export default function Insights() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("Last 30 Days");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const userFullName = user?.displayName || "Prageeth Gihan";
  const userEmail = user?.email || "prageethgihan55@gmail.com";

  // Mock Data for Charts
  const performanceData = [
    { name: "Apr 20", views: 400, downloads: 240, ats: 75 },
    { name: "Apr 25", views: 700, downloads: 350, ats: 78 },
    { name: "Apr 30", views: 600, downloads: 300, ats: 80 },
    { name: "May 05", views: 900, downloads: 500, ats: 82 },
    { name: "May 10", views: 1420, downloads: 610, ats: 86 },
    { name: "May 15", views: 1100, downloads: 480, ats: 84 },
    { name: "May 20", views: 1300, downloads: 550, ats: 88 },
  ];

  const engagementData = [
    { name: "Direct", value: 45, color: "#6366f1" },
    { name: "LinkedIn", value: 28, color: "#3b82f6" },
    { name: "Email", value: 15, color: "#10b981" },
    { name: "Others", value: 12, color: "#f59e0b" },
  ];

  const atsScoreData = [
    { name: "Excellent", value: 28, color: "#10b981" },
    { name: "Good", value: 54, color: "#3b82f6" },
    { name: "Average", value: 14, color: "#f59e0b" },
    { name: "Poor", value: 4, color: "#ef4444" },
  ];

  const skillsData = [
    { name: "JavaScript", value: 92 },
    { name: "React", value: 89 },
    { name: "Node.js", value: 85 },
    { name: "TypeScript", value: 78 },
    { name: "SQL", value: 72 },
  ];

  const growthData = [
    { subject: "Views", A: 120, fullMark: 150 },
    { subject: "Downloads", A: 98, fullMark: 150 },
    { subject: "ATS Score", A: 86, fullMark: 150 },
    { subject: "Interview Rate", A: 99, fullMark: 150 },
    { subject: "Profile Reach", A: 85, fullMark: 150 },
  ];

  const topCvs = [
    { 
      id: 1, 
      title: "Software Engineer CV", 
      views: 542, 
      downloads: 198, 
      ats: 86, 
      status: "Public", 
      img: "https://api.dicebear.com/7.x/avataaars/svg?seed=SE" 
    },
    { 
      id: 2, 
      title: "Data Analyst CV", 
      views: 312, 
      downloads: 124, 
      ats: 82, 
      status: "Public", 
      img: "https://api.dicebear.com/7.x/avataaars/svg?seed=DA" 
    },
    { 
      id: 3, 
      title: "Product Manager CV", 
      views: 231, 
      downloads: 98, 
      ats: 79, 
      status: "Public", 
      img: "https://api.dicebear.com/7.x/avataaars/svg?seed=PM" 
    },
  ];

  const recentActivity = [
    { id: 1, action: "Your CV was viewed", target: "Software Engineer CV", time: "2 mins ago", icon: Eye, bg: "bg-purple-500/20", color: "text-purple-400" },
    { id: 2, action: "ATS analysis completed", target: "Score: 84% - Good Match", time: "28 mins ago", icon: FileCheck, bg: "bg-blue-500/20", color: "text-blue-400" },
    { id: 3, action: "New public CV created", target: "Product Designer CV", time: "1 hour ago", icon: Globe, bg: "bg-emerald-500/20", color: "text-emerald-400" },
    { id: 4, action: "CV downloaded", target: "Data Analyst CV", time: "3 hours ago", icon: Download, bg: "bg-amber-500/20", color: "text-amber-400" },
  ];

  const insights = [
    "Your ATS score is above average. Optimize keywords to reach 90%+",
    "Add more quantifiable achievements to increase interview rate",
    "React and Node.js skills are in high demand for your role",
    "Share your CV on LinkedIn to increase profile reach",
  ];

  const heatmapData = Array.from({ length: 7 }, (_, i) => 
    Array.from({ length: 24 }, (_, j) => Math.floor(Math.random() * 10))
  );

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="flex h-screen overflow-hidden bg-[#070B14] text-white selection:bg-indigo-500/30">
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-[230px] flex-shrink-0 border-r border-white/5 bg-[#0A0D14] flex-col justify-between overflow-y-auto custom-scrollbar z-20">
        <div>
          <div className="flex items-center gap-2 p-4 pb-2">
            <div className="bg-white/10 p-1.5 rounded-lg">
              <FileCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">ProCV Lite</span>
            <Menu className="w-5 h-5 ml-auto text-gray-400 cursor-pointer hover:text-white" />
          </div>

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
              <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-medium shadow-lg shadow-indigo-500/20 transition-colors">
                <BarChart2 className="w-4 h-4" /> Insights & Analytics
              </button>
            </div>

            <div>
              <div className="text-[9px] font-bold text-gray-500 mb-1.5 px-2 uppercase tracking-wider">Manage</div>
              <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
                <User className="w-4 h-4" /> My Profile
              </button>
              <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
                <Settings className="w-4 h-4" /> Settings
              </button>
            </div>
          </div>
        </div>

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
      <main className="flex-1 overflow-y-auto bg-[#070B14] p-6 custom-scrollbar">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Insights & Analytics</h1>
            <p className="text-gray-400 text-xs">Track your CV performance and get actionable insights to grow your career.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/builder')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-all text-xs shadow-lg shadow-indigo-500/20">
              <PlusSquare className="w-4 h-4" /> Create New CV
            </button>
            <NotificationDropdown />
            <ProfileDropdown />
          </div>
        </div>

        <div className="flex items-center justify-end mb-6">
           <button className="flex items-center gap-2 text-[11px] font-medium text-gray-400 bg-[#111622] border border-white/5 px-3 py-1.5 rounded-lg hover:text-white transition-colors">
              <Download className="w-3.5 h-3.5" /> Export Report
           </button>
        </div>

        {/* TOP STATS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {[
            { label: "Total CV Views", val: "1,248", trend: "+18.6%", icon: Eye, color: "text-indigo-400", bg: "bg-indigo-500/10" },
            { label: "Downloads", val: "486", trend: "+12.3%", icon: Download, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Avg. ATS Score", val: "84%", trend: "+6.2%", icon: Award, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Interview Rate", val: "22%", trend: "+8.4%", icon: User, color: "text-purple-400", bg: "bg-purple-500/10" },
            { label: "Profile Reach", val: "932", trend: "+15.7%", icon: Target, color: "text-sky-400", bg: "bg-sky-500/10" },
            { label: "AI Usage Time", val: "18.6 hrs", trend: "+9.1%", icon: Clock, color: "text-teal-400", bg: "bg-teal-500/10" },
          ].map((s, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-[#111622] border border-white/5 rounded-xl p-3.5 relative overflow-hidden group hover:border-white/10 transition-colors min-w-0"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`${s.bg} ${s.color} p-1.5 rounded-lg`}>
                  <s.icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-medium text-gray-400">{s.label}</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xl font-bold mb-1">{s.val}</div>
                  <div className="text-[9px] text-emerald-400 font-semibold flex items-center gap-0.5">
                    {s.trend} <span className="text-gray-500 font-normal">vs last 30 days</span>
                  </div>
                </div>
                <div className="h-8 w-16 opacity-30 group-hover:opacity-60 transition-opacity">
                  {isMounted && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceData}>
                        <Area type="monotone" dataKey="views" stroke={s.color.includes('indigo') ? '#6366f1' : '#3b82f6'} fill={s.color.includes('indigo') ? '#6366f1' : '#3b82f6'} fillOpacity={0.2} strokeWidth={1} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* MIDDLE ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Performance Trend */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-1 lg:col-span-6 bg-[#111622] border border-white/5 rounded-2xl p-5 relative min-w-0"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold">Performance Trend</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 text-[10px] font-medium text-gray-400">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> CV Views</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Downloads</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> ATS Score (%)</div>
                </div>
                <div className="relative">
                  <button className="flex items-center gap-2 text-[10px] bg-[#1e2336] border border-white/5 px-3 py-1.5 rounded-lg text-gray-300">
                    Last 30 Days <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
            <div className="h-[240px] w-full">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e2336', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '11px' }}
                    itemStyle={{ padding: '2px 0' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: '#6366f1' }} activeDot={{ r: 5 }} />
                  <Line yAxisId="left" type="monotone" dataKey="downloads" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} activeDot={{ r: 5 }} />
                  <Line yAxisId="right" type="monotone" dataKey="ats" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Top Performing CVs */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-1 lg:col-span-3 bg-[#111622] border border-white/5 rounded-2xl p-5 min-w-0"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold">Top Performing CVs</h3>
              <button className="text-[10px] text-indigo-400 font-semibold hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {topCvs.map((cv, i) => (
                <div key={cv.id} className="flex items-center gap-3 group">
                  <div className="w-5 h-5 flex items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-[9px] font-bold">
                    {i + 1}
                  </div>
                  <div className="w-10 h-12 bg-white rounded-md overflow-hidden flex-shrink-0">
                    <img src={cv.img} alt={cv.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-[11px] font-bold truncate">{cv.title}</div>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold">{cv.views}</span>
                        <span className="text-[8px] text-gray-500">Views</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold">{cv.downloads}</span>
                        <span className="text-[8px] text-gray-500">Downloads</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-bold text-emerald-400">{cv.ats}%</div>
                    <div className="text-[8px] text-gray-500">ATS Score</div>
                    <div className="text-[8px] text-emerald-400 mt-1 uppercase font-bold tracking-wider">Public</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Engagement Overview */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-1 lg:col-span-3 bg-[#111622] border border-white/5 rounded-2xl p-5 min-w-0"
          >
            <h3 className="text-sm font-semibold mb-6">Engagement Overview</h3>
            <div className="h-[140px] w-full relative">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={engagementData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {engagementData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center mt-[-5px]">
                <div className="text-lg font-bold">1,248</div>
                <div className="text-[8px] text-gray-500">Total Views</div>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              {engagementData.map((e, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }}></div>
                    <span className="text-[10px] text-gray-400">{e.name}</span>
                  </div>
                  <span className="text-[10px] font-bold">{e.value}%</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-white/5">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-gray-400">Public vs Private CVs</span>
                  <span className="text-[10px] font-bold">78% <span className="text-gray-500">Public CVs</span></span>
               </div>
               <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden flex">
                  <div className="h-full bg-indigo-500" style={{ width: '78%' }}></div>
                  <div className="h-full bg-purple-500" style={{ width: '22%' }}></div>
               </div>
               <div className="flex justify-between mt-1.5">
                  <span className="text-[8px] text-gray-500">78% Public CVs</span>
                  <span className="text-[8px] text-gray-500 text-right">22% Private CVs</span>
               </div>
            </div>
          </motion.div>
        </div>

        {/* BOTTOM SECTION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
           {/* Monthly Overview */}
           <div className="col-span-1 lg:col-span-3 space-y-4 min-w-0">
              <div className="bg-[#111622] border border-white/5 rounded-2xl p-4">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-semibold text-gray-300">Monthly Overview</h3>
                    <div className="text-[9px] bg-[#1e2336] px-2 py-1 rounded-lg text-gray-400">May 2024 <ChevronDown className="w-2 h-2 inline ml-1"/></div>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#0A0D14] p-3 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-indigo-400 mb-2">
                           <Eye className="w-3 h-3"/>
                           <span className="text-[8px] font-bold text-gray-500">CV Views</span>
                        </div>
                        <div className="text-sm font-bold">1,248 <span className="text-[8px] text-red-500">-62%</span></div>
                        <div className="text-[7px] text-gray-600">vs Apr 2024</div>
                    </div>
                    <div className="bg-[#0A0D14] p-3 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-blue-400 mb-2">
                           <Download className="w-3.5 h-3.5"/>
                           <span className="text-[8px] font-bold text-gray-500">Downloads</span>
                        </div>
                        <div className="text-sm font-bold">486 <span className="text-[8px] text-emerald-500">+60%</span></div>
                        <div className="text-[7px] text-gray-600">vs Apr 2024</div>
                    </div>
                    <div className="bg-[#0A0D14] p-3 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-emerald-400 mb-2">
                           <Target className="w-3 h-3"/>
                           <span className="text-[8px] font-bold text-gray-500">ATS Score</span>
                        </div>
                        <div className="text-sm font-bold">84% <span className="text-[8px] text-red-500">-9%</span></div>
                        <div className="text-[7px] text-gray-600">vs Apr 2024</div>
                    </div>
                    <div className="bg-[#0A0D14] p-3 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-purple-400 mb-2">
                           <User className="w-3 h-3"/>
                           <span className="text-[8px] font-bold text-gray-500">Interview Rate</span>
                        </div>
                        <div className="text-sm font-bold">22% <span className="text-[8px] text-emerald-500">+5%</span></div>
                        <div className="text-[7px] text-gray-600">vs Apr 2024</div>
                    </div>
                 </div>
              </div>
              <div className="bg-[#111622] border border-white/5 rounded-2xl p-4">
                 <h3 className="text-xs font-semibold text-gray-300 mb-4">ATS Score Distribution</h3>
                 <div className="flex items-center gap-4">
                    <div className="w-24 h-24 relative">
                       {isMounted && (
                         <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                              <Pie data={atsScoreData} innerRadius={30} outerRadius={45} paddingAngle={2} dataKey="value">
                                 {atsScoreData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                              </Pie>
                           </PieChart>
                         </ResponsiveContainer>
                       )}
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xs font-bold">84%</span>
                          <span className="text-[6px] text-gray-500">Average</span>
                       </div>
                    </div>
                    <div className="flex-1 space-y-1.5">
                       {atsScoreData.map((s, i) => (
                          <div key={i} className="flex items-center justify-between">
                             <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }}></div>
                                <span className="text-[8px] text-gray-400">{s.name}</span>
                             </div>
                             <span className="text-[8px] font-bold">{s.value}%</span>
                          </div>
                       ))}
                    </div>
                 </div>
                 <button className="w-full text-[8px] text-indigo-400 font-semibold text-center mt-4 flex items-center justify-center gap-1 hover:underline">
                    View Full Analysis <ArrowRight className="w-2 h-2"/>
                 </button>
              </div>
           </div>

           {/* Skills & Heatmap Column */}
           <div className="col-span-1 lg:col-span-4 space-y-4 min-w-0">
              <div className="bg-[#111622] border border-white/5 rounded-2xl p-5">
                 <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-semibold">Top Skills In Demand</h3>
                    <button className="text-[10px] text-indigo-400 font-semibold">View All</button>
                 </div>
                 <div className="space-y-4">
                    {skillsData.map((s, i) => (
                       <div key={i} className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                             <span className="text-gray-400 font-medium">{s.name}</span>
                             <span className="font-bold">{s.value}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${s.value}%` }}
                               transition={{ duration: 1, delay: i * 0.1 }}
                               className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                             ></motion.div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="bg-[#111622] border border-white/5 rounded-2xl p-5">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold">Recruiter Engagement Heatmap</h3>
                    <div className="text-[9px] text-gray-500">Last 30 Days <ChevronDown className="w-2 h-2 inline ml-1"/></div>
                 </div>
                 <div className="flex gap-1">
                    <div className="flex flex-col justify-between text-[8px] text-gray-500 py-1 pr-1 h-[100px]">
                       {days.map(d => <span key={d}>{d}</span>)}
                    </div>
                    <div className="flex-1 grid grid-cols-24 gap-0.5 h-[100px]">
                       {heatmapData.flat().map((v, i) => (
                          <div key={i} className={`rounded-[1px] ${v > 8 ? 'bg-indigo-500' : v > 5 ? 'bg-indigo-700' : v > 2 ? 'bg-indigo-900' : 'bg-white/5'}`}></div>
                       ))}
                    </div>
                 </div>
                 <div className="flex items-center justify-between mt-3 px-6">
                    <div className="flex items-center gap-4 text-[8px] text-gray-500">
                       <span>12AM</span><span>4AM</span><span>8AM</span><span>12PM</span><span>4PM</span><span>8PM</span><span>12AM</span>
                    </div>
                 </div>
                 <div className="flex items-center justify-between mt-3">
                    <span className="text-[8px] text-gray-500">Low Engagement</span>
                    <div className="flex-1 mx-4 h-1 bg-gradient-to-r from-white/5 via-indigo-900 to-indigo-500 rounded-full"></div>
                    <span className="text-[8px] text-gray-500">High Engagement</span>
                 </div>
              </div>
           </div>

           {/* Activity & Radar & AI Recommendations */}
           <div className="col-span-1 lg:col-span-5 space-y-4 min-w-0">
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-[#111622] border border-white/5 rounded-2xl p-5">
                    <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                       {recentActivity.map((a, i) => (
                          <div key={i} className="flex items-start gap-3">
                             <div className={`w-7 h-7 rounded-lg ${a.bg} ${a.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                <a.icon className="w-3.5 h-3.5"/>
                             </div>
                             <div className="flex-1 overflow-hidden">
                                <div className="text-[10px] font-bold truncate text-gray-200">{a.action}</div>
                                <div className="text-[9px] text-gray-500 truncate">{a.target}</div>
                             </div>
                             <div className="text-[8px] text-gray-600 whitespace-nowrap mt-1">{a.time}</div>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-[#111622] border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-sm font-semibold">Growth Summary</h3>
                    </div>
                    <div className="h-[120px] w-full">
                       {isMounted && (
                         <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={growthData}>
                               <PolarGrid stroke="#ffffff10" />
                               <PolarAngleAxis dataKey="subject" stroke="#ffffff30" fontSize={8} />
                               <Radar name="Performance" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                            </RadarChart>
                         </ResponsiveContainer>
                       )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                       <div className="flex items-center justify-between text-[9px]">
                          <span className="text-gray-400">Views</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-0.5"><ArrowUpRight className="w-2 h-2"/> 18.6%</span>
                       </div>
                       <div className="flex items-center justify-between text-[9px]">
                          <span className="text-gray-400">Downloads</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-0.5"><ArrowUpRight className="w-2 h-2"/> 12.3%</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-gradient-to-br from-[#111622] to-[#1e2336] border border-indigo-500/20 rounded-2xl p-5 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Sparkles className="w-16 h-16 text-indigo-400"/>
                 </div>
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                       <Lightbulb className="w-4 h-4 text-amber-400"/>
                       <h3 className="text-sm font-bold">Insights & Recommendations</h3>
                    </div>
                    <span className="text-[9px] bg-indigo-600/20 text-indigo-400 px-2 py-0.5 rounded-full font-bold">AI Powered</span>
                 </div>
                 <div className="space-y-3">
                    {insights.map((text, i) => (
                       <div key={i} className="flex items-start gap-2.5">
                          <Zap className="w-3 h-3 text-indigo-400 mt-1 flex-shrink-0"/>
                          <p className="text-[11px] text-gray-300 leading-relaxed">{text}</p>
                       </div>
                    ))}
                 </div>
                 <button className="w-full text-[10px] text-indigo-400 font-bold text-center mt-6 flex items-center justify-center gap-1.5 hover:underline bg-white/5 py-2 rounded-xl border border-white/5">
                    View All Recommendations <ArrowRight className="w-3 h-3"/>
                 </button>
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
        .grid-cols-24 {
           grid-template-columns: repeat(24, minmax(0, 1fr));
        }
      `}</style>
    </div>
  );
}
