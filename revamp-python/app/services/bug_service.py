from typing import List, Dict, Optional
import time
from app.models.domain import BugReport, TriageResult, BugSeverity, BugCategory

class BugService:
    def __init__(self):
        self._bugs: Dict[str, BugReport] = {}
        self._triages: Dict[str, TriageResult] = {}

    def report_bug(self, bug: BugReport) -> BugReport:
        self._bugs[bug.bug_id] = bug
        self.triage_bug(bug.bug_id)
        return bug

    def triage_bug(self, bug_id: str) -> Optional[TriageResult]:
        bug = self._bugs.get(bug_id)
        if not bug:
            return None

        text = f"{bug.title} {bug.description} {bug.stack_trace or ''}".lower()
        
        # Category detection
        category = BugCategory.NULL_POINTER
        if "memory" in text or "heap" in text or "oom" in text:
            category = BugCategory.MEMORY_LEAK
        elif "race" in text or "lock" in text or "deadlock" in text:
            category = BugCategory.RACE_CONDITION
        elif "timeout" in text or "connection refused" in text:
            category = BugCategory.NETWORK_TIMEOUT
        elif "auth" in text or "unauthorized" in text or "jwt" in text:
            category = BugCategory.AUTHENTICATION
        elif "null" in text or "undefined" in text or "none" in text:
            category = BugCategory.NULL_POINTER

        # Severity scoring
        severity = BugSeverity.MEDIUM
        score = 0.5
        if "critical" in text or "fatal" in text or "outage" in text or category == BugCategory.MEMORY_LEAK:
            severity = BugSeverity.CRITICAL
            score = 0.95
        elif "error" in text or "exception" in text or category == BugCategory.AUTHENTICATION:
            severity = BugSeverity.HIGH
            score = 0.80
        elif "warn" in text:
            severity = BugSeverity.LOW
            score = 0.30

        recommendation = f"Initiate Swarm Root Cause Analysis for {category.value} with priority {severity.value}."

        result = TriageResult(
            bug_id=bug_id,
            severity=severity,
            category=category,
            score=score,
            recommended_action=recommendation
        )
        self._triages[bug_id] = result
        return result

    def get_bug(self, bug_id: str) -> Optional[BugReport]:
        return self._bugs.get(bug_id)

    def get_triage(self, bug_id: str) -> Optional[TriageResult]:
        return self._triages.get(bug_id)

    def list_bugs_by_tenant(self, tenant_id: str) -> List[BugReport]:
        return [b for b in self._bugs.values() if b.tenant_id == tenant_id]

bug_service = BugService()
