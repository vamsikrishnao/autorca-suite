from app.models.domain import SandboxExecutionRequest, SandboxExecutionResult, SandboxPolicy

class SandboxService:
    def __init__(self):
        self.policy = SandboxPolicy()

    def execute_in_sandbox(self, request: SandboxExecutionRequest) -> SandboxExecutionResult:
        cmd = request.command.strip().lower()
        
        # Security Policy Verification
        for prohibited in self.policy.prohibited_commands:
            if prohibited in cmd:
                return SandboxExecutionResult(
                    success=False,
                    exit_code=126,
                    stdout="",
                    stderr=f"Security Policy Violation: Prohibited command pattern detected '{prohibited}'",
                    violation_detected=True,
                    violation_reason=f"Command '{request.command}' violates sandbox security restrictions."
                )

        # Isolated Simulation Execution
        return SandboxExecutionResult(
            success=True,
            exit_code=0,
            stdout=f"[Sandbox Verified Execution] Executed safely in '{request.working_directory}'",
            stderr="",
            violation_detected=False
        )

sandbox_service = SandboxService()
