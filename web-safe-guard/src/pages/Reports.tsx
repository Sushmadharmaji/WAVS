import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Shield, Search, Download, Eye, Trash2, FileText,
  TrendingUp, AlertTriangle, ChevronLeft, Filter, BarChart3,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import { ScanReport, generateMockReports, getSeverityCounts, getTrendData } from "@/lib/reports-data";
import { SeverityLevel, generateHtmlReport } from "@/lib/scanner-data";

const severityColors: Record<SeverityLevel, string> = {
  Critical: "hsl(0 85% 55%)",
  High: "hsl(15 90% 55%)",
  Medium: "hsl(38 100% 55%)",
  Low: "hsl(195 100% 50%)",
};

const severityBadge: Record<SeverityLevel, string> = {
  Critical: "bg-severity-critical/15 text-severity-critical border-severity-critical/30",
  High: "bg-severity-high/15 text-severity-high border-severity-high/30",
  Medium: "bg-severity-medium/15 text-severity-medium border-severity-medium/30",
  Low: "bg-severity-low/15 text-severity-low border-severity-low/30",
};

const filters: (SeverityLevel | "All")[] = ["All", "Critical", "High", "Medium", "Low"];

const Reports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ScanReport[]>(() => generateMockReports());
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<SeverityLevel | "All">("All");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return reports.filter(r => {
      const matchSearch = !search || r.targetUrl.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        activeFilter === "All" ||
        r.vulnerabilities.some(v => v.severity === activeFilter);
      return matchSearch && matchFilter;
    });
  }, [reports, search, activeFilter]);

  const severityCounts = useMemo(() => getSeverityCounts(reports), [reports]);
  const trendData = useMemo(() => getTrendData(reports), [reports]);

  const pieData = useMemo(() => {
    return (["Critical", "High", "Medium", "Low"] as SeverityLevel[])
      .map(s => ({ name: s, value: severityCounts[s] }))
      .filter(d => d.value > 0);
  }, [severityCounts]);

  const totalVulns = Object.values(severityCounts).reduce((a, b) => a + b, 0);

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setTimeout(() => {
      setReports(prev => prev.filter(r => r.id !== id));
      setDeletingId(null);
    }, 300);
  };

  const handleDownload = (report: ScanReport) => {
    const html = generateHtmlReport(report.targetUrl, report.vulnerabilities);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vulnscan-${report.id}-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const riskColor = (score: number) => {
    if (score >= 30) return "text-severity-critical";
    if (score >= 20) return "text-severity-high";
    if (score >= 10) return "text-severity-medium";
    return "text-severity-low";
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:py-12">
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(160 100% 45%) 1px, transparent 1px), linear-gradient(90deg, hsl(160 100% 45%) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
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
                <FileText className="w-6 h-6 text-primary" />
                Reports Dashboard
              </h1>
              <p className="text-sm text-muted-foreground font-mono mt-1">
                {reports.length} scans · {totalVulns} vulnerabilities detected
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/")}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-display font-semibold glow-primary"
          >
            + New Scan
          </motion.button>
        </motion.div>

        {/* Summary Stats + Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8"
        >
          {/* Severity breakdown cards */}
          <div className="lg:col-span-1 grid grid-cols-2 gap-3">
            {(["Critical", "High", "Medium", "Low"] as SeverityLevel[]).map((sev, i) => (
              <motion.div
                key={sev}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className={`p-4 rounded-lg border text-center ${severityBadge[sev]}`}
              >
                <div className="text-2xl font-bold font-mono">{severityCounts[sev]}</div>
                <div className="text-xs font-display mt-1 opacity-80">{sev}</div>
              </motion.div>
            ))}
          </div>

          {/* Trend chart */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-display font-semibold text-foreground">Vulnerability Trends</h3>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={trendData} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
                <XAxis dataKey="label" tick={{ fill: "hsl(220 10% 55%)", fontSize: 10 }} />
                <YAxis tick={{ fill: "hsl(220 10% 55%)", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(220 18% 10%)",
                    border: "1px solid hsl(220 15% 18%)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="critical" stackId="a" fill={severityColors.Critical} radius={[0, 0, 0, 0]} />
                <Bar dataKey="high" stackId="a" fill={severityColors.High} />
                <Bar dataKey="medium" stackId="a" fill={severityColors.Medium} />
                <Bar dataKey="low" stackId="a" fill={severityColors.Low} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-display font-semibold text-foreground">Severity Distribution</h3>
            </div>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={severityColors[entry.name as SeverityLevel]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(220 18% 10%)",
                      border: "1px solid hsl(220 15% 18%)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: severityColors[d.name as SeverityLevel] }}
                  />
                  {d.name}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by target URL..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-display font-semibold border transition-colors ${
                  activeFilter === f
                    ? "bg-primary/15 text-primary border-primary/30"
                    : "bg-card text-muted-foreground border-border hover:border-primary/20"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Reports Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-lg overflow-hidden"
        >
          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-border text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider">
            <div className="col-span-2">Date</div>
            <div className="col-span-3">Target URL</div>
            <div className="col-span-1 text-center">Risk</div>
            <div className="col-span-3">Vulnerabilities</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border">
            <AnimatePresence>
              {filtered.map((report, i) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: deletingId === report.id ? 0 : 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 items-center hover:bg-muted/20 transition-colors"
                >
                  {/* Date */}
                  <div className="col-span-2">
                    <div className="text-sm font-display text-foreground">{formatDate(report.date)}</div>
                    <div className="text-xs font-mono text-muted-foreground">{formatTime(report.date)}</div>
                  </div>

                  {/* URL */}
                  <div className="col-span-3">
                    <div className="text-sm font-mono text-accent truncate">{report.targetUrl}</div>
                  </div>

                  {/* Risk Score */}
                  <div className="col-span-1 text-center">
                    <span className={`text-lg font-bold font-mono ${riskColor(report.riskScore)}`}>
                      {report.riskScore}
                    </span>
                  </div>

                  {/* Severity Badges */}
                  <div className="col-span-3 flex flex-wrap gap-1.5">
                    {(["Critical", "High", "Medium", "Low"] as SeverityLevel[]).map(sev => {
                      const count = report.vulnerabilities.filter(v => v.severity === sev).length;
                      if (!count) return null;
                      return (
                        <span
                          key={sev}
                          className={`px-2 py-0.5 rounded text-xs font-mono font-semibold border ${severityBadge[sev]}`}
                        >
                          {count} {sev.charAt(0)}
                        </span>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="col-span-3 flex items-center justify-end gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/report/${report.id}`, { state: { report } })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDownload(report)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display font-semibold bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(report.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display font-semibold bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="px-5 py-12 text-center">
                <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-display">No reports match your criteria</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Reports;
