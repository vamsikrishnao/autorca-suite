def test_audit_logging_and_tamper_checksum(client):
    params = {
        "event_type": "SWARM_PATCH_APPLIED",
        "actor": "user@org.com",
        "tenant_id": "tenant-alpha"
    }
    details = {"bug_id": "bug-101", "patch_status": "SUCCESS"}
    res = client.post("/api/v1/audit/log", params=params, json=details)
    assert res.status_code == 200
    log = res.json()
    assert log["event_type"] == "SWARM_PATCH_APPLIED"
    assert len(log["checksum"]) == 64  # SHA256 hex string length
