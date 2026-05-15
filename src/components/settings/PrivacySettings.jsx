import React, { useState } from "react";
import SettingsToggle from "./SettingsToggle";
import { Shield, Lock, Eye, BarChart, Link } from "lucide-react";

const PrivacySettings = ({ settings, onUpdate }) => {
  const [updatingField, setUpdatingField] = useState(null);

  const handleToggle = async (field, value) => {
    setUpdatingField(field);
    try {
      await onUpdate({
        privacy: {
          ...settings.privacy,
          [field]: value
        }
      });
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
    } finally {
      setUpdatingField(null);
    }
  };

  const privacyOptions = [
    {
      id: "publicProfile",
      label: "Public Profile",
      desc: "Allow other users to view your professional profile.",
      icon: Eye
    },
    {
      id: "cvVisibility",
      label: "Public CV Visibility",
      desc: "Make your primary CV accessible via public search engines.",
      icon: Shield
    },
    {
      id: "searchVisibility",
      label: "Search Visibility",
      desc: "Show your profile in search results within the platform.",
      icon: Lock
    },
    {
      id: "analyticsEnabled",
      label: "Analytics Sharing",
      desc: "Help us improve by sharing anonymous usage data.",
      icon: BarChart
    },
    {
      id: "linkSharing",
      label: "Shareable Link Access",
      desc: "Allow access to your CVs only through direct shareable links.",
      icon: Link
    }
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 mb-6">
        <p className="text-xs text-indigo-400 leading-relaxed font-medium">
          Note: Privacy settings are applied globally across all your generated CVs and documents unless overridden individually.
        </p>
      </div>

      <div className="grid gap-3">
        {privacyOptions.map((option) => (
          <SettingsToggle
            key={option.id}
            label={option.label}
            description={option.desc}
            enabled={settings?.privacy?.[option.id] ?? false}
            onChange={(val) => handleToggle(option.id, val)}
            loading={updatingField === option.id}
          />
        ))}
      </div>

      <div className="pt-4 mt-6 border-t border-white/5">
        <button 
          className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider"
          onClick={() => alert("Data deletion request initiated. Our support team will contact you.")}
        >
          Request Data Deletion
        </button>
      </div>
    </div>
  );
};

export default PrivacySettings;
