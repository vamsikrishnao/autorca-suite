# AutoRCA Engine - Python / FastAPI + Celery Architecture

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
* **Asynchronous Distributed Swarm Execution**: Multi-agent task queuing powered by Celery workers and Redis message brokers.
* **Type-Safe Domain Modeling**: Pydantic v2 models with runtime validation and automatic OpenAPI 3.1 specification generation.
* **Enterprise Multitenancy & Session Governance**: Isolation enforcement, distributed session store with TTL, and Redis/Local memory fallback.
* **Security Sandbox & SIEM Auditing**: Restricted command execution verification and SHA-256 tamper-evident CEF log formatting.
* **Knowledge Base RAG Engine**: Connectors for SharePoint, Confluence, Notion, Jira, and Vector similarity search.
* **Plug-and-Play Integration SDK Harness**: Multi-channel incident dispatchers for AutoRCA, Datadog, Sentry, PagerDuty, and Slack.

---

## 4. Directory & Module Structure

```text
revamp-python/
├── app/
│   ├── main.py                  # FastAPI entry point, CORS middleware, OpenAPI docs
│   ├── celery_app.py            # Celery instance configuration & broker settings
│   ├── core/
│   │   ├── config.py            # Pydantic Settings & Environment loading
│   │   ├── session.py           # DistributedSessionStore (Redis / Local fallback)
│   │   └── security.py          # Auth headers & Bearer token verification
│   ├── models/
│   │   └── domain.py            # Pydantic v2 schemas (Tenants, Bugs, Swarm, KB, SIEM, SDKs)
│   ├── services/
│   │   ├── tenant_service.py    # Multitenant isolation & quota enforcement
│   │   ├── bug_service.py       # Bug selector, severity scoring, triage classifier
│   │   ├── swarm_service.py     # Multi-agent swarm orchestrator & step runner
│   │   ├── worker_pool_service.py# Worker allocation, health checks & heartbeat
│   │   ├── sandbox_service.py   # Command isolation & security policy guard
│   │   ├── github_service.py    # GitHub PR automation & workflow branch creation
│   │   ├── kb_service.py        # RAG search, SharePoint/Confluence connector sync
│   │   ├── audit_service.py     # SIEM logger with CEF & SHA-256 checksums
│   │   ├── guardrail_service.py # PII redactor & Prompt Injection defender
│   │   ├── prompt_service.py    # Subagent prompt rendering engine
│   │   └── sdk_service.py       # Exception dispatch harness (Datadog/Sentry/Slack)
│   ├── tasks/
│   │   └── background_tasks.py  # Asynchronous Celery background task definitions
│   └── api/v1/
│       ├── router.py            # Main API Router aggregating domain endpoints
│       └── endpoints/           # Domain REST REST API controllers
│           ├── tenant.py
│           ├── bugs.py
│           ├── swarm.py
│           ├── worker_pool.py
│           ├── sandbox.py
│           ├── github.py
│           ├── kb.py
│           ├── audit.py
│           ├── guardrails.py
│           ├── prompts.py
│           ├── session.py
│           └── sdk.py
├── tests/
│   ├── conftest.py              # Pytest client fixtures
│   ├── test_tenant.py           # Tenant isolation test suite
│   ├── test_bugs.py             # Bug triage test suite
│   ├── test_swarm.py            # Swarm engine test suite
│   ├── test_worker_pool.py      # Worker pool test suite
│   ├── test_api_governance.py   # Health check & OpenAPI test suite
│   ├── test_sandbox.py          # Security sandbox test suite
│   ├── test_github.py           # GitHub automation test suite
│   ├── test_kb_rag.py           # Knowledge Base RAG test suite
│   ├── test_audit.py            # SIEM audit log test suite
│   ├── test_guardrails.py       # AI safety guardrails test suite
│   ├── test_prompts.py          # Subagent prompt test suite
│   ├── test_session.py          # Distributed session store test suite
│   ├── test_sdk_integrations.py # Integration SDK dispatch test suite
│   └── test_e2e.py              # End-to-End full workflow integration test
├── Dockerfile                   # Multi-stage production container build
├── docker-compose.yml           # Full stack local environment (API + Celery + Redis)
├── pytest.ini                   # Pytest runner configuration
├── requirements.txt             # Python dependencies
└── .env.example                 # Environment variables configuration template
```

---

## 5. Quickstart & Local Setup

### 1. Environment Setup
```bash
cd revamp-python
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Run Test Suite
```bash
PYTHONPATH=. pytest tests -v
```

### 3. Run Application locally with Uvicorn

#### Start FastAPI server with live reload
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger API documentation will be available at:
`http://localhost:8000/docs`

To let the React UI seamlessly communicate with your Python backend without cross-origin (CORS) issues, configure a proxy in `vite.config.ts` (or point your API fetch client base URL to `http://localhost:8000`):
In `vite.config.ts`:
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    }
  }
}
```

#### Start the React Frontend UI
Open a second terminal window in the root project directory:

```bash
# 1. Install UI dependencies
npm install

# 2. Start Vite development server
npm run dev
```

Open `http://localhost:3000` in your browser You will see the full interactive UI where user actions in the frontend trigger live Python FastAPI requests and Celery background tasks!

---

## 6. Docker & Docker Compose Deployment

To spin up the entire Python stack (FastAPI API + Celery Worker + Redis):

```bash
docker-compose up --build -d
```

Check health:
```bash
curl http://localhost:8000/health
```

---

## 7. Security Guardrails & Zero Data-Leakage Architecture

1. **Server-Side API Key Hiding**: Secrets (`GEMINI_API_KEY`, `GITHUB_PAT`, Jira API tokens) are strictly server-side (`/api/*`) and masked via HashiCorp Vault proxies.
2. **Production Safety Policy**: Pre-seeded demo sessions (`Jane Doe`) are disabled in production (`NODE_ENV=production`) unless explicitly allowed via `ALLOW_DEMO_SESSIONS=true`.
3. **Command Sanitization**: MicroVM Command Interceptor validates all harness commands against prohibited system calls.
4. **Human-in-the-Loop PR Gating**: All synthesized patches are published as GitHub Draft PRs requiring engineer review and approval.
