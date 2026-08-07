from fastapi import APIRouter
from typing import List, Dict, Any
from app.models.domain import AuditLogEntry
from app.services.audit_service import audit_service

router = APIRouter(prefix="/audit", tags=["SIEM & Audit Logging"])

@router.post("/log", response_model=AuditLogEntry)
def log_event(event_type: str, actor: str, tenant_id: str, details: Dict[str, Any]):
    return audit_service.log_event(event_type, actor, tenant_id, details)

@router.get("/tenant/{tenant_id}", response_model=List[AuditLogEntry])
def get_tenant_logs(tenant_id: str):
    return audit_service.get_tenant_logs(tenant_id)
