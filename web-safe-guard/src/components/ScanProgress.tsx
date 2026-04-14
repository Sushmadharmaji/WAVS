import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, Radio, XCircle, Terminal, Clock } from "lucide-react";
import { SCAN_PHASES } from "@/lib/scanner-data";

interface ScanProgressProps {
  currentPhase: number;
  progress: number;
  onCancel?: () => void;
}

const STATUS_MESSAGES: Record<string, string[]> = {
  Reconnaissance: [
    "Initializing scan...",
    "Resolving DNS records...",
    "Mapping target surface...",
  ],
  "Header Analysis": [
    "Analyzing HTTP headers...",
    "Checking security policies...",
    "Inspecting cookie flags...",
  ],
  "SQL Injection": [
    "Testing for SQL Injection...",
    "Injecting test payloads...",
    "Analyzing database responses...",
  ],
  "XSS Detection": [
    "Scanning for XSS vulnerabilities...",
    "Testing reflected payloads...",
    "Analyzing DOM injection points...",
  ],
  "CSRF Analysis": [
    "Checking CSRF protections...",
    "Inspecting form tokens...",
    "Validating SameSite policies...",
  ],
  "Directory Traversal": [
    "Testing path traversal...",
    "Crawling web pages...",
    "Probing file access vectors...",
  ],
  "CORS Analysis": [
    "Analyzing CORS configuration...",
    "Testing cross-origin policies...",
    "Validating origin restrictions...",
  ],
  "ML Classification": [
    "Running ML threat analysis...",
    "Classifying vulnerability patterns...",
    "Computing risk scores...",
  ],
};

const ScanProgress = ({ currentPhase, progress, onCancel }: ScanProgressProps) => {
  const [statusMsg, setStatusMsg] = useState("Initializing scan...");
  const [terminalLines, setTerminalLines] = useState<string[]>([]);

  const totalDuration = SCAN_PHASES.reduce((s, p) => s + p.duration, 0);
  const elapsed = (progress / 100) * totalDuration;
  const remaining = Math.max(0, totalDuration - elapsed);
  const remainingSec = Math.ceil(remaining / 1000);

  // Rotate status messages within current phase
  useEffect(() => {
    const phase = SCAN_PHASES[currentPhase];
    if (!phase) return;
    const messages = STATUS_MESSAGES[phase.name] || [phase.description];
    let idx = 0;
    setStatusMsg(messages[0]);
    setTerminalLines((prev) => [...prev, `> ${messages[0]}`].slice(-12));

    if (messages.length <= 1) return;
    const interval = setInterval(() => {
      idx = (idx + 1) % messages.length;
      setStatusMsg(messages[idx]);
      setTerminalLines((prev) => [...prev, `> ${messages[idx]}`].slice(-12));
    }, 1200);
    return () => clearInterval(interval);
  }, [currentPhase]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto mt-10"
    >
      <div className="bg-card border border-border rounded-lg p-6 relative overflow-hidden">
        <div className="absolute inset-0 scan-line pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <div className="absolute inset-0 rounded-full animate-pulse-glow" />
          </div>
          <h2 className="text-lg font-display font-semibold text-foreground">
            Scanning in Progress
          </h2>
          <span className="ml-auto font-mono text-sm text-primary text-glow">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Status message */}
        <AnimatePresence mode="wait">
          <motion.p
            key={statusMsg}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2 }}
            className="font-mono text-sm text-primary mb-4 terminal-cursor"
          >
            {statusMsg}
          </motion.p>
        </AnimatePresence>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-muted rounded-full mb-2 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            style={{
              background: "linear-gradient(90deg, hsl(160 100% 45%), hsl(195 100% 45%))",
              boxShadow: "0 0 12px hsl(160 100% 45% / 0.5)",
            }}
          />
        </div>

        {/* ETA */}
        <div className="flex items-center justify-between mb-6">
          <span className="font-mono text-xs text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Est. remaining: {remainingSec}s
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            Phase {Math.min(currentPhase + 1, SCAN_PHASES.length)}/{SCAN_PHASES.length}
          </span>
        </div>

        {/* Phase list */}
        <div className="space-y-2 mb-6">
          {SCAN_PHASES.map((phase, i) => {
            const isComplete = i < currentPhase;
            const isCurrent = i === currentPhase;
            return (
              <motion.div
                key={phase.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-3 py-1.5 px-3 rounded font-mono text-sm transition-colors ${
                  isCurrent
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : isComplete
                    ? "text-success"
                    : "text-muted-foreground"
                }`}
              >
                {isComplete ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : isCurrent ? (
                  <Radio className="w-4 h-4 flex-shrink-0 animate-pulse" />
                ) : (
                  <div className="w-4 h-4 flex-shrink-0 rounded-full border border-muted-foreground/30" />
                )}
                <span className="flex-1">{phase.name}</span>
                {isCurrent && (
                  <span className="text-xs text-muted-foreground">{phase.description}</span>
                )}
                {isComplete && (
                  <span className="text-xs text-success/70">✓ Done</span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Terminal output */}
        <div className="bg-background/60 border border-border rounded-md p-3 mb-5 max-h-36 overflow-y-auto">
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Live Output
            </span>
          </div>
          <div className="font-mono text-xs space-y-0.5">
            {terminalLines.map((line, i) => (
              <motion.div
                key={`${i}-${line}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: i === terminalLines.length - 1 ? 1 : 0.5 }}
                className={
                  i === terminalLines.length - 1
                    ? "text-primary"
                    : "text-muted-foreground"
                }
              >
                {line}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Cancel button */}
        {onCancel && (
          <div className="flex justify-center">
            <motion.button
              onClick={onCancel}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-2.5 border border-destructive/40 text-destructive rounded-lg font-mono text-sm hover:bg-destructive/10 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Cancel Scan
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ScanProgress;
