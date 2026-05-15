import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import "./Login.css";

import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";

import { auth } from "../firebase";

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const EyeIcon = ({ show }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {show ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* ───────── ICONS ───────── */
const MailSentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.18 6.18l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    <polyline points="16 2 18 4 22 0" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ───────── FORGOT PASSWORD MODAL ───────── */
function ForgotPasswordModal({ onClose }) {
  const [fpEmail, setFpEmail] = useState("");
  const [fpLoading, setFpLoading] = useState(false);
  const [fpSent, setFpSent] = useState(false);
  const [fpError, setFpError] = useState("");

  // ESC key close
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && !fpLoading) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, fpLoading]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !fpLoading) onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fpLoading || fpSent) return;

    const trimmedEmail = fpEmail.trim();
    if (!trimmedEmail) {
      setFpError("Please enter your email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setFpError("Please enter a valid email address.");
      return;
    }

    setFpLoading(true);
    setFpError("");

    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      setFpSent(true);
    } catch (err) {
      // Always show generic success for security — never reveal if email exists
      console.error("Password reset error:", err.code);
      setFpSent(true);
    } finally {
      setFpLoading(false);
    }
  };

  return (
    <div className="fp-backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-labelledby="fp-title">
      <div className="fp-modal">
        {/* Close button */}
        {!fpLoading && (
          <button className="fp-close-btn" onClick={onClose} aria-label="Close modal">
            <CloseIcon />
          </button>
        )}

        {fpSent ? (
          /* ── SUCCESS STATE ── */
          <div className="fp-success">
            <div className="fp-success-icon">
              <MailSentIcon />
            </div>
            <h3 className="fp-title" id="fp-title">Check Your Inbox</h3>
            <p className="fp-subtitle">
              If an account exists for <strong>{fpEmail.trim()}</strong>, a password reset link has been sent. Check your spam folder if you don&apos;t see it.
            </p>
            <button className="fp-back-btn" onClick={onClose}>
              Back to Login
            </button>
          </div>
        ) : (
          /* ── FORM STATE ── */
          <>
            <div className="fp-header">
              <div className="fp-icon-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3 className="fp-title" id="fp-title">Reset Password</h3>
              <p className="fp-subtitle">Enter your email address and we&apos;ll send you a secure reset link.</p>
            </div>

            {fpError && <div className="fp-error">{fpError}</div>}

            <form onSubmit={handleSubmit} className="fp-form">
              <div className="auth-field">
                <label htmlFor="fp-email">Email address</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><EmailIcon /></span>
                  <input
                    id="fp-email"
                    type="email"
                    placeholder="you@example.com"
                    value={fpEmail}
                    onChange={(e) => { setFpEmail(e.target.value); setFpError(""); }}
                    disabled={fpLoading}
                    autoFocus
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-btn fp-submit-btn"
                disabled={fpLoading || !fpEmail.trim()}
              >
                {fpLoading ? (
                  <><span className="auth-spinner" /> Sending&hellip;</>
                ) : (
                  "Send Reset Link"
                )}
              </button>

              <button
                type="button"
                className="fp-cancel-btn"
                onClick={onClose}
                disabled={fpLoading}
              >
                Cancel
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function getPasswordStrength(password) {
  if (!password) return { level: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { level: 1, label: "Weak", color: "#ef4444" };
  if (score === 2) return { level: 2, label: "Fair", color: "#f59e0b" };
  if (score === 3) return { level: 3, label: "Good", color: "#3b82f6" };
  return { level: 4, label: "Strong", color: "#22c55e" };
}

/* ───────── LOGIN LEFT PANEL ───────── */
function LoginLeftPanel() {
  return (
    <div className="auth-left">
      <div className="auth-bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="auth-left-content">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="auth-logo-text">ProCV <span className="auth-logo-lite">Lite</span></span>
        </div>

        {/* Badge */}
        <div className="auth-badge">AI-Powered CV Builder</div>

        {/* Hero */}
        <h1 className="auth-hero-title">
          Build Your<br />
          Professional CV<br />
          with <span className="auth-accent">ProCV Lite</span>
        </h1>
        <p className="auth-hero-sub">
          Create ATS-friendly resumes, stand out from the crowd and land your dream job.
        </p>

        {/* Features */}
        <div className="auth-features">
          <div className="auth-feature-item">
            <div className="auth-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div className="auth-feature-title">AI Powered</div>
              <div className="auth-feature-sub">Smart suggestions to improve your CV</div>
            </div>
          </div>
          <div className="auth-feature-item">
            <div className="auth-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div className="auth-feature-title">ATS Friendly</div>
              <div className="auth-feature-sub">Optimized templates that pass ATS scans</div>
            </div>
          </div>
          <div className="auth-feature-item">
            <div className="auth-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="2"/></svg>
            </div>
            <div>
              <div className="auth-feature-title">Modern Templates</div>
              <div className="auth-feature-sub">Professionally designed templates for every role</div>
            </div>
          </div>
        </div>

        {/* Floating CV Mockup */}
        <div className="auth-cv-mockup">
          <div className="cv-mockup-card">
            <div className="cv-mockup-avatar" />
            <div className="cv-mockup-lines">
              <div className="cv-line cv-line-long" />
              <div className="cv-line cv-line-medium" />
              <div className="cv-line cv-line-short" />
              <div style={{marginTop: '10px'}}>
                <div className="cv-line cv-line-long" style={{opacity: 0.5}} />
                <div className="cv-line cv-line-long" style={{opacity: 0.5}} />
                <div className="cv-line cv-line-medium" style={{opacity: 0.5}} />
              </div>
            </div>
            <div className="cv-mockup-badge">
              <span className="cv-badge-num">98%</span>
              <span className="cv-badge-label">ATS Score</span>
            </div>
          </div>
          <div className="cv-mockup-sphere cv-sphere-1" />
          <div className="cv-mockup-sphere cv-sphere-2" />
        </div>
      </div>

      <div className="auth-footer">© 2025 ProCV <span className="auth-accent">Lite</span>. All rights reserved.</div>
    </div>
  );
}

/* ───────── REGISTER LEFT PANEL ───────── */
function RegisterLeftPanel() {
  return (
    <div className="auth-left">
      <div className="auth-bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="auth-left-content">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="auth-logo-text">ProCV <span className="auth-logo-lite">Lite</span></span>
        </div>

        {/* Badge */}
        <div className="auth-badge">Join Thousands of Professionals</div>

        {/* Hero */}
        <h1 className="auth-hero-title">
          Start Building<br />
          Your <span className="auth-accent">Dream CV</span><br />
          Today!
        </h1>
        <p className="auth-hero-sub">
          Create your account and access powerful tools to boost your career.
        </p>

        {/* Stats */}
        <div className="auth-stats">
          <div className="auth-stat-item">
            <div className="auth-stat-icon">
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div className="auth-stat-num">50K+</div>
              <div className="auth-stat-label">Happy Users</div>
            </div>
          </div>
          <div className="auth-stat-item">
            <div className="auth-stat-icon">
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div className="auth-stat-num">100K+</div>
              <div className="auth-stat-label">CVs Created</div>
            </div>
          </div>
          <div className="auth-stat-item">
            <div className="auth-stat-icon">
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div className="auth-stat-num">98%</div>
              <div className="auth-stat-label">Satisfaction Rate</div>
            </div>
          </div>
        </div>

        {/* Floating CV Mockup */}
        <div className="auth-cv-mockup">
          <div className="cv-mockup-card">
            <div className="cv-mockup-avatar" />
            <div className="cv-mockup-lines">
              <div className="cv-line cv-line-long" />
              <div className="cv-line cv-line-medium" />
              <div className="cv-line cv-line-short" />
              <div style={{marginTop: '10px'}}>
                <div className="cv-line cv-line-long" style={{opacity: 0.5}} />
                <div className="cv-line cv-line-medium" style={{opacity: 0.5}} />
              </div>
            </div>
            <div className="cv-chart-badge">
              <svg viewBox="0 0 40 40" width="40" height="40">
                <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(139,92,246,0.3)" strokeWidth="4"/>
                <circle cx="20" cy="20" r="16" fill="none" stroke="#8b5cf6" strokeWidth="4" strokeDasharray="75 25" strokeLinecap="round" transform="rotate(-90 20 20)"/>
              </svg>
            </div>
          </div>
          <div className="cv-mockup-sphere cv-sphere-1" />
          <div className="cv-mockup-sphere cv-sphere-2" />
        </div>
      </div>

      <div className="auth-footer">© 2025 ProCV <span className="auth-accent">Lite</span>. All rights reserved.</div>
    </div>
  );
}

/* ───────── MAIN COMPONENT ───────── */
export default function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const strength = getPasswordStrength(password);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "register") {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (!agreeTerms) {
        setError("Please agree to the Terms of Service and Privacy Policy.");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "register") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (fullName) {
          await updateProfile(cred.user, { displayName: fullName });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err?.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err?.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
      )}

      {/* Left Panel */}
      {mode === "login" ? <LoginLeftPanel /> : <RegisterLeftPanel />}

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-form-wrapper">

          {mode === "login" ? (
            /* ── LOGIN FORM ── */
            <>
              <div className="auth-form-header">
                <h2 className="auth-form-title">Welcome back! 👋</h2>
                <p className="auth-form-subtitle">Login to continue to your account</p>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <form onSubmit={handleEmailAuth} className="auth-form">
                <div className="auth-field">
                  <label htmlFor="login-email">Email address</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"><EmailIcon /></span>
                    <input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="login-password">Password</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"><LockIcon /></span>
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="auth-eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <EyeIcon show={showPassword} />
                    </button>
                  </div>
                </div>

                <div className="auth-row">
                  <label className="auth-checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="auth-custom-check">{rememberMe && <CheckIcon />}</span>
                    Remember me
                  </label>
                  <button type="button" className="auth-link-btn" onClick={() => setShowForgotPassword(true)}>Forgot password?</button>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? <span className="auth-spinner" /> : "Log In"}
                </button>
              </form>

              <div className="auth-divider"><span>OR</span></div>

              <button type="button" className="auth-google-btn" onClick={handleGoogle} disabled={loading}>
                <GoogleIcon />
                Continue with Google
              </button>

              <p className="auth-switch-text">
                Don't have an account?{" "}
                <button type="button" className="auth-switch-btn" onClick={() => { setMode("register"); setError(""); }}>
                  Register
                </button>
              </p>
            </>
          ) : (
            /* ── REGISTER FORM ── */
            <>
              <div className="auth-form-header">
                <h2 className="auth-form-title">Create Account</h2>
                <p className="auth-form-subtitle">Let's get you started</p>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <form onSubmit={handleEmailAuth} className="auth-form">
                <div className="auth-field">
                  <label htmlFor="reg-name">Full Name</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"><UserIcon /></span>
                    <input
                      id="reg-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="reg-email">Email address</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"><EmailIcon /></span>
                    <input
                      id="reg-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="reg-password">Password</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"><LockIcon /></span>
                    <input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="auth-eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <EyeIcon show={showPassword} />
                    </button>
                  </div>
                  {/* Password Strength */}
                  {password && (
                    <div className="auth-strength">
                      <span className="auth-strength-label">Password strength</span>
                      <span className="auth-strength-text" style={{ color: strength.color }}>{strength.label}</span>
                      <div className="auth-strength-bar">
                        {[1,2,3,4].map(i => (
                          <div
                            key={i}
                            className="auth-strength-seg"
                            style={{ background: i <= strength.level ? strength.color : 'rgba(255,255,255,0.1)' }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="auth-field">
                  <label htmlFor="reg-confirm">Confirm Password</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"><LockIcon /></span>
                    <input
                      id="reg-confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="auth-eye-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <EyeIcon show={showConfirmPassword} />
                    </button>
                  </div>
                </div>

                <label className="auth-checkbox-label auth-terms">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <span className="auth-custom-check">{agreeTerms && <CheckIcon />}</span>
                  <span>
                    I agree to the{" "}
                    <button type="button" className="auth-link-btn">Terms of Service</button>
                    {" "}and{" "}
                    <button type="button" className="auth-link-btn">Privacy Policy</button>
                  </span>
                </label>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? <span className="auth-spinner" /> : "Create Account"}
                </button>
              </form>

              <div className="auth-divider"><span>OR</span></div>

              <button type="button" className="auth-google-btn" onClick={handleGoogle} disabled={loading}>
                <GoogleIcon />
                Continue with Google
              </button>

              <p className="auth-switch-text">
                Already have an account?{" "}
                <button type="button" className="auth-switch-btn" onClick={() => { setMode("login"); setError(""); }}>
                  Log in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}