
# 🛡️ WAVS – Web Application Vulnerability Scanner

WAVS is a web application security assessment tool designed to identify common web vulnerabilities through automated crawling, HTTP request analysis, and browser-based security scanning.

The project focuses on detecting SQL Injection, Cross-Site Scripting (XSS), insecure HTTP headers, and potential phishing risks.

## 🚀 Key Features

- 🔍 **Automated Web Crawling** – Discovers accessible web pages for security analysis.
- 🛡️ **XSS Detection** – Identifies potential cross-site scripting vulnerabilities.
- 💉 **SQL Injection Detection** – Checks for possible SQL injection vulnerabilities.
- 🎣 **Phishing Risk Detection** – Analyzes suspicious links, redirects, and phishing indicators.
- 📡 **HTTP Security Header Analysis** – Detects missing or insecure security headers.
- 🌐 **Browser-Based Scanning** – Supports automated browser interactions using Selenium.
- 📊 **Severity Classification** – Organizes detected findings into Critical, High, Medium, and Low severity levels.
- 🔄 **Finding Deduplication** – Reduces repeated vulnerability findings.

## 🛠️ Technology Stack

**Backend:** Python, Flask, Flask-CORS

**Frontend:** React, TypeScript, Vite, HTML, CSS, Tailwind CSS

**Automation:** Selenium

**HTTP & Parsing:** Requests, BeautifulSoup

**Security:** Web Vulnerability Assessment, HTTP Security Testing, Security Header Analysis

**Version Control:** Git, GitHub

## 🏗️ System Architecture

WAVS follows a modular architecture consisting of a React frontend, Flask backend, web crawler, and vulnerability scanning modules.

### Architecture Workflow

1. **User Input** – The user provides a target web application URL and scanning preferences.
2. **API Request** – The frontend sends a scan request to the Flask backend.
3. **Web Crawling** – The crawler discovers accessible pages based on the selected scan depth.
4. **Vulnerability Scanning** – Security modules analyze pages for SQL Injection, XSS, insecure HTTP headers, phishing indicators, and suspicious browser behavior.
5. **Finding Processing** – The backend normalizes findings, assigns severity levels, and removes duplicates.
6. **Results Generation** – The backend returns structured JSON results for frontend processing.

### Backend Workflow

```text
              User / React Frontend
                       |
                       v
               Flask REST API
                 POST /scan
                       |
                       v
                  Web Crawler
                       |
                       v
             Vulnerability Scanners
                       |
       +---------------+---------------+
       |               |               |
       v               v               v
   SQL Injection      XSS         HTTP Headers
       |               |               |
       +---------------+---------------+
                       |
              +--------+--------+
              |                 |
              v                 v
        Phishing Scan      Browser Scan
              |                 |
              +--------+--------+
                       |
                       v
              Findings Processing
              - Severity Levels
              - Confidence Values
              - Deduplication
                       |
                       v
                 JSON Response
                       |
                       v
                React Frontend
```

## 📂 Project Structure

```text
WAVS/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   │
│   └── scanner/
│       ├── browser_scan.py
│       ├── crawler.py
│       ├── headers.py
│       ├── phishing.py
│       ├── scam_detector.py
│       ├── sqli.py
│       └── xss.py
│
├── web-safe-guard/
│   └── ... React + TypeScript frontend
│
├── README.md
└── package-lock.json
```

## ⚙️ Installation & Setup

### Prerequisites

Ensure the following tools are installed:

- Python 3
- Node.js and npm
- Git
- A compatible web browser for browser-based scanning

### 1. Clone the Repository

```bash
git clone https://github.com/Sushmadharmaji/WAVS.git
cd WAVS
```

### 2. Backend Setup (Python Flask)

Navigate to the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv .venv
```

Activate the environment on Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

For Linux/macOS:

```bash
source .venv/bin/activate
```

Install the required Python packages:

```bash
pip install -r requirements.txt
```

Start the Flask backend:

```bash
python app.py
```

The backend runs locally at:

**http://localhost:5000**

### 3. Frontend Setup (React + Vite)

Open a second terminal and navigate to the frontend directory from the project root:

```bash
cd WAVS/web-safe-guard
```

Install the frontend dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend is typically available at:

**http://localhost:5173**

Use the actual URL displayed by Vite in your terminal.

## 🔌 Backend API Endpoints

The Flask backend provides REST API endpoints for vulnerability scanning and application health checks.

### 1. Health Check

**Endpoint:** `GET /health`

**URL:**

```text
http://localhost:5000/health
```

**Expected Response:**

```json
{
  "status": "ok",
  "scanners": [
    "sqli",
    "xss",
    "headers",
    "phishing",
    "browser"
  ]
}
```

### 2. Vulnerability Scanning

**Endpoint:** `POST /scan`

**URL:**

```text
http://localhost:5000/scan
```

**Example Request:**

```json
{
  "url": "http://localhost:8000",
  "type": "quick",
  "depth": "shallow"
}
```

The endpoint accepts a target URL, scan type, and scan depth.

**Response Fields:**

- `target` – Target application URL
- `total_urls_scanned` – Number of scanned URLs
- `scan_type` – Selected scanning mode
- `scan_depth` – Selected crawling depth
- `results` – Detected security findings
- `errors` – Scanning errors, if any

> Use only authorized local applications or controlled test environments when performing security scans.

## 🔍 Scan Options

### Scan Types

| Scan Type | Description |
|---|---|
| Quick | Runs HTTP header and phishing checks |
| Full | Runs SQLi, XSS, HTTP header, phishing, and browser checks |
| Stealth | Currently uses the same scanner modules as Full |

### Scan Depth

| Depth | Maximum Pages |
|---|---:|
| Shallow | 3 |
| Normal | 10 |
| Deep | 25 |

The number of pages actually scanned depends on the crawler's results and accessibility of the target.

## 📊 Vulnerability Findings

The backend processes detected findings and organizes them for security analysis.

Each finding can contain:

- Vulnerability name
- Category
- Severity
- Confidence value
- Affected URL
- Technical description
- Detection details
- Recommended mitigation
- Affected parameter, if applicable

### Severity Levels

- 🔴 **Critical** – Highest severity classification
- 🟠 **High** – High-severity security findings
- 🟡 **Medium** – Moderate-severity security findings
- 🟢 **Low** – Lower-severity findings

Severity is assigned using predefined classifications and confidence-based adjustments.

The classification is intended to support prioritization and should not be treated as a validated CVSS risk score.

## 💻 Available Frontend Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Generate a production build |
| `npm run build:dev` | Build in development mode |
| `npm run lint` | Run ESLint |
| `npm run test` | Execute Vitest tests |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run preview` | Preview the production build |

## 🔐 Security Considerations

WAVS is intended for educational purposes and authorized security assessments.

- Scan only websites and systems you own or have explicit permission to test.
- Use isolated or controlled environments for security demonstrations.
- Treat detected issues as potential vulnerabilities requiring manual verification.
- Avoid storing credentials or sensitive information in scan logs.
- Avoid exposing the Flask development server publicly.
- Disable Flask debug mode in production.
- Validate scan targets and redirects to prevent unauthorized access to internal network resources.

## 📌 Future Improvements

- Improve SQL Injection and XSS detection accuracy.
- Implement additional vulnerability detection modules.
- Add comprehensive automated testing.
- Improve vulnerability reporting and visualization.
- Implement dedicated stealth scanning behavior.
- Strengthen scan target validation and access controls.
- Improve deployment documentation.

## 🤝 Contributing

Contributions and suggestions are welcome.

You can fork the repository, create a feature branch, and submit a pull request.

## 👤 Author

**Dharmaji Sushma**

Cybersecurity Undergraduate

Interested in Cloud Security, Network Security, Vulnerability Assessment, and Ethical Hacking.

**GitHub:** https://github.com/Sushmadharmaji

---

⭐ If you find this project useful, consider starring the repository.
