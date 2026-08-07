def test_health_check(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_openapi_docs(client):
    res = client.get("/api/v1/openapi.json")
    assert res.status_code == 200
    assert "paths" in res.json()
