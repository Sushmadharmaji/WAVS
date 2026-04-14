import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Severity   = "Critical" | "High" | "Medium" | "Low";
type MonStatus  = "monitoring" | "alert" | "paused" | "pending";
type CheckState = "idle" | "scanning" | "pass" | "fail" | "warn";

interface MonitoredSite {
  id:        string;
  url:        string;
  status:     MonStatus;
  lastCheck:  string;
  nextCheck:  number;     // seconds until next check
  interval:   number;     // minutes
  uptime:     number;     // percent
  checks:     Record<string, CheckState>;
  issueCount: number;
  responseMs: number;
}

interface ThreatItem {
  severity: Severity;
  text:     string;
  time:     string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CHECK_KEYS = ["ssl", "domain", "redirect", "phishing", "malicious", "reputation"] as const;

const CHECK_META: Record<string, { label: string; icon: string }> = {
  ssl:        { label: "SSL Certificate",    icon: "🔒" },
  domain:     { label: "Domain Age & Reg.",  icon: "🌐" },
  redirect:   { label: "Redirect Chains",    icon: "🔀" },
  phishing:   { label: "Phishing Patterns",  icon: "🎣" },
  malicious:  { label: "Malicious Content",  icon: "⚠️" },
  reputation: { label: "Reputation Score",   icon: "📊" },
};

const INTERVAL_OPTIONS = [
  { label: "1 min",   value: 1 },
  { label: "5 min",   value: 5 },
  { label: "15 min",  value: 15 },
  { label: "30 min",  value: 30 },
  { label: "1 hour",  value: 60 },
];

const ALERT_OPTIONS = [
  { id: "email",    label: "Email Alerts",       icon: "📧" },
  { id: "webhook",  label: "Webhook / Slack",     icon: "🔗" },
  { id: "desktop",  label: "Desktop Notify",      icon: "🔔" },
  { id: "sms",      label: "SMS (critical only)", icon: "📱" },
];

const SCAN_DEPTH_OPTIONS = [
  { value: "quick",    label: "Quick",    desc: "SSL + Domain only" },
  { value: "standard", label: "Standard", desc: "All 6 checks"      },
  { value: "deep",     label: "Deep",     desc: "Full + subdomains"  },
];

const LIVE_THREATS: ThreatItem[] = [
  { severity: "Critical", text: "SQLi campaign targeting e-commerce login pages", time: "2m ago"  },
  { severity: "High",     text: "Stored XSS via user avatars on forum platforms",  time: "11m ago" },
  { severity: "Medium",   text: "CORS misconfiguration in popular REST APIs",       time: "34m ago" },
  { severity: "High",     text: "Credential stuffing wave on banking portals",      time: "1h ago"  },
  { severity: "Medium",   text: "Open redirect chains used in phishing kits",       time: "2h ago"  },
  { severity: "Low",      text: "Missing HSTS on 40% of newly registered domains",  time: "3h ago"  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 8);

const blankChecks = (): Record<string, CheckState> =>
  Object.fromEntries(CHECK_KEYS.map((k) => [k, "idle"]));

const fmtSeconds = (s: number) => {
  if (s <= 0)  return "now";
  if (s < 60)  return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
};

const mockScanResult = (): Record<string, CheckState> => {
  const states: CheckState[] = ["pass", "pass", "pass", "warn", "pass", "fail"];
  return Object.fromEntries(CHECK_KEYS.map((k, i) => [k, states[i % states.length]]));
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SeverityBadge = ({ s }: { s: Severity }) => {
  const cls: Record<Severity, string> = {
    Critical: "bg-red-500/15 text-red-400 border-red-500/40",
    High:     "bg-orange-500/15 text-orange-400 border-orange-500/40",
    Medium:   "bg-yellow-500/15 text-yellow-400 border-yellow-500/40",
    Low:      "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
  };
  return (
    <span className={`text-[10px] font-extrabold px-1.5 py-px rounded border shrink-0 ${cls[s]}`}>
      {s}
    </span>
  );
};

const CheckRow = ({ label, icon, state }: { label: string; icon: string; state: CheckState }) => {
  const dot: Record<CheckState, string> = {
    idle:    "bg-slate-700",
    scanning:"bg-emerald-400 animate-pulse",
    pass:    "bg-emerald-400",
    warn:    "bg-yellow-400",
    fail:    "bg-red-400",
  };
  const text: Record<CheckState, string> = {
    idle:    "text-slate-600",
    scanning:"text-emerald-400",
    pass:    "text-slate-300",
    warn:    "text-yellow-300",
    fail:    "text-red-300",
  };
  const tag: Record<CheckState, string | null> = {
    idle: null, scanning: null,
    pass: "PASS", warn: "WARN", fail: "FAIL",
  };
  const tagCls: Record<CheckState, string> = {
    idle:"", scanning:"",
    pass:"text-emerald-500", warn:"text-yellow-400", fail:"text-red-400",
  };
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border border-[#1e2830] bg-[#0d1114] ${text[state]}`}>
      <span className="text-base">{icon}</span>
      <span className="flex-1 text-sm font-mono">{label}</span>
      {tag[state] && (
        <span className={`text-[10px] font-bold font-mono ${tagCls[state]}`}>{tag[state]}</span>
      )}
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot[state]}`}/>
    </div>
  );
};

const StatusPill = ({ status }: { status: MonStatus }) => {
  const cls: Record<MonStatus, string> = {
    monitoring: "bg-emerald-400/10 text-emerald-400 border-emerald-400/30",
    alert:      "bg-red-400/10 text-red-400 border-red-400/30",
    paused:     "bg-slate-600/20 text-slate-400 border-slate-600/30",
    pending:    "bg-yellow-400/10 text-yellow-400 border-yellow-400/30",
  };
  const icons: Record<MonStatus, string> = {
    monitoring: "●", alert: "⚠", paused: "⏸", pending: "◌",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${cls[status]}`}>
      <span className={status === "monitoring" ? "animate-pulse" : ""}>{icons[status]}</span>
      {status}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ScamDetector = () => {
  // ── URL add form
  const [newUrl,      setNewUrl]      = useState("");
  const [interval,    setInterval]    = useState(5);
  const [depth,       setDepth]       = useState("standard");
  const [alertSet,    setAlertSet]    = useState<Set<string>>(new Set(["email", "desktop"]));
  const [showOptions, setShowOptions] = useState(false);

  // ── Monitored sites
  const [sites, setSites] = useState<MonitoredSite[]>([
    {
      id: uid(), url: "https://example-shop.com",
      status: "alert", lastCheck: "just now", nextCheck: 287, interval: 5,
      uptime: 97.4, checks: mockScanResult(), issueCount: 2, responseMs: 342,
    },
    {
      id: uid(), url: "https://my-dashboard.io",
      status: "monitoring", lastCheck: "2m ago", nextCheck: 112, interval: 15,
      uptime: 99.9, checks: { ssl:"pass", domain:"pass", redirect:"pass", phishing:"pass", malicious:"pass", reputation:"pass" },
      issueCount: 0, responseMs: 188,
    },
  ]);

  // ── Active (expanded) site for detailed checks view
  const [activeSiteId, setActiveSiteId] = useState<string | null>(sites[0]?.id ?? null);

  // ── Global stats
  const totalThreats = 1284;
  const urlsBlocked  = 47000;

  // ── Countdown timer
  useEffect(() => {
    const t = setInterval(() => {
      setSites((prev) =>
        prev.map((s) => {
          if (s.status === "paused") return s;
          const next = s.nextCheck - 1;
          if (next <= 0) {
            // Simulate a re-scan
            return {
              ...s,
              nextCheck:  s.interval * 60,
              lastCheck:  "just now",
              checks:     mockScanResult(),
              responseMs: 150 + Math.floor(Math.random() * 400),
            };
          }
          return { ...s, nextCheck: next };
        })
      );
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // ── Add site
  const addSite = useCallback(() => {
    const raw = newUrl.trim();
    if (!raw) return;
    const url = raw.startsWith("http") ? raw : `https://${raw}`;
    const site: MonitoredSite = {
      id: uid(), url, status: "pending",
      lastCheck: "—", nextCheck: interval * 60, interval,
      uptime: 100, checks: blankChecks(), issueCount: 0, responseMs: 0,
    };
    setSites((prev) => [site, ...prev]);
    setActiveSiteId(site.id);
    setNewUrl("");

    // Simulate initial scan
    const keys = [...CHECK_KEYS];
    keys.forEach((k, i) => {
      setTimeout(() => {
        setSites((prev) => prev.map((s) => s.id === site.id
          ? { ...s, status: "pending", checks: { ...s.checks, [k]: "scanning" } }
          : s
        ));
        setTimeout(() => {
          const result: CheckState = Math.random() > 0.15 ? "pass" : Math.random() > 0.5 ? "warn" : "fail";
          setSites((prev) => prev.map((s) => {
            if (s.id !== site.id) return s;
            const checks = { ...s.checks, [k]: result };
            const issues = Object.values(checks).filter((v) => v === "fail" || v === "warn").length;
            const done   = i === keys.length - 1;
            return {
              ...s,
              checks,
              issueCount: issues,
              status:     done ? (issues > 0 ? "alert" : "monitoring") : "pending",
              lastCheck:  done ? "just now" : s.lastCheck,
              responseMs: done ? 150 + Math.floor(Math.random() * 300) : 0,
            };
          }));
        }, 400);
      }, i * 550);
    });
  }, [newUrl, interval]);

  // ── Toggle pause
  const togglePause = (id: string) => {
    setSites((prev) => prev.map((s) =>
      s.id === id ? { ...s, status: s.status === "paused" ? "monitoring" : "paused" } : s
    ));
  };

  // ── Remove site
  const removeSite = (id: string) => {
    setSites((prev) => prev.filter((s) => s.id !== id));
    if (activeSiteId === id) setActiveSiteId(sites.find((s) => s.id !== id)?.id ?? null);
  };

  const activeSite = sites.find((s) => s.id === activeSiteId) ?? null;

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full min-h-screen bg-[#0a0d0f] text-slate-200 font-sans">

      {/* ── Left column ─────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">

        {/* Page header */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-xl">🛡</div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Automatic Website Monitor</h1>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Instant threat analysis · Live intelligence feed</p>
            </div>
            {/* Global live badge */}
            <div className="ml-auto flex items-center gap-2 text-emerald-400 text-xs font-bold font-mono tracking-widest">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
              LIVE
            </div>
          </div>
        </div>

        {/* ── Add URL form ──────────────────────────────────── */}
        <div className="mx-8 mb-5 rounded-2xl border border-[#1e2830] bg-[#111518] p-5">
          <p className="text-[10px] font-bold tracking-[3px] uppercase text-slate-500 font-mono mb-3">
            Add Website to Monitor
          </p>

          {/* URL row */}
          <div className="flex gap-3 mb-3">
            <div className="flex-1 flex items-center gap-2 bg-[#0d1114] border border-[#1e2830] rounded-xl px-4 focus-within:border-emerald-500 transition-colors">
              <span className="text-slate-500 text-sm">🌐</span>
              <input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSite()}
                placeholder="https://suspicious-site.com"
                className="flex-1 bg-transparent py-3 text-sm font-mono text-slate-200 placeholder-slate-600 outline-none"
              />
            </div>
            <button
              onClick={addSite}
              className="px-6 py-3 bg-emerald-400 text-black font-bold text-sm rounded-xl hover:bg-emerald-300 transition-all hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95"
            >
              + Monitor
            </button>
          </div>

          {/* Options toggle */}
          <button
            onClick={() => setShowOptions((v) => !v)}
            className="text-[11px] text-slate-500 hover:text-emerald-400 font-mono flex items-center gap-1 transition-colors"
          >
            <span>{showOptions ? "▾" : "▸"}</span> Monitoring Options
          </button>

          {showOptions && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Check interval */}
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2 font-mono">Check Interval</p>
                <div className="flex flex-wrap gap-1.5">
                  {INTERVAL_OPTIONS.map(({ label, value }) => (
                    <button
                      key={value}
                      onClick={() => setInterval(value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono border transition-all
                        ${interval === value
                          ? "bg-emerald-400/15 text-emerald-400 border-emerald-400/40"
                          : "bg-[#0d1114] text-slate-500 border-[#1e2830] hover:border-emerald-500/30 hover:text-slate-300"
                        }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scan depth */}
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2 font-mono">Scan Depth</p>
                <div className="flex flex-col gap-1.5">
                  {SCAN_DEPTH_OPTIONS.map(({ value, label, desc }) => (
                    <button
                      key={value}
                      onClick={() => setDepth(value)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border transition-all text-left
                        ${depth === value
                          ? "bg-emerald-400/15 text-emerald-400 border-emerald-400/40"
                          : "bg-[#0d1114] text-slate-500 border-[#1e2830] hover:border-emerald-500/30"
                        }`}
                    >
                      <span className="font-bold font-mono">{label}</span>
                      <span className="text-[10px] opacity-60">{desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Alert channels */}
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2 font-mono">Alert Channels</p>
                <div className="flex flex-col gap-1.5">
                  {ALERT_OPTIONS.map(({ id, label, icon }) => (
                    <button
                      key={id}
                      onClick={() => setAlertSet((prev) => {
                        const next = new Set(prev);
                        next.has(id) ? next.delete(id) : next.add(id);
                        return next;
                      })}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border transition-all
                        ${alertSet.has(id)
                          ? "bg-emerald-400/15 text-emerald-400 border-emerald-400/40"
                          : "bg-[#0d1114] text-slate-500 border-[#1e2830] hover:border-emerald-500/30"
                        }`}
                    >
                      <span>{icon}</span>
                      <span className="font-mono">{label}</span>
                      <span className="ml-auto">{alertSet.has(id) ? "✓" : ""}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Monitored sites list ──────────────────────────── */}
        <div className="mx-8 mb-5">
          <p className="text-[10px] font-bold tracking-[3px] uppercase text-slate-500 font-mono mb-3">
            Active Monitors ({sites.length})
          </p>
          <div className="flex flex-col gap-2">
            {sites.length === 0 && (
              <div className="rounded-xl border border-dashed border-[#1e2830] p-8 text-center text-slate-600 text-sm font-mono">
                No sites monitored yet — add one above.
              </div>
            )}
            {sites.map((site) => (
              <div
                key={site.id}
                onClick={() => setActiveSiteId(site.id)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl border cursor-pointer transition-all
                  ${activeSiteId === site.id
                    ? "border-emerald-500/40 bg-emerald-400/5"
                    : "border-[#1e2830] bg-[#111518] hover:border-[#2a3840]"
                  }`}
              >
                {/* Status dot */}
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0
                  ${site.status === "monitoring" ? "bg-emerald-400 animate-pulse" :
                    site.status === "alert"      ? "bg-red-400 animate-pulse" :
                    site.status === "pending"    ? "bg-yellow-400 animate-pulse" :
                                                   "bg-slate-600"}`}/>

                {/* URL */}
                <span className="flex-1 text-sm font-mono truncate">{site.url}</span>

                {/* Next check */}
                {site.status !== "paused" && (
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    next: <span className="text-slate-400">{fmtSeconds(site.nextCheck)}</span>
                  </span>
                )}

                {/* Issues */}
                {site.issueCount > 0 && (
                  <span className="text-[10px] font-bold text-red-400 font-mono shrink-0">
                    {site.issueCount} issue{site.issueCount > 1 ? "s" : ""}
                  </span>
                )}

                <StatusPill status={site.status} />

                {/* Actions */}
                <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => togglePause(site.id)}
                    className="px-2 py-1 text-[10px] font-mono rounded-md border border-[#1e2830] text-slate-500 hover:text-slate-200 hover:border-slate-500 transition-colors"
                  >
                    {site.status === "paused" ? "▶ Resume" : "⏸ Pause"}
                  </button>
                  <button
                    onClick={() => removeSite(site.id)}
                    className="px-2 py-1 text-[10px] font-mono rounded-md border border-[#1e2830] text-slate-600 hover:text-red-400 hover:border-red-500/30 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Security Checks (active site) ────────────────── */}
        {activeSite && (
          <div className="mx-8 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-[10px] font-bold tracking-[3px] uppercase text-slate-500 font-mono">
                Security Checks
              </p>
              <span className="text-[10px] font-mono text-slate-600">— {activeSite.url}</span>
              <span className="ml-auto text-[10px] font-mono text-slate-500">
                Last checked: <span className="text-slate-300">{activeSite.lastCheck}</span>
                {" · "}Uptime: <span className="text-emerald-400">{activeSite.uptime}%</span>
                {" · "}Response: <span className="text-slate-300">{activeSite.responseMs > 0 ? `${activeSite.responseMs}ms` : "—"}</span>
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {CHECK_KEYS.map((k) => (
                <CheckRow
                  key={k}
                  label={CHECK_META[k].label}
                  icon={CHECK_META[k].icon}
                  state={activeSite.checks[k]}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Right column — Live Threat Intelligence ──────────── */}
      <div className="w-72 shrink-0 border-l border-[#1e2830] bg-[#0d1114] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-[#1e2830]">
          <span className="text-emerald-400 text-sm">📡</span>
          <span className="font-bold text-sm">Live Threat Intelligence</span>
        </div>

        {/* Feed */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-0">
          {LIVE_THREATS.map(({ severity, text, time }, i) => (
            <div key={i} className="flex flex-col gap-1 py-3 border-b border-[#141c22] last:border-0">
              <div className="flex items-center gap-2">
                <SeverityBadge s={severity as Severity} />
                <span className="text-[10px] text-slate-500 font-mono ml-auto">{time}</span>
              </div>
              <p className="text-xs text-slate-400 leading-snug">{text}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="border-t border-[#1e2830] grid grid-cols-2 divide-x divide-[#1e2830]">
          <div className="flex flex-col items-center py-4 gap-0.5">
            <span className="text-xl font-bold text-emerald-400">
              {totalThreats.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Threats Today</span>
          </div>
          <div className="flex flex-col items-center py-4 gap-0.5">
            <span className="text-xl font-bold text-emerald-400">
              {(urlsBlocked / 1000).toFixed(0)}K
            </span>
            <span className="text-[10px] text-slate-500 font-mono">URLs Blocked</span>
          </div>
        </div>

        {/* Global monitor summary */}
        <div className="border-t border-[#1e2830] px-5 py-4">
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 font-mono mb-3">Monitor Summary</p>
          <div className="flex flex-col gap-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Active</span>
              <span className="text-emerald-400 font-bold">
                {sites.filter((s) => s.status === "monitoring").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Alerts</span>
              <span className="text-red-400 font-bold">
                {sites.filter((s) => s.status === "alert").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Paused</span>
              <span className="text-slate-400 font-bold">
                {sites.filter((s) => s.status === "paused").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Avg Uptime</span>
              <span className="text-slate-200 font-bold">
                {sites.length
                  ? (sites.reduce((a, s) => a + s.uptime, 0) / sites.length).toFixed(1) + "%"
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScamDetector;