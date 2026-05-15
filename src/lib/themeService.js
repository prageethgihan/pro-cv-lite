const THEME_KEY = "procv_theme_preference";

/**
 * Applies the specified theme to the document root
 */
export const applyTheme = (theme) => {
  const root = window.document.documentElement;
  
  // Remove existing theme classes
  root.classList.remove("light", "dark");

  let actualTheme = theme;

  // Handle system preference
  if (theme === "system") {
    actualTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  // Apply actual theme class
  root.classList.add(actualTheme);
  
  // Set data attribute for CSS targeting
  root.setAttribute("data-theme", actualTheme);
  
  // Persist to local storage
  localStorage.setItem(THEME_KEY, theme);
  
  return actualTheme;
};

/**
 * Gets the current stored theme or defaults to system
 */
export const getStoredTheme = () => {
  return localStorage.getItem(THEME_KEY) || "dark";
};

/**
 * Listens for system theme changes and updates if current theme is 'system'
 */
export const setupThemeListener = (callback) => {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  
  const handleChange = () => {
    const current = getStoredTheme();
    if (current === "system") {
      applyTheme("system");
      if (callback) callback();
    }
  };

  mediaQuery.addEventListener("change", handleChange);
  return () => mediaQuery.removeEventListener("change", handleChange);
};
