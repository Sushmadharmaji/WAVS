import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft, Settings as SettingsIcon, Shield, FileText, Server,
  Save, RotateCcw, Zap, Brain, Clock, Globe, Bell, Palette,
  Search, Bug, Code, Lock, FolderOpen, Wifi,
} from "lucide-react";

type ScanDepth = "quick" | "standard" | "deep";
type ReportFormat = "pdf" | "html" | "json";

interface ScanSettings {
  sqlInjection: boolean;
  xss: boolean;
  csrf: boolean;
  securityHeaders: boolean;
  directoryTraversal: boolean;
  corsMisconfig: boolean;
  serverMisconfig: boolean;
  scanDepth: ScanDepth;
  mlDetection: boolean;
  timeout: number;
  maxConcurrent: number;
}

interface ReportSettings {
  format: ReportFormat;
  includeTechnical: boolean;
  includeRemediation: boolean;
  includeCvss: boolean;
  autoDownload: boolean;
}

interface SystemSettings {
  apiEndpoint: string;
  notifyOnComplete: boolean;
  notifyOnCritical: boolean;
  notifyEmail: string;
  theme: "dark" | "light";
}

const defaultScan: ScanSettings = {
  sqlInjection: true,
  xss: true,
  csrf: true,
  securityHeaders: true,
  directoryTraversal: true,
  corsMisconfig: true,
  serverMisconfig: true,
  scanDepth: "standard",
  mlDetection: true,
  timeout: 30,
  maxConcurrent: 5,
};

const defaultReport: ReportSettings = {
  format: "pdf",
  includeTechnical: true,
  includeRemediation: true,
  includeCvss: true,
  autoDownload: false,
};

const defaultSystem: SystemSettings = {
  apiEndpoint: "https://api.vulnscanner.local",
  notifyOnComplete: true,
  notifyOnCritical: true,
  notifyEmail: "",
  theme: "dark",
};

const Toggle = ({ enabled, onChange, label, description, icon: Icon }: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  icon?: React.ElementType;
}) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center gap-3">
      {Icon && <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      <div>
        <div className="text-sm font-display font-medium text-foreground">{label}</div>
        {description && <div className="text-xs text-muted-foreground mt-0.5">{description}</div>}
      </div>
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        enabled ? "bg-primary" : "bg-muted"
      }`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-foreground transition-transform ${
          enabled ? "translate-x-5.5 left-[1px]" : "left-[2px]"
        }`}
        style={{ transform: enabled ? "translateX(22px)" : "translateX(0)" }}
      />
    </button>
  </div>
);

const depthOptions: { value: ScanDepth; label: string; desc: string; icon: React.ElementType }[] = [
  { value: "quick", label: "Quick", desc: "~2 min · Headers & basic checks", icon: Zap },
  { value: "standard", label: "Standard", desc: "~8 min · All vulnerability types", icon: Search },
  { value: "deep", label: "Deep", desc: "~20 min · Exhaustive with ML analysis", icon: Brain },
];

const formatOptions: { value: ReportFormat; label: string }[] = [
  { value: "pdf", label: "PDF" },
  { value: "html", label: "HTML" },
  { value: "json", label: "JSON" },
];

const SectionCard = ({ title, icon: Icon, children, delay = 0 }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-card border border-border rounded-lg overflow-hidden"
  >
    <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/30">
      <Icon className="w-4 h-4 text-primary" />
      <h3 className="text-sm font-display font-semibold text-foreground uppercase tracking-wider">{title}</h3>
    </div>
    <div className="px-5 py-2">{children}</div>
  </motion.div>
);

const Settings = () => {
  const navigate = useNavigate();
  const [scan, setScan] = useState<ScanSettings>(defaultScan);
  const [report, setReport] = useState<ReportSettings>(defaultReport);
  const [system, setSystem] = useState<SystemSettings>(defaultSystem);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setScan(defaultScan);
    setReport(defaultReport);
    setSystem(defaultSystem);
  };

  const updateScan = <K extends keyof ScanSettings>(key: K, val: ScanSettings[K]) =>
    setScan(prev => ({ ...prev, [key]: val }));

  const updateReport = <K extends keyof ReportSettings>(key: K, val: ReportSettings[K]) =>
    setReport(prev => ({ ...prev, [key]: val }));

  const updateSystem = <K extends keyof SystemSettings>(key: K, val: SystemSettings[K]) =>
    setSystem(prev => ({ ...prev, [key]: val }));

  const vulnToggles: { key: keyof ScanSettings; label: string; desc: string; icon: React.ElementType }[] = [
    { key: "sqlInjection", label: "SQL Injection", desc: "Test for SQL injection vulnerabilities", icon: Bug },
    { key: "xss", label: "Cross-Site Scripting (XSS)", desc: "Detect reflected & stored XSS", icon: Code },
    { key: "csrf", label: "CSRF Detection", desc: "Check for missing CSRF tokens", icon: Lock },
    { key: "securityHeaders", label: "Security Headers", desc: "Analyze HTTP security headers", icon: Shield },
    { key: "directoryTraversal", label: "Directory Traversal", desc: "Test path manipulation attacks", icon: FolderOpen },
    { key: "corsMisconfig", label: "CORS Misconfiguration", desc: "Analyze cross-origin policies", icon: Globe },
    { key: "serverMisconfig", label: "Server Misconfiguration", desc: "Detect exposed banners & listings", icon: Wifi },
  ];

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:py-12">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(160 100% 45%) 1px, transparent 1px), linear-gradient(90deg, hsl(160 100% 45%) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground flex items-center gap-2">
                <SettingsIcon className="w-6 h-6 text-primary" />
                Settings
              </h1>
              <p className="text-sm text-muted-foreground font-mono mt-1">Configure scanner behavior and preferences</p>
            </div>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-display font-semibold bg-card text-muted-foreground border border-border hover:border-primary/40 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-display font-semibold transition-all ${
                saved
                  ? "bg-success text-success-foreground"
                  : "bg-primary text-primary-foreground glow-primary"
              }`}
            >
              <Save className="w-3.5 h-3.5" /> {saved ? "Saved!" : "Save"}
            </motion.button>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Scan Settings */}
          <SectionCard title="Scan Settings" icon={Shield} delay={0.1}>
            {/* Vulnerability Toggles */}
            <div className="divide-y divide-border">
              {vulnToggles.map(({ key, label, desc, icon }) => (
                <Toggle
                  key={key}
                  enabled={scan[key] as boolean}
                  onChange={v => updateScan(key, v as never)}
                  label={label}
                  description={desc}
                  icon={icon}
                />
              ))}
            </div>

            {/* Scan Depth */}
            <div className="py-4 border-t border-border">
              <div className="text-sm font-display font-medium text-foreground mb-3">Scan Depth</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {depthOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateScan("scanDepth", opt.value)}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                      scan.scanDepth === opt.value
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border bg-muted/20 text-muted-foreground hover:border-primary/20"
                    }`}
                  >
                    <opt.icon className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-display font-semibold">{opt.label}</div>
                      <div className="text-xs opacity-70 mt-0.5">{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ML Detection */}
            <div className="border-t border-border">
              <Toggle
                enabled={scan.mlDetection}
                onChange={v => updateScan("mlDetection", v)}
                label="ML Threat Detection"
                description="Use machine learning models for anomaly detection and severity prediction"
                icon={Brain}
              />
            </div>

            {/* Timeout */}
            <div className="py-4 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-display font-medium text-foreground">Request Timeout</span>
                </div>
                <span className="text-sm font-mono text-primary font-semibold">{scan.timeout}s</span>
              </div>
              <input
                type="range"
                min={5}
                max={120}
                step={5}
                value={scan.timeout}
                onChange={e => updateScan("timeout", Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none bg-muted accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground font-mono mt-1">
                <span>5s</span>
                <span>120s</span>
              </div>
            </div>

            {/* Max Concurrent */}
            <div className="py-4 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-display font-medium text-foreground">Max Concurrent Requests</span>
                </div>
                <span className="text-sm font-mono text-primary font-semibold">{scan.maxConcurrent}</span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                step={1}
                value={scan.maxConcurrent}
                onChange={e => updateScan("maxConcurrent", Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none bg-muted accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground font-mono mt-1">
                <span>1</span>
                <span>20</span>
              </div>
            </div>
          </SectionCard>

          {/* Report Settings */}
          <SectionCard title="Report Settings" icon={FileText} delay={0.2}>
            {/* Format Selector */}
            <div className="py-4">
              <div className="text-sm font-display font-medium text-foreground mb-3">Report Format</div>
              <div className="flex gap-2">
                {formatOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateReport("format", opt.value)}
                    className={`px-5 py-2 rounded-lg text-sm font-display font-semibold border transition-colors ${
                      report.format === opt.value
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border bg-muted/20 text-muted-foreground hover:border-primary/20"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-border border-t border-border">
              <Toggle
                enabled={report.includeTechnical}
                onChange={v => updateReport("includeTechnical", v)}
                label="Include Technical Details"
                description="Add code snippets, payloads, and PoC data to reports"
                icon={Code}
              />
              <Toggle
                enabled={report.includeRemediation}
                onChange={v => updateReport("includeRemediation", v)}
                label="Include Remediation Steps"
                description="Add fix recommendations for each vulnerability"
                icon={Shield}
              />
              <Toggle
                enabled={report.includeCvss}
                onChange={v => updateReport("includeCvss", v)}
                label="Include CVSS Scores"
                description="Show CVSS severity metrics in vulnerability details"
              />
              <Toggle
                enabled={report.autoDownload}
                onChange={v => updateReport("autoDownload", v)}
                label="Auto-Download on Completion"
                description="Automatically download report when scan finishes"
              />
            </div>
          </SectionCard>

          {/* System Settings */}
          <SectionCard title="System Settings" icon={Server} delay={0.3}>
            {/* API Endpoint */}
            <div className="py-4">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-display font-medium text-foreground">API Endpoint</span>
              </div>
              <input
                type="text"
                value={system.apiEndpoint}
                onChange={e => updateSystem("apiEndpoint", e.target.value)}
                className="w-full px-4 py-2.5 bg-input border border-border rounded-lg font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
              />
            </div>

            {/* Notifications */}
            <div className="divide-y divide-border border-t border-border">
              <Toggle
                enabled={system.notifyOnComplete}
                onChange={v => updateSystem("notifyOnComplete", v)}
                label="Notify on Scan Complete"
                description="Receive a notification when a scan finishes"
                icon={Bell}
              />
              <Toggle
                enabled={system.notifyOnCritical}
                onChange={v => updateSystem("notifyOnCritical", v)}
                label="Alert on Critical Findings"
                description="Get immediate alerts for critical vulnerabilities"
                icon={Bell}
              />
            </div>

            {/* Notification Email */}
            <div className="py-4 border-t border-border">
              <div className="text-sm font-display font-medium text-foreground mb-2">Notification Email</div>
              <input
                type="email"
                value={system.notifyEmail}
                onChange={e => updateSystem("notifyEmail", e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-2.5 bg-input border border-border rounded-lg font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
              />
            </div>

            {/* Theme */}
            <div className="py-4 border-t border-border">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-display font-medium text-foreground">Theme</span>
              </div>
              <div className="flex gap-2">
                {(["dark", "light"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => updateSystem("theme", t)}
                    className={`px-5 py-2 rounded-lg text-sm font-display font-semibold border transition-colors capitalize ${
                      system.theme === t
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border bg-muted/20 text-muted-foreground hover:border-primary/20"
                    }`}
                  >
                    {t === "dark" ? "🌙 Dark" : "☀️ Light"}
                  </button>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default Settings;
