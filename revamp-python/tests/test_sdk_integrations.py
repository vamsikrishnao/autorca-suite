def test_sdk_exception_dispatch_harness(client):
    payload = {
        "incident_id": "inc-777",
        "service": "checkout-api",
        "title": "Critical Outage: Database Deadlock",
        "severity": "CRITICAL",
        "stack_trace": "org.postgresql.util.PSQLException: ERROR: deadlock detected",
        "tenant_id": "tenant-alpha"
    }
    res = client.post("/api/v1/sdk/dispatch", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["incident_id"] == "inc-777"
    assert data["status"] == "DISPATCHED"
    assert "Datadog_Events_API" in data["channels"]
    assert "AutoRCA_Core_SDK" in data["channels"]
