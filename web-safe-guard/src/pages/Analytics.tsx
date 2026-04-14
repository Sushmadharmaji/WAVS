import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, ArrowLeft, Activity, Bug, Brain, Target, TrendingUp, Clock,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, RadialBarChart, RadialBar,
} from "recharts";
import { generateMockReports, getSeverityCounts, getTrendData } from "@/lib/reports-data";

const StatCard = ({ icon: Icon, label, value, accent = false }: { icon: React.ElementType; label: string; value: string | number; accent?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-lg border border-border bg-card p-5"
  >
    <div className="flex items-center gap-3 mb-3">
      <div className={`flex items-center justify-center w-9 h-9 rounded-lg border ${accent ? "bg-accent/10 border-accent/20" : "bg-primary/10 border-primary/20"}`}>
        <Icon className={`w-5 h-5 ${accent ? "text-accent" : "text-primary"}`} />
      </div>
      <span className="text-xs font-display text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-3xl font-display font-bold text-foreground">{value}</p>
  </motion.div>
);

const SEVERITY_COLORS = [
  "hsl(0, 85%, 55%)",   // Critical
  "hsl(15, 90%, 55%)",  // High
  "hsl(38, 100%, 55%)", // Medium
  "hsl(195, 100%, 50%)", // Low
];

const Analytics = () => {
  const navigate = useNavigate();

  const reports = useMemo(() => generateMockReports(), []);
  const severityCounts = useMemo(() => getSeverityCounts(reports), [reports]);
  const trendData = useMemo(() => getTrendData(reports), [reports]);

  const totalScans = reports.length;
  const totalVulns = reports.reduce((s, r) => s + r.vulnerabilities.length, 0);
  const avgRisk = Math.round(reports.reduce((s, r) => s + r.riskScore, 0) / reports.length);

  const pieData = [
    { name: "Critical", value: severityCounts.Critical },
    { name: "High", value: severityCounts.High },
    { name: "Medium", value: severityCounts.Medium },
    { name: "Low", value: severityCounts.Low },
  ].filter(d => d.value > 0);

  // Most common vulnerability types
  const vulnTypeMap = new Map<string, number>();
  reports.forEach(r => r.vulnerabilities.forEach(v => {
    vulnTypeMap.set(v.category, (vulnTypeMap.get(v.category) || 0) + 1);
  }));
  const vulnTypeData = Array.from(vulnTypeMap.entries())
    .map(([name, count]) => ({ name: name.length > 20 ? name.slice(0, 18) + "…" : name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // ML stats
  const mlVulns = reports.flatMap(r => r.vulnerabilities.filter(v => v.category === "ML Anomaly Detection"));
  const avgMlConfidence = mlVulns.length
    ? Math.round((mlVulns.reduce((s, v) => s + v.confidence, 0) / mlVulns.length) * 100)
    : 78;
  const mlAccuracyData = [{ name: "Accuracy", value: avgMlConfidence, fill: "hsl(160, 100%, 45%)" }];

  // Recent activity
  const recentActivity = reports.slice(0, 6).map(r => ({
    id: r.id,
    url: r.targetUrl.replace(/^https?:\/\//, ""),
    date: new Date(r.date).toLocaleDateString(),
    time: new Date(r.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    vulns: r.vulnerabilities.length,
    risk: r.riskScore,
    status: r.status,
  }));

  const tooltipStyle = {
    contentStyle: { background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: "8px", fontSize: "12px", color: "hsl(160, 40%, 88%)" },
    cursor: { fill: "hsl(160, 100%, 45%, 0.05)" },
  };

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(hsl(160 100% 45%) 1px, transparent 1px), linear-gradient(90deg, hsl(160 100% 45%) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-display text-muted-foreground border border-border hover:border-primary/40 hover:text-primary transition-colors bg-card"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div>
            <h1 className="text-3xl font-display font-bold text-primary text-glow">Admin Analytics</h1>
            <p className="text-muted-foreground text-sm mt-1">System-wide scanning metrics and threat intelligence</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Target} label="Total Scans" value={totalScans} />
          <StatCard icon={Bug} label="Vulnerabilities" value={totalVulns} />
          <StatCard icon={TrendingUp} label="Avg Risk Score" value={avgRisk} accent />
          <StatCard icon={Brain} label="ML Detections" value={mlVulns.length} accent />
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Vulnerability Trends */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Vulnerability Trends
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                  <XAxis dataKey="label" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 11 }} />
                  <Tooltip {...tooltipStyle} />
                  <Area type="monotone" dataKey="critical" stackId="1" stroke={SEVERITY_COLORS[0]} fill={SEVERITY_COLORS[0]} fillOpacity={0.3} />
                  <Area type="monotone" dataKey="high" stackId="1" stroke={SEVERITY_COLORS[1]} fill={SEVERITY_COLORS[1]} fillOpacity={0.3} />
                  <Area type="monotone" dataKey="medium" stackId="1" stroke={SEVERITY_COLORS[2]} fill={SEVERITY_COLORS[2]} fillOpacity={0.3} />
                  <Area type="monotone" dataKey="low" stackId="1" stroke={SEVERITY_COLORS[3]} fill={SEVERITY_COLORS[3]} fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Distribution Pie */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Risk Distribution
            </h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={SEVERITY_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Most Common Vuln Types */}
          <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5">
            <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Bug className="w-4 h-4 text-primary" /> Most Common Vulnerability Types
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vulnTypeData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                  <XAxis type="number" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 10 }} width={130} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" fill="hsl(160, 100%, 45%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ML Accuracy */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Brain className="w-4 h-4 text-accent" /> ML Accuracy
            </h3>
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={mlAccuracyData} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "hsl(220, 15%, 16%)" }} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center -mt-2">
              <span className="text-3xl font-display font-bold text-primary">{avgMlConfidence}%</span>
              <p className="text-xs text-muted-foreground mt-1">Average confidence score</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center text-xs">
              <div className="p-2 rounded bg-muted/30 border border-border/50">
                <p className="font-display font-semibold text-foreground">{mlVulns.length}</p>
                <p className="text-muted-foreground">Detections</p>
              </div>
              <div className="p-2 rounded bg-muted/30 border border-border/50">
                <p className="font-display font-semibold text-foreground">3</p>
                <p className="text-muted-foreground">Models Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Recent Scan Activity
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 text-xs font-display text-muted-foreground uppercase tracking-wider">Target</th>
                  <th className="pb-3 text-xs font-display text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="pb-3 text-xs font-display text-muted-foreground uppercase tracking-wider">Vulns</th>
                  <th className="pb-3 text-xs font-display text-muted-foreground uppercase tracking-wider">Risk</th>
                  <th className="pb-3 text-xs font-display text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((item) => (
                  <tr key={item.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="py-3 font-mono text-xs text-foreground">{item.url}</td>
                    <td className="py-3 text-muted-foreground text-xs">{item.date} {item.time}</td>
                    <td className="py-3 font-mono text-xs text-foreground">{item.vulns}</td>
                    <td className="py-3">
                      <span className={`font-mono text-xs font-semibold ${
                        item.risk >= 76 ? "text-[hsl(var(--severity-critical))]" :
                        item.risk >= 51 ? "text-[hsl(var(--severity-high))]" :
                        item.risk >= 21 ? "text-[hsl(var(--severity-medium))]" :
                        "text-[hsl(var(--severity-low))]"
                      }`}>{item.risk}</span>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full ${
                        item.status === "completed"
                          ? "text-primary bg-primary/10 border border-primary/20"
                          : "text-[hsl(var(--severity-critical))] bg-[hsl(var(--severity-critical))]/10 border border-[hsl(var(--severity-critical))]/20"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === "completed" ? "bg-primary" : "bg-[hsl(var(--severity-critical))]"}`} />
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
