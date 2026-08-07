def test_swarm_orchestration(client):
    # Setup bug
    bug_payload = {
        "bug_id": "bug-swarm-1",
        "title": "Out of memory heap crash",
        "description": "Heap space exhausted under load",
        "stack_trace": "java.lang.OutOfMemoryError: Java heap space",
        "service_name": "analytics-worker",
        "tenant_id": "default-tenant"
    }
    client.post("/api/v1/bugs/", json=bug_payload)

    # Trigger swarm
    trigger_res = client.post("/api/v1/swarm/trigger/bug-swarm-1")
    assert trigger_res.status_code == 200

    # Trigger swarm task directly via swarm_service
    from app.services.swarm_service import swarm_service
    from app.services.bug_service import bug_service

    bug = bug_service.get_bug("bug-swarm-1")
    task = swarm_service.create_swarm_task(bug)
    completed_task = swarm_service.execute_swarm(task.task_id)

    assert completed_task.status.value == "COMPLETED"
    assert len(completed_task.steps) == 5
    assert completed_task.generated_patch is not None
