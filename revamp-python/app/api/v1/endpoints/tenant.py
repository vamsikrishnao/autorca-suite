from fastapi import APIRouter, HTTPException
from app.models.domain import TenantConfig, TenantTier
from app.services.tenant_service import tenant_service

router = APIRouter(prefix="/tenants", tags=["Tenants"])

@router.post("/register", response_model=TenantConfig)
def register_tenant(tenant_id: str, name: str, tier: TenantTier = TenantTier.PRO):
    return tenant_service.register_tenant(tenant_id, name, tier)

@router.get("/{tenant_id}", response_model=TenantConfig)
def get_tenant(tenant_id: str):
    tenant = tenant_service.get_tenant(tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant
