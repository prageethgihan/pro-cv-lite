import React, { useState } from "react";
import SettingsToggle from "./SettingsToggle";

const AccessibilitySettings = ({ settings, onUpdate }) => {
  const [updatingField, setUpdatingField] = useState(null);

  const handleToggle = async (field, value) => {
    setUpdatingField(field);
    try {
      await onUpdate({
        accessibility: {
          ...settings.accessibility,
          [field]: value
        }
      });
    } catch (error) {
      console.error(`Failed to update accessibility field ${field}:`, error);
    } finally {
      setUpdatingField(null);
    }
  };

  const options = [
    {
      id: "reduceMotion",
      label: "Reduce Motion",
      desc: "Minimize the number of non-essential animations across the UI."
    },
    {
      id: "highContrast",
      label: "High Contrast Mode",
      desc: "Increase color contrast for better legibility and visibility."
    },
    {
      id: "screenReader",
      label: "Screen Reader Optimization",
      desc: "Improve structural semantic tags for better screen reader compatibility."
    },
    {
      id: "largeFont",
      label: "Large Default Font",
      desc: "Increase the default base font size for better reading comfort."
    }
  ];

  return (
    <div className="space-y-4">
      {options.map((option) => (
        <SettingsToggle
          key={option.id}
          label={option.label}
          description={option.desc}
          enabled={settings?.accessibility?.[option.id] ?? false}
          onChange={(val) => handleToggle(option.id, val)}
          loading={updatingField === option.id}
        />
      ))}
    </div>
  );
};

export default AccessibilitySettings;
