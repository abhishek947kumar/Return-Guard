import time
from typing import List, Dict, Any, Tuple
from backend.app.models.schemas import ReActTrace, ReActStep, FinalResolutionType
from backend.app.db.store import store

class GovernanceEngine:
    @staticmethod
    def validate_guardrails(
        order_data: Dict[str, Any],
        proposed_action: FinalResolutionType,
        fraud_risk_score: int,
        refund_amount: float
    ) -> Tuple[bool, List[str]]:
        """
        Applies hard AI safety and governance guardrails.
        Ensures the agent cannot violate regulatory, financial, or anti-fraud rules.
        """
        violations = []

        # Guardrail 1: Financial Cap Constraint ($500 maximum automated refund threshold)
        if proposed_action == FinalResolutionType.AUTO_REFUND and refund_amount > 500.0:
            violations.append(
                f"GUARDRAIL_VIOLATION: Auto-refund amount ${refund_amount:.2f} exceeds statutory autonomous threshold ($500.00). Must be escalated to Tier-2 supervisor."
            )

        # Guardrail 2: High Fraud Score Constraint
        if proposed_action == FinalResolutionType.AUTO_REFUND and fraud_risk_score >= 60:
            violations.append(
                f"GUARDRAIL_VIOLATION: Cannot auto-refund order with elevated fraud risk score ({fraud_risk_score}/100). Mandatory Human-in-the-Loop review required."
            )

        # Guardrail 3: Order Status Integrity
        current_status = order_data.get("status")
        if current_status in ["REFUNDED", "EXCHANGED"]:
            violations.append(
                f"GUARDRAIL_VIOLATION: Order {order_data.get('order_id')} is already in terminal state '{current_status}'. Duplicate refund request prevented."
            )

        # Guardrail 4: Final Sale Integrity
        if order_data.get("is_final_sale", False) and proposed_action == FinalResolutionType.AUTO_REFUND:
            violations.append(
                f"GUARDRAIL_VIOLATION: Item is marked as Final Sale. Automated refund is strictly prohibited under terms of sale."
            )

        passed = len(violations) == 0
        return passed, violations

    @staticmethod
    def extract_policy_citations(steps: List[ReActStep]) -> List[str]:
        """Extracts cited merchant policy clauses from the ReAct observation steps."""
        citations = []
        for step in steps:
            if step.observation and isinstance(step.observation, dict):
                p_code = step.observation.get("policy_code")
                if p_code and p_code not in citations:
                    citations.append(p_code)
                desc = step.observation.get("description")
                if desc and p_code:
                    citations.append(f"{p_code}: {desc}")
        return citations

    @staticmethod
    def record_decision_trace(trace: ReActTrace):
        """Stores the immutable governance trace into the centralized audit repository."""
        store.record_trace(trace)
