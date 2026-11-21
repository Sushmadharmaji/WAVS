
# 🛡️ WAVS – Web Application Vulnerability Scanner

WAVS is a web application security assessment tool designed to
identify common web vulnerabilities through automated crawling,
HTTP request analysis, and browser-based security scanning.

The project focuses on detecting SQL Injection, Cross-Site
Scripting (XSS), insecure HTTP headers, and potential phishing risks.

## 🚀 Key Features

- 🔍 Automated Web Crawling – Discovers web pages for security analysis.
- 🛡️ XSS Detection – Identifies potential cross-site scripting vulnerabilities.
- 💉 SQL Injection Detection – Checks for SQL injection risks.
- 🎣 Phishing Risk Detection – Analyzes potential phishing indicators.
- 📡 HTTP Security Header Analysis – Identifies missing or insecure headers.
- 🌐 Browser-Based Scanning – Supports automated browser interactions.

## 🛠️ Technology Stack

**Backend:** Python, Flask

**Frontend:** React, TypeScript, HTML, CSS

**Automation:** Selenium

**HTTP & Parsing:** Requests, BeautifulSoup

**Security:** Web Vulnerability Assessment, HTTP Security Testing

## 🏗️ System Architecture

The scanner follows a modular approach:

1. User provides a target web application.
2. The crawler discovers accessible pages.
3. Security modules analyze the discovered pages.
4. Modules check for XSS, SQL Injection, phishing indicators,
   and insecure HTTP headers.
5. Findings are collected for review.

## 📂 Project Structure

```text
backend/
  scanner/
    browser_scan.py
    crawler.py
    headers.py
    phishing.py
    scam_detector.py
    sqli.py
    xss.py
```

## ⚙️ Installation


# Clone the repository
git clone https://github.com/Sushmadharmaji/WAVS.git

# Open the backend directory
cd WAVS/backend

# Create a virtual environment
python -m venv .venv

# Activate it on Windows
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend (if app.py is the entry point)
python app.py


## ▶️ Running the Project

Refer to the project's actual backend and frontend entry
points for startup instructions.

## 🔐 Security Considerations

- Run security scans only against systems you own or
  have explicit permission to test.
- Use controlled testing environments for demonstrations.
- Treat scanner findings as potential vulnerabilities
  that require verification.
- Avoid storing sensitive information in logs or reports.

## 📌 Future Improvements

- Improve vulnerability detection accuracy.
- Expand security checks.
- Enhance reporting and visualization.
- Add automated testing and documentation.

## 👤 Author

**Dharmaji Sushma**

Cybersecurity Undergraduate

GitHub: https://github.com/Sushmadharmaji
