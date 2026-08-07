import re
from typing import Dict, Any
from app.models.domain import GuardrailPolicy

class GuardrailService:
    def __init__(self):
        self.policy = GuardrailPolicy()

    def validate_content(self, text: str) -> Dict[str, Any]:
        violations = []
        clean_text = text

        # Check prohibited keywords
        for keyword in self.policy.prohibited_keywords:
            if keyword.lower() in text.lower():
                violations.append(f"Prohibited pattern detected: '{keyword}'")

        # PII Redaction simulation
        if self.policy.block_pii:
            # Mask SSN / Credit Card patterns
            clean_text = re.sub(r'\b\d{3}-\d{2}-\d{4}\b', '[REDACTED_SSN]', clean_text)
            clean_text = re.sub(r'\b\d{16}\b', '[REDACTED_CC]', clean_text)

        # Prompt Injection Defense check
        if self.policy.block_prompt_injection:
            injection_triggers = ["ignore previous instructions", "system prompt bypass", "drop database"]
            for trigger in injection_triggers:
                if trigger in text.lower():
                    violations.append(f"Prompt injection risk detected: '{trigger}'")

        is_safe = len(violations) == 0
        return {
            "is_safe": is_safe,
            "violations": violations,
            "sanitized_text": clean_text
        }

guardrail_service = GuardrailService()
