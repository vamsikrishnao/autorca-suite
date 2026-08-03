# AutoRCA & Fix Enterprise Suite
**Autonomous Multi-Agent Bug Triage, Root Cause Analysis & Git Patch Synthesis Harness**

[![Enterprise Shield](https://img.shields.io/badge/Guardrails-Active-059669?style=for-the-badge&logo=shield)](./DEPLOYMENT.md)
[![Zero Leakage](https://img.shields.io/badge/Security-Zero%20Code%20Leakage-1e40af?style=for-the-badge)](./README.md#security-guardrails--zero-data-leakage-architecture)
[![License: MIT](https://img.shields.io/badge/License-MIT-4f46e5?style=for-the-badge)](./README.md)

---

## 1. Executive Summary

**AutoRCA & Fix Enterprise Suite** is an autonomous, multi-agent engineering workbench designed to accelerate bug resolution without compromising source code security or architectural rigor. By integrating directly with enterprise issue trackers (Jira, Freshrelease), GitHub repositories, and semantic Confluence/PDF knowledge bases, AutoRCA deploys a specialized swarm of AI sub-agents to perform root cause analysis (RCA), synthesize multi-file code patches in isolated Git worktrees, verify fixes against test harnesses, and draft pull requests with executive-ready RCA documentation.

---

## 2. Benefits of Using AutoRCA

### For VPs & Directors of Engineering
* **Quantifiable Velocity Boost**: Cuts Mean-Time-To-Resolution (MTTR) for regressions and production exceptions by up to **70%** by automating tedious stack-trace triage, knowledge base lookup, and initial patch drafting.
* **Deterministic Cost & Token Governance**: Enforces hard budget limits per debugging loop (`$ USD` and token burn caps), preventing runaway LLM consumption.
* **Audit-Ready Documentation**: Every automated fix produces an extensive RCA note detailing symptom triggers, root cause mechanics, and regression test proofs—ensuring organizational knowledge retention.
* **Zero Disruption to Existing Tooling**: Plugs seamlessly into Jira, Freshrelease, GitHub Actions, and Confluence without requiring proprietary SDK adoption or repository restructuring.

### For Software Engineers & Tech Leads
* **Isolated Worktree Sandboxes**: All AI code modifications happen in ephemeral Git worktrees (`autorca/fix-*`), keeping your primary working directory clean and unaffected.
* **Multi-Agent Swarm Specialization**: Instead of a generic prompt, five specialized sub-agents collaborate:
  1. **RCA Analyst**: Parses stack traces and isolates faulty execution paths.
  2. **Knowledge Base Retriever**: Looks up architectural ADRs and Confluence guidelines.
  3. **Code Repair Specialist**: Synthesizes minimal, idiomatic code patches.
  4. **Harness Verifier**: Executes test suites and inspects `stdout/stderr` for regressions.
  5. **CI Coordinator**: Packages the fix into a clean draft PR with Markdown notes.
* **Manual & Platform Modes**: Toggle effortlessly between platform bug selection (Jira/Freshrelease) and **Manual Issue Mode** to debug custom reproduction steps or unlisted exceptions on the fly.

---

## 3. How to Use This Suite

### A. Quick Start (Local Development)
1. **Clone & Install Dependencies**:
   ```bash
   git clone https://github.com/enterprise/autorca-suite.git
   cd autorca-suite
   npm install
   ```
2. **Start the Workbench & Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser to access the Autonomous Workbench.

### B. Enterprise Docker & Docker Compose Deployment
For production or self-hosted deployment on internal cloud infrastructure:
```bash
# Launch containerized suite with environment variables
docker-compose up -d --build
```
The container runs an optimized production server binding to `0.0.0.0:3000` behind Nginx, ready for Google Cloud Run, AWS ECS, or Kubernetes deployment.

### C. Step-by-Step Workbench Workflow
1. **Connect Integrations** (*Tab 1: KB & Bug Tracker*):
   * Enter your Jira/Freshrelease project key and credentials.
   * Attach relevant Confluence documentation or PDF architectural guides.
2. **Configure Swarm Engine** (*Tab 2: Models & Guardrails*):
   * Choose your preferred LLM engine (`gemini-2.5-pro`, `gemini-2.5-flash`, etc.) and set swarm temperature.
   * Configure hard token burn limits and email alert recipients for guardrail violations.
3. **Select or Create Target Issue** (*Tab 4: Loop Control*):
   * Click **Search Issues...** to pick an existing Jira/Freshrelease bug, OR check **Manual Issue Mode** to type a custom title and reproduction steps.
4. **Run Autonomous Loop**:
   * Click **RUN AUTORCA & FIX**. Watch the multi-agent swarm execute in real time across **SYSTEM_LOG_STREAM**, **WORKTREE_DIFF**, and **RCA NOTE & DRAFT PR** tabs.

---

## 4. Security Guardrails & Zero Data-Leakage Architecture

A primary concern for engineering leaders is preventing proprietary source code from leaking into public AI training sets or unauthorized external servers. **AutoRCA is engineered with a Defense-in-Depth security model:**

```
+---------------------------------------------------------------------------------+
|                         ENTERPRISE ZERO-LEAKAGE BOUNDARY                         |
|                                                                                 |
|   +-------------------+       +-----------------------+       +-------------+   |
|   | Jira / Issue API  | ----> |  Isolated Worktree    | ----> |  Test Suite |   |
|   +-------------------+       |  autorca/fix-*        |       |  Exit Code  |   |
|                               +-----------------------+       +-------------+   |
|                                           |                                     |
|                                           v                                     |
|                               +-----------------------+                         |
|                               | Human-in-the-Loop PR  |                         |
|                               | Supervised Approval   |                         |
|                               +-----------------------+                         |
+---------------------------------------------------------------------------------+
```

### 1. Zero Public Code Leakage & Tenant Isolation
* **Server-Side API Proxying**: All API calls and credentials (`GEMINI_API_KEY`, `GITHUB_PERSONAL_ACCESS_TOKEN`, Jira API tokens) are managed strictly server-side (`/api/*`). Secrets are never transmitted to or exposed in browser bundles.
* **Zero Data Retention Agreements**: When paired with enterprise model endpoints (Google Cloud Vertex AI / Gemini Enterprise), prompts and generated patches are explicitly excluded from model training pipelines.

### 2. Ephemeral Git Worktree Sandboxing
* The agent swarm is **strictly forbidden** from committing directly to default branches (`main`, `master`, `production`).
* Every repair attempt creates a temporary, isolated worktree (`autorca/fix-<issue_id>`). If a patch fails validation or exceeds iteration limits, the worktree is automatically garbage-collected without modifying developer workspaces.

### 3. Configurable Budget & Recursion Caps
* **Hard Token Burn Limits**: If an autonomous loop reaches the configured token threshold (e.g., `45,000` tokens), execution halts immediately.
* **Automated Guardrail Email Alerts**: Enterprise administrators receive instant notifications with diagnostic snapshots if a sub-agent triggers an iteration loop or token ceiling.

### 4. Human-in-the-Loop Supervised PR Gating
* AutoRCA operates in **Supervised Draft PR Mode**. The swarm cannot merge code automatically.
* All synthesized patches are emitted as **Draft Pull Requests** containing full RCA explanations and diff previews, requiring explicit human peer review and approval before merging.

---

## 5. End-to-End Automated Testing & CI/CD

AutoRCA includes a full automated test suite to verify UI localization, swarm token calculations, manual mode toggling, and guardrail alerts on every commit:
* Run tests locally:
  ```bash
  npm test
  ```
* Automated continuous integration is defined in `.github/workflows/ci.yml`, running build verification and unit/integration tests for every pull request.
