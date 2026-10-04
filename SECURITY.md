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

---

## Secrets Isolation & Credentials Hygiene

Oryn AI handles sensitive third-party API credentials, including high-throughput LLM gateway keys and authenticated outbound SMTP credentials. We enforce strict architectural isolation:

### 1. Server-Side Encapsulation
- **Never Ingest in Frontend**: No API keys or SMTP passwords are ever bundled into the client build or delivered across HTTP responses. All inference calls and email dispatches are proxied through authenticated server endpoints (`ORYN-AI-SERVER`).
- **Client Sanitization**: The server strips internal stack traces, database keys, and configuration environments before sending responses to the client.

### 2. Git & Repository Isolation
- **`.gitignore` Enforcement**: All `.env`, `.env.*`, `*.pem`, `*.key`, and `*.cert` files are explicitly excluded in `.gitignore`.
- **Pre-Commit Verification**: Contributors must never commit real credentials. Only sanitized template files (e.g. `.env.example`) with dummy values are tracked in version control.

### 3. SMTP & Email Transport Security
- **App Passwords Only**: When configuring Gmail or custom SMTP relays, always use dedicated, revocable Application Passwords rather than primary account credentials.
- **Port Security**: SMTP connections default to port 587 (STARTTLS) or port 465 (TLS/SSL) with verified cryptographic certificates.
- **Immediate Credential Rotation**: If credentials are inadvertently exposed or compromised, immediately revoke the API key or App Password in your provider console and update your server environment.

---

## Human-in-the-Loop (HITL) Execution Security

One of the largest attack vectors in agentic AI systems is **unauthorized autonomous side effects** — where prompt injections, jailbreaks, or model hallucinations cause an AI to take irreversible actions (such as sending malicious emails, deleting ledger records, or triggering unauthorized webhooks).

Oryn AI solves this through a defensive **staged-consent state machine**:

```text
[User Prompt]
      │
      ▼
[LLM Inference Analysis]
      │
      ▼
[Draft Staged in Datastore] ──► status: 'awaiting_approval' (No side-effects executed)
      │
      ▼
[Interactive UI Proposal Card] ──► Displays Recipient, Subject, and Full Content
      │
      ▼
[Human Review & Consent]
      ├── Option A: User clicks "Confirm & Send via SMTP"
      └── Option B: User conversationally replies "yes", "confirm", or "proceed"
      │
      ▼
[Backend Authorization & Transport] ──► Verified SMTP handshake executed
      │
      ▼
[Persistent Audit Trail] ──► status: 'sent', remote messageId, timestamp recorded
```

### Security Guarantees:
1. **Zero Blind Dispatches**: The LLM *cannot* directly invoke SMTP or network relays. It can only emit a structured proposal payload that stages a pending draft.
2. **Deterministic State Transitions**: A draft in `awaiting_approval` state cannot be triggered more than once (idempotent status transition prevents double-dispatch attacks).
3. **Audit Trail Immutability**: Every dispatched email logs the local `draftId`, recipient, subject, dispatch timestamp, and upstream `messageId` into `oryn-db.json` for compliance verification.
4. **Failure Isolation**: If an upstream SMTP error occurs, the draft record transitions to `failed` and logs error traces without crashing backend daemons.


