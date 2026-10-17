import time
import re
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple

from backend.app.models.schemas import (
    ReActStep, ReActTrace, FinalResolutionType, RMALabel, 
    RefundReceipt, EscalationTicket, ChatResponse
)
from backend.app.agent.tools import AgentTools
from backend.app.agent.governance import GovernanceEngine
from backend.app.db.store import store

class ReActAgent:
    def __init__(self):
        self.tools = AgentTools()

    def process_request(
        self, 
        user_message: str, 
        order_id_param: Optional[str] = None, 
        session_id: Optional[str] = None,
        image_data: Optional[str] = None
    ) -> ChatResponse:
        start_time = time.time()
        session_id = session_id or str(uuid.uuid4())[:8]
        steps: List[ReActStep] = []
        step_counter = 1
        photo_verification_res = None

        # 1. Identify Order ID from parameter or message regex
        target_order_id = order_id_param
        if not target_order_id:
            match = re.search(r"ORD-\d{4}", user_message.upper())
            if match:
                target_order_id = match.group(0)

        # If still no order ID found, guide the user
        if not target_order_id:
            trace = ReActTrace(
                session_id=session_id,
                steps=[
                    ReActStep(
                        step_number=1,
                        thought="The customer has not provided a specific order reference number. I need an order ID (e.g., ORD-7821) to verify purchase details against merchant records.",
                        action=None,
                        timestamp=datetime.now().strftime("%H:%M:%S.%f")[:-3]
                    )
                ],
                confidence_score=0.95,
                total_duration_ms=int((time.time() - start_time) * 1000)
            )
            return ChatResponse(
                reply="Hello! I'm **ReturnGuard**, your autonomous returns assistant. To verify your return eligibility and process your request immediately, please provide your **Order ID** (e.g., `ORD-7821` or `ORD-9430`), or select one from the quick scenarios above.",
                session_id=session_id,
                trace=trace
            )

        # Step 1: Look up order details
        t0 = time.time()
        thought_1 = f"Customer initiated return request for order '{target_order_id}'. I must query the Order Management System to inspect purchase date, fulfillment timestamps, category, and current status."
        order_obs = self.tools.lookup_order(target_order_id)
        steps.append(ReActStep(
            step_number=step_counter,
            thought=thought_1,
            action="lookup_order",
            action_input={"order_id": target_order_id},
            observation=order_obs,
            timestamp=datetime.now().strftime("%H:%M:%S.%f")[:-3],
            duration_ms=int((time.time() - t0) * 1000)
        ))
        step_counter += 1

        if "error" in order_obs:
            trace = ReActTrace(
                session_id=session_id,
                order_id=target_order_id,
                steps=steps,
                confidence_score=0.99,
                total_duration_ms=int((time.time() - start_time) * 1000)
            )
            return ChatResponse(
                reply=f"I checked our database, but could not locate order **{target_order_id}**. Please double-check the order number on your confirmation email.",
                session_id=session_id,
                trace=trace
            )

        customer_id = order_obs["customer_id"]
        category = order_obs["item_category"]
        item_price = order_obs["item_price"]
        item_name = order_obs["item_name"]
        days_since_delivery = order_obs["days_since_delivery"]
        is_final_sale = order_obs.get("is_final_sale", False)
        is_hygiene_sensitive = order_obs.get("is_hygiene_sensitive", False)

        # Step 2: Customer Trust & Behavior Analysis
        t0 = time.time()
        thought_2 = f"Order found ({item_name}, ${item_price:.2f}). Now retrieving customer profile for '{customer_id}' to evaluate account trust score and historical return frequency."
        cust_obs = self.tools.lookup_customer(customer_id)
        steps.append(ReActStep(
            step_number=step_counter,
            thought=thought_2,
            action="lookup_customer",
            action_input={"customer_id": customer_id},
            observation=cust_obs,
            timestamp=datetime.now().strftime("%H:%M:%S.%f")[:-3],
            duration_ms=int((time.time() - t0) * 1000)
        ))
        step_counter += 1

        # Step 3: Evaluate Dynamic Merchant Return Policy & Semantic Clauses
        is_opened_claimed = any(w in user_message.lower() for w in ["opened", "unsealed", "tried", "used", "worn", "took out"])
        condition_claimed = "WORN" if any(w in user_message.lower() for w in ["worn", "party", "wedding", "scented"]) else "OPENED" if is_opened_claimed else "DAMAGED" if any(w in user_message.lower() for w in ["cracked", "broken", "damaged"]) else "GOOD"

        t0 = time.time()
        thought_3 = f"Now evaluating merchant policy for '{category}' against {days_since_delivery} elapsed delivery days (Item condition: {condition_claimed}, Opened: {is_opened_claimed})."
        policy_obs = self.tools.evaluate_return_policy(
            category=category,
            days_since_delivery=days_since_delivery,
            is_opened=is_opened_claimed,
            stated_condition=condition_claimed
        )
        steps.append(ReActStep(
            step_number=step_counter,
            thought=thought_3,
            action="evaluate_return_policy",
            action_input={
                "category": category,
                "days_since_delivery": days_since_delivery,
                "is_opened": is_opened_claimed,
                "condition": condition_claimed
            },
            observation=policy_obs,
            timestamp=datetime.now().strftime("%H:%M:%S.%f")[:-3],
            duration_ms=int((time.time() - t0) * 1000)
        ))
        step_counter += 1

        # Step 4: Multimodal Computer Vision Damage Inspection (if image attached or transit damage reported)
        has_photo_evidence = image_data is not None and len(image_data.strip()) > 0
        if has_photo_evidence:
            t0 = time.time()
            thought_photo = f"Customer attached photographic proof. Executing Multimodal Vision Defect Inspector for '{item_name}'."
            photo_obs = self.tools.verify_damage_photo(
                image_data=image_data,
                item_name=item_name,
                category=category,
                reason=user_message
            )
            steps.append(ReActStep(
                step_number=step_counter,
                thought=thought_photo,
                action="verify_damage_photo",
                action_input={"item_name": item_name, "category": category},
                observation=photo_obs,
                timestamp=datetime.now().strftime("%H:%M:%S.%f")[:-3],
                duration_ms=int((time.time() - t0) * 1000)
            ))
            step_counter += 1

            from backend.app.models.schemas import PhotoVerificationResult
            photo_verification_res = PhotoVerificationResult(
                is_verified=photo_obs["is_verified"],
                defect_detected=photo_obs["defect_detected"],
                confidence=photo_obs["confidence"],
                visual_indicators=photo_obs["visual_indicators"],
                image_summary=photo_obs["image_summary"]
            )

        # Step 5: Calculate Composite Fraud & Abuse Risk Score
        t0 = time.time()
        thought_fraud = f"Executing anti-fraud engine to evaluate risk signals (wardrobing, empty box frequency, high dollar value, serial return rate, photo evidence bonus)."
        fraud_obs = self.tools.calculate_fraud_risk(
            order_id=target_order_id,
            customer_id=customer_id,
            reason=user_message,
            days_elapsed=days_since_delivery,
            item_price=item_price,
            category=category,
            condition=condition_claimed,
            has_verified_photo=photo_verification_res.is_verified if photo_verification_res else False
        )
        steps.append(ReActStep(
            step_number=step_counter,
            thought=thought_fraud,
            action="calculate_fraud_risk",
            action_input={
                "order_id": target_order_id,
                "customer_id": customer_id,
                "item_price": item_price,
                "days_elapsed": days_since_delivery,
                "has_verified_photo": photo_verification_res.is_verified if photo_verification_res else False
            },
            observation=fraud_obs,
            timestamp=datetime.now().strftime("%H:%M:%S.%f")[:-3],
            duration_ms=int((time.time() - t0) * 1000)
        ))
        step_counter += 1

        fraud_score = fraud_obs["fraud_risk_score"]
        flags = fraud_obs["flags"]
        escalation_recommended = fraud_obs["escalation_recommended"]
        is_policy_compliant = policy_obs["is_policy_compliant"]

        # Step 5: Autonomous ReAct Decision Making & Action Dispatch
        final_resolution: FinalResolutionType
        reply_text: str
        rma_label: Optional[RMALabel] = None
        refund_receipt: Optional[RefundReceipt] = None
        escalation_ticket: Optional[EscalationTicket] = None

        # Scenario 1: Expired Return Window (unambiguous policy rejection unless damaged on delivery)
        is_transit_damage = any(w in user_message.lower() for w in ["damaged in transit", "arrived broken", "cracked", "shattered", "carrier damaged"])
        if days_since_delivery > policy_obs["allowed_window_days"] and not is_transit_damage:
            final_resolution = FinalResolutionType.POLICY_REJECTION
            overdue_days = policy_obs["days_overdue"]
            p_code = policy_obs["policy_code"]
            reply_text = (
                f"We reviewed your return request for **{item_name}** under merchant policy **{p_code}**.\n\n"
                f"Unfortunately, this item is **ineligible for return**:\n"
                f"- **Return Window:** Policy permits returns up to **{policy_obs['allowed_window_days']} days** post-delivery.\n"
                f"- **Days Elapsed:** **{days_since_delivery} days** have passed ({overdue_days} days past the authorized window).\n"
            )
            if "Wardrobing" in str(flags) or "worn" in user_message.lower():
                reply_text += f"- **Condition Notice:** Garments that have been worn for events or have tags removed cannot be re-stocked.\n\n"
            else:
                reply_text += "\n"
            reply_text += (
                f"If you believe there are extenuating circumstances or shipping delays, you can request an exception review via our Operations Team."
            )
            store.record_fraud_prevented(item_price)

        # Scenario 2: Policy Violation - Hygiene / Unsealed beauty item (offer goodwill concession)
        elif is_hygiene_sensitive and is_opened_claimed:
            t0 = time.time()
            thought_5 = f"Item '{item_name}' is hygiene-restricted under {policy_obs['policy_code']}. Opened items cannot be restocked. Offering 25% courtesy store credit voucher to preserve customer satisfaction."
            concession_amount = round(item_price * 0.25, 2)
            concession_obs = self.tools.issue_store_credit_concession(
                order_id=target_order_id,
                amount=concession_amount,
                customer_id=customer_id
            )
            steps.append(ReActStep(
                step_number=step_counter,
                thought=thought_5,
                action="issue_store_credit_concession",
                action_input={"order_id": target_order_id, "amount": concession_amount},
                observation=concession_obs,
                timestamp=datetime.now().strftime("%H:%M:%S.%f")[:-3],
                duration_ms=int((time.time() - t0) * 1000)
            ))
            final_resolution = FinalResolutionType.STORE_CREDIT_OFFER
            reply_text = (
                f"Under merchant safety policy **{policy_obs['policy_code']}**, personal care and beauty items that have been opened or unsealed cannot be returned for physical restocking due to sanitary regulations.\n\n"
                f"However, because we value your relationship with us, I have authorized an immediate courtesy store credit voucher:\n"
                f"- **Voucher Code:** `{concession_obs['voucher_code']}`\n"
                f"- **Value:** **${concession_amount:.2f}** (25% goodwill credit)\n"
                f"- **Validity:** 90 days on any future order.\n\n"
                f"You do not need to return the item. We appreciate your understanding of our hygiene safeguards!"
            )
            store.record_fraud_prevented(item_price - concession_amount)

        # Scenario 3: Escalation Trigger (High Value > $500, High Fraud Score >= 60, Transit Damage claim, or Empty Box Claim)
        elif escalation_recommended or item_price >= policy_obs.get("high_value_threshold", 500.0) or fraud_score >= 60 or "empty" in user_message.lower():
            t0 = time.time()
            dossier_text = (
                f"Customer requested return for {item_name} (${item_price:.2f}). "
                f"Risk score: {fraud_score}/100. Flags: {', '.join(flags) if flags else 'High value item threshold'}. "
                f"Customer statement: '{user_message}'"
            )
            thought_5 = f"Case requires human oversight due to high value (${item_price:.2f} >= ${policy_obs.get('high_value_threshold', 500.0)}) or elevated fraud risk ({fraud_score}/100). Routing to Tier-2 Review Dashboard."
            esc_obs = self.tools.route_to_escalation_queue(
                order_id=target_order_id,
                risk_score=fraud_score,
                flags=flags,
                dossier=dossier_text
            )
            steps.append(ReActStep(
                step_number=step_counter,
                thought=thought_5,
                action="route_to_escalation_queue",
                action_input={"order_id": target_order_id, "risk_score": fraud_score},
                observation=esc_obs,
                timestamp=datetime.now().strftime("%H:%M:%S.%f")[:-3],
                duration_ms=int((time.time() - t0) * 1000)
            ))
            final_resolution = FinalResolutionType.HUMAN_ESCALATION

            escalation_ticket = store.escalations.get(esc_obs["ticket_id"])
            if escalation_ticket:
                escalation_ticket.photo_evidence_url = image_data
                escalation_ticket.photo_verification = photo_verification_res

            reply_text = (
                f"Thank you for contacting us regarding **{item_name}** (Order `#{target_order_id}`).\n\n"
                f"Because this involves a high-value purchase (${item_price:.2f}) or requires transit damage inspection, "
                f"I have opened priority escalation ticket **#{esc_obs['ticket_id']}** with our Tier-2 Operations Desk.\n\n"
            )
            if photo_verification_res and photo_verification_res.is_verified:
                reply_text += (
                    f"📸 **Visual Defect Verified:** Multimodal vision analysis detected `{photo_verification_res.defect_detected}` "
                    f"with {int(photo_verification_res.confidence * 100)}% confidence. Your photo proof has been attached to the operator review dossier for expedited clearance.\n\n"
                )
            reply_text += (
                f"**What happens next?**\n"
                f"- A senior specialist will review your case notes within 4 business hours.\n"
                f"- You can track ticket `#{esc_obs['ticket_id']}` directly on the Escalations tab.\n"
                f"- If photographic proof is requested, you will receive an instant upload prompt."
            )

        # Scenario D: Legitimate Low-Risk Return (Automated Refund & RMA Generation)
        else:
            # 1. Generate Prepaid RMA Shipping Label
            t0 = time.time()
            thought_5a = f"Return meets all merchant guidelines under {policy_obs['policy_code']} with clean risk score ({fraud_score}/100). Generating prepaid RMA shipping label."
            rma_obs = self.tools.generate_rma_label(order_id=target_order_id, carrier="FedEx Ground")
            steps.append(ReActStep(
                step_number=step_counter,
                thought=thought_5a,
                action="generate_rma_label",
                action_input={"order_id": target_order_id, "carrier": "FedEx Ground"},
                observation=rma_obs,
                timestamp=datetime.now().strftime("%H:%M:%S.%f")[:-3],
                duration_ms=int((time.time() - t0) * 1000)
            ))
            step_counter += 1

            # 2. Trigger Automated Refund
            t0 = time.time()
            thought_5b = f"Authorizing automated refund of ${item_price:.2f} to original payment method ({order_obs['payment_method']})."
            refund_obs = self.tools.trigger_automated_refund(
                order_id=target_order_id,
                amount=item_price,
                reason="Customer verified return",
                payment_method=order_obs["payment_method"]
            )
            steps.append(ReActStep(
                step_number=step_counter,
                thought=thought_5b,
                action="trigger_automated_refund",
                action_input={"order_id": target_order_id, "amount": item_price},
                observation=refund_obs,
                timestamp=datetime.now().strftime("%H:%M:%S.%f")[:-3],
                duration_ms=int((time.time() - t0) * 1000)
            ))
            final_resolution = FinalResolutionType.AUTO_REFUND

            rma_label = RMALabel(
                rma_code=rma_obs["rma_code"],
                order_id=target_order_id,
                carrier=rma_obs["carrier"],
                tracking_number=rma_obs["tracking_number"],
                dropoff_location=rma_obs["dropoff_location"],
                expires_at=rma_obs["expires_at"],
                barcode_value=rma_obs["barcode_value"],
                instructions=rma_obs["instructions"]
            )

            refund_receipt = RefundReceipt(
                refund_id=refund_obs["refund_id"],
                order_id=target_order_id,
                amount=refund_obs["amount"],
                restocking_fee_deducted=refund_obs["restocking_fee"],
                net_refunded=refund_obs["net_refunded"],
                payment_method=refund_obs["payment_method"],
                transaction_ref=refund_obs["transaction_ref"],
                issued_at=refund_obs["issued_at"]
            )

            reply_text = (
                f"Great news! Your return for **{item_name}** has been automatically verified and approved under policy **{policy_obs['policy_code']}**.\n\n"
                f"### What We've Done For You:\n"
                f"1. **Prepaid Shipping Label Issued:** Return code **`{rma_obs['rma_code']}`** ({rma_obs['carrier']}). Printable label attached below.\n"
                f"2. **Refund Initiated:** **${refund_obs['net_refunded']:.2f}** sent to {refund_obs['payment_method']}.\n"
                f"3. **Next Steps:** Simply drop off the package at any {rma_obs['dropoff_location']} within 14 days."
            )

        # AI Governance and Compliance validation
        guardrails_passed, violations = GovernanceEngine.validate_guardrails(
            order_data=order_obs,
            proposed_action=final_resolution,
            fraud_risk_score=fraud_score,
            refund_amount=item_price
        )

        citations = GovernanceEngine.extract_policy_citations(steps)
        total_duration = int((time.time() - start_time) * 1000)

        trace = ReActTrace(
            session_id=session_id,
            order_id=target_order_id,
            customer_id=customer_id,
            steps=steps,
            final_resolution=final_resolution,
            confidence_score=0.98 if guardrails_passed else 0.50,
            fraud_risk_score=fraud_score,
            policy_citations=citations,
            total_duration_ms=total_duration,
            guardrails_passed=guardrails_passed,
            photo_verification=photo_verification_res
        )

        # Persist trace in audit logs
        GovernanceEngine.record_decision_trace(trace)

        return ChatResponse(
            reply=reply_text,
            session_id=session_id,
            trace=trace,
            rma_label=rma_label,
            refund_receipt=refund_receipt,
            escalation_ticket=escalation_ticket
        )

agent_instance = ReActAgent()
