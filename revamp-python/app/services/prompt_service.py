from typing import Dict
from app.models.domain import AgentRole, PromptTemplate

class PromptService:
    def __init__(self):
        self._templates: Dict[AgentRole, PromptTemplate] = {
            AgentRole.LOG_PARSER: PromptTemplate(
                role=AgentRole.LOG_PARSER,
                template_str="You are a Log Parser Subagent. Analyze the following stack trace for bug {bug_id}:\n{stack_trace}",
                description="Extracts error frames and exceptions"
            ),
            AgentRole.CODE_ANALYZER: PromptTemplate(
                role=AgentRole.CODE_ANALYZER,
                template_str="You are a Code Analyzer Subagent. Locate source code for service {service_name}.",
                description="Identifies code references"
            ),
            AgentRole.ROOT_CAUSE_FINDER: PromptTemplate(
                role=AgentRole.ROOT_CAUSE_FINDER,
                template_str="You are a Root Cause Isolation Subagent. Synthesize findings for {title}.",
                description="Isolates bug root cause"
            ),
            AgentRole.PATCH_GENERATOR: PromptTemplate(
                role=AgentRole.PATCH_GENERATOR,
                template_str="You are a Patch Generator Subagent. Generate fix for category {category}.",
                description="Creates defensive patch code"
            ),
            AgentRole.REGRESSION_TESTER: PromptTemplate(
                role=AgentRole.REGRESSION_TESTER,
                template_str="You are a Regression Tester Subagent. Validate generated patch against test suite.",
                description="Verifies patch correctness"
            )
        }

    def render_prompt(self, role: AgentRole, context: dict) -> str:
        template = self._templates.get(role)
        if not template:
            return f"Subagent Role {role.value}: Process task."
        
        try:
            return template.template_str.format(**context)
        except Exception:
            return template.template_str

prompt_service = PromptService()
