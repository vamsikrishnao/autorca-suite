from fastapi import APIRouter
from app.models.domain import IncidentDispatchRequest
from app.services.sdk_service import sdk_service

router = APIRouter(prefix="/sdk", tags=["Integration SDKs Harness"])

@router.post("/dispatch")
def dispatch_incident(request: IncidentDispatchRequest):
    return sdk_service.dispatch_incident(request)
