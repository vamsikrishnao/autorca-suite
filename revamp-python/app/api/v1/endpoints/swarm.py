from fastapi import APIRouter, HTTPException
from typing import List
from app.models.domain import SwarmTask
from app.services.swarm_service import swarm_service
from app.services.bug_service import bug_service
from app.tasks.background_tasks import async_execute_swarm

router = APIRouter(prefix="/swarm", tags=["Swarm Engine"])

@router.post("/trigger/{bug_id}", response_model=SwarmTask)
def trigger_swarm(bug_id: str):
    bug = bug_service.get_bug(bug_id)
    if not bug:
        raise HTTPException(status_code=404, detail="Bug not found")
    
    task = swarm_service.create_swarm_task(bug)
    # Trigger Celery task or synchronous execution
    async_execute_swarm.delay(task.task_id)
    return swarm_service.get_task(task.task_id)

@router.get("/task/{task_id}", response_model=SwarmTask)
def get_swarm_task(task_id: str):
    task = swarm_service.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Swarm task not found")
    return task

@router.get("/tenant/{tenant_id}", response_model=List[SwarmTask])
def list_swarm_tasks(tenant_id: str):
    return swarm_service.list_tasks_by_tenant(tenant_id)
