import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useThemeContext } from "./context/ThemeContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MyCVs from "./pages/MyCVs";
import Templates from "./pages/Templates";
import Builder from "./pages/Builder";
import PublicCV from "./pages/PublicCV";
import AiWriter from "./pages/AiWriter";
import AtsAnalyzer from "./pages/AtsAnalyzer";
import JobMatch from "./pages/JobMatch";
import InterviewQuestions from "./pages/InterviewQuestions";
import CoverLetterGenerator from "./pages/CoverLetterGenerator";
import InsightsAnalytics from "./pages/InsightsAnalytics";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

import ProtectedRoute from "./auth/ProtectedRoute";

function SplashScreen() {
  return (
    <div className="splash-screen">
      <div className="splash-logo">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="60" height="60">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="text-xl font-bold tracking-tight text-white">ProCV <span className="text-indigo-400">Lite</span></div>
      <div className="splash-progress-container">
        <div className="splash-progress-bar"></div>
      </div>
    </div>
  );
}

function GlobalBackground() {
  const location = useLocation();
  const { isDark } = useThemeContext();
  const isBuilder = location.pathname.startsWith("/builder");

  return (
    <div
      className="fixed inset-0 -z-30 overflow-hidden pointer-events-none"
      style={{ backgroundColor: isDark ? "#020617" : "#EEF0F9", transition: "background-color 0.25s ease" }}
    >
      {/* Dark overlay specifically for builder */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 z-10 ${isBuilder ? "opacity-60" : "opacity-0"}`}
        style={{ backgroundColor: isDark ? "black" : "rgba(0,0,0,0.1)" }}
      />
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      {showSplash && <SplashScreen />}
      <GlobalBackground />

      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/my-cvs" element={<ProtectedRoute><MyCVs /></ProtectedRoute>} />
        <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
        <Route path="/builder" element={<ProtectedRoute><Builder /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/ai-writer" element={<ProtectedRoute><AiWriter /></ProtectedRoute>} />
        <Route path="/ats-analyzer" element={<ProtectedRoute><AtsAnalyzer /></ProtectedRoute>} />
        <Route path="/job-match" element={<ProtectedRoute><JobMatch /></ProtectedRoute>} />
        <Route path="/interview-questions" element={<ProtectedRoute><InterviewQuestions /></ProtectedRoute>} />
        <Route path="/cover-letter-generator" element={<ProtectedRoute><CoverLetterGenerator /></ProtectedRoute>} />
        <Route path="/insights" element={<ProtectedRoute><InsightsAnalytics /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/builder/:id" element={<ProtectedRoute><Builder /></ProtectedRoute>} />

        <Route path="/cv/:id" element={<PublicCV />} />
        <Route path="/p/:slug" element={<PublicCV />} />
      </Routes>
    </BrowserRouter>
  );
}