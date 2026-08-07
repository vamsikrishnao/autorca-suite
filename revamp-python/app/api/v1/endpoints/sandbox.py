from fastapi import APIRouter
from app.models.domain import SandboxExecutionRequest, SandboxExecutionResult
from app.services.sandbox_service import sandbox_service

router = APIRouter(prefix="/sandbox", tags=["Sandbox Execution"])

@router.post("/execute", response_model=SandboxExecutionResult)
def execute_command(request: SandboxExecutionRequest):
    return sandbox_service.execute_in_sandbox(request)
