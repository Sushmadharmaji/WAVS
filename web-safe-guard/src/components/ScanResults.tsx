import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Download,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Brain,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import { Vulnerability, SeverityLevel, generateHtmlReport } from "@/lib/scanner-data";

interface ScanResultsProps {
  targetUrl: string;
  vulnerabilities: Vulnerability[];
  onNewScan: () => void;
  onSelectVuln: (vuln: Vulnerability) => void;
}

const severityStyles: Record<SeverityLevel, string> = {
  Critical: "bg-severity-critical/15 text-severity-critical border-severity-critical/30",
  High: "bg-severity-high/15 text-severity-high border-severity-high/30",
  Medium: "bg-severity-medium/15 text-severity-medium border-severity-medium/30",
  Low: "bg-severity-low/15 text-severity-low border-severity-low/30",
};

const severityOrder: SeverityLevel[] = ["Critical", "High", "Medium", "Low"];

const ScanResults = ({
  targetUrl,
  vulnerabilities,
  onNewScan,
  onSelectVuln,
}: ScanResultsProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<SeverityLevel | "All">("All");

  // ── Counts ──
  const counts = severityOrder.reduce((acc, sev) => {
    acc[sev] = vulnerabilities.filter((v) => v.severity === sev).length;
    return acc;
  }, {} as Record<SeverityLevel, number>);

  // ── Risk score — guarded against divide-by-zero ──
  const riskScore =
    vulnerabilities.length === 0
      ? 0
      : Math.round(
          vulnerabilities.reduce((sum, v) => {
            const weights: Record<SeverityLevel, number> = {
              Critical: 40,
              High: 25,
              Medium: 12,
              Low: 5,
            };
            return sum + weights[v.severity] * (v.confidence ?? 0);
          }, 0) / vulnerabilities.length
        );

  // ── Average confidence — guarded against divide-by-zero ──
  const avgConfidencePct =
    vulnerabilities.length === 0
      ? 0
      : Math.round(
          (vulnerabilities.reduce((s, v) => s + (v.confidence ?? 0), 0) /
            vulnerabilities.length) *
            100
        );

  // ── Sorting & filtering ──
  const sorted = [...vulnerabilities].sort(
    (a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
  );

  const filtered =
    activeFilter === "All"
      ? sorted
      : sorted.filter((v) => v.severity === activeFilter);

  // ── Download report ──
  const handleDownload = () => {
    const html = generateHtmlReport(targetUrl, vulnerabilities);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vulnscan-report-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto mt-10"
    >
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" /> Scan Results
          </h2>
          <p className="font-mono text-sm text-muted-foreground mt-1 break-all">
            {targetUrl}
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-display text-foreground hover:border-primary/40 transition-colors"
          >
            <Download className="w-4 h-4" /> Download Report
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNewScan}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-display font-semibold glow-primary"
          >
            New Scan
          </motion.button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {severityOrder.map((sev, i) => (
          <motion.div
            key={sev}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-4 rounded-lg border text-center cursor-pointer transition-all ${severityStyles[sev]} ${
              activeFilter === sev ? "ring-2 ring-primary/50 scale-[1.03]" : ""
            }`}
            onClick={() =>
              setActiveFilter((prev) => (prev === sev ? "All" : sev))
            }
          >
            <div className="text-3xl font-bold font-mono">{counts[sev]}</div>
            <div className="text-xs font-display mt-1 opacity-80">{sev}</div>
          </motion.div>
        ))}

        {/* Risk Score card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-lg border border-border bg-card text-center"
        >
          <div className="flex items-center justify-center gap-1">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-3xl font-bold font-mono text-primary">
              {riskScore}
            </span>
          </div>
          <div className="text-xs font-display mt-1 text-muted-foreground">
            Risk Score
          </div>
        </motion.div>
      </div>

      {/* ── ML Insights Bar ── */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6 flex items-center gap-3">
        <BarChart3 className="w-5 h-5 text-accent flex-shrink-0" />
        <span className="font-display text-sm text-foreground">
          ML Analysis:{" "}
          <span className="text-accent font-semibold">
            {vulnerabilities.length}
          </span>{" "}
          potential vulnerabilities identified with an average confidence of{" "}
          <span className="text-accent font-semibold font-mono">
            {avgConfidencePct}%
          </span>
        </span>
      </div>

      {/* ── Empty State ── */}
      {vulnerabilities.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card border border-border rounded-lg p-12 text-center"
        >
          <Shield className="w-12 h-12 text-primary mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-display font-semibold text-foreground mb-2">
            No Vulnerabilities Detected
          </h3>
          <p className="text-sm text-muted-foreground font-mono">
            The scan completed without finding any issues, or the backend
            returned no results. Check the browser console for backend errors.
          </p>
        </motion.div>
      )}

      {/* ── Filter Bar ── */}
      {vulnerabilities.length > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs font-mono text-muted-foreground mr-1">
            Filter:
          </span>
          {(["All", ...severityOrder] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1 rounded-md text-xs font-mono border transition-all ${
                activeFilter === f
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {f}
              {f !== "All" && (
                <span className="ml-1.5 opacity-60">{counts[f]}</span>
              )}
            </button>
          ))}
          {activeFilter !== "All" && (
            <span className="text-xs font-mono text-muted-foreground ml-2">
              Showing {filtered.length} of {vulnerabilities.length}
            </span>
          )}
        </div>
      )}

      {/* ── Vulnerability List ── */}
      <div className="space-y-3">
        {filtered.map((vuln, i) => {
          const isExpanded = expandedId === vuln.id;

          return (
            <motion.div
              key={vuln.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/20 transition-colors"
            >
              {/* Row */}
              <button
                onClick={() => onSelectVuln(vuln)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/30 transition-colors"
              >
                <span
                  className={`px-2.5 py-1 rounded text-xs font-mono font-semibold border flex-shrink-0 ${severityStyles[vuln.severity]}`}
                >
                  {vuln.severity}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="font-display font-semibold text-foreground text-sm truncate">
                    {vuln.name}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
                    {vuln.category} — {vuln.affectedUrl}
                  </div>
                </div>

                <span className="text-xs font-mono text-muted-foreground hidden sm:block flex-shrink-0">
                  {Math.round((vuln.confidence ?? 0) * 100)}% conf.
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedId(isExpanded ? null : vuln.id);
                  }}
                  className="p-1 rounded hover:bg-muted/50 transition-colors flex-shrink-0"
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </button>

              {/* Expanded quick-view */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                      {/* Description */}
                      <div>
                        <h4 className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Description
                        </h4>
                        <p className="text-sm text-foreground leading-relaxed">
                          {vuln.description}
                        </p>
                      </div>

                      {/* Affected URL */}
                      <div>
                        <h4 className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Affected URL
                        </h4>
                        <p className="text-sm font-mono text-accent break-all flex items-center gap-1">
                          {vuln.affectedUrl}
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </p>
                      </div>

                      {/* Technical Details */}
                      <div>
                        <h4 className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Technical Details
                        </h4>
                        <p className="text-sm font-mono text-muted-foreground bg-muted/50 p-2 rounded leading-relaxed">
                          {vuln.details}
                        </p>
                      </div>

                      {/* Mitigation */}
                      <div>
                        <h4 className="text-xs font-display font-semibold text-green-500 uppercase tracking-wider mb-1">
                          ✓ Mitigation
                        </h4>
                        <p className="text-sm text-foreground leading-relaxed">
                          {vuln.mitigation}
                        </p>
                      </div>

                      {/* Full details button */}
                      <button
                        onClick={() => onSelectVuln(vuln)}
                        className="flex items-center gap-1.5 text-xs font-mono text-primary hover:underline mt-1"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        View full details & code examples →
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ScanResults;
