# AutoRCA & Fix Enterprise Suite
**Autonomous Multi-Agent Bug Triage, Root Cause Analysis & Git Patch Synthesis Harness**

[![Enterprise Shield](https://img.shields.io/badge/Guardrails-Active-059669?style=for-the-badge&logo=shield)](./README.md#7-test-case-addition-guardrails)
[![Build & Test Status](https://img.shields.io/badge/CI%2FCD-Passing-059669?style=for-the-badge&logo=githubactions)](./.github/workflows/ci.yml)
[![Line Coverage](https://img.shields.io/badge/Line%20Coverage-94.2%25-0284c7?style=for-the-badge)](./README.md#6-overall-code-coverage--functional-test-matrix)
[![Branch Coverage](https://img.shields.io/badge/Branch%20Coverage-88.5%25-0284c7?style=for-the-badge)](./README.md#6-overall-code-coverage--functional-test-matrix)
[![Zero Leakage](https://img.shields.io/badge/Security-Zero%20Code%20Leakage-1e40af?style=for-the-badge)](./README.md#4-security-guardrails--zero-data-leakage-architecture)

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
docker-compose up -d --build
```
The container runs an optimized production server binding to `0.0.0.0:3000` behind Nginx, ready for Google Cloud Run, AWS ECS, or Kubernetes deployment.

### C. Step-by-Step Workbench Workflow
1. **Connect Integrations** (*Tab: KB & Bug Tracker*):
   * Enter your Jira/Freshrelease project key and credentials.
   * Attach relevant Confluence documentation or PDF architectural guides.
2. **Configure Swarm Engine** (*Tab: Models & Guardrails*):
   * Choose your preferred LLM engine (`gemini-2.5-pro`, `gemini-2.5-flash`, etc.) and set swarm temperature.
   * Configure hard token burn limits and email alert recipients for guardrail violations.
3. **Select or Create Target Issue** (*Tab: Loop Control*):
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
|   +-------------------+       +-----------------------+       +-------------+   |
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

AutoRCA includes a full automated test suite verifying all services, sub-agents, and security guardrails:
* **Run tests locally**:
  ```bash
  npm test
  ```
* **Run tests with coverage**:
  ```bash
  npm run test:coverage
  ```
* **Run CI pipeline locally**:
  ```bash
  npm run test:ci
  ```

<!-- --- -->

<!-- ## 6. Overall Code Coverage & Functional Test Matrix

| Coverage Dimension | Metric | Covered / Total | Threshold Gate |
| :--- | :---: | :---: | :---: |
| **Line Coverage** | **94.2%** | 895 / 950 lines | **80.0%** ✅ |
| **Branch Coverage** | **88.5%** | 310 / 350 branches | **70.0%** ✅ |
| **Statement Coverage** | **93.8%** | 890 / 948 statements | **80.0%** ✅ |
| **Function Coverage** | **95.5%** | 126 / 132 functions | **80.0%** ✅ |

### Functional Section Coverage Breakdown

| Functional Application Section | Target Component / Service | Functional Coverage % | Status |
| :--- | :--- | :---: | :---: |
| **Multi-Tenant Context Isolation** | `src/types.ts` & Tenant Header Proxies | **100.0%** | Passed ✅ |
| **Bug Selector & Search Engine** | `defaultConfig.ts`, Search Filtering | **96.5%** | Passed ✅ |
| **Swarm Engine & Dynamic Tokens** | `src/services/swarmEngine.ts` | **92.8%** | Passed ✅ |
| **Worker Runner Pool & Worktrees** | Pod Dispatcher & Ephemeral Worktree | **94.0%** | Passed ✅ |
| **Vault Proxy & Rate Limiter** | Token Bucket Limiter & PAT Masker | **98.1%** | Passed ✅ |
| **MicroVM Sandbox Security** | Command Interceptor & UID Sanitizer | **100.0%** | Passed ✅ |
| **GitHub Integration & PR Engine** | Draft PR Payload & Unified Patch Synthesizer | **93.5%** | Passed ✅ |
| **KB Connectors & RAG Processing** | Chunking Engine & Score Thresholds | **91.0%** | Passed ✅ |
| **SIEM Audit Pipeline** | SHA-256 Cryptographic Log Generator | **100.0%** | Passed ✅ |
| **Guardrails & System Controls** | Budget Limits, Temp Clamping & Alerts | **97.0%** | Passed ✅ |
| **Sub-Agent System Prompts** | `src/prompts/agentSystemPrompts.ts` | **98.5%** | Passed ✅ | -->

<!-- --- -->

## 6. Test Case Addition Guardrails

To prevent regression risks and maintain code quality, the repository enforces three strict automated guardrails on every pull request and commit:

### 1. Mandatory Test Addition Check (`scripts/verify-test-addition.js`)
If any functional application code in `src/` (excluding test files) is added or modified in a pull request, at least one test file in `src/tests/` or matching `*.test.ts` **must** also be modified or created. Otherwise, CI fails immediately.

### 2. Automated Coverage Threshold Gates
Vitest is configured with hard coverage minimums:
- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 70%
- **Statements**: 80%

If any commit causes total coverage to drop below these thresholds, the build is blocked.

### 3. Pre-Push & PR Commenter Integration
- Developers can run `npm run pre-push` locally before pushing code to verify type checking, test addition guardrails, and test execution.
- GitHub Actions automatically posts a structured Vitest coverage summary comment on every pull request thread via `davelosert/vitest-coverage-report-action`.
