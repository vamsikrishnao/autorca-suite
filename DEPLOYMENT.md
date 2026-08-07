# AutoRCA & Fix Suite — Enterprise Architecture & Deployment Guide

This document provides a comprehensive blueprint for deploying, configuring, and scaling the **AutoRCA & Fix Enterprise Suite** in production environments.

---

## 1. Enterprise Architecture Overview

AutoRCA is designed with a decoupled, cloud-native architecture that separates request handling, state storage, AI orchestration, and untrusted code execution.

```
                              +---------------------------------------+
                              |         Ingress / Load Balancer       |
                              +---------------------------------------+
                                                  |
                                                  v
                              +---------------------------------------+
                              |      AutoRCA Server API Pods          |
                              |   (Express + Security Middleware)     |
                              +---------------------------------------+
                                        /                  \
                                       v                    v
  +---------------------------------------+   +---------------------------------------+
  |    Distributed Redis Session Store    |   |     Ephemeral Worker Runner Pods      |
  |  (ioredis Cluster / AWS ElastiCache)  |   | (K8s Jobs / MicroVM Worktree Sandbox) |
  +---------------------------------------+   +---------------------------------------+
                                                           |
                                                           v
                                              +-----------------------+
                                              |  GitHub Draft PR      |
                                              |  + CI Verification    |
                                              +-----------------------+
```

### Core Architecture Subsystems:
1. **API Server & Express Engine (`server.ts`)**:
   - Manages SSO/OAuth logins, tenant workspace switching, rate limiting, and SIEM audit logging.
   - Binds to `0.0.0.0` on configurable port (`PORT` env, default `3000`).
2. **Distributed Session Store (`src/lib/sessionStore.ts`)**:
   - Uses `ioredis` for multi-instance cluster synchronization with sliding-window TTLs (24h default).
   - Gracefully falls back to high-performance local LRU memory store if Redis is unconfigured or temporarily unreachable.
3. **Ephemeral Worker Runner Pool**:
   - Dispatches bug fix jobs to isolated, decoupled container workers or Kubernetes Jobs.
   - Uses per-job isolated `GIT_INDEX_FILE` paths to prevent index lock contention on shared repositories.
4. **MicroVM Sandbox Command Interceptor**:
   - Validates test harness commands against malicious shell injections before execution.
5. **Multi-Tenant Context Partitioning**:
   - Isolates configurations, worktrees, and audit streams by `Org / Team / Project / User`.

---

## 2. Production Deployment Options

### Option A: Docker Compose (Recommended for Staging / Single-Node)

1. Create a production `.env` file from the example template:
   ```bash
   cp .env.example .env
   ```
2. Configure mandatory production environment variables:
   ```env
   NODE_ENV=production
   ALLOW_DEMO_SESSIONS=false
   REDIS_URL=redis://:your_password@redis-cluster:6379
   OAUTH_CLIENT_ID=your_github_sso_client_id
   OAUTH_CLIENT_SECRET=your_github_sso_client_secret
   ```
3. Build and launch the container suite:
   ```bash
   docker-compose up -d --build
   ```

---

### Option B: Kubernetes Deployment (K8s / Helm)

AutoRCA can be deployed as a standard Kubernetes Deployment with an Horizontal Pod Autoscaler (HPA).

#### 1. Kubernetes Manifest Example (`autorca-deployment.yaml`):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: autorca-suite
  namespace: autorca
  labels:
    app: autorca-suite
spec:
  replicas: 3
  selector:
    matchLabels:
      app: autorca-suite
  template:
    metadata:
      labels:
        app: autorca-suite
    spec:
      containers:
        - name: autorca
          image: autorca-suite:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: "production"
            - name: ALLOW_DEMO_SESSIONS
              value: "false"
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: autorca-secrets
                  key: REDIS_URL
            - name: GEMINI_API_KEY
              valueFrom:
                secretKeyRef:
                  name: autorca-secrets
                  key: GEMINI_API_KEY
          resources:
            requests:
              cpu: "500m"
              memory: "1Gi"
            limits:
              cpu: "2000m"
              memory: "4Gi"
          readinessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 15
            periodSeconds: 20
---
apiVersion: v1
kind: Service
metadata:
  name: autorca-service
  namespace: autorca
spec:
  type: ClusterIP
  ports:
    - port: 80
      targetPort: 3000
  selector:
    app: autorca-suite
```

---

### Option C: Serverless Containers (Google Cloud Run / AWS ECS)

AutoRCA is fully compatible with serverless container platforms:
- **Google Cloud Run**: Binds to `0.0.0.0` and respects the dynamic `$PORT` environment variable injected by Cloud Run.
- **AWS ECS (Fargate)**: Set container definition port mapping to `3000:3000` or custom host port.

---

## 3. Distributed Redis Session Clustering

When deploying multiple instances of AutoRCA behind a load balancer, configure a Redis backend for session persistence:

```env
# Single node or Redis Cluster URL
REDIS_URL=redis://default:secure_password@redis-cluster.internal:6379

# OR individual host details:
REDIS_HOST=10.0.1.50
REDIS_PORT=6379
REDIS_PASSWORD=secure_password
```

### Security Hardening:
* **Enforce Authentication**: Always set `ALLOW_DEMO_SESSIONS=false` in production. This prevents users from accessing pre-seeded demo sessions (`Jane Doe`).
* **Rate Limiting**: Rate limiting middleware automatically restricts `/api/auth/login` attempts to 30 requests per minute per IP.

---

## 4. Port Customization & Coexistence with Existing Services (e.g., Ruby on Rails)

In enterprise environments where other applications (like **Ruby on Rails** on Puma/Unicorn) already occupy host port `3000`, route traffic cleanly:

### A. Docker Host Port Mapping (Recommended)
Map external host port `8080` (or any free port) to internal container port `3000`:
```bash
HOST_PORT=8080 docker-compose up -d --build
```
Your Rails app runs uninterrupted on `http://localhost:3000`, while AutoRCA runs on `http://localhost:8080`.

### B. Direct Environment Variable Override
Set `PORT` in your environment to instruct `server.ts` to listen directly on a custom port:
```env
PORT=8080
```

---

## 5. SIEM & Audit Observability Integration

AutoRCA produces immutable SHA-256 cryptographic audit logs for every system action, swarm execution step, and configuration save.

### Fetching Audit Streams
Query `/api/audit/logs` with tenant headers or parameters:
```bash
curl -H "x-tenant-id: org-acme-corp" https://autorca.company.com/api/audit/logs
```

### Supported SIEM Export Formats:
- **JSON Stream**
- **CEF (Common Event Format)**
- **Syslog RFC 5424**
- **Splunk HTTP Event Collector (HEC)**

---

## 6. Plug-and-Play Integration SDKs & Webhooks

To trigger AutoRCA RCA runs automatically from your applications or exception monitoring tools (Sentry, Datadog), use our isolated SDKs in `/sdk`:

| Language / Framework | SDK Location | Setup Reference |
| :--- | :--- | :--- |
| **Node.js / TypeScript** | [`/sdk/node`](./sdk/node) | Express Error Middleware |
| **Python** | [`/sdk/python`](./sdk/python) | FastAPI / Django Middleware |
| **Java** | [`/sdk/java`](./sdk/java) | Spring `@ControllerAdvice` |
| **Ruby** | [`/sdk/ruby`](./sdk/ruby) | Rails / Rack Middleware |

For complete code examples, inspect [`/sdk/README.md`](./sdk/README.md).

---

## 7. Environment Variables Reference

| Variable Name | Required? | Default | Description |
| :--- | :---: | :---: | :--- |
| `NODE_ENV` | Yes | `development` | Environment mode (`production` or `development`). |
| `PORT` | Optional | `3000` | Port for the Express backend server. |
| `ALLOW_DEMO_SESSIONS` | Optional | `false` in prod | Controls pre-seeded dummy user session (`Jane Doe`). Set `false` in prod. |
| `REDIS_URL` | Optional | None | Connection string for Redis session store cluster. |
| `REDIS_HOST` | Optional | `127.0.0.1` | Redis host IP if `REDIS_URL` is omitted. |
| `REDIS_PORT` | Optional | `6379` | Redis port if `REDIS_URL` is omitted. |
| `REDIS_PASSWORD` | Optional | None | Redis password. |
| `GEMINI_API_KEY` | Optional | None | Google Gemini API key for server-side LLM operations. |
| `OAUTH_CLIENT_ID` | Optional | None | OAuth/SSO Client ID for GitHub/SAML authentication. |
| `OAUTH_CLIENT_SECRET` | Optional | None | OAuth/SSO Client Secret. |
| `APP_URL` | Optional | `http://localhost:3000` | Canonical public URL of the AutoRCA application. |

---

## 8. Health Verification & Troubleshooting

After deployment, verify system health using the health endpoint:

```bash
curl https://autorca.company.com/api/health
```

Expected JSON Response:
```json
{
  "status": "ok",
  "library": "autorca-suite",
  "version": "1.2.0",
  "architectureMode": "Multi-Tenant Enterprise Isolated Storage"
}
```
