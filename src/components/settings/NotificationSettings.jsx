import React, { useState } from "react";
import SettingsToggle from "./SettingsToggle";
import { Bell, Mail, ShieldCheck, Eye, Download, Sparkles, MessageSquare } from "lucide-react";

const NotificationSettings = ({ settings, onUpdate }) => {
  const [updatingField, setUpdatingField] = useState(null);

  const handleToggle = async (field, value) => {
    setUpdatingField(field);
    try {
      await onUpdate({
        notifications: {
          ...settings.notifications,
          [field]: value
        }
      });
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
    } finally {
      setUpdatingField(null);
    }
  };

  const notificationGroups = [
    {
      title: "Core Notifications",
      items: [
        { id: "email", label: "Email Notifications", desc: "Receive important updates and alerts via email.", icon: Mail },
        { id: "push", label: "Push Notifications", desc: "Get real-time browser notifications for all activity.", icon: Bell },
      ]
    },
    {
      title: "Activity Alerts",
      items: [
        { id: "ats_alerts", label: "ATS Analysis Alerts", desc: "Get notified when your ATS analysis is complete.", icon: ShieldCheck },
        { id: "cv_views", label: "CV View Alerts", desc: "Receive a notification when someone views your public CV.", icon: Eye },
        { id: "downloads", label: "Download Alerts", desc: "Get alerted whenever one of your CVs is downloaded.", icon: Download },
      ]
    },
    {
      title: "AI & Engagement",
      items: [
        { id: "job_matches", label: "Job Match Alerts", desc: "Daily notifications for new high-probability job matches.", icon: Sparkles },
        { id: "reminders", label: "Interview Reminders", desc: "Automatic reminders for upcoming scheduled interviews.", icon: MessageSquare },
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {notificationGroups.map((group, idx) => (
        <div key={idx} className="space-y-4">
          <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-[2px] px-1">{group.title}</h5>
          <div className="grid gap-3">
            {group.items.map((item) => (
              <SettingsToggle
                key={item.id}
                label={item.label}
                description={item.desc}
                enabled={settings?.notifications?.[item.id] ?? true}
                onChange={(val) => handleToggle(item.id, val)}
                loading={updatingField === item.id}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSettings;
