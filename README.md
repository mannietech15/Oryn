<div align="center">

# ⚡ ORYN AI

### **Autonomous Business Intelligence & Agentic Executive Operating System**

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.2-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![NVIDIA NIM](https://img.shields.io/badge/NVIDIA%20NIM-Llama--3.2%20Vision-76B900.svg?style=for-the-badge&logo=nvidia&logoColor=white)](https://build.nvidia.com)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-000000.svg?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)

<p align="center">
  <b>Transform raw enterprise telemetry into proactive decisions, autonomous workflows, and interactive applications.</b>
  <br />
  Powered by NVIDIA NIM, Llama 3.2 Vision, in-browser Babel execution, and real-time WebGL spatial intelligence.
</p>

[Explore Features](#-key-capabilities) • [Architecture](#-system-architecture) • [Quickstart](#-quickstart-guide) • [API Specs](#-api-endpoints--event-streams) • [Tech Stack](#-technology-stack) • [Roadmap](#-roadmap)

---

</div>

## 🌌 Overview

**ORYN** is not just another conversational wrapper — it is a **next-generation agentic business co-pilot and operating system** built for executives, founders, and autonomous product teams. 

Traditional BI dashboards are static, retrospective, and passive. ORYN inverts this paradigm by combining **real-time LLM inference**, **vision-enabled multimodal document analysis**, **proactive business anomaly detection**, **live code sandbox execution**, and **human-in-the-loop email automation** into a unified, ultra-aesthetic cyberpunk workspace.

Whether diagnosing pipeline churn, compiling live React dashboards on the fly inside the conversation, or querying complex financial models across global markets, ORYN delivers enterprise-grade reasoning with lightning-fast low-latency execution.

---

## 🔮 System Architecture

```mermaid
graph TD
    subgraph Client ["Client Layer (React 18 + Vite + WebGL)"]
        UI["Hyper-Aesthetic Glassmorphic UI"]
        Orb["3D Interactive WebGL Orb (Three.js/OGL)"]
        Voice["Conversational Voice Engine (STT/TTS)"]
        Sandbox["In-Chat Babel Sandbox & Tailwind Canvas"]
        Feed["Executive KPI & Smart Alert Feed"]
    end

    subgraph Server ["Server Orchestration Layer (Node.js + Express + TypeScript)"]
        Router["Dynamic Model Router & Resilience Gateway"]
        SSE["Server-Sent Events (SSE) Streaming Engine"]
        Analysis["Multimodal Vision & File Extraction Engine"]
        Safety["HITL Action Verifier (Human-in-the-Loop)"]
        BriefingCache["In-Memory Executive Briefing Cache"]
    end

    subgraph Intelligence ["Inference & External Services"]
        NvidiaDef["NVIDIA NIM: Llama-3.2-11B-Vision-Instruct"]
        NvidiaPro["NVIDIA NIM: Llama-3.2-90B-Vision-Instruct"]
        Pollinations["Generative Diffusion Engine (/imagine)"]
        SMTP["Enterprise Mail Gateway (Nodemailer)"]
    end

    UI --> Voice
    UI --> Sandbox
    UI --> SSE
    SSE <--> Router
    Router --> NvidiaDef
    Router --> NvidiaPro
    Router --> Pollinations
    Safety --> SMTP
    Analysis --> NvidiaPro
    BriefingCache --> Feed
```

---

## ✨ Key Capabilities

### 1. 🧠 Proactive Executive Intelligence & Anomaly Engine
* **Natural Language Business Query Bar:** Ask questions like *"Why is customer churn spiking?"* or *"Analyze Tuesday deal velocity"* and get structured strategic JSON insights with concrete recommendations.
* **Smart Alert Feed:** Scans revenue pacing, stalled accounts, support spikes, and broken integrations with automated risk-level categorization (`critical`, `warning`, `opportunity`, `info`).
* **Dynamic OKR Tracking:** Real-time progress monitoring against Q2 revenue, growth, and task milestones with on-demand strategic advice.
* **Business Health Scoring:** Continuous multi-factor grading across revenue health, user retention, team throughput, and integration health.

### 2. 💻 Live In-Chat Code Sandbox & Dynamic React Runner
* **Instant Babel Standalone Compilation:** When ORYN generates React components, Tailwind layouts, HTML, or SVG, they compile and render directly inside an interactive sandboxed modal.
* **Full State & Interactivity:** Test functional buttons, toggles, forms, and charts without leaving the chat thread.
* **Zero Dependencies on Local Bundlers:** Renders dynamic JSX, Lucide icons, and Tailwind styles on the fly via client-side runtime injection.

### 3. 🎙️ Real-Time Conversational Voice Mode
* **Hands-Free Ambient Audio Loop:** Built-in speech recognition and vocal synthesis engine for fluid voice conversations.
* **Live Acoustic Waveform Visualizer:** Dynamic audio feedback with intuitive status indicators for listening, processing, and speaking.

### 4. 👁️ Multimodal Vision & Document Forensics
* **Powered by Llama 3.2 Vision:** Upload financial statements, product wireframes, receipts, UI screenshots, or CSV dumps up to 8,000 characters.
* **Deep Structural Extraction:** Auto-parses balance sheets, extracts tabular datasets, and surfaces actionable business summaries in seconds.

### 5. 🎨 Generative Creative Studio (`/imagine`)
* **Instant High-Fidelity Diffusion:** Trigger image creation via `/imagine <prompt>` or conversational requests like *"Generate a sleek 3D logo for a fintech brand"*.
* **Streaming Previews & Shimmer Loaders:** Real-time visual feedback with direct one-click high-resolution asset downloads through a backend proxy.

### 6. 🛡️ Human-in-the-Loop (HITL) Email Automation
* **Autonomous Drafting, Guardrailed Dispatch:** ORYN drafts context-rich transactional or cold-outreach emails, requests explicit confirmation, and dispatches only upon user approval.
* **Nodemailer SMTP Integration:** Works seamlessly with Gmail, Outlook, Amazon SES, or local development mock modes.

### 7. 🌐 Global Multilingual & Multi-Market Intelligence
* **Cross-Border Enterprise Fluency:** Native understanding across global languages with deep context retention for international market expansion, regional business compliance, and multilingual executive communications.

### 8. 🎨 Hyper-Aesthetic Neo-Dark Workspace
* **3D Neural Orb:** Built with React Three Fiber, Three.js, and OGL shaders for reactive ambient visual feedback.
* **Interactive Fluid Splash Cursor:** 60fps WebGL particle cursor trails and refined physics.
* **Custom Dark Theme:** Specially tuned dark-mode palette (`#09090b`), translucent glass cards, and glowing amber-orange highlights.

---
