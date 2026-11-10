import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import ProfileDropdown from "../components/ProfileDropdown";
import NotificationDropdown from "../components/NotificationDropdown";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  LayoutDashboard, FileText, PlusSquare, LayoutTemplate, PenTool,
  FileCheck, Sparkles, MessageSquare, FileSignature, BarChart2,
  User, Settings, Sun, Moon, Bell, ChevronDown, Menu, UploadCloud,
  CheckCircle2, XCircle, Lightbulb, ArrowRight, ShieldCheck,
  Target, FileDigit, Eye, Zap, RotateCcw, Loader2, X, Copy,
  Info, Check, ExternalLink, Layers, Flame, Filter, Download
} from "lucide-react";
import { extractCvText, analyzeWithGemini, improveSection, validateCvForAts } from "../lib/atsAnalysis";
import Template1 from "../templates/Template1";
import Template2 from "../templates/Template2";
import Template3 from "../templates/Template3";
import Template4 from "../templates/Template4";
import Template5 from "../templates/Template5";
import Template6 from "../templates/Template6";
import OriginalUploadedTemplate from "../templates/OriginalUploadedTemplate";
import { exportService } from "../lib/exportService";

const EMPTY_CV = {
  fullName: "",
  jobTitle: "",
  summaryTitle: "ABOUT ME",
  summary: "",
  contact: { phone: "", email: "", address: "", website: "", linkedin: "", github: "" },
  education: [],
  skills: [],
  technologies: [],
  experience: [],
  projects: [],
  certifications: [],
  references: [],
  achievements: [],
  languages: [],
  themeMode: "auto",
  themeManual: {
    primary: "#000000",
    secondary: "#333333",
    accent: "#000000",
    bg: "#ffffff",
    card: "#ffffff",
    text: "#000000"
  }
};

function ScoreRing({ score, color, size = 80, strokeW = 6 }) {
  const r = (size / 2) - strokeW;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  return (
    <svg width={size} height={size} className="rotate-[-90deg]" viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeW} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeW}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  );
}

const TEMPLATES_LIST = [
  { id: "t3", name: "Classic ATS (Recommended)", comp: Template3, desc: "Clean single-column standard ATS layout with neat dividers" },
  { id: "t1", name: "Modern Sidebar", comp: Template1, desc: "Two-column design with prominent colored left sidebar" },
  { id: "t2", name: "Modern Dark", comp: Template2, desc: "Sleek dark theme for modern technical roles" },
  { id: "t4", name: "Executive Timeline", comp: Template4, desc: "Sophisticated timeline format for senior roles" },
  { id: "t5", name: "Minimalist", comp: Template5, desc: "Ultra-clean modern whitespace design" },
  { id: "t6", name: "Sri Lanka Academic", comp: Template6, desc: "Detailed academic & comprehensive layout" },
];

function detectSectionFromText(text) {
  const t = (text || "").toLowerCase();
  if (t.includes("experience") || t.includes("work") || t.includes("role") || t.includes("job") || t.includes("internship")) return "experience";
  if (t.includes("skill") || t.includes("keyword") || t.includes("technology") || t.includes("tool") || t.includes("cloud")) return "skills";
  if (t.includes("project") || t.includes("portfolio")) return "projects";
  if (t.includes("summary") || t.includes("profile") || t.includes("objective") || t.includes("headline")) return "summary";
  if (t.includes("education") || t.includes("degree") || t.includes("course") || t.includes("gpa") || t.includes("academic")) return "education";
  if (t.includes("certif")) return "certifications";
  return "experience";
}

export default function AtsAnalyzer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  
  // Auto-scan states
  const [isAutoLoading, setIsAutoLoading] = useState(false);
  const [autoLoadingStep, setAutoLoadingStep] = useState("");
  const autoScanDone = useRef(false);

  const userFullName = user?.displayName || "Prageeth Gihan";
  const userEmail = user?.email || "prageethgihan55@gmail.com";

  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [cvText, setCvText] = useState("");
  const [cooldown, setCooldown] = useState(false);

  const [isOptimizeModalOpen, setIsOptimizeModalOpen] = useState(false);
  const [optimizationLoading, setOptimizationLoading] = useState(false);
  const [aiImprovementResult, setAiImprovementResult] = useState(null);
  const [optimizationError, setOptimizationError] = useState("");

  // Validation state
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [validationWarning, setValidationWarning] = useState("");
  const [isInvalidFile, setIsInvalidFile] = useState(false);

  // CV Data state for direct importing and optimization
  const [cvData, setCvData] = useState(EMPTY_CV);
  const [history, setHistory] = useState([]); // For Undo support
  const [showUndoToast, setShowUndoToast] = useState(false);
  const [lastUpdatedSection, setLastUpdatedSection] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Template and preview states
  const [selectedTemplate, setSelectedTemplate] = useState("t3");
  const [previewMode, setPreviewMode] = useState("original-template"); // "original-template" | "alternative-templates" | "raw-pdf"
  const [previewPage, setPreviewPage] = useState("all"); // "all" | 1 | 2
  const [activeImproveTab, setActiveImproveTab] = useState("all");
  const [copiedText, setCopiedText] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const filePreviewUrl = React.useMemo(() => {
    if (file && file instanceof File && (file.type === "application/pdf" || file.name?.toLowerCase().endsWith(".pdf"))) {
      try {
        return URL.createObjectURL(file);
      } catch (e) {
        return null;
      }
    }
    return null;
  }, [file]);

  React.useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  const validateFile = async (f) => {
    setIsValidating(true);
    setValidationError("");
    setValidationWarning("");
    setIsInvalidFile(false);
    setResult(null);

    try {
      const validation = await validateCvForAts(f);
      
      if (!validation.isValid) {
        setIsInvalidFile(true);
        setValidationError(validation.error || "Profile photo or heavy graphics detected. Please remove images and upload a text-based CV for accurate ATS analysis.");
        setFile(null);
        return;
      }

      setFile(f);
      setCvText(validation.text);
      if (validation.warning) {
        setValidationWarning(validation.warning);
      }
    } catch (err) {
      console.error("Validation error:", err);
      setValidationError("Failed to read file. Please ensure it is a valid PDF or DOCX.");
      setIsInvalidFile(true);
      setFile(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleFile = (f) => {
    if (!f) return;
    const ok = f.name.endsWith(".pdf") || f.name.endsWith(".docx");
    if (!ok) { 
      setValidationError("Only PDF or DOCX files are supported."); 
      setIsInvalidFile(true);
      return; 
    }
    if (f.size > 10 * 1024 * 1024) { 
      setValidationError("File must be under 10MB."); 
      setIsInvalidFile(true);
      return; 
    }
    
    validateFile(f);
  };

  const handleDrop = (e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); };

  const processingRef = useRef(false);
  const abortControllerRef = useRef(null);

  React.useEffect(() => {
    return () => {
      // Abort any ongoing request on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // --- Automated Workflow Detection ---
  React.useEffect(() => {
    if (autoScanDone.current || !location.state?.autoScan || !location.state?.cvId || !user) return;

    const runAutoScan = async () => {
      autoScanDone.current = true;
      setIsAutoLoading(true);
      setAutoLoadingStep("Preparing ATS analysis...");

      try {
        // 1. Fetch CV from Firestore
        const cvRef = doc(db, "cvs", location.state.cvId);
        const cvSnap = await getDoc(cvRef);
        
        if (!cvSnap.exists()) {
          throw new Error("CV not found. Please select a different resume.");
        }

        const data = cvSnap.data();
        setAutoLoadingStep("Analyzing resume structure...");

        // 2. Format CV data for analysis
        const formattedText = `
          Full Name: ${data.fullName || ""}
          Job Title: ${data.jobTitle || ""}
          Summary: ${data.summary || ""}
          Skills: ${Array.isArray(data.skills) ? data.skills.map(s => typeof s === 'string' ? s : s.name).join(', ') : ""}
          Experience: ${Array.isArray(data.experience) ? data.experience.map(e => `${e.role} at ${e.company}: ${e.description}`).join('\n') : ""}
          Education: ${Array.isArray(data.education) ? data.education.map(ed => `${ed.degree} from ${ed.school}`).join('\n') : ""}
        `;

        // 3. Set states for analysis
        setCvText(formattedText);
        setFile({ name: data.title || "Selected CV", size: 0, isAuto: true });
        
        // Use a short delay for UX smoothness
        setTimeout(() => {
          setAutoLoadingStep("Optimizing ATS compatibility...");
          analyzeAuto(formattedText, data.title || "Selected CV");
        }, 1500);

      } catch (err) {
        console.error("Auto-scan failed:", err);
        setError(err.message);
        setIsAutoLoading(false);
      }
    };

    runAutoScan();
  }, [location.state, user]);

  const analyzeAuto = async (text, fileName) => {
    setAnalyzing(true);
    setIsAutoLoading(true);
    setError("");

    try {
      const data = await analyzeWithGemini(text, jobDesc);
      setResult(data);
      
      // Persist ATS history
      const savedHistory = JSON.parse(localStorage.getItem("procv_ats_history") || "[]");
      const newEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        atsScore: data.atsScore,
        resumeMatch: data.resumeMatch,
        keywordMatch: data.keywordMatch,
        fileName: fileName
      };
      localStorage.setItem("procv_ats_history", JSON.stringify([newEntry, ...savedHistory].slice(0, 50)));

      if (data.recommendedTemplate) {
        setSelectedTemplate(data.recommendedTemplate);
      } else {
        setSelectedTemplate("t3");
      }

      if (data.parsedCv) {
        // Map parsed CV to builder format (optional, keeping current behavior)
        const mappedCv = {
          ...EMPTY_CV,
          fullName: data.parsedCv.fullName || "Your Name",
          jobTitle: data.parsedCv.jobTitle || "Professional Title",
          summaryTitle: data.parsedCv.summaryTitle || "ABOUT ME",
          summary: data.parsedCv.summary || "",
          contact: { ...EMPTY_CV.contact, ...data.parsedCv.contact },
          education: data.parsedCv.education || [],
          skills: data.parsedCv.skills || [],
          technologies: data.parsedCv.technologies || [],
          experience: data.parsedCv.experience || [],
          projects: data.parsedCv.projects || [],
          certifications: data.parsedCv.certifications || [],
          references: data.parsedCv.references || [],
          achievements: data.parsedCv.achievements || [],
        };
        setCvData(mappedCv);
        setPreviewMode("original-template");
      }
    } catch (e) {
      setError(e.message || "Auto-analysis failed.");
    } finally {
      setAnalyzing(false);
      setIsAutoLoading(false);
    }
  };

  const analyze = async () => {
    if (!file || !cvText) { setError("Please upload a valid CV file first."); return; }
    if (analyzing || cooldown || processingRef.current) return; 

    processingRef.current = true;
    setAnalyzing(true); 
    setError(""); 
    setResult(null);
    
    abortControllerRef.current = new AbortController();

    try {
      const data = await analyzeWithGemini(cvText, jobDesc);
      
      if (processingRef.current) {
        setResult(data);

        if (data.recommendedTemplate) {
          setSelectedTemplate(data.recommendedTemplate);
        } else {
          setSelectedTemplate("t3");
        }
        
        // Persist ATS history for Analytics
        try {
          const savedHistory = JSON.parse(localStorage.getItem("procv_ats_history") || "[]");
          const newEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            atsScore: data.atsScore,
            resumeMatch: data.resumeMatch,
            keywordMatch: data.keywordMatch,
            fileName: file?.name || "Uploaded CV"
          };
          localStorage.setItem("procv_ats_history", JSON.stringify([newEntry, ...savedHistory].slice(0, 50)));
        } catch (err) {
          console.error("Failed to save ATS history", err);
        }

        if (data.parsedCv) {
          // Map parsed CV to builder format
          const mappedCv = {
            ...EMPTY_CV,
            fullName: data.parsedCv.fullName || "Your Name",
            jobTitle: data.parsedCv.jobTitle || "Professional Title",
            summaryTitle: data.parsedCv.summaryTitle || "ABOUT ME",
            summary: data.parsedCv.summary || "",
            contact: { ...EMPTY_CV.contact, ...data.parsedCv.contact },
            education: data.parsedCv.education || [],
            skills: data.parsedCv.skills || [],
            technologies: data.parsedCv.technologies || [],
            experience: data.parsedCv.experience || [],
            projects: data.parsedCv.projects || [],
            certifications: data.parsedCv.certifications || [],
            references: data.parsedCv.references || [],
            achievements: data.parsedCv.achievements || [],
          };
          setCvData(mappedCv);
          setPreviewMode("original-template");
        }
        setCooldown(true);
        setTimeout(() => setCooldown(false), 3000);
      }
    } catch (e) {
      if (e.name === 'AbortError') return;
      console.error("Analysis process error:", e);
      setError(e.message || "Analysis failed. Please try again.");
      setCooldown(true);
      setTimeout(() => setCooldown(false), 2000);
    } finally {
      processingRef.current = false;
      setAnalyzing(false);
      abortControllerRef.current = null;
    }
  };

  const applyImprovement = (section, improvedContent) => {
    if (!improvedContent) return;

    // Save current state for undo
    setHistory(prev => [...prev, { section, data: JSON.parse(JSON.stringify(cvData)) }]);
    
    const newCvData = { ...cvData };
    let sectionNameForToast = section;
    const s = (section || "").toLowerCase();

    if (s.includes("summary") || s.includes("profile") || s.includes("about")) {
      let title = newCvData.summaryTitle || "PROFESSIONAL SUMMARY";
      let body = improvedContent.trim();
      
      const firstLineBreak = body.indexOf("\n");
      if (firstLineBreak !== -1) {
        const firstLine = body.substring(0, firstLineBreak).trim().replace(/^#+\s*/, "").replace(/\*\*/g, "");
        if (/^(professional summary|summary|about me|profile|overview|about)$/i.test(firstLine)) {
          title = firstLine.toUpperCase();
          body = body.substring(firstLineBreak + 1).trim();
        }
      } else {
        if (/^(professional summary|summary|about me|profile|overview|about)$/i.test(body)) {
          title = body.toUpperCase();
        }
      }
      
      // If the heading was 'ABOUT ME', update it to 'PROFESSIONAL SUMMARY' as advised by ATS
      if (title.toUpperCase().includes("ABOUT")) {
        title = "PROFESSIONAL SUMMARY";
      }

      newCvData.summaryTitle = title;
      newCvData.summary = body;
      sectionNameForToast = "Professional Summary";
    } else if (s.includes("skill")) {
      // Intelligent merge: split by comma, newline or bullets
      const newSkills = improvedContent
        .split(/[,\n•·\-\*]/)
        .map(x => x.trim().replace(/^[-•*]\s*/, ""))
        .filter(x => x.length > 1 && !x.includes(":") && x.length < 50);
      
      const existingSkills = Array.isArray(newCvData.skills) ? newCvData.skills : [];
      newCvData.skills = [...new Set([...existingSkills, ...newSkills])];
      sectionNameForToast = "Skills";
    } else if (s.includes("experience")) {
      if (newCvData.experience && newCvData.experience.length > 0) {
        newCvData.experience = [
          { ...newCvData.experience[0], description: improvedContent },
          ...newCvData.experience.slice(1)
        ];
      } else {
        newCvData.experience = [{
          role: newCvData.jobTitle || "Software Professional",
          company: "Company",
          start: "2023",
          end: "Present",
          description: improvedContent
        }];
      }
      sectionNameForToast = "Work Experience";
    } else if (s.includes("project")) {
      if (newCvData.projects && newCvData.projects.length > 0) {
        newCvData.projects = [
          { ...newCvData.projects[0], description: improvedContent },
          ...newCvData.projects.slice(1)
        ];
      } else {
        newCvData.projects = [{ title: "Featured Project", description: improvedContent }];
      }
      sectionNameForToast = "Projects";
    } else if (s.includes("education")) {
      if (newCvData.education && newCvData.education.length > 0) {
        newCvData.education = [
          { ...newCvData.education[0], details: improvedContent },
          ...newCvData.education.slice(1)
        ];
      } else {
        newCvData.education = [{
          degree: "Bachelor's Degree",
          university: "University",
          years: "2019 - 2023",
          details: improvedContent
        }];
      }
      sectionNameForToast = "Education";
    } else if (s.includes("cert")) {
      const items = improvedContent
        .split(/[,\n•·\-\*]/)
        .map(c => c.trim().replace(/^[-•*]\s*/, ""))
        .filter(Boolean);
      const newCerts = items.map(c => ({ name: c, issuer: "Accredited Provider", year: new Date().getFullYear().toString() }));
      newCvData.certifications = [...(newCvData.certifications || []), ...newCerts];
      sectionNameForToast = "Certifications";
    } else {
      newCvData.summary = improvedContent;
      sectionNameForToast = "CV Content";
    }

    setCvData(newCvData);
    setLastUpdatedSection(sectionNameForToast);
    setSuccessMessage(`Original Template updated: ${sectionNameForToast} section optimized!`);
    setShowUndoToast(true);
    setPreviewMode("original-template");
    
    // Clear highlight after 3.5 seconds
    setTimeout(() => setLastUpdatedSection(""), 3500);
    // Hide toast after 6 seconds
    setTimeout(() => setShowUndoToast(false), 6000);
  };

  const downloadUpdatedPdf = async () => {
    try {
      setDownloadingPdf(true);
      const filename = `${(cvData.fullName || "Updated_CV").replace(/\s+/g, "_")}_ATS_Optimized`;

      // If the user hasn't applied any AI improvements yet, directly provide the original uploaded PDF
      if (history.length === 0 && file && file instanceof File && (file.type === "application/pdf" || file.name?.toLowerCase().endsWith(".pdf"))) {
        const url = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }

      await exportService.exportToPDF("cv-pdf-export-root", filename);
    } catch (e) {
      console.error("Failed to export PDF", e);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const undoLastAction = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setCvData(lastState.data);
    setHistory(prev => prev.slice(0, -1));
    setShowUndoToast(false);
    setSuccessMessage("Undo successful.");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const reset = () => { 
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setFile(null); setResult(null); setError(""); setJobDesc(""); setCvText("");
    setValidationError(""); setValidationWarning(""); setIsInvalidFile(false);
    setCvData(EMPTY_CV); setHistory([]); setShowUndoToast(false);
    setSelectedTemplate("t3");
  };

  const handleAutoImprove = async (section, customInstruction = "", displayLabel = "") => {
    if (!cvText || optimizationLoading) return;
    setOptimizationLoading(true);
    setOptimizationError("");
    setAiImprovementResult(null);
    setCopiedText(false);
    try {
      const res = await improveSection(
        cvText, 
        result?.missingKeywords || [], 
        section, 
        customInstruction
      );
      setAiImprovementResult({ 
        section, 
        content: res, 
        label: displayLabel || `Improved ${section}` 
      });
    } catch (err) {
      setOptimizationError(err.message || "Failed to generate AI improvement.");
    } finally {
      setOptimizationLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Generate dynamic list of all actionable improvement cards from ATS diagnosis
  const actionableImprovements = React.useMemo(() => {
    if (!result) return [];
    const items = [];

    // 1. Missing Keywords Action
    if (result.missingKeywords && result.missingKeywords.length > 0) {
      items.push({
        id: "kw-incorporate",
        category: "keywords",
        section: "skills",
        title: "Integrate Missing Target Keywords",
        subtitle: `Inject ${result.missingKeywords.slice(0, 4).join(", ")} naturally into Skills & Experience`,
        badge: "+8% ATS Boost",
        badgeType: "keywords",
        instruction: `Naturally incorporate and emphasize these critical missing keywords: ${result.missingKeywords.join(", ")}. Optimize skills and summary with these ATS terms.`
      });
    }

    // 2. Measurable Metrics Action
    items.push({
      id: "action-metrics",
      category: "weak",
      section: "experience",
      title: "Add Measurable Metrics & Numbers",
      subtitle: "Add quantifiable achievements (percentages, scale, numbers) to experience bullets",
      badge: "+5% Impact",
      badgeType: "metrics",
      instruction: "Add quantifiable metrics, percentages, numbers, and scale to experience bullet points (e.g. improved performance by 35%, scaled to 50K+ users)."
    });

    // 3. Weak Sections from ATS Diagnostic
    const sectionDescriptions = {
      summary: "Write a high-converting, keyword-optimized professional summary.",
      experience: "Elevate experience bullet points using strong action verbs & impact.",
      skills: "Reorganize skills into high-ranking technical & professional keywords.",
      education: "Format education cleanly with degree, university & relevant coursework.",
      projects: "Detail technical architecture, tools used, and measurable results for projects."
    };

    Object.entries(result.sections || {}).forEach(([sec, score]) => {
      items.push({
        id: `sec-${sec}`,
        category: score < 70 ? "weak" : "sections",
        section: sec,
        title: `Optimize ${sec.charAt(0).toUpperCase() + sec.slice(1)} Section`,
        subtitle: sectionDescriptions[sec] || `Enhance ${sec} for ATS score improvement.`,
        score: score,
        badge: `${score}% Score`,
        badgeType: score < 50 ? "danger" : score < 70 ? "warning" : "success",
        instruction: `Fully optimize the ${sec} section to improve its ATS score from ${score}% to 95%+. Ensure high keyword density and professional ATS phrasing.`
      });
    });

    // 4. AI Suggestions from result
    (result.suggestions || []).forEach((s, idx) => {
      const targetSec = detectSectionFromText(s.text);
      items.push({
        id: `sug-${idx}`,
        category: "suggestions",
        section: targetSec,
        title: s.text,
        subtitle: `Target: ${targetSec.charAt(0).toUpperCase() + targetSec.slice(1)} Section`,
        badge: s.impact || "+3%",
        badgeType: "suggestion",
        instruction: `Implement this specific ATS recommendation: "${s.text}". Rewrite the ${targetSec} section accordingly.`
      });
    });

    // 5. Standard Sections Shortcuts
    ["summary", "experience", "skills", "projects", "education", "certifications"].forEach(sec => {
      if (!items.some(it => it.section === sec && it.category === "sections")) {
        items.push({
          id: `std-${sec}`,
          category: "sections",
          section: sec,
          title: `Enhance ${sec.charAt(0).toUpperCase() + sec.slice(1)}`,
          subtitle: `Refine and polish the ${sec} section for ATS algorithms`,
          badge: "Section",
          badgeType: "neutral",
          instruction: `Optimize and rewrite the ${sec} section for high ATS compatibility.`
        });
      }
    });

    return items;
  }, [result]);

  const filteredImprovements = React.useMemo(() => {
    if (activeImproveTab === "all") return actionableImprovements;
    if (activeImproveTab === "weak") {
      return actionableImprovements.filter(it => it.category === "weak" || (it.score !== undefined && it.score < 70));
    }
    if (activeImproveTab === "keywords") {
      return actionableImprovements.filter(it => it.category === "keywords" || it.id.includes("kw"));
    }
    if (activeImproveTab === "suggestions") {
      return actionableImprovements.filter(it => it.category === "suggestions");
    }
    if (activeImproveTab === "sections") {
      return actionableImprovements.filter(it => it.category === "sections");
    }
    return actionableImprovements;
  }, [actionableImprovements, activeImproveTab]);

  const verdictColor = (score) => score >= 80 ? "text-emerald-400" : score >= 60 ? "text-yellow-400" : "text-red-400";
  const ringColor   = (score) => score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex h-screen overflow-hidden bg-[#070B14] text-white">
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-[230px] flex-shrink-0 border-r border-white/5 bg-[#0A0D14] flex-col justify-between overflow-y-auto custom-scrollbar">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2 p-4 pb-2">
            <div className="bg-white/10 p-1.5 rounded-lg">
              <FileCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">ProCV Lite</span>
            <Menu className="w-5 h-5 ml-auto text-gray-400 cursor-pointer hover:text-white" />
          </div>

          {/* Profile */}
          <div className="px-3 mb-4">
            <div className="flex items-center gap-2 bg-[#111622] p-2 rounded-xl border border-white/5">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'User'}`} alt="User" className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-semibold truncate text-gray-200">{userFullName}</div>
                <div className="text-[10px] text-gray-500 truncate">{userEmail}</div>
              </div>
            </div>
          </div>

          <div className="px-3 space-y-4">
            {/* MAIN */}
            <div>
              <div className="text-[9px] font-bold text-gray-500 mb-1.5 px-2 uppercase tracking-wider">Main</div>
              <div className="space-y-1">
                <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </button>
                <button onClick={() => navigate('/my-cvs')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
                  <FileText className="w-4 h-4" /> My CVs
                </button>
                <button onClick={() => navigate('/builder')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
                  <PlusSquare className="w-4 h-4" /> Create New CV
                </button>
                <button onClick={() => navigate('/templates')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
                  <LayoutTemplate className="w-4 h-4" /> Templates
                </button>
              </div>
            </div>

            {/* AI TOOLS */}
            <div>
              <div className="text-[9px] font-bold text-gray-500 mb-1.5 px-2 uppercase tracking-wider">AI Tools</div>
              <div className="space-y-1">
                <button onClick={() => navigate('/ai-writer')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
                  <PenTool className="w-4 h-4" /> AI Writer
                </button>
                <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-medium shadow-lg shadow-indigo-500/20 transition-colors">
                  <FileCheck className="w-4 h-4" /> ATS Analyzer
                </button>
                <button onClick={() => navigate('/job-match')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
                  <Sparkles className="w-4 h-4" /> Job Match
                </button>
                <button onClick={() => navigate('/interview-questions')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
                  <MessageSquare className="w-4 h-4" /> Interview Questions
                </button>
                <button onClick={() => navigate('/cover-letter-generator')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
                  <FileSignature className="w-4 h-4" /> Cover Letter Generator
                </button>
              </div>
            </div>

            {/* ANALYTICS */}
            <div>
              <div className="text-[9px] font-bold text-gray-500 mb-1.5 px-2 uppercase tracking-wider">Analytics</div>
              <button onClick={() => navigate('/insights')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
                <BarChart2 className="w-4 h-4" /> Insights & Analytics
              </button>
            </div>

            {/* MANAGE */}
            <div>
              <div className="text-[9px] font-bold text-gray-500 mb-1.5 px-2 uppercase tracking-wider">Manage</div>
              <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
                <User className="w-4 h-4" /> My Profile
              </button>
              <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors">
                <Settings className="w-4 h-4" /> Settings
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Theme Toggle */}
        <div className="p-3 mt-4">
          <div className="flex items-center justify-center gap-4 bg-[#111622] p-2 rounded-2xl border border-white/5">
            <button className="text-gray-400 hover:text-white"><Sun className="w-4 h-4" /></button>
            <div className="w-10 h-5 bg-indigo-600 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
            </div>
            <button className="text-white"><Moon className="w-4 h-4" /></button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto bg-[#070B14] p-8 custom-scrollbar relative">
        {/* HEADER */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="mb-1 text-3xl font-bold">ATS Analyzer</h1>
            <p className="text-sm text-gray-400">Analyze your CV for ATS compatibility and get actionable AI-powered insights.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/builder")} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] transition hover:bg-indigo-700">
              <PlusSquare className="h-4 w-4" /> Create New CV
            </button>
            <NotificationDropdown />
            <ProfileDropdown />
          </div>
        </div>

        {/* ── SCORE CARDS (show when result available) ── */}
        {result && (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
            {[
              { label: "ATS Score",      score: result.atsScore,        color: "#6366f1", icon: <Target className="w-4 h-4 text-indigo-400" />, bg: "bg-indigo-500/10" },
              { label: "Resume Match",   score: result.resumeMatch,     color: "#3b82f6", icon: <FileText className="w-4 h-4 text-blue-400" />,   bg: "bg-blue-500/10" },
              { label: "Keyword Match",  score: result.keywordMatch,    color: "#10b981", icon: <FileDigit className="w-4 h-4 text-emerald-400" />, bg: "bg-emerald-500/10" },
              { label: "Formatting",     score: result.formattingScore, color: "#10b981", icon: <LayoutTemplate className="w-4 h-4 text-emerald-400" />, bg: "bg-emerald-500/10" },
              { label: "Readability",    score: result.readabilityScore,color: "#6366f1", icon: <Eye className="w-4 h-4 text-indigo-400" />,    bg: "bg-indigo-500/10" },
            ].map(c => (
              <div key={c.label} className="rounded-2xl border border-white/5 bg-[#111622] p-4 flex flex-col items-center justify-center relative shadow-lg">
                <div className={`absolute top-3 left-3 p-1.5 rounded-lg ${c.bg}`}>{c.icon}</div>
                <div className="text-[11px] text-gray-400 font-medium mb-3 mt-1">{c.label}</div>
                <div className="relative flex items-center justify-center mb-3">
                  <ScoreRing score={c.score} color={c.color} size={80} strokeW={6} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">{c.score}%</span>
                  </div>
                </div>
                <div className={`text-[11px] font-semibold ${verdictColor(c.score)}`}>
                  {c.score >= 80 ? "Excellent" : c.score >= 60 ? "Good" : "Needs Work"}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── MAIN GRID ── */}
        <div className={`gap-6 mb-6 ${result ? "grid grid-cols-1 lg:grid-cols-[1fr_1.5fr_1.1fr]" : "flex justify-center"}`}>

          {/* COLUMN 1 — Upload + Keyword analysis */}
          <div className="flex flex-col gap-6">
            {/* Upload */}
            <div className="rounded-2xl border border-white/5 bg-[#111622] p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-semibold text-white">Upload Your CV</h3>
                {(file || result) && (
                  <button onClick={reset} className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition">
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                )}
              </div>

               {/* Drop zone */}
              {isAutoLoading ? (
                 <div className="border-2 border-indigo-500/30 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center mb-4 bg-indigo-500/5 min-h-[160px]">
                    <div className="relative mb-6">
                       <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                       <Sparkles className="w-6 h-6 text-indigo-300 absolute -top-1 -right-1 animate-pulse" />
                    </div>
                    <h4 className="text-sm font-bold text-white mb-2">{autoLoadingStep}</h4>
                    <p className="text-[11px] text-gray-500 animate-pulse">Running AI-powered ATS diagnostic...</p>
                 </div>
              ) : (
                <div
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => !file && !isValidating && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 py-8 flex flex-col items-center justify-center text-center mb-4 transition-colors cursor-pointer ${
                    isValidating ? "border-indigo-500/20 bg-indigo-500/5 animate-pulse" :
                    file ? "border-emerald-500/40 bg-emerald-500/5" : 
                    isInvalidFile ? "border-red-500/40 bg-red-500/5" :
                    "border-indigo-500/30 bg-indigo-500/5 hover:border-indigo-500/50"
                  }`}
                >
                  <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={e => handleFile(e.target.files[0])} />
                  {isValidating ? (
                    <>
                      <Loader2 className="w-10 h-10 text-indigo-400 mb-3 animate-spin" />
                      <p className="text-[13px] text-gray-300 mb-1">Validating CV...</p>
                    </>
                  ) : file ? (
                    <>
                      {file.isAuto ? <FileDigit className="w-10 h-10 text-indigo-400 mb-2" /> : <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />}
                      <p className={`text-[13px] font-semibold mb-1 truncate max-w-[180px] ${file.isAuto ? 'text-indigo-300' : 'text-emerald-300'}`}>{file.name}</p>
                      <p className="text-[11px] text-gray-500">{file.isAuto ? 'AI Selected Profile' : (file.size / 1024).toFixed(0) + ' KB'}</p>
                    </>
                  ) : isInvalidFile ? (
                    <>
                      <XCircle className="w-10 h-10 text-red-400 mb-3" />
                      <p className="text-[13px] text-red-300 mb-1">Invalid CV Format</p>
                      <button className="mt-2 bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg transition">Try Another</button>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-10 h-10 text-indigo-400 mb-3" />
                      <p className="text-[13px] text-gray-300 mb-1">Drag & drop your CV here</p>
                      <p className="text-[11px] text-gray-500 mb-3">or</p>
                      <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition">Choose File</button>
                    </>
                  )}
                </div>
              )}

              <div className="text-[10px] text-gray-500 mb-3 text-center">Supported: PDF, DOCX · Max 10MB</div>

              {/* Optional job description */}
              <textarea
                value={jobDesc}
                onChange={e => setJobDesc(e.target.value)}
                placeholder="Paste job description here (optional — improves keyword matching)"
                rows={3}
                className="w-full bg-[#0A0D14] border border-white/5 rounded-xl p-3 text-xs text-gray-300 placeholder:text-gray-600 outline-none resize-none mb-4 focus:border-indigo-500/40"
              />

              {validationError && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-xs text-red-400">
                  <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {validationError}
                </div>
              )}

              {validationWarning && !error && (
                <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4 text-xs text-amber-400">
                  <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" /> {validationWarning}
                </div>
              )}

              {error && (
                <div className="flex flex-col gap-1 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-xs text-red-400">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
                  </div>
                  {error.includes("Daily AI limit reached") && (
                    <p className="text-[10px] text-red-400/60 ml-6 italic">The free AI limit resets automatically.</p>
                  )}
                </div>
              )}

              <button
                onClick={analyze}
                disabled={analyzing || cooldown || !file || isValidating}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 py-3 rounded-xl text-sm font-semibold text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {analyzing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</>
                ) : cooldown ? (
                  <><RotateCcw className="w-4 h-4 animate-spin" /> Waiting...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Analyze CV</>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] text-emerald-400/80">
                <ShieldCheck className="w-3.5 h-3.5" /> Your data is processed securely
              </div>
            </div>

            {/* Keyword chart — only when result */}
            {result && (() => {
              const matched = result.matchedKeywords?.length || 0;
              const missing = result.missingKeywords?.length || 0;
              const partial = result.partialKeywords?.length || 0;
              const total   = matched + missing + partial || 1;
              const circ = 2 * Math.PI * 40;
              const matchedD = circ * (matched / total);
              const partialD = circ * (partial / total);
              return (
                <div className="rounded-2xl border border-white/5 bg-[#111622] p-5">
                  <h3 className="text-[15px] font-semibold text-white mb-5">Keyword Analysis</h3>
                  <div className="flex items-center gap-6">
                    <div className="relative flex h-24 w-24 items-center justify-center flex-shrink-0">
                      <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="12" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="12" strokeDasharray={`${partialD} ${circ - partialD}`} strokeDashoffset={-(matchedD)} />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray={`${matchedD} ${circ - matchedD}`} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-white leading-tight">{result.keywordMatch}%</span>
                        <span className="text-[9px] text-gray-400">Matched</span>
                      </div>
                    </div>
                    <div className="space-y-3 w-full">
                      {[
                        { label: "Matched", color: "bg-emerald-500", count: matched, pct: Math.round(matched/total*100) },
                        { label: "Missing",  color: "bg-red-500",     count: missing, pct: Math.round(missing/total*100) },
                        { label: "Partial",  color: "bg-yellow-500",  count: partial, pct: Math.round(partial/total*100) },
                      ].map(r => (
                        <div key={r.label} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2"><div className={`w-2.5 h-2.5 rounded-sm ${r.color}`} /><span className="text-gray-300">{r.label} Keywords</span></div>
                          <div className="flex gap-2"><span className="text-gray-400">{r.pct}%</span><span className="text-gray-500">({r.count})</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* COLUMN 2 — Score overview + Section analysis + Strengths */}
          {result && (
            <div className="flex flex-col gap-6">
              {/* Score Overview */}
              <div className="rounded-2xl border border-white/5 bg-[#111622] p-6 shadow-lg flex flex-col">
                <h3 className="text-[15px] font-semibold text-white mb-6">Score Overview</h3>
                <div className="flex items-center gap-8 mb-6">
                  <div className="relative flex h-40 w-40 items-center justify-center flex-shrink-0 ml-2">
                    <ScoreRing score={result.atsScore} color={ringColor(result.atsScore)} size={160} strokeW={8} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-white mb-1">{result.atsScore}%</span>
                      <span className="text-xs text-gray-400 font-medium">ATS Score</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-[15px] font-bold mb-2 ${verdictColor(result.atsScore)}`}>
                      {result.overallVerdict || (result.atsScore >= 80 ? "Great Job! 🎉" : result.atsScore >= 60 ? "Good Start 👍" : "Needs Improvement ⚠️")}
                    </h4>
                    <p className="text-[13px] text-gray-400 leading-relaxed mb-6">{result.summaryMessage}</p>
                    <div className="flex items-start justify-between border-t border-white/5 pt-5 pr-2">
                      <div><div className="text-[10px] text-gray-400 mb-1">Total Issues</div><div className="text-xl font-bold text-yellow-500 mb-0.5">{result.totalIssues}</div><div className="text-[9px] text-yellow-500/80">Needs Fix</div></div>
                      <div><div className="text-[10px] text-gray-400 mb-1">Strengths</div><div className="text-xl font-bold text-emerald-400 mb-0.5">{result.strengthsFound}</div><div className="text-[9px] text-emerald-400/80">Good Points</div></div>
                      <div><div className="text-[10px] text-gray-400 mb-1">Optimized</div><div className="text-xl font-bold text-indigo-400 mb-0.5">{result.optimizedSections}<span className="text-sm text-gray-500 font-medium">/{result.totalSections}</span></div><div className="text-[9px] text-indigo-400/80">Sections</div></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Section Analysis */}
                <div className="rounded-2xl border border-white/5 bg-[#111622] p-5 flex flex-col">
                  <h3 className="text-[15px] font-semibold text-white mb-6">Section Analysis</h3>
                  <div className="space-y-4 flex-1">
                    {Object.entries(result.sections || {}).map(([name, score]) => (
                      <div key={name} className="flex items-center gap-3 text-xs">
                        <span className="w-28 text-gray-300 capitalize truncate">{name}</span>
                        <div className="flex-1 h-1.5 bg-[#0A0D14] rounded-full overflow-hidden border border-white/5">
                          <div className={`h-full rounded-full ${score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${score}%` }} />
                        </div>
                        <span className="w-8 text-right text-gray-400 font-medium">{score}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strengths */}
                <div className="rounded-2xl border border-white/5 bg-[#111622] p-5 flex flex-col">
                  <h3 className="text-[15px] font-semibold text-white mb-5">Top Strengths</h3>
                  <ul className="space-y-3 flex-1">
                    {(result.strengths || []).slice(0, 6).map((s, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-xs text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />{s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* COLUMN 3 — Keywords + Suggestions + Tips */}
          {result && (
            <div className="flex flex-col gap-6">
              {/* Missing Keywords */}
              <div className="rounded-2xl border border-white/5 bg-[#111622] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[15px] font-semibold text-white">Missing Keywords</h3>
                  <span className="px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 text-[10px] font-bold">{result.missingKeywords?.length || 0}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(result.missingKeywords || []).map(kw => (
                    <span key={kw} className="px-2.5 py-1 rounded-lg bg-[#0A0D14] border border-white/5 text-[10px] text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-colors cursor-default">{kw}</span>
                  ))}
                </div>
                {(result.matchedKeywords || []).length > 0 && (
                  <>
                    <div className="text-[10px] text-emerald-400 font-semibold mb-2 mt-3">✓ Matched Keywords</div>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedKeywords.slice(0, 12).map(kw => (
                        <span key={kw} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300">{kw}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Suggestions */}
              <div className="rounded-2xl border border-white/5 bg-[#111622] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-[15px] font-semibold text-white">Top Suggestions</h3>
                </div>
                <div className="space-y-3 mb-4">
                  {(result.suggestions || []).slice(0, 4).map((s, i) => (
                    <div key={i} className="flex items-start justify-between gap-3 text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-start gap-2">
                        <Zap className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 leading-snug">{s.text}</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 whitespace-nowrap">{s.impact}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weaknesses */}
              {(result.weaknesses || []).length > 0 && (
                <div className="rounded-2xl border border-white/5 bg-[#111622] p-5 flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    <h3 className="text-[15px] font-semibold text-white">Areas to Improve</h3>
                  </div>
                  <ul className="space-y-3">
                    {result.weaknesses.slice(0, 5).map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                        <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />{w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── BOTTOM BANNER ── */}
        <div className="rounded-2xl border border-indigo-500/20 bg-[#111622] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_20px_rgba(79,70,229,0.1)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="h-12 w-12 rounded-xl bg-indigo-600/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-0.5">Want to improve your score?</h3>
              <p className="text-xs text-gray-400">Let AI optimize your CV and make it ATS-friendly.</p>
            </div>
          </div>
          <button 
            onClick={() => result && setIsOptimizeModalOpen(true)} 
            disabled={!result}
            className={`relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg ${
              result 
                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20" 
                : "bg-white/5 text-gray-500 cursor-not-allowed opacity-50"
            }`}
            title={!result ? "Analyze a CV first to unlock AI optimization" : ""}
          >
            <Sparkles className="w-4 h-4" /> Optimize with AI
          </button>
        </div>
      </main>

      {/* AI OPTIMIZATION MODAL */}
      {isOptimizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#0A0D14] border border-white/10 w-full max-w-5xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-white/5 flex items-center justify-between bg-[#111622]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">Optimize with AI</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      1-Click ATS Enhancer
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Click any detected flaw below to instantly improve your CV for maximum ATS score.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOptimizeModalOpen(false)} 
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar bg-[#070B14] space-y-8">
              
              {/* TOP SPLIT: TIPS & 1-CLICK ACTIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.6fr] gap-6">
                
                {/* Left: Interactive Improvement Tips */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-400" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Detected Deficiencies (Click to Fix)</h3>
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">Click any item ⚡</span>
                  </div>
                  
                  {/* Critical Actions Card */}
                  <div className="p-4 rounded-2xl bg-[#111622] border border-white/5 space-y-3">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center justify-between">
                      <span>Critical ATS Actions</span>
                      <span className="text-indigo-400 text-[10px]">1-Click Triggers</span>
                    </div>

                    <div className="space-y-2">
                      {result?.missingKeywords?.length > 0 && (
                        <button
                          onClick={() => handleAutoImprove("skills", `Naturally incorporate and emphasize missing keywords: ${result.missingKeywords.join(", ")}`, "Incorporate Missing Keywords")}
                          className="w-full text-left p-2.5 rounded-xl bg-white/[0.03] hover:bg-indigo-600/10 border border-white/5 hover:border-indigo-500/40 transition-all group flex items-start gap-2.5"
                        >
                          <Flame className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                          <div className="flex-1">
                            <div className="text-xs text-gray-200 font-medium leading-snug">
                              Missing keywords: <span className="text-indigo-400 font-semibold">{result.missingKeywords.slice(0, 3).join(", ")}</span>
                            </div>
                            <div className="text-[10px] text-indigo-400/80 group-hover:text-indigo-300 flex items-center gap-1 mt-1">
                              <Zap className="w-3 h-3" /> Click to auto-inject into Skills & Experience
                            </div>
                          </div>
                        </button>
                      )}

                      {Object.entries(result?.sections || {}).filter(([_, s]) => s < 70).map(([name, score]) => (
                        <button
                          key={name}
                          onClick={() => handleAutoImprove(name, `Fully rewrite and optimize the ${name} section to improve ATS score from ${score}% to 95%+`, `Optimize ${name}`)}
                          className="w-full text-left p-2.5 rounded-xl bg-white/[0.03] hover:bg-indigo-600/10 border border-white/5 hover:border-indigo-500/40 transition-all group flex items-start gap-2.5"
                        >
                          <ArrowRight className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                          <div className="flex-1">
                            <div className="text-xs text-gray-200 capitalize font-medium flex items-center justify-between">
                              <span>Improve your {name} section</span>
                              <span className="text-[10px] text-red-400 font-bold bg-red-500/10 px-1.5 py-0.5 rounded">{score}%</span>
                            </div>
                            <div className="text-[10px] text-gray-500 group-hover:text-indigo-300 flex items-center gap-1 mt-0.5">
                              <Zap className="w-3 h-3" /> Rewrite & optimize for ATS
                            </div>
                          </div>
                        </button>
                      ))}

                      <button
                        onClick={() => handleAutoImprove("experience", "Add measurable achievements with quantifiable metrics, percentages, numbers, and scale", "Quantify Achievements")}
                        className="w-full text-left p-2.5 rounded-xl bg-white/[0.03] hover:bg-indigo-600/10 border border-white/5 hover:border-indigo-500/40 transition-all group flex items-start gap-2.5"
                      >
                        <Zap className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                        <div className="flex-1">
                          <div className="text-xs text-gray-200 font-medium">Add measurable achievements (numbers, %)</div>
                          <div className="text-[10px] text-emerald-400/80 group-hover:text-emerald-300 flex items-center gap-1 mt-0.5">
                            <Zap className="w-3 h-3" /> Apply Google XYZ formula to bullet points
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Top Suggestions Card */}
                  <div className="p-4 rounded-2xl bg-[#111622] border border-white/5 space-y-3">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center justify-between">
                      <span>Top Suggestions</span>
                      <span className="text-emerald-400 text-[10px]">Boost Impact</span>
                    </div>
                    <div className="space-y-2">
                      {(result?.suggestions || []).slice(0, 3).map((s, i) => {
                        const targetSec = detectSectionFromText(s.text);
                        return (
                          <button
                            key={i}
                            onClick={() => handleAutoImprove(targetSec, s.text, `Suggestion Fix: ${s.text.substring(0, 24)}...`)}
                            className="w-full text-left p-2.5 rounded-xl bg-white/[0.03] hover:bg-indigo-600/10 border border-white/5 hover:border-indigo-500/40 transition-all group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs text-gray-300 leading-snug group-hover:text-white transition-colors">{s.text}</span>
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                                {s.impact}
                              </span>
                            </div>
                            <div className="text-[10px] text-indigo-400 mt-1 flex items-center gap-1 opacity-80 group-hover:opacity-100">
                              <Sparkles className="w-3 h-3" /> Click to auto-execute in {targetSec}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Weak Sections Badges Card */}
                  <div className="p-4 rounded-2xl bg-[#111622] border border-white/5 space-y-2">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Weak Sections (Click badge to optimize)
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(result?.sections || {}).map(([name, score]) => (
                        <button
                          key={name}
                          onClick={() => handleAutoImprove(name, `Fully optimize the ${name} section to improve score from ${score}%`, `Fix ${name}`)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 ${
                            score >= 80 
                              ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20" 
                              : score >= 60 
                              ? "border-yellow-500/30 text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20" 
                              : "border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20 animate-pulse"
                          }`}
                        >
                          <Zap className="w-3 h-3" />
                          <span>{name.toUpperCase()}: {score}%</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: AI Auto-Improve Action Board */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Auto-Improve Hub</h3>
                    </div>
                    {aiImprovementResult && (
                      <button 
                        onClick={() => setAiImprovementResult(null)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors flex items-center gap-1"
                      >
                        ← Back to options
                      </button>
                    )}
                  </div>

                  {/* If not generated yet and not loading: show dynamic list of actionable buttons */}
                  {!aiImprovementResult && !optimizationLoading ? (
                    <div className="flex-1 flex flex-col p-4 rounded-3xl bg-[#111622] border border-white/5">
                      {/* Filter category pills */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 border-b border-white/5 custom-scrollbar">
                        {[
                          { id: "all", label: "All Fixes", count: actionableImprovements.length },
                          { id: "weak", label: "Weak Sections", count: actionableImprovements.filter(x => x.category === "weak" || (x.score !== undefined && x.score < 70)).length },
                          { id: "keywords", label: "Keywords", count: actionableImprovements.filter(x => x.category === "keywords").length },
                          { id: "suggestions", label: "AI Suggestions", count: actionableImprovements.filter(x => x.category === "suggestions").length },
                          { id: "sections", label: "Sections", count: actionableImprovements.filter(x => x.category === "sections").length },
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveImproveTab(tab.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                              activeImproveTab === tab.id
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                            }`}
                          >
                            {tab.label} {tab.count > 0 && <span className="opacity-70 text-[10px]">({tab.count})</span>}
                          </button>
                        ))}
                      </div>

                      <div className="text-xs text-gray-400 mb-3 px-1">
                        Select any item below to have AI rewrite it professionally with 1-click:
                      </div>

                      {/* Dynamic Actionable Items Cards Grid */}
                      <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1 custom-scrollbar">
                        {filteredImprovements.map(item => (
                          <div
                            key={item.id}
                            className="p-3.5 rounded-2xl bg-[#0A0D14] border border-white/5 hover:border-indigo-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                          >
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-400 mt-0.5 border border-indigo-500/20 flex-shrink-0 group-hover:scale-110 transition-transform">
                                <Sparkles className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    item.badgeType === "danger" ? "bg-red-500/15 text-red-400 border border-red-500/20" :
                                    item.badgeType === "warning" ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" :
                                    item.badgeType === "keywords" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-extrabold" :
                                    "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-bold"
                                  }`}>
                                    {item.badge}
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed line-clamp-2">{item.subtitle}</p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleAutoImprove(item.section, item.instruction, item.title)}
                              className="self-end sm:self-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              1-Click Fix
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : optimizationLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-white/5 rounded-3xl bg-[#111622]">
                      <div className="relative mb-6">
                        <div className="w-16 h-16 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                        <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-indigo-400 animate-pulse" />
                      </div>
                      <h4 className="text-lg font-bold text-white mb-1">Optimizing Section...</h4>
                      <p className="text-xs text-gray-400 max-w-xs">AI is applying ATS algorithms, keywords, and action metrics...</p>
                      <div className="mt-6 w-full max-w-xs h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 animate-shimmer" style={{ width: '100%', background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.4), transparent)', backgroundSize: '200% 100%' }} />
                      </div>
                    </div>
                  ) : optimizationError ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-red-500/20 rounded-3xl bg-red-500/5">
                      <XCircle className="w-12 h-12 text-red-500 mb-4" />
                      <h4 className="text-lg font-bold text-white mb-2">Optimization Failed</h4>
                      <p className="text-xs text-red-400 mb-6">{optimizationError}</p>
                      <button 
                        onClick={() => setAiImprovementResult(null)} 
                        className="px-6 py-2 rounded-xl bg-white/10 text-xs font-bold text-white hover:bg-white/20 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col p-5 rounded-3xl bg-[#111622] border border-white/5 animate-in slide-in-from-right-4 duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                            {aiImprovementResult.label || `Improved ${aiImprovementResult.section}`}
                          </span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-bold">
                            ATS Ready
                          </span>
                        </div>
                        <button 
                          onClick={() => setAiImprovementResult(null)} 
                          className="text-[11px] font-bold text-gray-400 hover:text-white transition-colors"
                        >
                          ← Choose Another
                        </button>
                      </div>

                      <div className="flex-1 p-4 rounded-2xl bg-[#0A0D14] border border-white/5 text-xs text-gray-200 leading-relaxed overflow-y-auto max-h-[260px] whitespace-pre-wrap custom-scrollbar select-text">
                        {aiImprovementResult.content}
                      </div>

                      <div className="mt-4 flex flex-col gap-2.5">
                        <div className="flex gap-2.5">
                          <button 
                            onClick={() => applyImprovement(aiImprovementResult.section, aiImprovementResult.content)}
                            className="flex-[2] flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-95"
                          >
                            <Sparkles className="w-4 h-4" /> Apply to CV Preview
                          </button>
                          <button 
                            onClick={() => copyToClipboard(aiImprovementResult.content)}
                            className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl text-xs font-bold transition-all border border-white/10"
                          >
                            {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            {copiedText ? "Copied!" : "Copy"}
                          </button>
                          <button 
                            onClick={() => handleAutoImprove(aiImprovementResult.section, "", aiImprovementResult.label)}
                            className="px-3.5 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10"
                            title="Regenerate"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {showUndoToast && (
                          <div className="flex items-center justify-between px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl animate-in slide-in-from-bottom-2">
                            <span className="text-xs text-indigo-300 font-medium">{successMessage}</span>
                            <button onClick={undoLastAction} className="text-[11px] font-bold text-white bg-indigo-600 px-2.5 py-1 rounded-lg hover:bg-indigo-700 transition-colors">
                              Undo
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* BOTTOM: LIVE PREVIEW & TEMPLATE SYNCHRONIZATION */}
              <div className="pt-6 border-t border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Eye className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Preview & Template Sync</h3>
                        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      </div>
                      <p className="text-[11px] text-gray-400">
                        {previewMode === "original-template" 
                          ? "✨ Rendering: Original Uploaded Template (Live AI Changes Applied)"
                          : previewMode === "alternative-templates"
                          ? `🎨 Rendering Alternative: ${TEMPLATES_LIST.find(t => t.id === selectedTemplate)?.name || "Modern ATS"}`
                          : "📄 Viewing Raw Uploaded PDF File (Before AI Reference)"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* View mode toggle */}
                    <div className="flex items-center bg-[#111622] p-1 rounded-xl border border-white/10">
                      <button
                        onClick={() => setPreviewMode("original-template")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                          previewMode === "original-template" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold" : "text-gray-400 hover:text-white"
                        }`}
                      >
                        ⭐ Original CV (AI-Updated)
                      </button>
                      
                      <button
                        onClick={() => setPreviewMode("alternative-templates")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          previewMode === "alternative-templates" ? "bg-indigo-600 text-white shadow" : "text-gray-400 hover:text-white"
                        }`}
                      >
                        🎨 ProCV Themes
                      </button>

                      {filePreviewUrl && (
                        <button
                          onClick={() => setPreviewMode("raw-pdf")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            previewMode === "raw-pdf" ? "bg-gray-700 text-white shadow" : "text-gray-400 hover:text-white"
                          }`}
                        >
                          📄 Raw PDF (Before AI)
                        </button>
                      )}
                    </div>

                    {/* Page selector for Original CV */}
                    {previewMode === "original-template" && (
                      <div className="flex items-center bg-[#111622] p-1 rounded-xl border border-white/10 text-xs">
                        <button
                          onClick={() => setPreviewPage("all")}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                            previewPage === "all" ? "bg-emerald-600 text-white font-bold shadow" : "text-gray-400 hover:text-white"
                          }`}
                          title="View both pages with divider"
                        >
                          📜 Both Pages
                        </button>
                        <button
                          onClick={() => setPreviewPage(1)}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                            previewPage === 1 ? "bg-emerald-600 text-white font-bold shadow" : "text-gray-400 hover:text-white"
                          }`}
                          title="View Page 1 only"
                        >
                          📄 Page 1
                        </button>
                        <button
                          onClick={() => setPreviewPage(2)}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                            previewPage === 2 ? "bg-emerald-600 text-white font-bold shadow" : "text-gray-400 hover:text-white"
                          }`}
                          title="View Page 2 only"
                        >
                          📄 Page 2
                        </button>
                      </div>
                    )}

                    {/* Download Updated PDF Button */}
                    <button
                      onClick={downloadUpdatedPdf}
                      disabled={downloadingPdf}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] disabled:opacity-50"
                      title="Download the updated original CV as a clean multi-page A4 PDF"
                    >
                      {downloadingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                      {downloadingPdf ? "Generating..." : "Download Updated PDF"}
                    </button>

                    {/* Open in Builder Button */}
                    <button
                      onClick={() => {
                        setIsOptimizeModalOpen(false);
                        navigate('/builder', { state: { cvData, templateId: selectedTemplate } });
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open in Builder
                    </button>
                  </div>
                </div>

                {/* Notice banner when viewing raw-pdf */}
                {previewMode === "raw-pdf" && (
                  <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-300 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 flex-shrink-0 text-amber-400" />
                      <span>
                        You are viewing your <strong>unedited raw PDF file</strong> as uploaded. To see your AI optimizations applied, switch to the <strong>Original CV (AI-Updated)</strong> tab.
                      </span>
                    </div>
                    <button
                      onClick={() => setPreviewMode("original-template")}
                      className="px-3 py-1 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition-colors whitespace-nowrap text-[11px]"
                    >
                      View AI-Updated CV →
                    </button>
                  </div>
                )}

                {/* Template Selector Bar (visible in alternative-templates mode) */}
                {previewMode === "alternative-templates" && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 custom-scrollbar">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 flex-shrink-0 mr-1">
                      <Layers className="w-3.5 h-3.5" /> Theme:
                    </span>
                    {TEMPLATES_LIST.map(tmpl => (
                      <button
                        key={tmpl.id}
                        onClick={() => setSelectedTemplate(tmpl.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 flex-shrink-0 border ${
                          selectedTemplate === tmpl.id
                            ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30"
                            : "bg-[#111622] text-gray-400 border-white/5 hover:text-white hover:bg-white/5"
                        }`}
                        title={tmpl.desc}
                      >
                        {tmpl.name}
                        {selectedTemplate === tmpl.id && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Preview Canvas */}
                {previewMode === "raw-pdf" && filePreviewUrl ? (
                  <div className="w-full h-[620px] rounded-2xl border border-white/10 bg-white overflow-hidden shadow-2xl">
                    <iframe src={filePreviewUrl} title="Original Raw PDF Document" className="w-full h-full" />
                  </div>
                ) : previewMode === "alternative-templates" ? (
                  <div className="rounded-2xl border border-white/10 bg-white overflow-hidden shadow-2xl origin-top scale-[0.62] -mb-[26%] mx-auto w-[794px] transition-all duration-500">
                    <div className={`p-0 transition-all duration-700 ${lastUpdatedSection ? 'ring-8 ring-indigo-500/40' : ''}`}>
                      {(() => {
                        const activeTmpl = TEMPLATES_LIST.find(t => t.id === selectedTemplate) || TEMPLATES_LIST[0];
                        const Comp = activeTmpl.comp;
                        return <Comp cv={{ ...cvData, theme: cvData.themeManual }} />;
                      })()}
                    </div>
                  </div>
                ) : (
                  /* DEFAULT: ORIGINAL UPLOADED TEMPLATE WITH REAL-TIME AI UPDATES (PAGINATED & SCROLLABLE) */
                  <div className="w-full max-h-[700px] overflow-y-auto rounded-2xl border border-white/10 bg-[#090d16] p-4 sm:p-6 shadow-2xl custom-scrollbar flex flex-col items-center">
                    <div className="w-[794px] origin-top scale-[0.72] sm:scale-[0.80] md:scale-[0.85] transition-all duration-300">
                      <div className={`transition-all duration-700 ${lastUpdatedSection ? 'ring-8 ring-emerald-500/40' : ''}`}>
                        <OriginalUploadedTemplate
                          cv={cvData}
                          lastUpdatedSection={lastUpdatedSection}
                          pageToShow={previewPage}
                          isExport={false}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Offscreen target for crisp multi-page PDF export */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "794px",
                    opacity: 0,
                    pointerEvents: "none",
                    zIndex: -9999,
                  }}
                >
                  <div id="cv-pdf-export-root">
                    <OriginalUploadedTemplate
                      cv={cvData}
                      lastUpdatedSection=""
                      pageToShow="all"
                      isExport={true}
                    />
                  </div>
                </div>

                {lastUpdatedSection && (
                  <div className="text-center mt-4 text-emerald-400 text-xs font-bold animate-pulse">
                    ✨ Original Template Updated: Section "{lastUpdatedSection}" synchronized!
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-white/5 bg-[#111622] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Existing data preserved. Instant ATS preview sync enabled.</span>
              </div>
              <button 
                onClick={() => setIsOptimizeModalOpen(false)} 
                className="px-6 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
}

