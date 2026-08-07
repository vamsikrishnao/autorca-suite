import time
import uuid
from typing import Dict, Any, Optional, List
from pydantic import BaseModel

class UserSessionData(BaseModel):
    token: str
    user_id: str
    email: str
    role: str
    tenant_id: str
    created_at: float
    expires_at: float
    metadata: Dict[str, Any] = {}

class DistributedSessionStore:
    def __init__(self, redis_url: Optional[str] = None):
        self.redis_url = redis_url
        self._local_store: Dict[str, UserSessionData] = {}
        self.is_redis_active = False
        
        # Check if Redis is usable
        if redis_url and redis_url.startswith("redis://"):
            try:
                import redis
                r = redis.Redis.from_url(redis_url, socket_timeout=1)
                r.ping()
                self._redis_client = r
                self.is_redis_active = True
            except Exception:
                self.is_redis_active = False

    def create_session(
        self,
        user_id: str,
        email: str,
        role: str,
        tenant_id: str,
        ttl_seconds: int = 86400,
        metadata: Optional[Dict[str, Any]] = None
    ) -> UserSessionData:
        token = f"sess_{uuid.uuid4().hex}"
        now = time.time()
        expires_at = now + ttl_seconds
        
        session = UserSessionData(
            token=token,
            user_id=user_id,
            email=email,
            role=role,
            tenant_id=tenant_id,
            created_at=now,
            expires_at=expires_at,
            metadata=metadata or {}
        )
        
        if self.is_redis_active:
            try:
                import json
                self._redis_client.setex(
                    f"session:{token}",
                    ttl_seconds,
                    session.model_dump_json()
                )
            except Exception:
                self._local_store[token] = session
        else:
            self._local_store[token] = session
            
        return session

    def get_session(self, token: str) -> Optional[UserSessionData]:
        if not token:
            return None
            
        if self.is_redis_active:
            try:
                data = self._redis_client.get(f"session:{token}")
                if data:
                    return UserSessionData.model_validate_json(data)
            except Exception:
                pass
                
        session = self._local_store.get(token)
        if session:
            if time.time() > session.expires_at:
                del self._local_store[token]
                return None
            return session
        return None

    def destroy_session(self, token: str) -> bool:
        if not token:
            return False
            
        destroyed = False
        if self.is_redis_active:
            try:
                res = self._redis_client.delete(f"session:{token}")
                destroyed = res > 0
            except Exception:
                pass
                
        if token in self._local_store:
            del self._local_store[token]
            destroyed = True
            
        return destroyed

    def list_tenant_sessions(self, tenant_id: str) -> List[UserSessionData]:
        active: List[UserSessionData] = []
        now = time.time()
        
        for token, sess in list(self._local_store.items()):
            if sess.tenant_id == tenant_id and sess.expires_at > now:
                active.append(sess)
        return active

session_store = DistributedSessionStore()
