# Security Policy & Vulnerability Disclosure

At **Oryn AI**, security and trust are foundational principles. Because Oryn interacts with external LLM inference gateways, persistent financial ledgers, and live outbound SMTP email relays, safeguarding systems and user data is our highest priority.

This document outlines our vulnerability disclosure process, supported versions, and security practices.

---

## Supported Versions

Security patches and vulnerability updates are provided for the following versions:

| Version | Supported | Security Notes |
|---------|-----------|----------------|
| `1.0.x` (current `main`) | ✅ Supported | Actively maintained with real-time dependency and security patches. |
| `< 1.0.0` | ❌ End of Life | Development prototypes; please upgrade to current `main`. |

---

## Reporting a Security Vulnerability

If you discover a security vulnerability, credential leak, or authorization flaw within Oryn AI, **please do NOT report it through a public GitHub issue**.

Instead, please report it privately via email:

📧 **Security Contact**: `mannietech817@gmail.com`  
🔒 **Subject Prefix**: `[SECURITY VULNERABILITY] - Oryn AI`

### What to Include in Your Report
To help us triage and resolve the issue quickly, please provide:
1. **Description**: A clear summary of the vulnerability and its potential impact.
2. **Component Affected**: Specify whether the issue affects `ORYN-AI-CLIENT`, `ORYN-AI-SERVER`, storage, or inference routing.
3. **Reproduction Steps**: A minimal, reproducible proof-of-concept (PoC) or step-by-step instructions.
4. **Environment**: Operating system, Node.js version, and configuration details (excluding real secrets).
5. **Mitigation Suggestion**: Any proposed code fixes or architectural workarounds if known.

---

## Response & Disclosure Process

We follow a coordinated, responsible disclosure timeline:

1. **Initial Acknowledgment**: We will acknowledge receipt of your vulnerability report within **48 hours**.
2. **Triage & Assessment**: Our maintainers will investigate the report, verify the issue, and provide an initial assessment within **5 business days**.
3. **Fix & Verification**: A patch will be authored, validated through the automated test suite, and deployed to `main`.
4. **Public Release & Credit**: Once the patch is available, we will release a public security advisory with full credit to the researcher (unless anonymity is requested).
