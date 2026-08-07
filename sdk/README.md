# 🔌 AutoRCA Plug-and-Play Integration SDKs

The **AutoRCA Plug-and-Play SDK Suite** enables engineering teams to instantly trigger autonomous Root Cause Analysis (RCA) and code fix jobs directly from their existing applications, exception handlers, APM systems, or CI/CD pipelines.

When an unhandled exception or critical bug occurs in production or staging, these lightweight SDKs capture the stack trace, metadata, and context, sending an automated dispatch event to your AutoRCA cluster.

---

## 📁 SDK Language Directory

This directory contains dedicated, isolated SDK implementations for major tech stacks:

| Tech Stack | Directory | Primary Integration Pattern |
| :--- | :--- | :--- |
| **Node.js / TypeScript** | [`/sdk/node`](./node) | Express Error Middleware, NestJS Filters, Lambda Hooks |
| **Python** | [`/sdk/python`](./python) | FastAPI / Starlette Middleware, Django Exception Handlers, Sentry Hooks |
| **Java / Spring Boot** | [`/sdk/java`](./java) | `@ControllerAdvice`, Spring WebFilter, Logback Appender |
| **Ruby on Rails** | [`/sdk/ruby`](./ruby) | Rails / Rack Middleware (`AutoRCA::RackMiddleware`), Sidekiq Hooks |

---

## ⚡ 5-Minute Setup Guides

### 1. Node.js & TypeScript (`/sdk/node`)

#### Installation
```bash
npm install ./sdk/node
# OR copy index.ts directly into your project's lib directory
```

#### Express.js Integration Example
```typescript
import express from 'express';
import { AutoRCAClient } from '@autorca/sdk';

const app = express();

const autorca = new AutoRCAClient({
  endpoint: process.env.AUTORCA_ENDPOINT || 'https://autorca.company.com',
  apiKey: process.env.AUTORCA_API_KEY,
  tenantId: 'org-payments',
  projectId: 'proj-gateway-v2',
  targetRepo: 'my-org/payment-gateway',
  targetBranch: 'main'
});

// Place as the LAST error middleware in Express
app.use(autorca.expressErrorHandler());
```

---

### 2. Python (`/sdk/python`)

#### Installation
```bash
pip install ./sdk/python
# OR copy autorca.py directly into your codebase
```

#### FastAPI Integration Example
```python
from fastapi import FastAPI
from autorca import AutoRCAClient, get_fastapi_middleware

app = FastAPI()

autorca = AutoRCAClient(
    endpoint="https://autorca.company.com",
    api_key="your-cluster-api-key",
    tenant_id="org-payments",
    project_id="proj-fraud-engine",
    target_repo="my-org/fraud-engine"
)

# Add AutoRCA Exception Catching Middleware
app.add_middleware(get_fastapi_middleware(autorca))
```

#### Manual Capture in Python
```python
try:
    process_payment(order_id)
except Exception as e:
    autorca.capture_exception(e, harness_command="pytest tests/unit")
```

---

### 3. Java & Spring Boot (`/sdk/java`)

#### Spring Boot `@ControllerAdvice` Integration
```java
package com.mycompany.service;

import com.autorca.sdk.AutoRCAClient;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    private final AutoRCAClient autorca = new AutoRCAClient(
        "https://autorca.company.com",
        System.getenv("AUTORCA_API_KEY"),
        "org-acme-corp",
        "proj-core-banking",
        "acme/core-banking-service",
        "main"
    );

    @ExceptionHandler(Exception.class)
    public void handleAllExceptions(Exception ex) {
        // Dispatch RCA swarm job in background
        autorca.dispatchIncident(
            ex.getClass().getSimpleName(),
            ex.getMessage(),
            getStackTraceAsString(ex),
            "mvn test"
        );
    }
}
```

---

### 4. Ruby on Rails (`/sdk/ruby`)

#### Rails Middleware Integration (`config/application.rb`)
```ruby
require_relative '../sdk/ruby/autorca'

module MyRailsApp
  class Application < Rails::Application
    # Auto-dispatch RCA swarm jobs on unhandled Rails exceptions
    config.middleware.use AutoRCA::RackMiddleware, client: AutoRCA::Client.new(
      endpoint: ENV.fetch('AUTORCA_ENDPOINT', 'https://autorca.company.com'),
      api_key: ENV['AUTORCA_API_KEY'],
      tenant_id: 'org-acme-corp',
      project_id: 'proj-rails-api',
      target_repo: 'acme/rails-api',
      targetBranch: 'main'
    )
  end
end
```

---

## 📡 Webhook Triggering from Sentry / Datadog / PagerDuty

If you prefer zero code modifications, configure your incident management or APM tools (Sentry, Datadog, PagerDuty, Grafana) to send a webhook POST request directly to the AutoRCA Cluster endpoint:

```http
POST https://autorca.company.com/api/worktree/dispatch
Content-Type: application/json
Authorization: Bearer <AUTORCA_API_KEY>
x-tenant-id: org-acme-corp
x-project-id: proj-payments

{
  "bugId": "SENTRY-ISSUE-8921",
  "title": "NullPointerInPaymentPipeline",
  "errorMessage": "Cannot read property 'id' of null",
  "stackTrace": "Error: Cannot read property 'id' of null at PaymentService.process (/app/src/payment.ts:42)",
  "repoUrl": "https://github.com/acme/payment-service",
  "branchName": "main",
  "harnessCommand": "npm test"
}
```

---

## 🧪 SDK Testing & Verification

Each SDK plug includes dedicated unit test suites to verify exception capture, header construction, and dispatch payloads:

| SDK Language | Test Suite Location | Command to Execute Tests |
| :--- | :--- | :--- |
| **Node.js / TypeScript** | [`/sdk/node/index.test.ts`](./node/index.test.ts) & [`src/tests/suite13_sdk_integrations.test.ts`](../src/tests/suite13_sdk_integrations.test.ts) | `npm test` |
| **Python** | [`/sdk/python/test_autorca.py`](./python/test_autorca.py) | `python3 -m unittest sdk/python/test_autorca.py` |
| **Ruby** | [`/sdk/ruby/test_autorca.rb`](./ruby/test_autorca.rb) | `ruby sdk/ruby/test_autorca.rb` |

---

## 🔒 Security & Privacy

1. **Secret Redaction**: Stack traces and metadata are sanitized via AutoRCA's HashiCorp Vault / Secret Masking engine prior to LLM processing.
2. **Network Safety**: The SDK performs asynchronous, non-blocking HTTP requests so your user-facing application latency is never impacted.
