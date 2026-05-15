import React from "react";
import { Check, Globe } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "../../lib/languageService";

const LanguageSelector = ({ currentLang, onSelect }) => {
  return (
    <div className="grid gap-3">
      {SUPPORTED_LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onSelect(lang.code, lang.label)}
          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
            currentLang === lang.code
              ? "bg-indigo-600/10 border-indigo-600/50 shadow-lg shadow-indigo-600/10"
              : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
          }`}
        >
          <div className="flex items-center gap-4 text-left">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 ${
              currentLang === lang.code ? "bg-indigo-600 text-white" : "bg-[#1a2030] text-gray-400"
            }`}>
              <span className="text-xs font-bold uppercase">{lang.code}</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{lang.label}</h4>
              <p className="text-[11px] text-gray-500">{lang.native}</p>
            </div>
          </div>

          {currentLang === lang.code && (
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-white" />
            </div>
          )}
        </button>
      ))}

      <div className="mt-4 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-3">
        <Globe className="w-5 h-5 text-indigo-400 flex-shrink-0" />
        <p className="text-[10px] text-indigo-400 leading-tight">
          Changing language will update the entire interface text. Support for more languages is being added.
        </p>
      </div>
    </div>
  );
};

export default LanguageSelector;
