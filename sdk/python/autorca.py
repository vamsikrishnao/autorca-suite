import os
import sys
import traceback
import json
import requests
from typing import Optional, Dict, Any

class AutoRCAClient:
    """
    AutoRCA Python SDK & Middleware Wrapper
    Plug-and-play client to report runtime errors and trigger autonomous RCA swarm fixes.
    """

    def __init__(
        self,
        endpoint: str,
        api_key: Optional[str] = None,
        tenant_id: Optional[str] = None,
        project_id: Optional[str] = None,
        target_repo: Optional[str] = None,
        target_branch: Optional[str] = None,
        environment: Optional[str] = None
    ):
        self.endpoint = endpoint.rstrip("/")
        self.api_key = api_key or os.environ.get("AUTORCA_API_KEY")
        self.tenant_id = tenant_id or os.environ.get("AUTORCA_TENANT_ID", "org-acme-corp")
        self.project_id = project_id or os.environ.get("AUTORCA_PROJECT_ID", "proj-main")
        self.target_repo = target_repo or os.environ.get("AUTORCA_TARGET_REPO", "")
        self.target_branch = target_branch or os.environ.get("AUTORCA_TARGET_BRANCH", "main")
        self.environment = environment or os.environ.get("ENV", "production")

    def dispatch_investigation(
        self,
        title: str,
        error_message: str,
        stack_trace: Optional[str] = None,
        bug_id: Optional[str] = None,
        harness_command: str = "pytest",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Dispatch an automated RCA investigation job to the AutoRCA cluster.
        """
        url = f"{self.endpoint}/api/worktree/dispatch"
        payload = {
            "bugId": bug_id or f"PY-{int(os.getpid())}",
            "title": title,
            "errorMessage": error_message,
            "stackTrace": stack_trace or traceback.format_exc(),
            "repoUrl": self.target_repo,
            "branchName": self.target_branch,
            "tenantId": self.tenant_id,
            "projectId": self.project_id,
            "environment": self.environment,
            "harnessCommand": harness_command,
            "metadata": metadata or {},
        }

        headers = {
            "Content-Type": "application/json",
            "x-tenant-id": self.tenant_id,
            "x-project-id": self.project_id,
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=5)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"[AutoRCA Python SDK] Exception dispatch error: {e}", file=sys.stderr)
            return {"success": False, "error": str(e)}

    def capture_exception(self, exc: Exception, harness_command: str = "pytest", metadata: Optional[Dict[str, Any]] = None):
        """
        Convenience method to capture a caught Python exception.
        """
        tb = "".join(traceback.format_exception(type(exc), exc, exc.__traceback__))
        return self.dispatch_investigation(
            title=type(exc).__name__,
            error_message=str(exc),
            stack_trace=tb,
            harness_command=harness_command,
            metadata=metadata
        )

# FastAPI / Starlette Middleware Wrapper Example
def get_fastapi_middleware(client: AutoRCAClient):
    from starlette.middleware.base import BaseHTTPMiddleware

    class AutoRCAMiddleware(BaseHTTPMiddleware):
        async def dispatch(self, request, call_next):
            try:
                return await call_next(request)
            except Exception as exc:
                client.capture_exception(
                    exc,
                    metadata={"url": str(request.url), "method": request.method}
                )
                raise exc

    return AutoRCAMiddleware
