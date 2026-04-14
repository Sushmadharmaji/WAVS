import { SeverityLevel, Vulnerability, generateSimulatedResults } from "./scanner-data";

export interface ScanReport {
  id: string;
  date: string;
  targetUrl: string;
  riskScore: number;
  vulnerabilities: Vulnerability[];
  status: "completed" | "failed";
}

function randomDate(daysBack: number): string {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return d.toISOString();
}

function calcRiskScore(vulns: Vulnerability[]): number {
  if (!vulns.length) return 0;
  const w: Record<SeverityLevel, number> = { Critical: 40, High: 25, Medium: 12, Low: 5 };
  return Math.round(
    vulns.reduce((s, v) => s + w[v.severity] * v.confidence, 0) / vulns.length
  );
}

const targets = [
  "https://example.com",
  "https://shop.testsite.org",
  "https://api.devportal.io",
  "https://blog.techcorp.net",
  "https://dashboard.acme.co",
  "https://portal.enterprise.com",
  "https://staging.webapp.dev",
  "https://beta.fintech.app",
];

export function generateMockReports(): ScanReport[] {
  return targets.map((url, i) => {
    const vulns = generateSimulatedResults(url);
    return {
      id: `report-${String(i + 1).padStart(3, "0")}`,
      date: randomDate(90),
      targetUrl: url,
      riskScore: calcRiskScore(vulns),
      vulnerabilities: vulns,
      status: (Math.random() > 0.1 ? "completed" : "failed") as "completed" | "failed",
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getSeverityCounts(reports: ScanReport[]) {
  const counts: Record<SeverityLevel, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  reports.forEach(r => r.vulnerabilities.forEach(v => { counts[v.severity]++; }));
  return counts;
}

export function getTrendData(reports: ScanReport[]) {
  const sorted = [...reports].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return sorted.map(r => {
    const d = new Date(r.date);
    return {
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      critical: r.vulnerabilities.filter(v => v.severity === "Critical").length,
      high: r.vulnerabilities.filter(v => v.severity === "High").length,
      medium: r.vulnerabilities.filter(v => v.severity === "Medium").length,
      low: r.vulnerabilities.filter(v => v.severity === "Low").length,
      total: r.vulnerabilities.length,
    };
  });
}
