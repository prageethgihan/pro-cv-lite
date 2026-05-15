import React, { useEffect, useRef, useState } from "react";
import {
  X,
  Search,
  Clock,
  Copy,
  RotateCcw,
  Trash2,
  FileText,
  Sparkles,
  CheckCircle2,
  History,
  Target,
  AlignLeft,
  Edit3,
  LayoutTemplate,
  Zap,
} from "lucide-react";

/* ─── Tone colour map ─── */
const TONE_STYLES = {
  Professional: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/20" },
  Modern:       { bg: "bg-indigo-500/15", text: "text-indigo-400", border: "border-indigo-500/20" },
  Creative:     { bg: "bg-violet-500/15", text: "text-violet-400", border: "border-violet-500/20" },
  Concise:      { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/20" },
};

/* ─── Type icon map ─── */
const TYPE_ICONS = {
  "Professional Summary": LayoutTemplate,
  "Experience Bullets":   AlignLeft,
  "Skills & Keywords":    Sparkles,
  "Custom Content":       Edit3,
};

function typeIcon(type) {
  const Icon = TYPE_ICONS[type] || FileText;
  return <Icon className="h-4 w-4" />;
}

function formatDate(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return (
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
}

/* ─── Single history row ─── */
function HistoryItem({ item, onCopy, onReuse, onDelete, copied }) {
  const tone = item.type?.split(" ")[0] || "Professional";
  const ts = TONE_STYLES[item.tone] || TONE_STYLES.Professional;

  return (
    <div className="group relative flex flex-col gap-3 rounded-2xl border border-white/5 bg-[#0d1120] p-4 transition-all duration-200 hover:border-indigo-500/25 hover:bg-[#111827] hover:shadow-[0_0_20px_rgba(99,102,241,0.05)]">
      {/* Row 1: icon + title + time */}
      <div className="flex items-start gap-3 min-w-0">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
          {typeIcon(item.type)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-white truncate max-w-[220px]">{item.title}</h4>
            {/* ATS badge */}
            <span className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400 tracking-wide">
              <CheckCircle2 className="h-2.5 w-2.5" /> ATS
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2 flex-wrap">
            <span className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold tracking-wide ${ts.bg} ${ts.text} ${ts.border}`}>
              {item.tone || "Professional"}
            </span>
            <span className="text-[10px] text-gray-500 flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" /> {formatDate(item.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: snippet */}
      <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2 pl-0">
        {item.text || "—"}
      </p>

      {/* Row 3: actions */}
      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          onClick={() => onCopy(item)}
          title="Copy"
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-all ${
            copied === item.id
              ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
              : "border-white/8 bg-white/5 text-gray-400 hover:border-white/15 hover:text-white"
          }`}
        >
          {copied === item.id ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied === item.id ? "Copied!" : "Copy"}
        </button>

        <button
          onClick={() => onReuse(item)}
          title="Reuse in editor"
          className="flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-[11px] font-semibold text-indigo-400 transition-all hover:bg-indigo-500/20 hover:text-white"
        >
          <RotateCcw className="h-3 w-3" /> Reuse
        </button>

        <button
          onClick={() => onDelete(item.id)}
          title="Delete"
          className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-[11px] font-semibold text-red-400 transition-all hover:bg-red-500/15 hover:text-white"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

/* ─── Empty state ─── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-2xl" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-[#111622] border border-white/8 shadow-xl">
          <History className="h-9 w-9 text-indigo-400" />
          <Sparkles className="absolute -right-1 -top-1 h-5 w-5 text-yellow-400" />
        </div>
      </div>
      <h3 className="mb-2 text-lg font-bold text-white">No AI generation history yet</h3>
      <p className="max-w-xs text-sm text-gray-400 leading-relaxed">
        Start generating content in the AI Writer to build your history library here.
      </p>
    </div>
  );
}

/* ─── Skeleton loader ─── */
function SkeletonItem() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-[#0d1120] p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl bg-white/5 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-40 rounded bg-white/5" />
          <div className="h-2.5 w-24 rounded bg-white/5" />
        </div>
      </div>
      <div className="space-y-1.5 pl-0">
        <div className="h-2 w-full rounded bg-white/5" />
        <div className="h-2 w-4/5 rounded bg-white/5" />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN MODAL COMPONENT
══════════════════════════════════════════════════════════════ */
export default function AIHistoryModal({ open, onClose, history, onReuse, onDelete }) {
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(null);
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef(null);
  const searchRef = useRef(null);

  /* ─── Animate in/out ─── */
  useEffect(() => {
    if (open) {
      // prevent bg scroll
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => setVisible(true));
      setTimeout(() => searchRef.current?.focus(), 300);
    } else {
      setVisible(false);
      setTimeout(() => {
        document.body.style.overflow = "";
        setSearch("");
      }, 300);
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  /* ─── ESC to close ─── */
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  /* ─── Backdrop click ─── */
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  /* ─── Copy handler ─── */
  const handleCopy = (item) => {
    navigator.clipboard.writeText(item.text || "");
    setCopied(item.id);
    setTimeout(() => setCopied(null), 2000);
  };

  /* ─── Filter ─── */
  const filtered = (history || []).filter((item) => {
    const q = search.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.type?.toLowerCase().includes(q) ||
      item.tone?.toLowerCase().includes(q) ||
      item.text?.toLowerCase().includes(q)
    );
  });

  if (!open && !visible) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        backgroundColor: `rgba(5, 8, 18, ${visible ? 0.8 : 0})`,
        backdropFilter: `blur(${visible ? 12 : 0}px)`,
        transition: "background-color 0.3s ease, backdrop-filter 0.3s ease",
      }}
    >
      {/* Modal card */}
      <div
        className="relative flex w-full max-w-2xl flex-col rounded-[24px] border border-white/8 bg-[#0a0e1a] shadow-[0_30px_80px_rgba(0,0,0,0.8),0_0_0_1px_rgba(99,102,241,0.08)] overflow-hidden"
        style={{
          maxHeight: "90vh",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1) translateY(0)" : "scale(0.94) translateY(20px)",
          transition: "opacity 0.3s cubic-bezier(0.16,1,0.3,1), transform 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* ── Glow accent ── */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-80 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

        {/* ── HEADER ── */}
        <div className="relative flex-shrink-0 px-6 pt-6 pb-5 border-b border-white/5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/20 text-indigo-400">
                <History className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">AI Generation History</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {(history || []).length} generation{(history || []).length !== 1 ? "s" : ""} saved
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-white/5 text-gray-400 transition-all hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, tone, or content…"
              className="w-full rounded-xl border border-white/8 bg-[#111622] pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Search result count */}
          {search && (
            <p className="mt-2 text-[11px] text-gray-500">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"
            </p>
          )}
        </div>

        {/* ── CONTENT ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3 min-h-0 custom-modal-scroll">
          {filtered.length === 0 ? (
            search ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="h-8 w-8 text-gray-600 mb-3" />
                <p className="text-sm text-gray-400 font-medium">No results for "{search}"</p>
                <p className="text-xs text-gray-600 mt-1">Try a different keyword</p>
              </div>
            ) : (
              <EmptyState />
            )
          ) : (
            filtered.map((item) => (
              <HistoryItem
                key={item.id}
                item={item}
                onCopy={handleCopy}
                onReuse={(item) => { onReuse(item); onClose(); }}
                onDelete={onDelete}
                copied={copied}
              />
            ))
          )}
        </div>

        {/* ── FOOTER ── */}
        {(history || []).length > 0 && (
          <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t border-white/5 bg-[#080c18]">
            <p className="text-[11px] text-gray-500">
              Stored locally · cleared on sign-out
            </p>
            <button
              onClick={() => {
                if (window.confirm("Clear all AI generation history?")) {
                  (history || []).forEach((item) => onDelete(item.id));
                }
              }}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-[11px] font-semibold text-red-400 hover:bg-red-500/15 transition-all"
            >
              <Trash2 className="h-3 w-3" /> Clear All
            </button>
          </div>
        )}
      </div>

      <style>{`
        .custom-modal-scroll::-webkit-scrollbar { width: 5px; }
        .custom-modal-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-modal-scroll::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.25); border-radius: 10px; }
        .custom-modal-scroll::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.45); }
      `}</style>
    </div>
  );
}
