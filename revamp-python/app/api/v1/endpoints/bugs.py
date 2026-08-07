from fastapi import APIRouter, HTTPException
from typing import List
from app.models.domain import BugReport, TriageResult
from app.services.bug_service import bug_service

router = APIRouter(prefix="/bugs", tags=["Bugs"])

@router.post("/", response_model=BugReport)
def report_bug(bug: BugReport):
    return bug_service.report_bug(bug)

@router.get("/{bug_id}", response_model=BugReport)
def get_bug(bug_id: str):
    bug = bug_service.get_bug(bug_id)
    if not bug:
        raise HTTPException(status_code=404, detail="Bug report not found")
    return bug

@router.get("/{bug_id}/triage", response_model=TriageResult)
def get_triage(bug_id: str):
    triage = bug_service.get_triage(bug_id)
    if not triage:
        raise HTTPException(status_code=404, detail="Triage result not found")
    return triage

@router.get("/tenant/{tenant_id}", response_model=List[BugReport])
def list_bugs_by_tenant(tenant_id: str):
    return bug_service.list_bugs_by_tenant(tenant_id)
