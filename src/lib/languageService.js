import en from "./translations/en.json";

// For demo purposes, we define placeholders for si/ta
const si = { ...en }; // Sinhala placeholder
const ta = { ...en }; // Tamil placeholder

const translations = { en, si, ta };

export const getTranslation = (lang, path) => {
  const keys = path.split(".");
  let result = translations[lang] || translations.en;
  
  for (const key of keys) {
    if (result && result[key]) {
      result = result[key];
    } else {
      // Fallback to English if missing in target language
      let fallback = translations.en;
      for (const fKey of keys) {
        if (fallback && fallback[fKey]) fallback = fallback[fKey];
        else return path;
      }
      return fallback;
    }
  }
  return result;
};

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "si", label: "Sinhala", native: "සිංහල" },
  { code: "ta", label: "Tamil", native: "தமிழ்" }
];
