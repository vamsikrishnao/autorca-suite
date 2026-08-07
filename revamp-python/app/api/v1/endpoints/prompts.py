from fastapi import APIRouter
from app.models.domain import AgentRole
from app.services.prompt_service import prompt_service

router = APIRouter(prefix="/prompts", tags=["Subagent Prompts"])

@router.post("/render")
def render_prompt(role: AgentRole, context: dict):
    rendered = prompt_service.render_prompt(role, context)
    return {"role": role.value, "rendered_prompt": rendered}
