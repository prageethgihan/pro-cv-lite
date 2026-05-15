import { useState, useCallback, useMemo } from "react";
import { getTranslation } from "../lib/languageService";

export const useLanguage = (userId, settings, updateSettings) => {
  const currentLang = settings?.language?.code || "en";

  const t = useCallback((path) => {
    return getTranslation(currentLang, path);
  }, [currentLang]);

  const setLanguage = useCallback(async (langCode, label) => {
    if (userId && updateSettings) {
      try {
        await updateSettings({
          language: {
            code: langCode,
            label: label
          }
        });
      } catch (error) {
        console.error("Failed to update language:", error);
      }
    }
  }, [userId, updateSettings]);

  return {
    language: currentLang,
    t,
    setLanguage
  };
};
