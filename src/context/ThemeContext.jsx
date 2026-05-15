import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const THEME_KEY = "procv_theme_preference";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || "dark";
  } catch {
    return "dark";
  }
}

function resolveActualTheme(theme) {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

function applyThemeToDOM(theme) {
  const actual = resolveActualTheme(theme);
  const root = document.documentElement;
  root.setAttribute("data-theme", actual);
  // Keep class as well for Tailwind dark: variant support
  root.classList.remove("dark", "light");
  root.classList.add(actual);
}

// ── Context ───────────────────────────────────────────────────────────────────

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const stored = getStoredTheme();
    // Apply immediately to prevent flash before React hydrates
    applyThemeToDOM(stored);
    return stored;
  });

  // Apply on every theme change
  useEffect(() => {
    applyThemeToDOM(theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {/* ignore */}
  }, [theme]);

  // Listen for system preference changes when theme === "system"
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") {
        applyThemeToDOM("system");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
  }, []);

  const actualTheme = resolveActualTheme(theme);
  const isDark = actualTheme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext must be used within ThemeProvider");
  return ctx;
}
