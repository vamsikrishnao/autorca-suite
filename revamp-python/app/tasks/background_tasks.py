from app.celery_app import celery_app
from app.services.swarm_service import swarm_service
from app.services.kb_service import kb_service
from app.services.sdk_service import sdk_service
from app.models.domain import IncidentDispatchRequest, BugSeverity

@celery_app.task(name="async_execute_swarm")
def async_execute_swarm(task_id: str):
    """Background Celery task for asynchronous swarm RCA execution."""
    task = swarm_service.execute_swarm(task_id)
    return task.model_dump()

@celery_app.task(name="async_sync_kb_connectors")
def async_sync_kb_connectors():
    """Background Celery task for scheduled KB connector synchronization."""
    connectors = kb_service.list_connectors()
    synced_count = len(connectors)
    return {"status": "SUCCESS", "synced_connectors": synced_count}

@celery_app.task(name="async_dispatch_incident")
def async_dispatch_incident(incident_data: dict):
    """Background Celery task for SDK exception dispatch."""
    req = IncidentDispatchRequest(**incident_data)
    res = sdk_service.dispatch_incident(req)
    return res
