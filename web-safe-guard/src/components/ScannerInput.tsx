import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Crosshair, AlertTriangle, Clock, History, Calendar,
  ChevronDown, ChevronUp, Zap, Search, EyeOff, Sliders, X, ExternalLink,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ScanType  = "full" | "quick" | "stealth";
export type ScanDepth = "shallow" | "normal" | "deep";

export interface ScanOptions {
  type:    ScanType;
  depth:   ScanDepth;
  timeout: number;
}

export interface ScanHistoryEntry {
  url:       string;
  scannedAt: string;
  type:      ScanType;
}

interface ScannerInputProps {
  onStartScan: (url: string, options: ScanOptions) => void;
  isScanning:  boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SCAN_TYPES: { value: ScanType; label: string; icon: React.ElementType; desc: string }[] = [
  { value: "full",    label: "Full",    icon: Search, desc: "All checks, highest coverage"  },
  { value: "quick",   label: "Quick",   icon: Zap,    desc: "Core checks, fastest results"  },
  { value: "stealth", label: "Stealth", icon: EyeOff, desc: "Low-noise, evasion-aware scan" },
];

const DEPTH_OPTIONS: { value: ScanDepth; label: string; desc: string }[] = [
  { value: "shallow", label: "Shallow", desc: "Surface-level, minimal requests" },
  { value: "normal",  label: "Normal",  desc: "Balanced depth and speed"        },
  { value: "deep",    label: "Deep",    desc: "Exhaustive, more time required"  },
];

const TIMEOUT_OPTIONS = [30, 60, 120, 300];
const HISTORY_KEY     = "vulnscan_history";
const MAX_HISTORY     = 5;


// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadHistory(): ScanHistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]"); } catch { return []; }
}

function saveHistory(entry: ScanHistoryEntry) {
  const prev = loadHistory().filter((h) => h.url !== entry.url);
  localStorage.setItem(HISTORY_KEY, JSON.stringify([entry, ...prev].slice(0, MAX_HISTORY)));
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min  = Math.floor(diff / 60_000);
  if (min <  1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr  < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const Toggle = ({
  icon: Icon, label, open, onToggle,
}: {
  icon: React.ElementType; label: string; open: boolean; onToggle: () => void;
}) => (
  <button
    type="button"
    onClick={onToggle}
    className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
  >
    <Icon className="w-3.5 h-3.5" />
    {label}
    {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
  </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ScannerInput = ({ onStartScan, isScanning }: ScannerInputProps) => {
  const [url,          setUrl]          = useState("");
  const [error,        setError]        = useState("");
  const [scanType,     setScanType]     = useState<ScanType>("full");
  const [scanDepth,    setScanDepth]    = useState<ScanDepth>("normal");
  const [timeout,      setTimeout_]     = useState(60);
  const [showOptions,  setShowOptions]  = useState(false);
  const [showHistory,  setShowHistory]  = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [history,      setHistory]      = useState<ScanHistoryEntry[]>([]);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [scheduleSet,  setScheduleSet]  = useState(false);

  useEffect(() => { setHistory(loadHistory()); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    let target = url.trim();
    if (!target) { setError("Please enter a URL"); return; }
    if (!/^https?:\/\//i.test(target)) target = "https://" + target;
    try { new URL(target); } catch { setError("Please enter a valid URL"); return; }
    saveHistory({ url: target, scannedAt: new Date().toISOString(), type: scanType });
    setHistory(loadHistory());
    onStartScan(target, { type: scanType, depth: scanDepth, timeout });
  };

  const pickFromHistory = (entry: ScanHistoryEntry) => {
    setUrl(entry.url);
    setScanType(entry.type);
    setShowHistory(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-3xl mx-auto"
    >
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="relative inline-flex items-center justify-center mb-5"
        >
          <motion.div className="absolute w-28 h-28 rounded-full border border-primary/10"
            animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.1, 0.5] }}
            transition={{ duration: 3.5, repeat: Infinity }} />
          <motion.div className="absolute w-20 h-20 rounded-full border border-primary/20"
            animate={{ scale: [1, 1.07, 1], opacity: [0.6, 0.2, 0.6] }}
            transition={{ duration: 2.8, repeat: Infinity, delay: 0.4 }} />
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center relative"
            style={{
              background: "linear-gradient(135deg, hsl(160 100% 45% / 0.15), hsl(160 100% 45% / 0.05))",
              border: "1.5px solid hsl(160 100% 45% / 0.35)",
              boxShadow: "0 0 32px hsl(160 100% 45% / 0.12)",
            }}>
            <Shield className="w-9 h-9 text-primary" strokeWidth={1.5} />
          </div>
        </motion.div>

        <h1 className="text-5xl font-bold tracking-tight mb-1"
          style={{
            fontFamily: "'Syne', sans-serif",
            background: "linear-gradient(135deg, #fff 35%, hsl(160 100% 45%) 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
          VulnScanner
        </h1>

        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          AI-powered web application vulnerability scanner with ML-based threat detection
        </p>
      </div>

      {/* ── URL Input ────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2 p-1.5 rounded-xl border bg-card"
          style={{ borderColor: error ? "hsl(var(--destructive) / 0.5)" : "hsl(var(--border))" }}>
          <div className="flex-1 relative flex items-center">
            <Crosshair className="absolute left-4 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input type="text" value={url}
              onChange={(e) => { setUrl(e.target.value); setError(""); }}
              placeholder="Enter target URL (e.g., https://example.com)"
              disabled={isScanning}
              className="w-full pl-11 pr-4 py-3.5 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none disabled:opacity-50 rounded-lg" />
          </div>
          <motion.button type="submit" disabled={isScanning}
            whileHover={{ scale: isScanning ? 1 : 1.02 }}
            whileTap={{ scale: isScanning ? 1 : 0.97 }}
            className="px-7 py-3 rounded-lg font-bold text-sm text-black whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{
              fontFamily: "'Syne', sans-serif",
              background: "hsl(160 100% 45%)",
              boxShadow: isScanning ? "none" : "0 0 24px hsl(160 100% 45% / 0.3)",
            }}>
            {isScanning
              ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-black/30 border-t-black animate-spin" />Scanning…</>
              : "Start Scan"
            }
          </motion.button>
        </div>
        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 mt-2 text-destructive text-xs font-mono px-1">
              <AlertTriangle className="w-3.5 h-3.5" /> {error}
            </motion.p>
          )}
        </AnimatePresence>
      </form>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-3 flex-wrap">
        <p className="text-[10px] font-mono text-muted-foreground mr-auto flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3 text-yellow-500/60" />
          Educational tool — simulated scanning
        </p>
        <Toggle icon={Sliders} label="Options" open={showOptions}
          onToggle={() => { setShowOptions((v) => !v); setShowHistory(false); setShowSchedule(false); }} />
        <Toggle icon={History} label={`History${history.length ? ` (${history.length})` : ""}`} open={showHistory}
          onToggle={() => { setShowHistory((v) => !v); setShowOptions(false); setShowSchedule(false); }} />
        <Toggle icon={Calendar} label={scheduleSet ? "Scheduled ✓" : "Schedule"} open={showSchedule}
          onToggle={() => { setShowSchedule((v) => !v); setShowOptions(false); setShowHistory(false); }} />
      </div>

      {/* ── Options panel ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showOptions && (
          <motion.div key="opt" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="bg-card border border-border rounded-xl p-4 mb-3 space-y-5">
              <div>
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Scan Type</p>
                <div className="grid grid-cols-3 gap-2">
                  {SCAN_TYPES.map(({ value, label, icon: Icon, desc }) => (
                    <button key={value} type="button" onClick={() => setScanType(value)}
                      className={`flex flex-col items-start gap-1 p-3 rounded-lg border text-left transition-all ${
                        scanType === value
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                      }`}>
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-xs font-mono font-semibold">{label}</span>
                      </div>
                      <span className="text-[10px] font-mono opacity-70 leading-tight">{desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Scan Depth</p>
                  <div className="flex flex-col gap-1.5">
                    {DEPTH_OPTIONS.map(({ value, label, desc }) => (
                      <button key={value} type="button" onClick={() => setScanDepth(value)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all ${
                          scanDepth === value
                            ? "border-primary/50 bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/30"
                        }`}>
                        <span className="text-xs font-mono font-semibold">{label}</span>
                        <span className="text-[10px] font-mono opacity-60">{desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Timeout</p>
                  <div className="flex flex-col gap-1.5">
                    {TIMEOUT_OPTIONS.map((s) => (
                      <button key={s} type="button" onClick={() => setTimeout_(s)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                          timeout === s
                            ? "border-primary/50 bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/30"
                        }`}>
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span className="text-xs font-mono font-semibold">{s < 60 ? `${s}s` : `${s / 60}m`}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── History panel ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showHistory && (
          <motion.div key="hist" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="bg-card border border-border rounded-xl p-4 mb-3">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Recent Targets</p>
                {history.length > 0 && (
                  <button type="button"
                    onClick={() => { localStorage.removeItem(HISTORY_KEY); setHistory([]); }}
                    className="text-[10px] font-mono text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
              {history.length === 0
                ? <p className="text-xs font-mono text-muted-foreground py-2 text-center">No scans yet.</p>
                : (
                  <div className="space-y-1.5">
                    {history.map((entry) => (
                      <button key={entry.url + entry.scannedAt} type="button"
                        onClick={() => pickFromHistory(entry)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left group">
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary flex-shrink-0 transition-colors" />
                        <span className="flex-1 font-mono text-xs text-foreground truncate">{entry.url}</span>
                        <span className="text-[10px] font-mono text-muted-foreground capitalize flex-shrink-0">{entry.type}</span>
                        <span className="text-[10px] font-mono text-muted-foreground flex-shrink-0">{formatRelative(entry.scannedAt)}</span>
                      </button>
                    ))}
                  </div>
                )
              }
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Schedule panel ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSchedule && (
          <motion.div key="sched" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="bg-card border border-border rounded-xl p-4 mb-3">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3">Schedule Scan</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-[10px] font-mono text-muted-foreground block mb-1">Date</label>
                  <input type="date" value={scheduleDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-muted-foreground block mb-1">Time</label>
                  <input type="time" value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all" />
                </div>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground mb-3">
                Using <span className="text-primary capitalize">{scanType}</span> ·{" "}
                <span className="text-primary capitalize">{scanDepth}</span> depth
              </p>
              <button type="button"
                onClick={() => { if (scheduleDate) { setScheduleSet(true); setShowSchedule(false); } }}
                disabled={!scheduleDate || !url.trim()}
                className="w-full py-2.5 bg-primary/10 border border-primary/30 text-primary rounded-lg font-mono text-sm font-semibold hover:bg-primary/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" /> Confirm Schedule
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scheduled banner ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {scheduleSet && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 border border-primary/30 rounded-xl mb-3">
            <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-xs font-mono text-primary flex-1">
              Scheduled for <span className="font-semibold">{scheduleDate} at {scheduleTime}</span>
            </p>
            <button type="button" onClick={() => setScheduleSet(false)} className="text-primary hover:text-primary/60">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default ScannerInput;