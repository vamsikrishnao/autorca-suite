from typing import Dict, Optional
from app.models.domain import TenantConfig, TenantTier, TenantQuota

class TenantService:
    def __init__(self):
        self._tenants: Dict[str, TenantConfig] = {
            "default-tenant": TenantConfig(
                tenant_id="default-tenant",
                tenant_name="Default Production Tenant",
                tier=TenantTier.ENTERPRISE,
                quota=TenantQuota(max_bugs_per_day=1000, max_swarm_workers=20, max_kb_docs=5000)
            )
        }

    def register_tenant(self, tenant_id: str, name: str, tier: TenantTier = TenantTier.PRO) -> TenantConfig:
        quota = TenantQuota()
        if tier == TenantTier.ENTERPRISE:
            quota = TenantQuota(max_bugs_per_day=1000, max_swarm_workers=50, max_kb_docs=50000)
        elif tier == TenantTier.FREE:
            quota = TenantQuota(max_bugs_per_day=10, max_swarm_workers=2, max_kb_docs=50)

        tenant = TenantConfig(
            tenant_id=tenant_id,
            tenant_name=name,
            tier=tier,
            quota=quota
        )
        self._tenants[tenant_id] = tenant
        return tenant

    def get_tenant(self, tenant_id: str) -> Optional[TenantConfig]:
        return self._tenants.get(tenant_id)

    def validate_tenant_isolation(self, resource_tenant_id: str, request_tenant_id: str) -> bool:
        if not resource_tenant_id or not request_tenant_id:
            return False
        return resource_tenant_id == request_tenant_id

tenant_service = TenantService()
