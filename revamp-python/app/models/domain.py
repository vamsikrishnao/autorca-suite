from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, HttpUrl, EmailStr
from enum import Enum
import time

class TenantTier(str, Enum):
    FREE = "FREE"
    PRO = "PRO"
    ENTERPRISE = "ENTERPRISE"

class BugSeverity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class BugCategory(str, Enum):
    MEMORY_LEAK = "MEMORY_LEAK"
    RACE_CONDITION = "RACE_CONDITION"
    NULL_POINTER = "NULL_POINTER"
    AUTHENTICATION = "AUTHENTICATION"
    NETWORK_TIMEOUT = "NETWORK_TIMEOUT"
    DATABASE_LOCK = "DATABASE_LOCK"
    DATA_CORRUPTION = "DATA_CORRUPTION"

class SwarmStatus(str, Enum):
    QUEUED = "QUEUED"
    ANALYZING = "ANALYZING"
    PATCHING = "PATCHING"
    VERIFYING = "VERIFYING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class ConnectorType(str, Enum):
    SHAREPOINT = "SHAREPOINT"
    CONFLUENCE = "CONFLUENCE"
    NOTION = "NOTION"
    JIRA = "JIRA"
    LOCAL_VECTOR = "LOCAL_VECTOR"

# Tenant Models
class TenantQuota(BaseModel):
    max_bugs_per_day: int = 100
    max_swarm_workers: int = 10
    max_kb_docs: int = 500
    allowed_integrations: List[str] = ["slack", "github", "autorca"]

class TenantConfig(BaseModel):
    tenant_id: str
    tenant_name: str
    tier: TenantTier = TenantTier.PRO
    quota: TenantQuota = Field(default_factory=TenantQuota)
    is_active: bool = True
    created_at: float = Field(default_factory=time.time)

# Bug & Triage Models
class BugReport(BaseModel):
    bug_id: str
    title: str
    description: str
    stack_trace: Optional[str] = None
    service_name: str
    environment: str = "production"
    tenant_id: str
    reported_at: float = Field(default_factory=time.time)

class TriageResult(BaseModel):
    bug_id: str
    severity: BugSeverity
    category: BugCategory
    score: float
    recommended_action: str
    triaged_at: float = Field(default_factory=time.time)

# Swarm & Worker Models
class AgentRole(str, Enum):
    LOG_PARSER = "LOG_PARSER"
    CODE_ANALYZER = "CODE_ANALYZER"
    ROOT_CAUSE_FINDER = "ROOT_CAUSE_FINDER"
    PATCH_GENERATOR = "PATCH_GENERATOR"
    REGRESSION_TESTER = "REGRESSION_TESTER"

class SwarmStep(BaseModel):
    step_id: str
    agent_role: AgentRole
    status: str
    output: Optional[str] = None
    execution_time_ms: float = 0.0

class SwarmTask(BaseModel):
    task_id: str
    bug_id: str
    tenant_id: str
    status: SwarmStatus = SwarmStatus.QUEUED
    steps: List[SwarmStep] = []
    assigned_worker_id: Optional[str] = None
    root_cause_summary: Optional[str] = None
    generated_patch: Optional[str] = None
    created_at: float = Field(default_factory=time.time)

class WorkerNode(BaseModel):
    worker_id: str
    status: str = "IDLE"  # IDLE, BUSY, OFFLINE
    active_tasks: int = 0
    max_capacity: int = 5
    last_heartbeat: float = Field(default_factory=time.time)

# Sandbox Models
class SandboxPolicy(BaseModel):
    prohibited_commands: List[str] = ["rm -rf", "shutdown", "dd", "mkfs", "chmod 777 /"]
    max_memory_mb: int = 512
    max_cpu_percent: float = 80.0
    network_restricted: bool = True

class SandboxExecutionRequest(BaseModel):
    command: str
    working_directory: str = "/sandbox"
    timeout_seconds: int = 10
    tenant_id: str

class SandboxExecutionResult(BaseModel):
    success: bool
    exit_code: int
    stdout: str
    stderr: str
    violation_detected: bool = False
    violation_reason: Optional[str] = None

# GitHub Workflow Models
class GitHubPRRequest(BaseModel):
    repo: str
    base_branch: str = "main"
    head_branch: str
    title: str
    body: str
    patch_code: str
    tenant_id: str

class GitHubPRResult(BaseModel):
    pr_number: int
    pr_url: str
    branch: str
    status: str = "OPEN"

# KB Models
class KBArticle(BaseModel):
    article_id: str
    title: str
    content: str
    source: ConnectorType
    url: str
    tags: List[str] = []
    embedding_vector: Optional[List[float]] = None

class ConnectorConfig(BaseModel):
    connector_id: str
    connector_type: ConnectorType
    url: str
    is_connected: bool = False
    auth_status: str = "PENDING"  # PENDING, CONNECTED, DISCONNECTED, ERROR
    last_synced_at: Optional[float] = None

# SIEM & Audit Models
class AuditLogEntry(BaseModel):
    log_id: str
    event_type: str
    actor: str
    tenant_id: str
    details: Dict[str, Any] = {}
    timestamp: float = Field(default_factory=time.time)
    checksum: str = ""

# Guardrail Models
class GuardrailPolicy(BaseModel):
    block_pii: bool = True
    block_prompt_injection: bool = True
    prohibited_keywords: List[str] = ["AWS_SECRET_ACCESS_KEY", "DROP DATABASE", "exec("]

# Subagent Prompt Models
class PromptTemplate(BaseModel):
    role: AgentRole
    template_str: str
    description: str

# SDK Models
class IncidentDispatchRequest(BaseModel):
    incident_id: str
    service: str
    title: str
    severity: BugSeverity
    stack_trace: str
    tenant_id: str
