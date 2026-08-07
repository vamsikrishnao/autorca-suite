from app.services.tenant_service import tenant_service
from app.models.domain import TenantTier

def test_tenant_registration(client):
    res = client.post("/api/v1/tenants/register?tenant_id=tenant-alpha&name=AlphaCorp&tier=PRO")
    assert res.status_code == 200
    data = res.json()
    assert data["tenant_id"] == "tenant-alpha"
    assert data["tier"] == "PRO"
    assert data["quota"]["max_bugs_per_day"] == 100

def test_tenant_retrieval(client):
    res = client.get("/api/v1/tenants/tenant-alpha")
    assert res.status_code == 200
    assert res.json()["tenant_name"] == "AlphaCorp"

def test_tenant_not_found(client):
    res = client.get("/api/v1/tenants/non-existent-tenant")
    assert res.status_code == 404

def test_tenant_isolation_validation():
    valid = tenant_service.validate_tenant_isolation("tenant-a", "tenant-a")
    invalid = tenant_service.validate_tenant_isolation("tenant-a", "tenant-b")
    assert valid is True
    assert invalid is False
