import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const SettingsToggle = ({ 
  label, 
  description, 
  enabled, 
  onChange, 
  loading = false,
  disabled = false 
}) => {
  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.02] transition-all ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex-1 pr-4">
        <h4 className="text-sm font-bold text-white mb-0.5">{label}</h4>
        {description && <p className="text-[11px] text-gray-500 leading-relaxed">{description}</p>}
      </div>

      <button
        onClick={() => !loading && onChange(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 outline-none focus:ring-2 focus:ring-indigo-500/50 ${
          enabled ? "bg-indigo-600" : "bg-white/10"
        }`}
      >
        <motion.div
          animate={{ x: enabled ? 22 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 left-0 w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center"
        >
          {loading && <Loader2 className="w-2.5 h-2.5 text-indigo-600 animate-spin" />}
        </motion.div>
      </button>
    </div>
  );
};

export default SettingsToggle;
