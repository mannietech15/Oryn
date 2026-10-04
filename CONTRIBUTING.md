# Contributing to Oryn AI ⚡

Thank you for your interest in contributing to **Oryn AI**! 

Oryn AI is an open-source, full-stack Executive Operations Platform that bridges generative intelligence with real-world execution through safe, **Human-in-the-Loop (HITL)** architecture.

Whether you're fixing a bug, adding an intelligent tool integration, improving design aesthetics, or writing documentation, your contributions help make business AI safer and more pragmatic for everyone.

---

## Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for all contributors, regardless of experience level, background, gender, sexual orientation, disability, personal appearance, race, ethnicity, or religion.

### Our Standards
- **Be respectful and constructive** in discussions, reviews, and pull requests.
- **Focus on the craft**: Prioritize code quality, system safety, and end-user delight.
- **Gracefully accept constructive criticism** and collaborate to find optimal technical solutions.
- **Show empathy** towards fellow community members and maintainers.

Instances of unacceptable behavior may be reported privately to the project maintainer at `mannietech817@gmail.com`.

---

## Architectural Overview

Oryn AI is organized as a unified monorepo with two primary packages:

```text
ORYN-AI/
├── ORYN-AI-CLIENT/       # Frontend Single Page App (React 18, Vite, TypeScript)
│   ├── src/
│   │   ├── api/          # Typed API clients communicating with backend
│   │   ├── components/   # Modular UI components, icons, and layout widgets
│   │   ├── hooks/        # Reactive hooks (useChat, session management)
│   │   ├── pages/        # Route views (Dashboard, Chat, Analytics, Financials, etc.)
│   │   └── types/        # Client-side domain contracts and TypeScript types
│   └── package.json
│
├── ORYN-AI-SERVER/       # Backend API Gateway & Telemetry (Node.js, Express, TypeScript)
│   ├── src/
│   │   ├── infrastructure/ # Datastore persistence, logging, security middleware
│   │   ├── modules/        # Domain modules (auth, chat, email, financials, automations)
│   │   └── shared/         # Common error classes, status codes, schemas
│   ├── tests/              # Automated unit and integration test suite (node:test)
│   ├── data/               # Persistent JSON document database
│   └── package.json
│
├── docs/                 # Architectural deep-dives and licensing guides
├── LICENSE               # Official Apache License 2.0
├── CONTRIBUTING.md       # Contribution specifications (this file)
└── SECURITY.md           # Vulnerability disclosure and security policy
```
