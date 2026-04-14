import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, ArrowLeft, BookOpen, Bug, Brain, BarChart3, Scale, HelpCircle, Mail, Send,
  ChevronDown, Zap, Search, Globe, Lock, Code, AlertTriangle, Fingerprint
} from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const Section = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-lg border border-border bg-card p-6"
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 border border-primary/20">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h2 className="text-xl font-display font-semibold text-foreground">{title}</h2>
    </div>
    {children}
  </motion.div>
);

const vulnTypes = [
  { icon: Code, name: "SQL Injection", desc: "Occurs when untrusted data is sent to an interpreter as part of a command or query. Attackers can execute arbitrary SQL to access, modify, or delete database contents.", severity: "Critical" as const },
  { icon: Globe, name: "Cross-Site Scripting (XSS)", desc: "Allows attackers to inject client-side scripts into web pages viewed by other users. Can steal session tokens, deface websites, or redirect users to malicious sites.", severity: "High" as const },
  { icon: Lock, name: "CSRF (Cross-Site Request Forgery)", desc: "Forces authenticated users to execute unwanted actions on a web application. Exploits the trust a site has in the user's browser.", severity: "Medium" as const },
  { icon: AlertTriangle, name: "Directory Traversal", desc: "Allows attackers to access files and directories outside the intended scope by manipulating file paths with ../ sequences.", severity: "Critical" as const },
  { icon: Shield, name: "Security Misconfiguration", desc: "Encompasses insecure default settings, verbose error messages, missing security headers, and permissive CORS policies.", severity: "Medium" as const },
  { icon: Fingerprint, name: "Missing Security Headers", desc: "Absence of HTTP headers like HSTS, CSP, X-Content-Type-Options that provide defense-in-depth against common attack vectors.", severity: "Medium" as const },
  { icon: Brain, name: "ML Anomaly Detection", desc: "Uses machine learning models to detect unusual response patterns, timing anomalies, and payload deviations that may indicate hidden vulnerabilities.", severity: "Low" as const },
];

const severityColor: Record<string, string> = {
  Critical: "text-[hsl(var(--severity-critical))]",
  High: "text-[hsl(var(--severity-high))]",
  Medium: "text-[hsl(var(--severity-medium))]",
  Low: "text-[hsl(var(--severity-low))]",
};

const faqItems = [
  { q: "Is this a real vulnerability scanner?", a: "VulnScanner is an educational and demonstration tool. It simulates scan results to showcase vulnerability detection workflows. Do not use it as a replacement for professional penetration testing tools." },
  { q: "How accurate is the ML detection?", a: "The ML classifier provides confidence scores between 0-1. Scores above 0.8 indicate high confidence. Lower scores should be treated as potential leads requiring manual verification." },
  { q: "Can I scan any website?", a: "You should only scan websites you own or have explicit written authorization to test. Unauthorized scanning may violate laws such as the CFAA (US) or Computer Misuse Act (UK)." },
  { q: "How are risk scores calculated?", a: "Risk scores combine severity weights (Critical: 40, High: 25, Medium: 12, Low: 5), ML confidence levels, and vulnerability count to produce a 0-100 composite score." },
  { q: "What scan depths are available?", a: "Quick scans check security headers and basic misconfigurations. Standard scans add injection and XSS tests. Deep scans include directory traversal, CORS analysis, and ML-based anomaly detection." },
  { q: "Can I export scan results?", a: "Yes — reports can be exported in PDF, HTML, or JSON format from the Reports Dashboard." },
];

const Help = () => {
  const navigate = useNavigate();
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setContactForm({ name: "", email: "", message: "" });
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

      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-display text-muted-foreground border border-border hover:border-primary/40 hover:text-primary transition-colors bg-card"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div>
            <h1 className="text-3xl font-display font-bold text-primary text-glow">Help & Documentation</h1>
            <p className="text-muted-foreground text-sm mt-1">Everything you need to know about VulnScanner</p>
          </div>
        </div>

        {/* How It Works */}
        <Section icon={Zap} title="How the Scanner Works">
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>VulnScanner performs automated security assessments through a multi-phase pipeline:</p>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li><span className="text-foreground font-medium">Reconnaissance</span> — Gathers target information, DNS records, and technology stack fingerprinting.</li>
              <li><span className="text-foreground font-medium">Header Analysis</span> — Checks for security headers (HSTS, CSP, X-Frame-Options, etc.).</li>
              <li><span className="text-foreground font-medium">Injection Testing</span> — Tests for SQL injection, XSS, and command injection vectors.</li>
              <li><span className="text-foreground font-medium">Configuration Audit</span> — Analyzes CORS, CSRF protections, and server configurations.</li>
              <li><span className="text-foreground font-medium">Path Traversal</span> — Tests for directory traversal and file inclusion vulnerabilities.</li>
              <li><span className="text-foreground font-medium">ML Classification</span> — Runs trained models to identify anomalous response patterns.</li>
            </ol>
            <p>Each phase produces findings with confidence scores that are aggregated into a comprehensive risk report.</p>
          </div>
        </Section>

        {/* Vulnerability Types */}
        <Section icon={Bug} title="Vulnerability Types">
          <div className="space-y-3">
            {vulnTypes.map((v) => (
              <div key={v.name} className="flex gap-3 p-3 rounded-md bg-muted/30 border border-border/50">
                <div className="mt-0.5">
                  <v.icon className={`w-5 h-5 ${severityColor[v.severity]}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display font-semibold text-foreground text-sm">{v.name}</span>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
                      v.severity === "Critical" ? "border-[hsl(var(--severity-critical))]/30 text-[hsl(var(--severity-critical))] bg-[hsl(var(--severity-critical))]/10" :
                      v.severity === "High" ? "border-[hsl(var(--severity-high))]/30 text-[hsl(var(--severity-high))] bg-[hsl(var(--severity-high))]/10" :
                      v.severity === "Medium" ? "border-[hsl(var(--severity-medium))]/30 text-[hsl(var(--severity-medium))] bg-[hsl(var(--severity-medium))]/10" :
                      "border-[hsl(var(--severity-low))]/30 text-[hsl(var(--severity-low))] bg-[hsl(var(--severity-low))]/10"
                    }`}>{v.severity}</span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ML Detection */}
        <Section icon={Brain} title="Machine Learning Detection">
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>VulnScanner uses a multi-model ML pipeline to detect threats that traditional rule-based scanners miss:</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { title: "Response Anomaly Detection", desc: "Identifies unusual response times, payload sizes, and HTTP status code patterns." },
                { title: "Payload Classification", desc: "Neural network trained on 100K+ known attack payloads classifies injection attempts." },
                { title: "Behavioral Analysis", desc: "Compares endpoint behavior against baseline profiles to detect deviations." },
                { title: "Confidence Scoring", desc: "Each finding receives a 0-1 confidence score indicating detection reliability." },
              ].map((item) => (
                <div key={item.title} className="p-3 rounded-md bg-muted/30 border border-border/50">
                  <p className="font-display font-semibold text-foreground text-sm mb-1">{item.title}</p>
                  <p className="text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Risk Scores */}
        <Section icon={BarChart3} title="How to Interpret Risk Scores">
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>Risk scores range from 0-100 and are calculated using a weighted formula:</p>
            <div className="font-mono text-xs bg-muted/50 rounded-md p-4 border border-border/50">
              Score = Σ (severity_weight × confidence) / vulnerability_count
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { range: "0-20", label: "Low Risk", color: "text-[hsl(var(--severity-low))]", bg: "bg-[hsl(var(--severity-low))]/10" },
                { range: "21-50", label: "Medium Risk", color: "text-[hsl(var(--severity-medium))]", bg: "bg-[hsl(var(--severity-medium))]/10" },
                { range: "51-75", label: "High Risk", color: "text-[hsl(var(--severity-high))]", bg: "bg-[hsl(var(--severity-high))]/10" },
                { range: "76-100", label: "Critical", color: "text-[hsl(var(--severity-critical))]", bg: "bg-[hsl(var(--severity-critical))]/10" },
              ].map((r) => (
                <div key={r.range} className={`text-center p-3 rounded-md border border-border/50 ${r.bg}`}>
                  <p className={`font-mono font-bold text-lg ${r.color}`}>{r.range}</p>
                  <p className="text-xs mt-1">{r.label}</p>
                </div>
              ))}
            </div>
            <p><strong className="text-foreground">Severity weights:</strong> Critical = 40, High = 25, Medium = 12, Low = 5</p>
          </div>
        </Section>

        {/* Legal Disclaimer */}
        <Section icon={Scale} title="Legal Disclaimer">
          <div className="space-y-3 text-sm">
            <div className="p-4 rounded-md border border-[hsl(var(--severity-high))]/30 bg-[hsl(var(--severity-high))]/5">
              <p className="font-display font-semibold text-[hsl(var(--severity-high))] mb-2">⚠️ Important: Authorized Scanning Only</p>
              <ul className="list-disc list-inside space-y-1.5 text-muted-foreground text-xs">
                <li>Only scan web applications you own or have <strong className="text-foreground">explicit written permission</strong> to test.</li>
                <li>Unauthorized scanning may violate the <strong className="text-foreground">Computer Fraud and Abuse Act (CFAA)</strong> in the US, the <strong className="text-foreground">Computer Misuse Act</strong> in the UK, or equivalent laws in your jurisdiction.</li>
                <li>This tool is provided for <strong className="text-foreground">educational and authorized testing purposes only</strong>.</li>
                <li>The developers assume no liability for misuse of this tool.</li>
                <li>Always obtain a <strong className="text-foreground">signed authorization agreement</strong> before conducting security assessments.</li>
                <li>Respect <strong className="text-foreground">scope boundaries</strong> — only test systems explicitly included in your authorization.</li>
              </ul>
            </div>
          </div>
        </Section>

        {/* FAQ */}
        <Section icon={HelpCircle} title="Frequently Asked Questions">
          <Accordion type="multiple" className="w-full">
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-border/50">
                <AccordionTrigger className="text-sm font-display text-foreground hover:text-primary hover:no-underline py-3">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-3">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Section>

        {/* Contact Support */}
        <Section icon={Mail} title="Contact Support">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <Send className="w-7 h-7 text-primary" />
              </div>
              <p className="text-foreground font-display font-semibold">Message sent!</p>
              <p className="text-muted-foreground text-sm mt-1">We'll get back to you within 24 hours.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-display font-medium text-muted-foreground mb-1.5">Name</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-input border border-border rounded-lg font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-display font-medium text-muted-foreground mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-input border border-border rounded-lg font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-display font-medium text-muted-foreground mb-1.5">Message</label>
                <textarea
                  required
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-input border border-border rounded-lg font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                  placeholder="Describe your issue or question..."
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary text-primary-foreground font-display font-semibold rounded-lg glow-primary transition-all hover:opacity-90 text-sm"
              >
                Send Message
              </button>
            </form>
          )}
        </Section>
      </div>
    </div>
  );
};

export default Help;
