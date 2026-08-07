from fastapi import APIRouter
from typing import Dict, Any
from app.services.guardrail_service import guardrail_service

router = APIRouter(prefix="/guardrails", tags=["Guardrails & Safety"])

@router.post("/validate")
def validate_content(text: str) -> Dict[str, Any]:
    return guardrail_service.validate_content(text)
