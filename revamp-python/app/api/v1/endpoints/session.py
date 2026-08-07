from fastapi import APIRouter, HTTPException, Header
from typing import Optional, List
from app.core.session import session_store, UserSessionData

router = APIRouter(prefix="/auth", tags=["Session & Auth Governance"])

@router.post("/session", response_model=UserSessionData)
def create_session(user_id: str, email: str, role: str, tenant_id: str):
    return session_store.create_session(user_id, email, role, tenant_id)

@router.get("/session/me", response_model=UserSessionData)
def get_current_session(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Bearer token")
    token = authorization.split(" ")[1]
    sess = session_store.get_session(token)
    if not sess:
        raise HTTPException(status_code=401, detail="Session expired or invalid")
    return sess

@router.delete("/session")
def logout(authorization: Optional[str] = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        session_store.destroy_session(token)
    return {"message": "Session destroyed"}
