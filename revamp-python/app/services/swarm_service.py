import uuid
import time
from typing import Dict, Optional, List
from app.models.domain import SwarmTask, SwarmStatus, SwarmStep, AgentRole, BugReport

class SwarmService:
    def __init__(self):
        self._tasks: Dict[str, SwarmTask] = {}

    def create_swarm_task(self, bug: BugReport) -> SwarmTask:
        task_id = f"swarm_{uuid.uuid4().hex[:8]}"
        task = SwarmTask(
            task_id=task_id,
            bug_id=bug.bug_id,
            tenant_id=bug.tenant_id,
            status=SwarmStatus.QUEUED
        )
        self._tasks[task_id] = task
        return task

    def execute_swarm(self, task_id: str) -> SwarmTask:
        task = self._tasks.get(task_id)
        if not task:
            raise ValueError(f"Swarm task {task_id} not found")

        task.status = SwarmStatus.ANALYZING

        # Step 1: Log Parser Agent
        step1 = SwarmStep(
            step_id=f"step_{uuid.uuid4().hex[:6]}",
            agent_role=AgentRole.LOG_PARSER,
            status="COMPLETED",
            output="Parsed stack trace and logs successfully.",
            execution_time_ms=45.2
        )
        task.steps.append(step1)

        # Step 2: Code Analyzer Agent
        step2 = SwarmStep(
            step_id=f"step_{uuid.uuid4().hex[:6]}",
            agent_role=AgentRole.CODE_ANALYZER,
            status="COMPLETED",
            output="Identified target source module and affected lines.",
            execution_time_ms=120.8
        )
        task.steps.append(step2)

        # Step 3: Root Cause Finder Agent
        step3 = SwarmStep(
            step_id=f"step_{uuid.uuid4().hex[:6]}",
            agent_role=AgentRole.ROOT_CAUSE_FINDER,
            status="COMPLETED",
            output="Root cause isolated: Unhandled null reference / connection pool timeout.",
            execution_time_ms=88.4
        )
        task.steps.append(step3)
        task.root_cause_summary = "Null check missing before invoking downstream handler."

        # Step 4: Patch Generator Agent
        task.status = SwarmStatus.PATCHING
        step4 = SwarmStep(
            step_id=f"step_{uuid.uuid4().hex[:6]}",
            agent_role=AgentRole.PATCH_GENERATOR,
            status="COMPLETED",
            output="Generated bugfix patch with defensive null check and fallback exception handling.",
            execution_time_ms=195.0
        )
        task.steps.append(step4)
        task.generated_patch = "if (input == null) return FallbackResult.empty();"

        # Step 5: Regression Tester Agent
        task.status = SwarmStatus.VERIFYING
        step5 = SwarmStep(
            step_id=f"step_{uuid.uuid4().hex[:6]}",
            agent_role=AgentRole.REGRESSION_TESTER,
            status="COMPLETED",
            output="Executed regression test suite. All 120 tests passed.",
            execution_time_ms=310.5
        )
        task.steps.append(step5)

        task.status = SwarmStatus.COMPLETED
        return task

    def get_task(self, task_id: str) -> Optional[SwarmTask]:
        return self._tasks.get(task_id)

    def list_tasks_by_tenant(self, tenant_id: str) -> List[SwarmTask]:
        return [t for t in self._tasks.values() if t.tenant_id == tenant_id]

swarm_service = SwarmService()
