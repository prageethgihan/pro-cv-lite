import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MyCVs from "./pages/MyCVs";
import Templates from "./pages/Templates";
import Builder from "./pages/Builder";
import PublicCV from "./pages/PublicCV";

import ProtectedRoute from "./auth/ProtectedRoute";

function AutoRefreshOnFirstLoad() {
  useEffect(() => {
    try {
      const navEntries = performance.getEntriesByType("navigation");
      const navType =
        navEntries && navEntries.length > 0
          ? navEntries[0].type
          : performance?.navigation?.type === 1
          ? "reload"
          : "navigate";

      const key = `procv-auto-refresh:${window.location.pathname}`;
      const alreadyRefreshed = sessionStorage.getItem(key);

      // If this is the first non-reload visit to this route in this tab/session,
      // force one refresh so the latest deployed files load automatically.
      if (navType !== "reload" && !alreadyRefreshed) {
        sessionStorage.setItem(key, "1");
        window.location.reload();
      }
    } catch (err) {
      console.warn("Auto refresh check failed:", err);
    }
  }, []);

  return null;
}

function GlobalBackground() {
  const location = useLocation();
  const isBuilder = location.pathname.startsWith("/builder");

  return (
    <div className="fixed inset-0 -z-30 overflow-hidden app-bg-animated pointer-events-none">
      {/* Dark overlay specifically for builder */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-1000 z-10 ${isBuilder ? "opacity-60" : "opacity-0"}`} 
      />
      
      {/* Shapes with dynamic opacity for builder mode */}
      <div className="shape shape-1" style={{ opacity: isBuilder ? 0.2 : 0.6, transition: 'opacity 1s ease' }}></div>
      <div className="shape shape-2" style={{ opacity: isBuilder ? 0.2 : 0.6, transition: 'opacity 1s ease' }}></div>
      <div className="shape shape-3" style={{ opacity: isBuilder ? 0.1 : 0.6, transition: 'opacity 1s ease' }}></div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AutoRefreshOnFirstLoad />
      <GlobalBackground />

      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-cvs"
          element={
            <ProtectedRoute>
              <MyCVs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/templates"
          element={
            <ProtectedRoute>
              <Templates />
            </ProtectedRoute>
          }
        />

        <Route
          path="/builder"
          element={
            <ProtectedRoute>
              <Builder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/builder/:id"
          element={
            <ProtectedRoute>
              <Builder />
            </ProtectedRoute>
          }
        />

        <Route path="/cv/:id" element={<PublicCV />} />
        <Route path="/p/:slug" element={<PublicCV />} />
      </Routes>
    </BrowserRouter>
  );
}