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

---

## Git Workflow & Branching Model

We follow a structured Git branching strategy to maintain stability on the `main` branch.

### 1. Branch Naming Conventions
Always create a feature branch off of the latest `main`:

```bash
git checkout main
git pull origin main
git checkout -b <type>/<short-description>
```

Branch naming prefixes:
- `feat/`: New feature or user-facing capability (e.g. `feat/slack-integration`)
- `fix/`: Bug fix or patch (e.g. `fix/email-regex-fences`)
- `docs/`: Documentation additions or revisions (e.g. `docs/api-specs`)
- `refactor/`: Code reorganization without functional changes (e.g. `refactor/datastore-cache`)
- `test/`: New automated test suites or fixtures (e.g. `test/hil-workflow`)
- `perf/`: Performance improvements and latency optimizations (e.g. `perf/stream-buffering`)

### 2. Conventional Commits Standard
Commit messages should adhere to the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
<type>(<scope>): <short imperative description>

[optional longer body detailing non-obvious design choices or context]

[optional issue reference: Fixes #123]
```

Examples:
- `feat(chat): add retry action on failed SMTP dispatch`
- `fix(auth): prevent session expiration race condition`
- `docs(licensing): clarify Apache 2.0 patent grant provisions`
- `test(email): verify draft staging and transition to sent status`

### 3. Pull Request Guidelines
- **Keep PRs focused**: Avoid bundling unrelated changes across frontend and backend in one massive PR.
- **Provide clear summaries**: Detail the motivation, screenshots or recordings of UI changes, and verification commands.
- **Ensure green builds**: PRs must compile cleanly and pass the full test suite before review.

---

## Testing Protocols & Verification Standards

To guarantee enterprise stability and prevent regressions, all changes must pass automated verification suites.

### 1. Backend Automated Tests (`node:test`)
The server uses Node.js's native test runner without external bloated test harnesses:

```bash
cd ORYN-AI-SERVER
npm test
```

The test runner executes all test modules across:
- **`AppError Hierarchy`**: Exception mapping, HTTP status codes, and error codes.
- **`Validator Utility & Schemas`**: Input payload validation and rejection of malformed requests.
- **`RoutingStrategy`**: Multi-tier LLM routing, vision/deep-reasoning tier selection, and image intent detection.
- **`DashboardService`**: Financial metric calculations, ledger aggregates, and system health scores.
- **`ModelRouter`**: Provider registry and failover fallback logic.
- **`Datastore`**: Local JSON persistence, atomic transactions, and task telemetry logging.
- **`Human-in-the-Loop Email Protocol`**: Draft staging, state machine transitions (`awaiting_approval` -> `sent`/`failed`), and audit logging.

When adding new backend endpoints or services, you must provide corresponding unit tests under `ORYN-AI-SERVER/tests/unit/<feature>.test.ts` and register them in `ORYN-AI-SERVER/tests/run-tests.ts`.

### 2. Frontend Type Checking & Production Build
Ensure that all TypeScript types, React JSX components, and Tailwind styles compile without errors or warnings:

```bash
cd ORYN-AI-CLIENT
npm run build
```

This executes `tsc && vite build` and validates that the production bundle emits cleanly without syntax or type errors.

### 3. Manual Smoke Testing Checklist
Before submitting a PR for UI or interactive workflows:
1. Verify that the Executive Dashboard loads and renders live KPIs from `oryn-db.json`.
2. Test the **Human-in-the-Loop Email** workflow: Ask Oryn to draft an email, confirm that the proposal card displays with correct recipient chips, and test both button click and conversational confirmation ("yes" / "continue").
3. Check the dark mode contrast and responsiveness on both desktop and mobile viewports.



