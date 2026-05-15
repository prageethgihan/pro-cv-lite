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
  Search,
  LayoutGrid,
  List,
  Heart,
  Star,
  LayoutList,
  Briefcase,
  GraduationCap,
  MonitorSmartphone,
  Palette,
  CheckCircle2,
  Lightbulb,
  ChevronRight,
  Menu,
  X
} from "lucide-react";

import Template1 from "../templates/Template1";
import Template2 from "../templates/Template2";
import Template3 from "../templates/Template3";
import Template4 from "../templates/Template4";
import Template5 from "../templates/Template5";
import Template6 from "../templates/Template6";
import { fakePreviewData } from "../data/templatePreviewData";
import ProfileDropdown from "../components/ProfileDropdown";
import NotificationDropdown from "../components/NotificationDropdown";

function TemplateThumbnail({ templateId }) {
  const containerRef = React.useRef(null);
  const [scale, setScale] = React.useState(0.25);

  React.useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setScale(entry.contentRect.width / 794);
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const Tpl = {
    t1: Template1,
    t2: Template2,
    t3: Template3,
    t4: Template4,
    t5: Template5,
    t6: Template6,
  }[templateId];

  if (!Tpl) return null;

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-white pointer-events-none rounded-2xl">
      <div 
        className="absolute top-0 left-0 w-[794px] origin-top-left" 
        style={{ transform: `scale(${scale})` }}
      >
        <Tpl cv={fakePreviewData} />
      </div>
    </div>
  );
}

function TemplatePreviewFull({ templateId }) {
  const containerRef = React.useRef(null);
  const cvRef = React.useRef(null);
  const [scale, setScale] = React.useState(1);
  const [cvHeight, setCvHeight] = React.useState(1123);

  React.useEffect(() => {
    const calculateScale = () => {
      if (containerRef.current && cvRef.current) {
        const containerH = containerRef.current.clientHeight;
        const containerW = containerRef.current.clientWidth;
        
        // Wait for fonts/content to render to get accurate height
        const actualCvHeight = cvRef.current.offsetHeight || 1123;
        setCvHeight(actualCvHeight);
        
        const scaleH = containerH / actualCvHeight;
        const scaleW = containerW / 794;

        // Leave a tiny 2% gap so it doesn't touch the very edges
        setScale(Math.min(scaleH, scaleW) * 0.98); 
      }
    };

    calculateScale();
    window.addEventListener("resize", calculateScale);
    // Timeout to recalculate after layout/fonts settle
    const timer = setTimeout(calculateScale, 150);

    return () => {
      window.removeEventListener("resize", calculateScale);
      clearTimeout(timer);
    };
  }, [templateId]);

  const Tpl = {
    t1: Template1,
    t2: Template2,
    t3: Template3,
    t4: Template4,
    t5: Template5,
    t6: Template6,
  }[templateId];

  if (!Tpl) return null;

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden">
      <div 
        style={{ 
          width: `${794 * scale}px`, 
          height: `${cvHeight * scale}px`,
          position: 'relative'
        }}
        className="rounded-xl overflow-hidden shadow-2xl border border-white/10 transition-all duration-300"
      >
        <div 
          ref={cvRef}
          className="w-[794px] absolute top-0 left-0 origin-top-left bg-white pointer-events-none" 
          style={{ transform: `scale(${scale})` }}
        >
          <Tpl cv={fakePreviewData} />
        </div>
      </div>
    </div>
  );
}

export default function Templates() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeCategory, setActiveCategory] = useState("All Templates");
  const [activeColor, setActiveColor] = useState("All Colors");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [tipStartIndex, setTipStartIndex] = useState(0);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const [favoriteTemplates, setFavoriteTemplates] = useState(() => {
    try {
      const saved = localStorage.getItem("favorite_templates");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (e, id) => {
    e.stopPropagation(); // prevent card click if we ever add it
    setFavoriteTemplates(prev => {
      const newFavs = prev.includes(id) 
        ? prev.filter(favId => favId !== id)
        : [...prev, id];
      localStorage.setItem("favorite_templates", JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const userFullName = user?.displayName || "Prageeth Gihan";
  const userEmail = user?.email || "prageethgihan55@gmail.com";

  const templatesData = [
    {
      id: 1,
      name: "Modern Professional",
      desc: "Clean modern design for all industries.",
      badge: "Popular",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/20",
      categories: ["Professional", "Modern", "ATS Friendly"],
      colors: ["blue", "violet"],
    },
    {
      id: 2,
      name: "Minimal CV",
      desc: "Simple elegant minimalist layout.",
      badge: "",
      badgeColor: "",
      categories: ["Minimalist", "ATS Friendly"],
      colors: ["slate", "blue"],
    },
    {
      id: 3,
      name: "Creative Designer",
      desc: "Perfect for designers & creatives.",
      badge: "New",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/20",
      categories: ["Creative", "Modern"],
      colors: ["emerald", "rose"],
    },
    {
      id: 4,
      name: "Executive Resume",
      desc: "Professional corporate resume design.",
      badge: "",
      badgeColor: "",
      categories: ["Professional", "ATS Friendly"],
      colors: ["slate", "blue"],
    },
    {
      id: 5,
      name: "Tech Focused",
      desc: "Built for developers & engineers.",
      badge: "",
      badgeColor: "",
      categories: ["Modern", "Professional", "ATS Friendly"],
      colors: ["blue", "emerald"],
    },
    {
      id: 6,
      name: "Sri Lankan Academic",
      desc: "ATS optimized academic template.",
      badge: "Featured",
      badgeColor: "bg-pink-500/20 text-pink-300 border border-pink-500/20",
      categories: ["Academic", "ATS Friendly"],
      colors: ["blue", "slate"],
    },
  ];

  const categories = [
    { name: "All Templates", count: templatesData.length, icon: LayoutGrid },
    { name: "Professional", count: templatesData.filter(t => t.categories.includes("Professional")).length, icon: Briefcase },
    { name: "Academic", count: templatesData.filter(t => t.categories.includes("Academic")).length, icon: GraduationCap },
    { name: "Modern", count: templatesData.filter(t => t.categories.includes("Modern")).length, icon: MonitorSmartphone },
    { name: "Creative", count: templatesData.filter(t => t.categories.includes("Creative")).length, icon: Palette },
    { name: "Minimalist", count: templatesData.filter(t => t.categories.includes("Minimalist")).length, icon: LayoutList },
    { name: "ATS Friendly", count: templatesData.filter(t => t.categories.includes("ATS Friendly")).length, icon: CheckCircle2 },
  ];

  const filteredTemplates = templatesData.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All Templates" || t.categories.includes(activeCategory);
    const matchesColor = activeColor === "All Colors" || t.colors.includes(activeColor.toLowerCase());
    return matchesSearch && matchesCategory && matchesColor;
  });

  const allTips = [
    { text: "Use ATS-friendly templates to increase your chances.", icon: CheckCircle2 },
    { text: "Choose a layout matching your industry.", icon: LayoutTemplate },
    { text: "Keep your CV clean and professional.", icon: Sparkles },
    { text: "Ensure your contact details are up to date and professional.", icon: User },
    { text: "Keep descriptions concise; use bullet points over paragraphs.", icon: List },
    { text: "Quantify your achievements with numbers wherever possible.", icon: BarChart2 },
    { text: "Save your CV as a PDF to preserve formatting.", icon: FileText },
    { text: "Tailor your skills section to the specific job.", icon: PenTool },
    { text: "Proofread your resume multiple times to avoid errors.", icon: CheckCircle2 },
  ];

  const currentTips = allTips.slice(tipStartIndex, tipStartIndex + 3);

  const handleNextTips = () => {
    setTipStartIndex((prev) => (prev + 3) >= allTips.length ? 0 : prev + 3);
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
                <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-medium shadow-lg shadow-indigo-500/20 transition-colors">
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
      <main className="flex-1 overflow-y-auto bg-[#070B14] p-8">

        {/* HEADER */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">

          <div>
            <h1 className="mb-2 text-4xl font-bold">
              Templates
            </h1>

            <p className="text-sm text-gray-400">
              Choose a professional template for your next CV.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">

            <button
              onClick={() => navigate("/builder")}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:scale-[1.02]"
            >
              <PlusSquare className="h-4 w-4" />
              Create New CV
            </button>

            <NotificationDropdown />
            <ProfileDropdown />
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT */}
          <div className="flex-1 space-y-6">

            {/* SEARCH */}
            <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/5 bg-[#111827] p-3">

              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl bg-[#0A0D14] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-gray-500"
                />
              </div>

              <div className="relative">
                <select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="appearance-none flex items-center gap-2 rounded-xl border border-white/5 bg-[#0A0D14] px-4 py-3 pr-10 text-sm text-gray-300 outline-none cursor-pointer"
                >
                  {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-gray-400" />
              </div>

              <div className="relative">
                <select
                  value={activeColor}
                  onChange={(e) => setActiveColor(e.target.value)}
                  className="appearance-none flex items-center gap-2 rounded-xl border border-white/5 bg-[#0A0D14] px-4 py-3 pr-10 text-sm text-gray-300 outline-none cursor-pointer"
                >
                  <option value="All Colors">All Colors</option>
                  <option value="Blue">Blue</option>
                  <option value="Violet">Violet</option>
                  <option value="Emerald">Emerald</option>
                  <option value="Rose">Rose</option>
                  <option value="Slate">Slate</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-gray-400" />
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-[#0A0D14] p-2">
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`rounded-lg p-2 ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>

                <button 
                  onClick={() => setViewMode("list")}
                  className={`rounded-lg p-2 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* FEATURED BANNER */}
            <div className="relative overflow-hidden rounded-[28px] border border-indigo-500/20 bg-gradient-to-br from-[#111827] via-[#140F2D] to-[#1B1140] p-5 shadow-[0_0_60px_rgba(79,70,229,0.18)]">

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.25),transparent_35%)]"></div>

              <div className="absolute bottom-[-120px] right-[-120px] h-[320px] w-[320px] rounded-full bg-violet-600/20 blur-3xl"></div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">

                {/* LEFT */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-8">

                  {/* PREVIEW */}
                  <div className="w-[160px] aspect-[21/29.7] flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl">
                    <TemplateThumbnail templateId="t6" />
                  </div>

                  {/* TEXT */}
                  <div className="max-w-[520px]">

                    <div className="mb-3 flex items-center gap-2 text-violet-300">
                      <Star className="h-4 w-4 fill-violet-400 text-violet-400" />

                      <span className="text-xs font-bold uppercase tracking-[0.2em]">
                        Featured Template
                      </span>
                    </div>

                    <h2 className="mb-3 text-[28px] font-extrabold leading-[1.05] tracking-tight text-white">
                      Sri Lankan Academic
                    </h2>

                    <p className="mb-4 text-[14px] leading-6 text-gray-300">
                      An ATS-optimized template customized with specific sections
                      like O/L and A/L results, tailored for the Sri Lankan job market.
                    </p>

                    {/* TAGS */}
                    <div className="mb-4 flex flex-wrap items-center gap-2">

                      <span className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                        ATS Friendly
                      </span>

                      <span className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-400">
                        <Sparkles className="h-4 w-4" />
                        Easy to Customize
                      </span>

                      <span className="flex items-center gap-2 rounded-xl border border-pink-500/20 bg-pink-500/10 px-3 py-1.5 text-xs font-semibold text-pink-400">
                        <Heart className="h-4 w-4" />
                        Professional Design
                      </span>
                    </div>

                    {/* BUTTONS */}
                    <div className="flex items-center gap-4">

                      <button
                        onClick={() => navigate("/builder", { state: { templateId: 't6' } })}
                        className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:scale-[1.03]"
                      >
                        Use This Template
                      </button>

                      <button
                        onClick={() => setPreviewTemplate("t6")}
                        className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                </div>

                {/* RIGHT GLOW */}
                <div className="hidden xl:flex items-center justify-center">

                  <div className="relative flex h-[190px] w-[190px] items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-2xl">

                    <div className="absolute h-[130px] w-[130px] rounded-[40px] bg-gradient-to-br from-violet-500 to-indigo-600 opacity-90 blur-[1px]"></div>

                    <div className="relative rotate-[-10deg] rounded-[28px] border border-white/10 bg-[#8B5CF6] p-4 shadow-2xl">

                      <div className="space-y-2">
                        <div className="h-2 w-12 rounded-full bg-white/90"></div>
                        <div className="h-2 w-14 rounded-full bg-white/70"></div>
                        <div className="h-9 w-9 rounded-2xl bg-white/30"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TEMPLATES */}
            <div>

              <h2 className="mb-5 text-2xl font-bold">
                All Templates
              </h2>

              {filteredTemplates.length > 0 ? (
                <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col gap-4"}>

                  {filteredTemplates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className={`group rounded-2xl border border-white/5 bg-[#111827] p-3 transition hover:border-indigo-500/20 ${viewMode === 'list' ? 'flex items-center gap-5' : ''}`}
                    >

                      {/* IMAGE */}
                      <div className={`relative overflow-hidden rounded-2xl border border-white/5 bg-white ${viewMode === 'list' ? 'w-[120px] mb-0 flex-shrink-0' : 'mb-4'}`}>

                        <button 
                          onClick={(e) => toggleFavorite(e, tpl.id)}
                          className={`absolute right-3 top-3 z-10 rounded-full p-2 transition ${
                            favoriteTemplates.includes(tpl.id)
                              ? "bg-rose-500/90 opacity-100"
                              : "bg-black/40 opacity-0 group-hover:opacity-100 hover:bg-black/60"
                          }`}
                        >
                          <Heart className={`h-4 w-4 text-white ${favoriteTemplates.includes(tpl.id) ? "fill-white" : ""}`} />
                        </button>

                        <div className={`flex w-full h-full ${viewMode === 'list' ? 'aspect-[1/1.4]' : 'aspect-[1/1.2]'}`}>
                          <TemplateThumbnail templateId={`t${tpl.id}`} />
                        </div>
                      </div>

                      {/* INFO */}
                      <div className={viewMode === 'list' ? 'flex-1 py-2 flex flex-col h-full' : ''}>
                        <div className="mb-2 flex items-center gap-2">

                          <h3 className="flex-1 text-sm font-semibold">
                            {tpl.name}
                          </h3>

                          {tpl.badge && (
                            <span
                              className={`rounded-lg px-2 py-1 text-[10px] font-bold ${tpl.badgeColor}`}
                            >
                              {tpl.badge}
                            </span>
                          )}
                        </div>

                        <p className={`text-xs leading-6 text-gray-400 ${viewMode === 'list' ? 'mb-auto' : 'mb-4'}`}>
                          {tpl.desc}
                        </p>

                        <div className={`flex items-center justify-between ${viewMode === 'list' ? 'mt-4' : ''}`}>
                          {/* COLORS */}
                          <div className="flex items-center gap-2">
                            {tpl.colors.includes('blue') && <div className="h-3 w-3 rounded-full bg-blue-500"></div>}
                            {tpl.colors.includes('violet') && <div className="h-3 w-3 rounded-full bg-violet-500"></div>}
                            {tpl.colors.includes('emerald') && <div className="h-3 w-3 rounded-full bg-emerald-500"></div>}
                            {tpl.colors.includes('rose') && <div className="h-3 w-3 rounded-full bg-rose-500"></div>}
                            {tpl.colors.includes('slate') && <div className="h-3 w-3 rounded-full bg-slate-500"></div>}
                          </div>

                          {viewMode === 'list' && (
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => setPreviewTemplate(`t${tpl.id}`)}
                                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white"
                              >
                                Preview
                              </button>

                              <button
                                onClick={() => navigate("/builder", { state: { templateId: `t${tpl.id}` } })}
                                className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                              >
                                Use
                              </button>
                            </div>
                          )}
                        </div>

                        {/* BUTTONS for GRID VIEW */}
                        {viewMode === 'grid' && (
                          <div className="grid grid-cols-2 gap-3 mt-4">

                            <button 
                              onClick={() => setPreviewTemplate(`t${tpl.id}`)}
                              className="rounded-xl border border-white/10 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white"
                            >
                              Preview
                            </button>

                            <button
                              onClick={() => navigate("/builder", { state: { templateId: `t${tpl.id}` } })}
                              className="rounded-xl bg-indigo-600 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                            >
                              Use
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#111827] py-20 text-center">
                  <LayoutTemplate className="mb-4 h-12 w-12 text-gray-600" />
                  <h3 className="mb-2 text-lg font-semibold text-white">No templates found</h3>
                  <p className="text-sm text-gray-400">Try adjusting your filters or search query.</p>
                  <button 
                    onClick={() => {
                      setSearchQuery("");
                      setActiveCategory("All Templates");
                      setActiveColor("All Colors");
                    }}
                    className="mt-6 rounded-xl bg-indigo-600/20 px-4 py-2 text-sm font-medium text-indigo-400 transition hover:bg-indigo-600/30"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="w-full lg:w-[290px] flex-shrink-0 space-y-5">

            {/* CATEGORIES */}
            <div className="rounded-3xl border border-white/5 bg-[#111827] p-5">

              <h2 className="mb-5 text-lg font-semibold">
                Template Categories
              </h2>

              <div className="space-y-2">

                {categories.map((cat, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      setActiveCategory(cat.name)
                    }
                    className={`flex w-full items-center justify-between rounded-2xl p-3 text-sm transition ${
                      activeCategory === cat.name
                        ? "border border-indigo-500/20 bg-indigo-600/20 text-indigo-300"
                        : "text-gray-300 hover:bg-white/5"
                    }`}
                  >

                    <div className="flex items-center gap-3">
                      <cat.icon className="h-4 w-4" />
                      {cat.name}
                    </div>

                    <span className="text-xs font-bold">
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* TIPS */}
            <div className="rounded-3xl border border-white/5 bg-[#111827] p-5">

              <div className="mb-5 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-indigo-400" />

                <h2 className="text-lg font-semibold">
                  Template Tips
                </h2>
              </div>

              <div className="space-y-5">
                {currentTips.map((tip, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20">
                      <tip.icon className="h-4 w-4 text-indigo-400" />
                    </div>

                    <p className="text-sm leading-6 text-gray-400">
                      {tip.text}
                    </p>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleNextTips}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/5 hover:text-white"
              >
                Learn More Tips
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* PREVIEW MODAL */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-5xl h-[95vh] bg-[#111827] rounded-3xl border border-white/10 flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#0A0D14]">
              <h3 className="text-lg font-bold text-white pl-2">Template Preview</h3>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate("/builder", { state: { templateId: previewTemplate } })}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-indigo-500/20"
                >
                  Use Template
                </button>
                <button 
                  onClick={() => setPreviewTemplate(null)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 bg-[#070B14] p-4 sm:p-8 flex items-center justify-center overflow-hidden">
              <TemplatePreviewFull templateId={previewTemplate} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}