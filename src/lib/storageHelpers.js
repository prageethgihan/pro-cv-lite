/**
 * Storage Helpers
 * Provides defensive parsing and safe access to localStorage
 */

export const safeJSONParse = (data, fallback = null) => {
  if (!data) return fallback;
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Storage parsing error:", error);
    return fallback;
  }
};

export const getStorageItem = (key, fallback = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? safeJSONParse(item, fallback) : fallback;
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return fallback;
  }
};

export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing ${key} to storage:`, error);
    return false;
  }
};
