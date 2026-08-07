from fastapi import APIRouter
from app.api.v1.endpoints import (
    tenant, bugs, swarm, worker_pool, sandbox,
    github, kb, audit, guardrails, prompts, session, sdk
)

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(tenant.router)
api_router.include_router(bugs.router)
api_router.include_router(swarm.router)
api_router.include_router(worker_pool.router)
api_router.include_router(sandbox.router)
api_router.include_router(github.router)
api_router.include_router(kb.router)
api_router.include_router(audit.router)
api_router.include_router(guardrails.router)
api_router.include_router(prompts.router)
api_router.include_router(session.router)
api_router.include_router(sdk.router)
