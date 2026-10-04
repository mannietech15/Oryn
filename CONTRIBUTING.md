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

---

## Local Development Setup

### Prerequisites
Before getting started, ensure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or higher (`node -v`)
- **npm**: `v9.0.0` or higher (`npm -v`)
- **Git**: Modern git client (`git --version`)

### 1. Clone the Repository
```bash
git clone https://github.com/mannietech15/Oryn.git
cd Oryn
```

### 2. Backend Server Setup
```bash
cd ORYN-AI-SERVER

# Install server dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Ensure your `ORYN-AI-SERVER/.env` contains the required keys:
```env
PORT=3006
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# AI Inference Gateway (NVIDIA NIM or compatible endpoint)
NVIDIA_API_KEY=your_nvidia_api_key_here
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1

# Outbound Mail Transport (Verified Gmail SMTP relay)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_verified_sender@gmail.com
SMTP_PASS=your_gmail_app_password
```

Start the backend development daemon:
```bash
npm run dev
# Server listens on http://localhost:3006
```

### 3. Frontend Client Setup
In a new terminal window:
```bash
cd ORYN-AI-CLIENT

# Install frontend dependencies
npm install

# Start Vite hot-reload development server
npm run dev
# Client runs at http://localhost:5173
```

