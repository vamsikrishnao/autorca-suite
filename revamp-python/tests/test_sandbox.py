def test_sandbox_safe_command(client):
    payload = {
        "command": "python -m unittest discover",
        "working_directory": "/sandbox",
        "tenant_id": "tenant-alpha"
    }
    res = client.post("/api/v1/sandbox/execute", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["violation_detected"] is False

def test_sandbox_prohibited_command(client):
    payload = {
        "command": "rm -rf /",
        "working_directory": "/sandbox",
        "tenant_id": "tenant-alpha"
    }
    res = client.post("/api/v1/sandbox/execute", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is False
    assert data["violation_detected"] is True
    assert "Prohibited command" in data["stderr"]
