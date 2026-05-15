import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { useAuth } from "../auth/AuthProvider";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { 
  LayoutDashboard, FileText, PlusSquare, LayoutTemplate, PenTool, 
  FileCheck, Sparkles, MessageSquare, FileSignature, BarChart2, 
  User, Settings, Sun, Moon, Bell, ChevronDown, Search, Filter,
  LayoutGrid, List, Eye, Edit, MoreVertical, QrCode, Download,
  Upload, Lightbulb, ChevronRight, ChevronLeft, Menu
} from "lucide-react";

export default function MyCVs() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [cvs, setCvs] = useState([]);

  useEffect(() => {
    if (loading || !user) return;
    const q = query(collection(db, "cvs"), where("ownerId", "==", user.uid), orderBy("updatedAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setCvs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user, loading]);

  const userName = user?.displayName?.split(' ')[0] || "Prageeth";
  const userFullName = user?.displayName || "Prageeth Gihan";
  const userEmail = user?.email || "prageethgihan55@gmail.com";
  
  const mockCvs = [
    { id: 1, title: "Software Engineer CV", date: "Updated May 30, 2025 • 10:30 AM", status: "Published", views: 342, downloads: 128, scans: 24, privacy: "Public" },
    { id: 2, title: "Product Manager CV", date: "Updated May 28, 2025 • 09:15 AM", status: "Published", views: 276, downloads: 97, scans: 18, privacy: "Public" },
    { id: 3, title: "UX Designer CV", date: "Updated May 25, 2025 • 04:45 PM", status: "Draft", views: 124, downloads: 32, scans: 7, privacy: "Private" },
    { id: 4, title: "Data Analyst CV", date: "Updated May 20, 2025 • 11:20 AM", status: "Published", views: 198, downloads: 68, scans: 12, privacy: "Public" },
    { id: 5, title: "Full Stack Developer CV", date: "Updated May 18, 2025 • 02:10 PM", status: "Draft", views: 89, downloads: 21, scans: 5, privacy: "Private" },
  ];

  const displayCvs = cvs.length >= 5 ? cvs.map((c) => ({
    id: c.id,
    title: c.title || "Untitled CV",
    date: `Updated ${new Date(c.updatedAt?.seconds * 1000 || Date.now()).toLocaleString('en-US', {month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'})}`,
    status: c.isPublished ? "Published" : "Draft",
    views: c.views || 0,
    downloads: c.downloads || 0,
    scans: 0,
    privacy: c.isPublic ? "Public" : "Private"
  })).slice(0, 5) : mockCvs;

  if (loading) return <div className="p-6 text-white bg-[#0A0D14] min-h-screen">Loading...</div>;

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
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium transition-colors">
                  <FileText className="w-4 h-4" /> My CVs
                </button>
                <button onClick={() => navigate('/builder')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors">
                  <PlusSquare className="w-4 h-4" /> Create New CV
                </button>
                <button onClick={() => navigate('/templates')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors">
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
            <h1 className="text-3xl font-bold mb-2">My CVs</h1>
            <p className="text-gray-400 text-sm">Manage, view and track all your CVs in one place.</p>
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
          
          {/* LEFT SIDE - CV LIST */}
          <div className="flex-1 flex flex-col gap-5">
            {/* Filters Bar */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search your CVs..." 
                  className="w-full bg-[#111622] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              <button className="flex items-center gap-2 bg-[#111622] border border-white/5 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-colors">
                All CVs <ChevronDown className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-2 bg-[#111622] border border-white/5 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Sort by: Latest <ChevronDown className="w-4 h-4" />
              </button>
              <div className="flex items-center bg-[#111622] border border-white/5 rounded-xl p-1">
                <button className="p-1.5 text-gray-500 hover:text-white rounded-lg"><LayoutGrid className="w-4 h-4" /></button>
                <button className="p-1.5 text-indigo-400 bg-indigo-500/10 rounded-lg"><List className="w-4 h-4" /></button>
              </div>
            </div>

            {/* CV Items List */}
            <div className="bg-[#111622] border border-white/5 rounded-2xl flex flex-col p-2">
              {displayCvs.map((cv, idx) => (
                <div key={cv.id} className={`flex items-start justify-between p-4 ${idx !== displayCvs.length - 1 ? 'border-b border-white/5' : ''}`}>
                  <div className="flex items-start gap-5">
                    {/* CV Thumbnail */}
                    <div className="w-16 h-[88px] bg-white rounded-md flex-shrink-0 border border-gray-200 overflow-hidden relative shadow-sm mt-1">
                      <div className="absolute inset-1.5 space-y-1">
                        <div className="flex gap-1.5 mb-2">
                          <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
                          <div className="flex-1 space-y-0.5 mt-0.5">
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
                    
                    {/* Info */}
                    <div className="py-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-base text-gray-100">{cv.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium tracking-wide ${cv.status === 'Published' ? 'bg-indigo-600/20 text-indigo-400' : 'bg-gray-600/20 text-gray-400'}`}>
                          {cv.status}
                        </span>
                      </div>
                      <div className="text-[12px] text-gray-400 mb-3">{cv.date}</div>
                      
                      <div className="flex items-center gap-5 text-[12px] text-gray-400">
                        <div className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> <span className="text-gray-300 font-medium">{cv.views} Views</span></div>
                        <div className="flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> <span className="text-gray-300 font-medium">{cv.downloads} Downloads</span></div>
                        <div className="flex items-center gap-1.5"><QrCode className="w-3.5 h-3.5" /> <span className="text-gray-300 font-medium">{cv.scans} Scans</span></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2 py-1">
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-[12px] font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-[12px] font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <div className={`text-[11px] font-bold mt-2 pr-1 ${cv.privacy === 'Public' ? 'text-emerald-400' : 'text-orange-400'}`}>
                      {cv.privacy}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/5 text-gray-500 hover:text-white hover:bg-white/5 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white font-medium text-sm">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/5 text-gray-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/5 text-gray-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors">3</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/5 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>

          {/* RIGHT SIDE - SIDE PANELS */}
          <div className="w-[320px] flex-shrink-0 flex flex-col gap-5">
            
            {/* CV Overview */}
            <div className="bg-[#111622] border border-white/5 rounded-2xl p-5">
              <h2 className="text-[15px] font-semibold text-gray-100 mb-4">CV Overview</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0A0D14] rounded-xl p-4 flex flex-col items-center justify-center border border-white/5">
                  <div className="bg-indigo-500/10 p-2 rounded-lg mb-2"><FileText className="w-4 h-4 text-indigo-400" /></div>
                  <div className="text-xl font-bold mb-0.5">8</div>
                  <div className="text-[11px] text-gray-400 font-medium">Total CVs</div>
                </div>
                <div className="bg-[#0A0D14] rounded-xl p-4 flex flex-col items-center justify-center border border-white/5">
                  <div className="bg-blue-500/10 p-2 rounded-lg mb-2"><Eye className="w-4 h-4 text-blue-400" /></div>
                  <div className="text-xl font-bold mb-0.5">1,248</div>
                  <div className="text-[11px] text-gray-400 font-medium">Total Views</div>
                </div>
                <div className="bg-[#0A0D14] rounded-xl p-4 flex flex-col items-center justify-center border border-white/5">
                  <div className="bg-emerald-500/10 p-2 rounded-lg mb-2"><Download className="w-4 h-4 text-emerald-400" /></div>
                  <div className="text-xl font-bold mb-0.5">356</div>
                  <div className="text-[11px] text-gray-400 font-medium">Total Downloads</div>
                </div>
                <div className="bg-[#0A0D14] rounded-xl p-4 flex flex-col items-center justify-center border border-white/5">
                  <div className="bg-yellow-500/10 p-2 rounded-lg mb-2"><QrCode className="w-4 h-4 text-yellow-400" /></div>
                  <div className="text-xl font-bold mb-0.5">89</div>
                  <div className="text-[11px] text-gray-400 font-medium">Total Scans</div>
                </div>
              </div>
            </div>

            {/* Storage Usage */}
            <div className="bg-[#111622] border border-white/5 rounded-2xl p-5">
              <h2 className="text-[15px] font-semibold text-gray-100 mb-4">Storage Usage</h2>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2 font-medium">
                <span>78.4 MB / 1 GB Used</span>
                <span>7.8%</span>
              </div>
              <div className="w-full bg-[#0A0D14] rounded-full h-1.5 border border-white/5 overflow-hidden">
                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '7.8%' }}></div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#111622] border border-white/5 rounded-2xl p-5">
              <h2 className="text-[15px] font-semibold text-gray-100 mb-4">Quick Actions</h2>
              <div className="flex flex-col gap-2">
                <button className="flex items-center justify-between p-3 rounded-xl bg-[#0A0D14] border border-white/5 hover:border-white/10 transition-colors group">
                  <div className="flex items-center gap-3 text-sm text-gray-300 group-hover:text-white transition-colors">
                    <PlusSquare className="w-4 h-4 text-indigo-400" /> Create New CV
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
                </button>
                <button className="flex items-center justify-between p-3 rounded-xl bg-[#0A0D14] border border-white/5 hover:border-white/10 transition-colors group">
                  <div className="flex items-center gap-3 text-sm text-gray-300 group-hover:text-white transition-colors">
                    <Upload className="w-4 h-4 text-gray-400" /> Upload CV (PDF)
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
                </button>
                <button className="flex items-center justify-between p-3 rounded-xl bg-[#0A0D14] border border-white/5 hover:border-white/10 transition-colors group">
                  <div className="flex items-center gap-3 text-sm text-gray-300 group-hover:text-white transition-colors">
                    <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg> Import from LinkedIn
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
                </button>
                <button className="flex items-center justify-between p-3 rounded-xl bg-[#0A0D14] border border-white/5 hover:border-white/10 transition-colors group">
                  <div className="flex items-center gap-3 text-sm text-gray-300 group-hover:text-white transition-colors">
                    <LayoutTemplate className="w-4 h-4 text-gray-400" /> View Templates
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-[#111622] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-[15px] text-gray-100">Tips</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Keep your CV updated and optimized to get better opportunities!
              </p>
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
