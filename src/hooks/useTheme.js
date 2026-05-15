/**
 * useTheme – backward-compatible hook that reads from the global ThemeContext.
 *
 * Usage (Settings.jsx, etc.):
 *   const { theme, setTheme, isDark } = useTheme(userId, settings, updateSettings);
 */
import { useCallback } from "react";
import { useThemeContext } from "../context/ThemeContext";

export const useTheme = (userId, settings, updateSettings) => {
  const { theme, setTheme: setGlobalTheme, isDark } = useThemeContext();

  const setTheme = useCallback(async (newTheme) => {
    // Update the global context (which persists to localStorage)
    setGlobalTheme(newTheme);

    // Optionally sync to cloud if user is authenticated
    if (userId && updateSettings) {
      try {
        await updateSettings({
          appearance: {
            ...(settings?.appearance || {}),
            theme: newTheme,
          },
        });
      } catch (error) {
        console.error("Failed to sync theme to cloud:", error);
      }
    }
  }, [userId, settings, updateSettings, setGlobalTheme]);

  return { theme, setTheme, isDark };
};
