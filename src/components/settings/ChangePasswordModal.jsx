import React, { useState } from "react";
import { auth } from "../../firebase";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { Eye, EyeOff, Loader2, ShieldCheck, AlertCircle, CheckCircle2, Lock } from "lucide-react";

const ChangePasswordModal = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validatePassword = (pass) => {
    return pass.length >= 6;
  };

  const getPasswordStrength = (pass) => {
    if (pass.length === 0) return 0;
    if (pass.length < 6) return 1;
    if (pass.length < 10) return 2;
    return 3;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validatePassword(newPassword)) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user found.");

      // 1. Re-authenticate
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // 2. Update Password
      await updatePassword(user, newPassword);

      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      console.error("Password update error:", err);
      if (err.code === "auth/wrong-password") {
        setError("The current password you entered is incorrect.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError(err.message || "Failed to update password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
          <CheckCircle2 className="w-10 h-10 animate-bounce" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Password Updated!</h3>
        <p className="text-sm text-gray-500">Your account is now more secure. Closing...</p>
      </div>
    );
  }

  const strength = getPasswordStrength(newPassword);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-400 font-medium leading-relaxed">{error}</p>
        </div>
      )}

      {/* Current Password */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Current Password</label>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <input
            type={showCurrent ? "text" : "password"}
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full bg-[#1a2030] border border-white/5 rounded-2xl py-3.5 pl-12 pr-12 text-sm focus:border-indigo-500/50 outline-none transition-all placeholder:text-gray-600"
            placeholder="Enter current password"
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
          >
            {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="h-px bg-white/5" />

      {/* New Password */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">New Password</label>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
            <Lock className="w-5 h-5" />
          </div>
          <input
            type={showNew ? "text" : "password"}
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-[#1a2030] border border-white/5 rounded-2xl py-3.5 pl-12 pr-12 text-sm focus:border-indigo-500/50 outline-none transition-all placeholder:text-gray-600"
            placeholder="Minimum 6 characters"
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
          >
            {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Strength Indicator */}
        <div className="flex gap-1 mt-2 px-1">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`h-1 flex-1 rounded-full transition-colors ${
                strength >= i 
                  ? strength === 1 ? "bg-red-500" : strength === 2 ? "bg-amber-500" : "bg-emerald-500"
                  : "bg-white/5"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Confirm New Password</label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-[#1a2030] border border-white/5 rounded-2xl py-3.5 pl-12 text-sm focus:border-indigo-500/50 outline-none transition-all placeholder:text-gray-600"
            placeholder="Repeat new password"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !currentPassword || !newPassword || !confirmPassword}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 mt-4"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Updating Securely...
          </>
        ) : (
          "Save New Password"
        )}
      </button>
    </form>
  );
};

export default ChangePasswordModal;
