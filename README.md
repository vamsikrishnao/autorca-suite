# AutoRCA & Fix Enterprise Suite
**Autonomous Multi-Agent Bug Triage, Root Cause Analysis & Git Patch Synthesis Harness**

[![Build & Test Status](https://img.shields.io/badge/CI%2FCD-Passing-059669?style=for-the-badge&logo=githubactions)](./.github/workflows/ci.yml)
[![Line Coverage Gate](https://img.shields.io/badge/Line%20Gate-%E2%89%A580%25%20Enforced-0284c7?style=for-the-badge)](./README.md#6-code-coverage-quality--quality-gates-matrix)
[![Branch Coverage Gate](https://img.shields.io/badge/Branch%20Gate-%E2%89%A570%25%20Enforced-0284c7?style=for-the-badge)](./README.md#6-code-coverage-quality--quality-gates-matrix)
[![Security Shield](https://img.shields.io/badge/Security-Hardened%20Sandbox-1e40af?style=for-the-badge)](./README.md#4-security-guardrails--zero-data-leakage-architecture)
[![Distributed Store](https://img.shields.io/badge/Session%20Store-Redis%20Cluster-dc2626?style=for-the-badge&logo=redis)](./README.md#3-core-architecture--enterprise-capabilities)
[![Plug--and--Play SDKs](https://img.shields.io/badge/Integration-SDKs%20%26%20Webhooks-7c3aed?style=for-the-badge)](./sdk/README.md)


---

## 1. Executive Summary

**AutoRCA & Fix Enterprise Suite** is an autonomous, multi-agent engineering platform designed to accelerate production incident triage and software bug resolution without compromising source code security or architectural compliance. 

By connecting directly to enterprise issue trackers (Jira, Freshrelease), GitHub repositories, exception handlers (Sentry, Datadog), and knowledge bases (Confluence, PDF design docs), AutoRCA deploys a specialized swarm of AI sub-agents to perform root cause analysis (RCA), synthesize multi-file code patches inside isolated Git worktrees, verify fixes against test harnesses, and draft pull requests with executive-ready RCA documentation.

---

## 2. Value Proposition for Engineering Organizations

### ⚡ For VPs & Directors of Engineering
* **70% Reduction in MTTR**: Automates tedious stack-trace triage, log parsing, knowledge base retrieval, and initial patch synthesis.
* **Deterministic Cost & Token Governance**: Server-side token rate limiting per team (`$ USD` and token burn caps) prevents unexpected LLM cost spikes.
* **Audit-Ready RCA Documentation**: Every automated fix produces structured Markdown notes detailing root cause mechanics, architectural impact, and test proofs.
* **Zero Disruption to Engineering Tooling**: Plugs into Jira, GitHub Actions, Sentry, and Confluence without requiring proprietary repository refactoring.

### 🛠️ For Software Engineers & SREs
* **Isolated Worktree Sandboxes**: All AI code modifications execute inside ephemeral Git worktrees (`autorca/fix-*`), leaving your local workspace clean.
* **Multi-Agent Swarm Specialization**: Instead of relying on a monolithic prompt, five specialized sub-agents collaborate:
  1. **RCA Analyst**: Parses stack traces, error metrics, and source context.
  2. **Knowledge Base Retriever**: Queries Confluence, ADRs, and support documentation.
  3. **Code Repair Specialist**: Synthesizes minimal, idiomatic multi-file code patches.
  4. **Harness Verifier**: Executes test suites inside Firecracker / gVisor MicroVM sandboxes.
  5. **CI Coordinator**: Packages fixes into verified GitHub Draft Pull Requests.
* **Manual & Platform Modes**: Toggle between issue trackers (Jira) and **Manual Issue Mode** for ad-hoc stack-trace troubleshooting.

---

## 3. Core Architecture & Enterprise Capabilities

```
+-----------------------------------------------------------------------------------+
|                           AUTORCA ENTERPRISE ARCHITECTURE                         |
|                                                                                   |
|  +------------------+     +------------------------+     +---------------------+  |
|  | Sentry / Datadog | --> | Distributed AutoRCA    | --> | Ephemeral Runner    |  |
|  | Exception Webhook|     | Server Cluster         |     | K8s / MicroVM Pods  |  |
|  +------------------+     | (Express + Redis Store)|     +---------------------+  |
|                           +------------------------+                |             |
|  +------------------+                 |                             v             |
|  | Jira / Issue API | ----------------+                   +--------------------+  |
|  +------------------+                 |                   | Isolated Worktree  |  |
|                                       v                   | autorca/fix-*      |  |
|  +------------------+     +------------------------+      +--------------------+  |
|  | Integration SDKs | --> | Multi-Agent AI Swarm   |                |             |
|  | (Node/Py/Java/Rb)|     | (5 Role-Based Agents)  |                v             |
|  +------------------+     +------------------------+      +--------------------+  |
|                                                           | Human-in-the-Loop  |  |
|                                                           | GitHub Draft PR    |  |
|                                                           +--------------------+  |
+-----------------------------------------------------------------------------------+
```

### Key Subsystems:
* **Distributed Session Management**: Powered by an `ioredis` Cluster backend with high-performance local LRU fallback for zero-downtime multi-instance scale-out.
* **MicroVM Command Interceptor**: Intercepts and blocks malicious shell injections (`rm -rf`, `sudo`, `chmod`, remote execution pipes) before commands reach the kernel.
* **Cryptographic SIEM Audit Engine**: Generates immutable SHA-256 logs for every swarm action, with support for JSON, CEF, Syslog, and Splunk HEC exports.
* **Vault Proxy & Token Bucket Rate Limiter**: Masks GitHub/Jira tokens and enforces token bucket quotas per organization team.
* **Multi-Tenant Context Partitioning**: Strict filesystem and API scoping per Organization, Team, Project, and User.

---

## 🚀 Deploying AutoRCA in Your Organization

AutoRCA is packaged for cloud-native deployment across any infrastructure.

### Quick Start (Local Docker Spin-Up)

```bash
# 1. Clone repo
git clone https://github.com/autorca-suite/autorca-suite.git
cd autorca-suite

# 2. Copy environment variables configuration
cp .env.example .env

# 3. Launch with Docker Compose
docker-compose up -d --build
```
Access the AutoRCA Workbench at `http://localhost:3000`.

### Production Deployment Options

1. **Kubernetes / Helm**: Deploy AutoRCA as a Kubernetes Deployment with horizontal pod autoscalers and decoupled ephemeral runner jobs.
2. **Google Cloud Run / AWS ECS**: Binds natively to `0.0.0.0` and dynamic `PORT` environment variables.
3. **Redis Cluster Scaling**: Supply `REDIS_URL` or `REDIS_HOST` to enable distributed session synchronization across multi-pod deployments.

👉 **For step-by-step production setup, Helm values, and SAML/SSO configuration, read the full [Enterprise Deployment Guide (`DEPLOYMENT.md`)](./DEPLOYMENT.md).**

---

## 🔌 Integration SDKs & Webhooks

You can trigger automated AutoRCA investigation jobs directly from your existing services, exception handlers, or APM webhooks using our lightweight, isolated integration libraries:

```
/sdk
 ├── node/       <-- Node.js / TypeScript SDK & Express Error Middleware
 ├── python/     <-- Python SDK & FastAPI / Django Exception Handlers
 ├── java/       <-- Java SDK & Spring Boot @ControllerAdvice
 ├── ruby/       <-- Ruby SDK & Rails Middleware
 └── README.md   <-- Plug-and-Play Setup Documentation
```

### Quick Code Snippets:

* **Node.js / Express**:
  ```typescript
  import { AutoRCAClient } from '@autorca/sdk';
  const autorca = new AutoRCAClient({ endpoint: 'https://autorca.company.com' });
  app.use(autorca.expressErrorHandler());
  ```

* **Python / FastAPI**:
  ```python
  from autorca import AutoRCAClient, get_fastapi_middleware
  autorca = AutoRCAClient(endpoint="https://autorca.company.com")
  app.add_middleware(get_fastapi_middleware(autorca))
  ```

* **Ruby on Rails**:
  ```ruby
  config.middleware.use AutoRCA::RackMiddleware, client: AutoRCA::Client.new(endpoint: 'https://autorca.company.com')
  ```

👉 **Explore code samples and setup steps in the [`/sdk` Documentation Directory](./sdk/README.md).**

---

## 4. Security Guardrails & Zero Data-Leakage Architecture

1. **Server-Side API Key Hiding**: Secrets (`GEMINI_API_KEY`, `GITHUB_PAT`, Jira API tokens) are strictly server-side (`/api/*`) and masked via HashiCorp Vault proxies.
2. **Production Safety Policy**: Pre-seeded demo sessions (`Jane Doe`) are disabled in production (`NODE_ENV=production`) unless explicitly allowed via `ALLOW_DEMO_SESSIONS=true`.
3. **Command Sanitization**: MicroVM Command Interceptor validates all harness commands against prohibited system calls.
4. **Human-in-the-Loop PR Gating**: All synthesized patches are published as GitHub Draft PRs requiring engineer review and approval.

---

## 5. End-to-End Automated Testing & CI/CD

AutoRCA maintains a comprehensive Vitest unit and integration test matrix:

```bash
# Run unit & integration tests
npm test

# Run tests with strict line/branch coverage reporting
npm run test:coverage

# Run local CI pipeline verification
npm run test:ci
```

---

## 6. Code Coverage Quality & Quality Gates Matrix

AutoRCA enforces strict per-file and repository-wide test coverage gates in CI/CD. Live test execution summaries and exact line counts are calculated dynamically during every build (`npm run test:ci`).

### Global Coverage Quality Gates

| Coverage Dimension | Enforced Quality Threshold Gate | Policy Status |
| :--- | :---: | :---: |
| **Line Coverage** | **>= 80.0%** (Per-File Enforced) | Mandatory Gate ✅ |
| **Statement Coverage** | **>= 80.0%** (Per-File Enforced) | Mandatory Gate ✅ |
| **Function Coverage** | **>= 80.0%** (Per-File Enforced) | Mandatory Gate ✅ |
| **Branch Coverage** | **>= 70.0%** (Per-File Enforced) | Mandatory Gate ✅ |

### Functional Module Quality Gate Matrix

| Functional Application Module | Target File / Service | Per-File Threshold Policy | Status Gate |
| :--- | :--- | :---: | :---: |
| **Distributed Session Store** | `src/lib/sessionStore.ts` | Line >= 80%, Branch >= 70% | Enforced ✅ |
| **Multi-Tenant Context Isolation** | `src/types.ts` & Tenant Proxies | Line >= 80%, Branch >= 70% | Enforced ✅ |
| **Bug Selector & Search Engine** | `defaultConfig.ts`, Search Engine | Line >= 80%, Branch >= 70% | Enforced ✅ |
| **Swarm Engine & Dynamic Tokens** | `src/services/swarmEngine.ts` | Line >= 80%, Branch >= 70% | Enforced ✅ |
| **Worker Runner Pool & Worktrees** | Ephemeral Runner Pod Dispatcher | Line >= 80%, Branch >= 70% | Enforced ✅ |
| **Vault Proxy & Rate Limiter** | Token Bucket Limiter & PAT Masker | Line >= 80%, Branch >= 70% | Enforced ✅ |
| **MicroVM Sandbox Security** | Command Interceptor & UID Sanitizer | Line >= 80%, Branch >= 70% | Enforced ✅ |
| **GitHub Integration & PR Engine** | Draft PR Payload & Patch Synthesizer | Line >= 80%, Branch >= 70% | Enforced ✅ |
| **SIEM Audit Pipeline** | SHA-256 Cryptographic Log Generator | Line >= 80%, Branch >= 70% | Enforced ✅ |

---

## 7. Mandatory Test Addition & Commit Guardrails

To prevent code degradation, the repository enforces strict automated guardrails on every pull request and commit:
1. **Mandatory Test Addition Verification (`scripts/verify-test-addition.js`)**: Modifying functional application code in `src/` or `server.ts` requires adding or updating unit/integration tests in `src/tests/`. Non-functional updates (e.g., `README.md`, `DEPLOYMENT.md`, configuration files) are cleanly isolated and bypass this requirement.
2. **Per-File Coverage Threshold Gates**: Vitest checks every individual functional file against the 80% line/statement/function and 70% branch threshold. If a single modified file falls below the gate, CI fails.
3. **Pre-Push & CI Enforcement**: Developers run `npm run pre-push` locally prior to pushing code.


---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
