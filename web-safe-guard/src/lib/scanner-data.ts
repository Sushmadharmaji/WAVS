export type SeverityLevel = "Critical" | "High" | "Medium" | "Low";

export interface Vulnerability {
  id: string;
  name: string;
  category: string;
  severity: SeverityLevel;
  affectedUrl: string;
  description: string;
  mitigation: string;
  confidence: number; // ML confidence score 0-1
  details: string;
}

export interface ScanPhase {
  name: string;
  description: string;
  duration: number; // ms
}

export const SCAN_PHASES: ScanPhase[] = [
  { name: "Reconnaissance", description: "Gathering target information...", duration: 2000 },
  { name: "Header Analysis", description: "Checking security headers...", duration: 1500 },
  { name: "SQL Injection", description: "Testing SQL injection vectors...", duration: 2500 },
  { name: "XSS Detection", description: "Scanning for XSS vulnerabilities...", duration: 2000 },
  { name: "CSRF Analysis", description: "Checking CSRF protections...", duration: 1500 },
  { name: "Directory Traversal", description: "Testing path traversal...", duration: 1500 },
  { name: "CORS Analysis", description: "Analyzing CORS configuration...", duration: 1000 },
  { name: "ML Classification", description: "Running ML-based risk scoring...", duration: 2000 },
];

export function generateSimulatedResults(targetUrl: string): Vulnerability[] {
  const domain = (() => {
    try { return new URL(targetUrl).hostname; } catch { return targetUrl; }
  })();

  const vulnerabilities: Vulnerability[] = [
    {
      id: "vuln-001",
      name: "Missing X-Content-Type-Options Header",
      category: "Missing Security Headers",
      severity: "Medium",
      affectedUrl: targetUrl,
      description: "The X-Content-Type-Options header is not set, allowing MIME-type sniffing attacks.",
      mitigation: "Add 'X-Content-Type-Options: nosniff' to all HTTP responses.",
      confidence: 0.95,
      details: "Response header analysis shows no X-Content-Type-Options header present.",
    },
    {
      id: "vuln-002",
      name: "Missing Strict-Transport-Security",
      category: "Missing Security Headers",
      severity: "High",
      affectedUrl: targetUrl,
      description: "HSTS header is missing, making the site vulnerable to protocol downgrade attacks.",
      mitigation: "Add 'Strict-Transport-Security: max-age=31536000; includeSubDomains' header.",
      confidence: 0.98,
      details: "No HSTS header detected in server response.",
    },
    {
      id: "vuln-003",
      name: "Potential Reflected XSS",
      category: "Cross-Site Scripting (XSS)",
      severity: "High",
      affectedUrl: `${targetUrl}/search?q=<script>alert(1)</script>`,
      description: "Input parameter 'q' reflects unescaped user input in the response body.",
      mitigation: "Implement input validation and output encoding. Use Content-Security-Policy headers.",
      confidence: 0.72,
      details: "ML classifier detected reflected payload pattern with 72% confidence.",
    },
    {
      id: "vuln-004",
      name: "SQL Injection (Error-based)",
      category: "SQL Injection",
      severity: "Critical",
      affectedUrl: `${targetUrl}/api/users?id=1' OR '1'='1`,
      description: "Database error message exposed when injecting SQL payload into 'id' parameter.",
      mitigation: "Use parameterized queries. Never concatenate user input into SQL statements.",
      confidence: 0.85,
      details: "Server returned MySQL syntax error: \"You have an error in your SQL syntax near '''\"",
    },
    {
      id: "vuln-005",
      name: "CSRF Token Missing",
      category: "Cross-Site Request Forgery",
      severity: "Medium",
      affectedUrl: `${targetUrl}/account/settings`,
      description: "Form submission endpoint lacks CSRF token validation.",
      mitigation: "Implement anti-CSRF tokens in all state-changing forms. Use SameSite cookie attribute.",
      confidence: 0.88,
      details: "POST form detected without CSRF token field or header requirement.",
    },
    {
      id: "vuln-006",
      name: "Server Version Disclosure",
      category: "Security Misconfiguration",
      severity: "Low",
      affectedUrl: targetUrl,
      description: `Server banner exposes version information: "Apache/2.4.41 (Ubuntu)"`,
      mitigation: "Configure the server to suppress version information in response headers.",
      confidence: 0.99,
      details: "Server header: Apache/2.4.41 (Ubuntu)",
    },
    {
      id: "vuln-007",
      name: "Permissive CORS Policy",
      category: "CORS Misconfiguration",
      severity: "High",
      affectedUrl: `${targetUrl}/api/data`,
      description: "Access-Control-Allow-Origin is set to '*', allowing any origin to access resources.",
      mitigation: "Restrict CORS to specific trusted origins. Avoid wildcard '*' in production.",
      confidence: 0.94,
      details: "Access-Control-Allow-Origin: * detected in API response headers.",
    },
    {
      id: "vuln-008",
      name: "Directory Traversal Detected",
      category: "Directory Traversal",
      severity: "Critical",
      affectedUrl: `${targetUrl}/download?file=../../../etc/passwd`,
      description: "File parameter is vulnerable to path traversal, potentially exposing system files.",
      mitigation: "Validate and sanitize file paths. Use allowlists for permitted file access.",
      confidence: 0.67,
      details: "Response contained content matching /etc/passwd format. ML anomaly score: 0.89.",
    },
    {
      id: "vuln-009",
      name: "Missing Content-Security-Policy",
      category: "Missing Security Headers",
      severity: "Medium",
      affectedUrl: targetUrl,
      description: "No CSP header detected, increasing risk of XSS and data injection attacks.",
      mitigation: "Implement a strict Content-Security-Policy header with appropriate directives.",
      confidence: 0.97,
      details: "No Content-Security-Policy header found in response.",
    },
    {
      id: "vuln-010",
      name: "Anomalous Response Pattern",
      category: "ML Anomaly Detection",
      severity: "Low",
      affectedUrl: `${targetUrl}/api/health`,
      description: "ML anomaly detector flagged unusual response timing and payload size patterns.",
      mitigation: "Review endpoint behavior. Monitor for potential information leakage or backdoors.",
      confidence: 0.54,
      details: "Response time deviation: 340ms above baseline. Payload size anomaly score: 0.62.",
    },
  ];

  // Randomly select 5-8 vulnerabilities for variety
  const count = 5 + Math.floor(Math.random() * 4);
  const shuffled = vulnerabilities.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

interface VulnExtras {
  technicalDetail: string;
  riskImpact: string;
  payload: string;
  vulnerableCode: string;
  secureCode: string;
}

const vulnExtrasMap: Record<string, VulnExtras> = {
  "vuln-001": {
    technicalDetail: "The X-Content-Type-Options header prevents browsers from MIME-sniffing a response away from the declared content-type. Without it, an attacker can trick the browser into executing a malicious file disguised as a benign type.",
    riskImpact: "An attacker could upload a malicious HTML file disguised as an image. Without this header, the browser may interpret and execute the HTML, leading to stored XSS attacks.",
    payload: "curl -I https://target.com\n→ Missing: X-Content-Type-Options header",
    vulnerableCode: "// Express.js - No security headers\napp.get('/api/data', (req, res) => {\n  res.json({ data: 'sensitive' });\n});",
    secureCode: "// Express.js - With helmet\nconst helmet = require('helmet');\napp.use(helmet.noSniff());\n\napp.get('/api/data', (req, res) => {\n  res.json({ data: 'sensitive' });\n});",
  },
  "vuln-002": {
    technicalDetail: "HTTP Strict Transport Security (HSTS) forces browsers to only use HTTPS connections. Without it, the site is vulnerable to SSL stripping attacks where a man-in-the-middle downgrades HTTPS to HTTP.",
    riskImpact: "Attackers on shared networks (cafes, airports) can intercept traffic via SSL stripping, capturing session tokens, credentials, and sensitive data in plaintext.",
    payload: "curl -I https://target.com\n→ Missing: Strict-Transport-Security header\n→ Site accessible over HTTP without redirect",
    vulnerableCode: "# Nginx - No HSTS\nserver {\n  listen 443 ssl;\n  server_name target.com;\n  # No HSTS header configured\n}",
    secureCode: "# Nginx - With HSTS\nserver {\n  listen 443 ssl;\n  server_name target.com;\n  add_header Strict-Transport-Security\n    \"max-age=31536000; includeSubDomains\"\n    always;\n}",
  },
  "vuln-003": {
    technicalDetail: "Reflected XSS occurs when user input is echoed back in the page without proper sanitization. The ML classifier detected that the 'q' parameter value appears unescaped in the response HTML body.",
    riskImpact: "An attacker can craft a malicious URL that, when visited by a victim, executes arbitrary JavaScript in their browser — stealing session cookies, redirecting to phishing sites, or performing actions on their behalf.",
    payload: "GET /search?q=<script>alert(document.cookie)</script>\n\nResponse body contains:\n<p>Results for: <script>alert(document.cookie)</script></p>",
    vulnerableCode: "// Vulnerable - Direct interpolation\napp.get('/search', (req, res) => {\n  const q = req.query.q;\n  res.send(`<p>Results for: ${q}</p>`);\n});",
    secureCode: "// Secure - Escaped output\nconst escape = require('escape-html');\n\napp.get('/search', (req, res) => {\n  const q = escape(req.query.q);\n  res.send(`<p>Results for: ${q}</p>`);\n});",
  },
  "vuln-004": {
    technicalDetail: "Error-based SQL injection was detected when a single quote injected into the 'id' parameter caused a MySQL syntax error to be returned in the response. This confirms the parameter is concatenated directly into a SQL query.",
    riskImpact: "Critical: An attacker can extract the entire database, modify or delete data, bypass authentication, and in some cases gain operating system access via SQL command execution.",
    payload: "GET /api/users?id=1' OR '1'='1\n\nResponse: 500 Internal Server Error\n\"You have an error in your SQL syntax\nnear '\\'' at line 1\"",
    vulnerableCode: "# Vulnerable - String concatenation\n@app.route('/api/users')\ndef get_user():\n  uid = request.args.get('id')\n  query = f\"SELECT * FROM users\n    WHERE id = '{uid}'\"\n  cursor.execute(query)",
    secureCode: "# Secure - Parameterized query\n@app.route('/api/users')\ndef get_user():\n  uid = request.args.get('id')\n  query = \"SELECT * FROM users\n    WHERE id = %s\"\n  cursor.execute(query, (uid,))",
  },
  "vuln-005": {
    technicalDetail: "The form at /account/settings submits a POST request without including a CSRF token in the request body or headers. This means any third-party site can forge requests on behalf of authenticated users.",
    riskImpact: "An attacker can create a malicious page that auto-submits forms to change user settings, passwords, or email addresses when visited by an authenticated user.",
    payload: "<!-- Attacker's page -->\n<form action=\"https://target.com/account/settings\"\n  method=\"POST\">\n  <input name=\"email\" value=\"attacker@evil.com\">\n  <script>document.forms[0].submit();</script>\n</form>",
    vulnerableCode: "<!-- No CSRF protection -->\n<form action=\"/account/settings\"\n  method=\"POST\">\n  <input name=\"email\" />\n  <button type=\"submit\">Save</button>\n</form>",
    secureCode: "<!-- With CSRF token -->\n<form action=\"/account/settings\"\n  method=\"POST\">\n  <input type=\"hidden\" name=\"_csrf\"\n    value=\"{{ csrf_token() }}\" />\n  <input name=\"email\" />\n  <button type=\"submit\">Save</button>\n</form>",
  },
  "vuln-006": {
    technicalDetail: "The server's HTTP response includes a 'Server' header that discloses the exact software version (Apache/2.4.41). This information helps attackers identify known vulnerabilities for that specific version.",
    riskImpact: "Low direct risk, but disclosed version info enables targeted attacks. CVE databases can be searched for Apache 2.4.41 vulnerabilities, reducing attacker effort.",
    payload: "HTTP/1.1 200 OK\nServer: Apache/2.4.41 (Ubuntu)\nX-Powered-By: PHP/7.4.3",
    vulnerableCode: "# Apache - Default config\n# httpd.conf\nServerTokens Full\nServerSignature On",
    secureCode: "# Apache - Hardened config\n# httpd.conf\nServerTokens Prod\nServerSignature Off\nHeader unset X-Powered-By",
  },
  "vuln-007": {
    technicalDetail: "The API endpoint responds with 'Access-Control-Allow-Origin: *', permitting any website to make cross-origin requests and read the response. If combined with credentials, this exposes authenticated data.",
    riskImpact: "Any malicious website can read data from this API on behalf of authenticated users. This can lead to data theft, account enumeration, and unauthorized access to sensitive resources.",
    payload: "curl -H \"Origin: https://evil.com\" -I\n  https://target.com/api/data\n\n→ Access-Control-Allow-Origin: *\n→ Access-Control-Allow-Credentials: true",
    vulnerableCode: "// Vulnerable - Wildcard CORS\napp.use(cors({\n  origin: '*',\n  credentials: true\n}));",
    secureCode: "// Secure - Allowlisted origins\nconst allowed = ['https://app.example.com'];\napp.use(cors({\n  origin: (origin, cb) => {\n    if (allowed.includes(origin))\n      cb(null, true);\n    else cb(new Error('Blocked'));\n  },\n  credentials: true\n}));",
  },
  "vuln-008": {
    technicalDetail: "The 'file' parameter in /download accepts path traversal sequences (../) allowing an attacker to escape the intended directory and access arbitrary files on the server filesystem.",
    riskImpact: "Critical: Attackers can read sensitive system files like /etc/passwd, application source code, configuration files with database credentials, and private keys.",
    payload: "GET /download?file=../../../etc/passwd\n\nResponse (200 OK):\nroot:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\n...",
    vulnerableCode: "# Vulnerable - No path validation\n@app.route('/download')\ndef download():\n  filename = request.args.get('file')\n  return send_file(\n    f'/uploads/{filename}'\n  )",
    secureCode: "# Secure - Path validation\nimport os\n\n@app.route('/download')\ndef download():\n  filename = request.args.get('file')\n  safe = os.path.basename(filename)\n  path = os.path.join('/uploads', safe)\n  if not path.startswith('/uploads/'):\n    abort(403)\n  return send_file(path)",
  },
  "vuln-009": {
    technicalDetail: "No Content-Security-Policy header was found. CSP is a defense-in-depth mechanism that restricts which sources can load scripts, styles, and other resources, significantly reducing XSS impact.",
    riskImpact: "Without CSP, successful XSS attacks have unrestricted capability. Injected scripts can load external resources, exfiltrate data, and hijack user sessions without browser restrictions.",
    payload: "curl -I https://target.com\n→ Missing: Content-Security-Policy header\n→ No fallback X-Content-Security-Policy either",
    vulnerableCode: "// No CSP configured\napp.get('/', (req, res) => {\n  res.sendFile('index.html');\n});",
    secureCode: "// With strict CSP\napp.use((req, res, next) => {\n  res.setHeader(\n    'Content-Security-Policy',\n    \"default-src 'self'; \" +\n    \"script-src 'self'; \" +\n    \"style-src 'self' 'unsafe-inline'; \" +\n    \"img-src 'self' data:\"\n  );\n  next();\n});",
  },
  "vuln-010": {
    technicalDetail: "The ML anomaly detector identified statistically significant deviations in response timing (340ms above baseline) and payload size patterns from the /api/health endpoint. This could indicate hidden processing, data leakage, or a backdoor.",
    riskImpact: "Low direct risk but warrants investigation. Anomalous behavior could indicate a compromised endpoint, timing-based information disclosure, or resource-intensive background operations.",
    payload: "Baseline response time: 45ms\nObserved response time: 385ms (+340ms)\n\nBaseline payload size: 128 bytes\nObserved payload size: 2,847 bytes\nAnomaly score: 0.62",
    vulnerableCode: "# Potential issue - Excessive data\n@app.route('/api/health')\ndef health():\n  return jsonify({\n    'status': 'ok',\n    'debug': get_system_info(),\n    'env': dict(os.environ)\n  })",
    secureCode: "# Minimal health endpoint\n@app.route('/api/health')\ndef health():\n  return jsonify({\n    'status': 'ok',\n    'timestamp': time.time()\n  })",
  },
};

const defaultExtras: VulnExtras = {
  technicalDetail: "Further analysis is required to determine the full technical impact of this vulnerability.",
  riskImpact: "This vulnerability could potentially be exploited to compromise application security. A thorough risk assessment is recommended.",
  payload: "No specific payload data available.",
  vulnerableCode: "// No code example available",
  secureCode: "// No code example available",
};

export function getVulnExtras(vulnId: string): VulnExtras {
  return vulnExtrasMap[vulnId] || defaultExtras;
}

export function generateHtmlReport(targetUrl: string, vulnerabilities: Vulnerability[]): string {
  const severityColor = (s: SeverityLevel) => {
    switch (s) {
      case "Critical": return "#e53e3e";
      case "High": return "#ed8936";
      case "Medium": return "#ecc94b";
      case "Low": return "#38b2ac";
    }
  };

  const counts = {
    Critical: vulnerabilities.filter(v => v.severity === "Critical").length,
    High: vulnerabilities.filter(v => v.severity === "High").length,
    Medium: vulnerabilities.filter(v => v.severity === "Medium").length,
    Low: vulnerabilities.filter(v => v.severity === "Low").length,
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Vulnerability Scan Report — ${targetUrl}</title>
<style>
body { font-family: 'Segoe UI', sans-serif; background: #0d1117; color: #c9d1d9; padding: 40px; }
h1 { color: #00e68a; border-bottom: 2px solid #00e68a; padding-bottom: 10px; }
h2 { color: #79c0ff; margin-top: 30px; }
.summary { display: flex; gap: 20px; margin: 20px 0; }
.summary-card { padding: 16px 24px; border-radius: 8px; background: #161b22; border: 1px solid #30363d; text-align: center; min-width: 120px; }
.summary-card .count { font-size: 32px; font-weight: bold; }
.summary-card .label { font-size: 14px; color: #8b949e; margin-top: 4px; }
table { width: 100%; border-collapse: collapse; margin: 20px 0; }
th { background: #161b22; text-align: left; padding: 12px; border-bottom: 2px solid #30363d; }
td { padding: 12px; border-bottom: 1px solid #21262d; vertical-align: top; }
.severity { padding: 4px 12px; border-radius: 4px; font-weight: 600; font-size: 12px; display: inline-block; }
.details { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #8b949e; background: #0d1117; padding: 8px; border-radius: 4px; margin-top: 8px; }
.footer { margin-top: 40px; color: #484f58; font-size: 12px; border-top: 1px solid #21262d; padding-top: 16px; }
</style>
</head>
<body>
<h1>🛡️ Vulnerability Scan Report</h1>
<p><strong>Target:</strong> ${targetUrl}</p>
<p><strong>Scan Date:</strong> ${new Date().toISOString()}</p>
<p><strong>Total Vulnerabilities:</strong> ${vulnerabilities.length}</p>

<div class="summary">
${Object.entries(counts).map(([sev, count]) => `
<div class="summary-card">
  <div class="count" style="color: ${severityColor(sev as SeverityLevel)}">${count}</div>
  <div class="label">${sev}</div>
</div>`).join("")}
</div>

<h2>Detailed Findings</h2>
<table>
<thead><tr><th>#</th><th>Vulnerability</th><th>Category</th><th>Severity</th><th>Confidence</th><th>Affected URL</th></tr></thead>
<tbody>
${vulnerabilities.map((v, i) => `
<tr>
  <td>${i + 1}</td>
  <td><strong>${v.name}</strong><div class="details">${v.details}</div></td>
  <td>${v.category}</td>
  <td><span class="severity" style="background: ${severityColor(v.severity)}22; color: ${severityColor(v.severity)}">${v.severity}</span></td>
  <td>${Math.round(v.confidence * 100)}%</td>
  <td style="word-break:break-all; max-width:300px; font-size:12px;">${v.affectedUrl}</td>
</tr>
<tr><td colspan="6" style="padding:8px 12px;"><strong>Mitigation:</strong> ${v.mitigation}</td></tr>
`).join("")}
</tbody>
</table>

<div class="footer">
  <p>Generated by VulnScanner — Educational Cybersecurity Tool</p>
  <p>⚠️ This is a simulated scan for educational purposes. Always obtain proper authorization before scanning.</p>
</div>
</body>
</html>`;
}
