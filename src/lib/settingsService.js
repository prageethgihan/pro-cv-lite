import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

const SETTINGS_COLLECTION = "users";
const SETTINGS_DOC_PATH = "settings/preferences";
const LOCAL_STORAGE_KEY = "procv_user_settings";
const SETTINGS_VERSION = "1.0.0";

/**
 * Default settings structure for new users or fallback
 */
export const createDefaultSettings = () => ({
  notifications: {
    email: true,
    push: true,
    updates: true,
    marketing: false,
  },
  appearance: {
    theme: "dark",
    fontSize: "medium",
    reduceMotion: false,
    glassmorphism: true,
  },
  language: {
    code: "en",
    label: "English",
  },
  privacy: {
    profilePublic: false,
    showEmail: false,
    analyticsEnabled: true,
  },
  accessibility: {
    highContrast: false,
    screenReader: false,
  },
  metadata: {
    version: SETTINGS_VERSION,
    lastSynced: null,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

/**
 * Validates and sanitizes settings data
 */
export const validateSettingsData = (data) => {
  const defaults = createDefaultSettings();
  if (!data || typeof data !== "object") return defaults;

  // Deep merge with defaults to ensure no missing fields
  return {
    notifications: { ...defaults.notifications, ...(data.notifications || {}) },
    appearance: { ...defaults.appearance, ...(data.appearance || {}) },
    language: { ...defaults.language, ...(data.language || {}) },
    privacy: { ...defaults.privacy, ...(data.privacy || {}) },
    accessibility: { ...defaults.accessibility, ...(data.accessibility || {}) },
    metadata: { ...defaults.metadata, ...(data.metadata || {}), version: SETTINGS_VERSION },
    createdAt: data.createdAt || defaults.createdAt,
    updatedAt: data.updatedAt || defaults.updatedAt,
  };
};

/**
 * Fetches settings from Firestore with LocalStorage fallback
 */
export const fetchUserSettings = async (userId) => {
  if (!userId) throw new Error("User ID is required");

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, userId, SETTINGS_DOC_PATH);
    const docSnap = await getDoc(docRef);

    let settings;

    if (docSnap.exists()) {
      settings = validateSettingsData(docSnap.data());
    } else {
      // Create defaults if document doesn't exist
      settings = createDefaultSettings();
      await setDoc(docRef, {
        ...settings,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    // Cache to localStorage
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_${userId}`, JSON.stringify(settings));
    return settings;
  } catch (error) {
    console.error("Error fetching settings:", error);
    
    // Fallback to localStorage on network error
    const cached = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${userId}`);
    if (cached) {
      return validateSettingsData(JSON.parse(cached));
    }
    
    return createDefaultSettings();
  }
};

/**
 * Updates settings in Firestore and LocalStorage
 */
export const updateUserSettings = async (userId, updates) => {
  if (!userId) throw new Error("User ID is required");

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, userId, SETTINGS_DOC_PATH);
    
    const payload = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    // Use setDoc with merge: true for better resilience
    await setDoc(docRef, payload, { merge: true });

    // Get fresh data to sync local storage
    const freshSnap = await getDoc(docRef);
    const freshData = validateSettingsData(freshSnap.data());
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_${userId}`, JSON.stringify(freshData));

    return freshData;
  } catch (error) {
    console.error("Error updating settings:", error);
    throw error;
  }
};

/**
 * Resets settings to defaults
 */
export const resetUserSettings = async (userId) => {
  const defaults = createDefaultSettings();
  return updateUserSettings(userId, defaults);
};

/**
 * Syncs local storage with Firestore
 */
export const syncLocalSettings = (userId, settings) => {
  if (!userId || !settings) return;
  localStorage.setItem(`${LOCAL_STORAGE_KEY}_${userId}`, JSON.stringify(validateSettingsData(settings)));
};
