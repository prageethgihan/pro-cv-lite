import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  fetchUserSettings, 
  updateUserSettings, 
  resetUserSettings as resetService,
  validateSettingsData 
} from "../lib/settingsService";

/**
 * Custom hook for managing user settings with optimistic updates and Firestore sync
 */
export const useSettings = (userId) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Load settings on mount or when userId changes
   */
  const loadSettings = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchUserSettings(userId);
      setSettings(data);
    } catch (err) {
      setError(err.message || "Failed to load settings");
      // Fallback to local defaults if everything fails
      setSettings(validateSettingsData(null));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  /**
   * Update settings with optimistic UI support
   */
  const updateSettings = useCallback(async (updates) => {
    if (!userId) return;

    const previousSettings = settings;

    // Optimistic Update
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString()
      };
    });

    try {
      const freshData = await updateUserSettings(userId, updates);
      setSettings(freshData);
      return freshData;
    } catch (err) {
      // Rollback on failure
      setSettings(previousSettings);
      setError(err.message || "Failed to update settings");
      throw err;
    }
  }, [userId, settings]);

  /**
   * Reset settings to defaults
   */
  const resetSettings = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await resetService(userId);
      setSettings(data);
    } catch (err) {
      setError(err.message || "Failed to reset settings");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Refresh settings from cloud
   */
  const refreshSettings = useCallback(() => {
    return loadSettings();
  }, [loadSettings]);

  // Memoized values to prevent unnecessary re-renders
  const memoizedSettings = useMemo(() => settings, [settings]);

  return {
    settings: memoizedSettings,
    loading,
    error,
    updateSettings,
    refreshSettings,
    resetSettings
  };
};
