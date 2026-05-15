import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { 
  LayoutDashboard, FileText, PlusSquare, LayoutTemplate, PenTool, 
  FileCheck, Sparkles, MessageSquare, FileSignature, BarChart2, 
  User, Settings, Sun, Moon, Bell, ChevronDown, Search,
  LayoutGrid, List, Heart, Star, LayoutList, Briefcase, GraduationCap, 
  MonitorSmartphone, Palette, CheckCircle2, Lightbulb, ChevronRight, Menu 
} from "lucide-react";

export default function Templates() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All Templates");

  const userName = user?.displayName?.split(' ')[0] || "Prageeth";
  const userFullName = user?.displayName || "Prageeth Gihan";
  const userEmail = user?.email || "prageethgihan55@gmail.com";

  const categories = [
    { name: "All Templates", count: 12, icon: LayoutGrid },
    { name: "Professional", count: 4, icon: Briefcase },
    { name: "Academic", count: 3, icon: GraduationCap },
    { name: "Modern", count: 3, icon: MonitorSmartphone },
    { name: "Creative", count: 2, icon: Palette },
    { name: "Minimalist", count: 2, icon: LayoutList },
    { name: "ATS Friendly", count: 12, icon: CheckCircle2 },
  ];

  const templates = [
    { id: 1, name: "Modern Professional", desc: "Clean and modern design suitable for all professions.", badge: "Popular", badgeColor: "bg-indigo-600/20 text-indigo-400" },
    { id: 2, name: "Minimalist", desc: "Simple and minimal design with focus on content.", badge: "", badgeColor: "" },
    { id: 3, name: "Creative Designer", desc: "Perfect for designers and creative professionals.", badge: "", badgeColor: "" },
    { id: 4, name: "Executive", desc: "Professional design for senior level positions.", badge: "", badgeColor: "" },
    { id: 5, name: "Sri Lankan Academic", desc: "Optimized for academic and research positions.", badge: "New", badgeColor: "bg-emerald-500/20 text-emerald-400" },
    { id: 6, name: "Tech Focused", desc: "Ideal for developers and tech professionals.", badge: "", badgeColor: "" },
    { id: 7, name: "Two Column", desc: "Classic two column layout for easy readability.", badge: "", badgeColor: "" },
    { id: 8, name: "Infographic", desc: "Visual and creative layout to stand out.", badge: "", badgeColor: "" },
    { id: 9, name: "Simple Clean", desc: "Clean and elegant design for any industry.", badge: "", badgeColor: "" },
    { id: 10, name: "Classic Professional", desc: "Traditional and professional template for all fields.", badge: "", badgeColor: "" },
  ];

  const popular = [
    { rank: 1, name: "Modern Professional", uses: "2.4K uses" },
    { rank: 2, name: "Sri Lankan Academic", uses: "1.8K uses" },
    { rank: 3, name: "Minimalist", uses: "1.2K uses" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0D14] text-white font-sans selection:bg-indigo-500/30">
      
      {/* SIDEBAR */}
      <aside className="w-[260px] flex-shrink-0 border-r border-white/5 bg-[#0A0D14] flex flex-col justify-between overflow-y-auto custom-scrollbar">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 pb-4">
            <div className="bg-white/10 p-1.5 rounded-lg">
              <FileCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">ProCV Lite</span>
            <Menu className="w-5 h-5 ml-auto text-gray-400 cursor-pointer hover:text-white" />
          </div>

          {/* Profile */}
          <div className="px-4 mb-6">
            <div className="flex items-center gap-3 bg-[#111622] p-3 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Prageeth"} alt="User" className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-semibold truncate text-gray-200">{userFullName}</div>
                <div className="text-[10px] text-gray-500 truncate">{userEmail}</div>
              </div>
            </div>
          </div>

          <div className="px-4 space-y-6">
            {/* MAIN */}
            <div>
              <div className="text-[10px] font-bold text-gray-500 mb-2 px-2 uppercase tracking-wider">Main</div>
              <div className="space-y-1">
                <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </button>
                <button onClick={() => navigate('/my-cvs')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors">
                  <FileText className="w-4 h-4" /> My CVs
                </button>
                <button onClick={() => navigate('/builder')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors">
                  <PlusSquare className="w-4 h-4" /> Create New CV
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium transition-colors">
                  <LayoutTemplate className="w-4 h-4" /> Templates
                </button>
              </div>
            </div>

            {/* AI TOOLS */}
            <div>
              <div className="text-[10px] font-bold text-gray-500 mb-2 px-2 uppercase tracking-wider">AI Tools</div>
              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors">
                  <PenTool className="w-4 h-4" /> AI Writer
                  <span className="ml-auto text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-semibold">New</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors">
                  <FileCheck className="w-4 h-4" /> ATS Analyzer
                  <span className="ml-auto text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-semibold">New</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors">
                  <Sparkles className="w-4 h-4" /> Job Match
                  <span className="ml-auto text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-semibold">New</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors">
                  <MessageSquare className="w-4 h-4" /> Interview Questions
                  <span className="ml-auto text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-semibold">New</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors">
                  <FileSignature className="w-4 h-4" /> Cover Letter Generator
                </button>
              </div>
            </div>

            {/* ANALYTICS */}
            <div>
              <div className="text-[10px] font-bold text-gray-500 mb-2 px-2 uppercase tracking-wider">Analytics</div>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors">
                <BarChart2 className="w-4 h-4" /> Insights & Analytics
              </button>
            </div>

            {/* MANAGE */}
            <div>
              <div className="text-[10px] font-bold text-gray-500 mb-2 px-2 uppercase tracking-wider">Manage</div>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors">
                <User className="w-4 h-4" /> My Profile
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors">
                <Settings className="w-4 h-4" /> Settings
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Theme Toggle */}
        <div className="p-4 mt-6">
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
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Templates</h1>
            <p className="text-gray-400 text-sm">Choose a professional template for your next CV. All templates are ATS-friendly.</p>
          </div>
          <div className="flex items-center gap-5">
            <button onClick={() => navigate('/builder')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm shadow-[0_0_15px_rgba(79,70,229,0.3)]">
              <PlusSquare className="w-4 h-4" /> Create New CV
            </button>
            <button className="relative p-2.5 rounded-full bg-[#111622] border border-white/5 text-gray-300 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full text-[10px] flex items-center justify-center border-2 border-[#0A0D14] font-bold">3</span>
            </button>
            <div className="flex items-center gap-2 cursor-pointer">
              <img src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Prageeth"} alt="User" className="w-10 h-10 rounded-full border border-white/10" />
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex gap-6 items-start">
          
          {/* LEFT SIDE - TEMPLATES LIST */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Filters Bar */}
            <div className="flex items-center gap-4 bg-[#111622] p-2.5 rounded-2xl border border-white/5">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search templates..." 
                  className="w-full bg-transparent border-none py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none"
                />
              </div>
              <div className="h-6 w-px bg-white/10"></div>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                All Categories <ChevronDown className="w-4 h-4" />
              </button>
              <div className="h-6 w-px bg-white/10"></div>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                All Colors <ChevronDown className="w-4 h-4" />
              </button>
              <div className="h-6 w-px bg-white/10"></div>
              <div className="flex items-center gap-1 px-1">
                <button className="p-1.5 text-white bg-white/10 rounded-lg"><LayoutGrid className="w-4 h-4" /></button>
                <button className="p-1.5 text-gray-500 hover:text-white rounded-lg"><List className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Featured Template Banner */}
            <div className="relative rounded-3xl overflow-hidden border border-indigo-500/20 bg-gradient-to-r from-[#1E1140] to-[#25154E] p-6 flex gap-6">
              {/* Background abstract element (Map of Sri Lanka mockup) */}
              <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-full h-full text-yellow-500/40 fill-current" preserveAspectRatio="xMaxYMid meet">
                  {/* Simplified Sri Lanka map shape */}
                  <path d="M50 10 Q60 5 65 15 Q75 30 70 50 Q65 70 55 85 Q50 95 45 85 Q35 70 35 50 Q30 30 40 15 Q45 5 50 10 Z" />
                </svg>
              </div>
              
              <div className="w-[180px] flex-shrink-0 bg-white rounded-xl overflow-hidden shadow-2xl z-10 relative">
                {/* Thumbnail mockup */}
                <div className="h-[240px] flex">
                  <div className="w-1/3 bg-[#1e40af]"></div>
                  <div className="w-2/3 bg-white p-2">
                    <div className="h-1.5 bg-gray-200 w-1/2 rounded-full mb-3"></div>
                    <div className="h-1 bg-gray-200 w-full rounded-full mb-1"></div>
                    <div className="h-1 bg-gray-200 w-5/6 rounded-full mb-1"></div>
                    <div className="h-1 bg-gray-200 w-4/6 rounded-full mb-4"></div>
                    <div className="h-1.5 bg-gray-200 w-1/3 rounded-full mb-2"></div>
                    <div className="h-1 bg-gray-200 w-full rounded-full mb-1"></div>
                    <div className="h-1 bg-gray-200 w-full rounded-full mb-1"></div>
                    <div className="h-1 bg-gray-200 w-5/6 rounded-full"></div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-center z-10 relative pr-4">
                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                  <Star className="w-4 h-4 fill-indigo-400" />
                  <span className="text-xs font-bold tracking-wide uppercase">Featured Template</span>
                </div>
                <h2 className="text-2xl font-bold mb-3">Sri Lankan Academic Template</h2>
                <p className="text-sm text-indigo-100/70 mb-6 max-w-md leading-relaxed">
                  Specially designed for Sri Lankan students and academics. Perfect for local and international opportunities.
                </p>
                <div className="flex items-center gap-3">
                  <button onClick={() => navigate('/builder')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm">
                    Use Template
                  </button>
                  <button className="bg-black/30 hover:bg-black/50 text-white border border-white/10 px-5 py-2.5 rounded-xl font-medium transition-colors text-sm">
                    Preview
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 justify-center z-10 mr-4">
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ATS Friendly
                </span>
                <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5" /> Academic Focus
                </span>
                <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> Sri Lankan Format
                </span>
              </div>
            </div>

            {/* All Templates Header */}
            <div>
              <h2 className="text-lg font-bold mb-4">All Templates</h2>
              
              {/* Templates Grid */}
              <div className="grid grid-cols-5 gap-4">
                {templates.map(tpl => (
                  <div key={tpl.id} className="bg-[#111622] border border-white/5 rounded-2xl p-3 flex flex-col group hover:border-indigo-500/30 transition-all duration-300 relative">
                    <button className="absolute top-5 right-5 z-10 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm border border-white/10">
                      <Heart className="w-3.5 h-3.5 text-white" />
                    </button>
                    
                    {/* Thumbnail mock */}
                    <div className="w-full aspect-[1/1.4] bg-white rounded-xl border border-gray-200 overflow-hidden relative mb-3">
                      {/* Simple mock layout inside */}
                      <div className="absolute inset-2 space-y-1.5">
                        <div className="flex gap-2 mb-3">
                          <div className="w-5 h-5 bg-gray-300 rounded-sm flex-shrink-0"></div>
                          <div className="flex-1 space-y-1">
                             <div className="h-1.5 bg-gray-400 w-1/2 rounded-full"></div>
                             <div className="h-1 bg-gray-300 w-1/3 rounded-full"></div>
                          </div>
                        </div>
                        <div className="h-1 bg-gray-200 w-full rounded-full"></div>
                        <div className="h-1 bg-gray-200 w-5/6 rounded-full"></div>
                        <div className="h-1 bg-gray-200 w-full rounded-full mt-2"></div>
                        <div className="h-1 bg-gray-200 w-3/4 rounded-full"></div>
                        <div className="h-1 bg-gray-200 w-5/6 rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[13px] leading-tight flex-1">{tpl.name}</h3>
                      {tpl.badge && (
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${tpl.badgeColor}`}>
                          {tpl.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 leading-snug mb-3 line-clamp-2 min-h-[28px]">
                      {tpl.desc}
                    </p>
                    
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white/20"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-sky-400 border border-white/20"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-200 border border-white/20"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-800 border border-white/20"></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <button className="py-1.5 rounded-lg border border-white/10 text-[11px] font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors text-center">
                        Preview
                      </button>
                      <button onClick={() => navigate('/builder')} className="py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-medium transition-colors text-center">
                        Use
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          {/* RIGHT SIDE - SIDE PANELS */}
          <div className="w-[280px] flex-shrink-0 flex flex-col gap-5">
            
            {/* Categories */}
            <div className="bg-[#111622] border border-white/5 rounded-2xl p-5">
              <h2 className="text-[15px] font-semibold text-gray-100 mb-4">Template Categories</h2>
              <div className="flex flex-col gap-1.5">
                {categories.map((cat, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`flex items-center justify-between p-2.5 rounded-xl transition-colors text-sm ${activeCategory === cat.name ? 'bg-indigo-600/20 border border-indigo-500/20' : 'hover:bg-white/5 border border-transparent'}`}
                  >
                    <div className={`flex items-center gap-3 ${activeCategory === cat.name ? 'text-indigo-400 font-semibold' : 'text-gray-300 font-medium'}`}>
                      <cat.icon className="w-4 h-4" /> {cat.name}
                    </div>
                    <span className={`text-[11px] font-bold ${activeCategory === cat.name ? 'text-indigo-400' : 'text-gray-500'}`}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Most Popular */}
            <div className="bg-[#111622] border border-white/5 rounded-2xl p-5">
              <h2 className="text-[15px] font-semibold text-gray-100 mb-4">Most Popular</h2>
              <div className="flex flex-col gap-4 mb-4">
                {popular.map((item) => (
                  <div key={item.rank} className="flex items-center gap-3 group cursor-pointer">
                    <div className="text-[10px] font-bold text-gray-500 w-3">{item.rank}</div>
                    <div className="w-8 h-10 bg-white rounded flex-shrink-0 border border-gray-200"></div>
                    <div>
                      <div className="text-[13px] font-semibold text-gray-200 group-hover:text-indigo-400 transition-colors">{item.name}</div>
                      <div className="text-[11px] text-gray-500">{item.uses}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full py-2.5 rounded-xl border border-white/5 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                View All Popular
              </button>
            </div>

            {/* Tips */}
            <div className="bg-[#111622] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-[15px] text-gray-100">Template Tips</span>
              </div>
              <div className="flex flex-col gap-4 mb-5">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Lightbulb className="w-3 h-3 text-indigo-400" />
                  </div>
                  <div className="text-xs text-gray-400 leading-relaxed">
                    Choose a template that best suits your industry.
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                  </div>
                  <div className="text-xs text-gray-400 leading-relaxed">
                    Keep your CV clean and focused.
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <LayoutTemplate className="w-3 h-3 text-indigo-400" />
                  </div>
                  <div className="text-xs text-gray-400 leading-relaxed">
                    Use ATS-friendly templates to get better results.
                  </div>
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/5 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                Learn More Tips <ChevronRight className="w-3.5 h-3.5" />
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
      `}</style>
    </div>
  );
}
