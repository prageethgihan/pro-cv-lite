import React from "react";
import { Moon, Sun, Monitor, Check } from "lucide-react";

/**
 * ThemeSelector – used in the Appearance modal in Settings.
 * Props: currentTheme (string), onSelect (fn) — these can be passed directly
 * from the Settings page which calls useTheme() (which now delegates to ThemeContext).
 */
const ThemeSelector = ({ currentTheme, onSelect }) => {
  const themes = [
    { id: "dark",   label: "Dark Theme",      icon: Moon,    desc: "Classic dark premium look" },
    { id: "light",  label: "Light Theme",     icon: Sun,     desc: "Clean and bright professional feel" },
    { id: "system", label: "System Default",  icon: Monitor, desc: "Syncs with your device settings" },
  ];

  return (
    <div className="grid gap-3">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
            currentTheme === t.id
              ? "bg-indigo-600/10 border-indigo-600/50 shadow-lg shadow-indigo-600/10"
              : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
          }`}
          style={
            currentTheme === t.id
              ? {}
              : { background: "var(--theme-card-secondary, rgba(255,255,255,0.02))" }
          }
        >
          <div className="flex items-center gap-4 text-left">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 ${
                currentTheme === t.id ? "bg-indigo-600 text-white" : "text-gray-400"
              }`}
              style={currentTheme !== t.id ? { background: "var(--theme-icon-bg, #1a2030)" } : {}}
            >
              <t.icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold" style={{ color: "var(--theme-text-primary, white)" }}>
                {t.label}
              </h4>
              <p className="text-[11px]" style={{ color: "var(--theme-text-muted, #6b7280)" }}>
                {t.desc}
              </p>
            </div>
          </div>

          {currentTheme === t.id && (
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-white" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default ThemeSelector;
