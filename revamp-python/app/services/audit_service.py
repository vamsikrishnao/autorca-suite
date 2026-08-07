import time
import uuid
import hashlib
import json
from typing import List, Dict, Any, Optional
from app.models.domain import AuditLogEntry

class AuditService:
    def __init__(self):
        self._logs: List[AuditLogEntry] = []

    def log_event(self, event_type: str, actor: str, tenant_id: str, details: Dict[str, Any]) -> AuditLogEntry:
        log_id = f"audit_{uuid.uuid4().hex[:10]}"
        now = time.time()
        
        # Calculate SHA256 checksum for audit tamper verification
        raw_payload = f"{log_id}:{event_type}:{actor}:{tenant_id}:{now}:{json.dumps(details, sort_keys=True)}"
        checksum = hashlib.sha256(raw_payload.encode('utf-8')).hexdigest()

        entry = AuditLogEntry(
            log_id=log_id,
            event_type=event_type,
            actor=actor,
            tenant_id=tenant_id,
            details=details,
            timestamp=now,
            checksum=checksum
        )
        self._logs.append(entry)
        return entry

    def format_cef(self, entry: AuditLogEntry) -> str:
        """Common Event Format (CEF) for SIEM integrations."""
        return f"CEF:0|AutoRCA|Engine|1.0|{entry.event_type}|{entry.event_type}|5|act={entry.actor} tenant={entry.tenant_id} msg={json.dumps(entry.details)}"

    def get_tenant_logs(self, tenant_id: str) -> List[AuditLogEntry]:
        return [l for l in self._logs if l.tenant_id == tenant_id]

audit_service = AuditService()
