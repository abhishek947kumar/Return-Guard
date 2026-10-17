from datetime import datetime
import uuid
import random
from typing import Dict, Any, List, Optional
from backend.app.db.store import store
from backend.app.models.schemas import (
    OrderStatus, RMALabel, RefundReceipt, EscalationTicket, ReturnPolicy
)

class AgentTools:
    @staticmethod
    def lookup_order(order_id: str) -> Dict[str, Any]:
        """Fetches complete order details, item metadata, delivery timestamps, and order status."""
        order = store.get_order(order_id)
        if not order:
            return {"error": f"Order with ID '{order_id}' was not found in the order management system."}
        
        # Calculate days elapsed since delivery
        try:
            deliv_dt = datetime.strptime(order.delivery_date, "%Y-%m-%d")
            days_elapsed = (datetime.now() - deliv_dt).days
        except Exception:
            days_elapsed = 3

        item = order.items[0] if order.items else None

        return {
            "order_id": order.id,
            "customer_id": order.customer_id,
            "customer_name": order.customer_name,
            "customer_email": order.customer_email,
            "order_date": order.order_date,
            "delivery_date": order.delivery_date,
            "days_since_delivery": days_elapsed,
            "status": order.status.value,
            "item_name": item.name if item else "Unknown",
            "item_category": item.category if item else "General",
            "item_price": item.price if item else order.total_amount,
            "is_final_sale": item.is_final_sale if item else False,
            "is_hygiene_sensitive": item.is_hygiene_sensitive if item else False,
            "payment_method": order.payment_method,
            "shipping_carrier": order.shipping_carrier,
            "tracking_number": order.tracking_number
        }

    @staticmethod
    def lookup_customer(customer_id: str) -> Dict[str, Any]:
        """Fetches customer trust score, return frequency, and prior fraud indicators."""
        cust = store.get_customer(customer_id)
        if not cust:
            return {"error": f"Customer '{customer_id}' not found."}
        
        return {
            "customer_id": cust.id,
            "name": cust.name,
            "trust_score": cust.trust_score,
            "return_rate_pct": cust.return_rate_pct,
            "total_orders": cust.total_orders_count,
            "prior_returns": cust.prior_returns_count,
            "empty_box_claims": cust.empty_box_claims,
            "is_serial_returner": cust.is_flagged_serial_returner,
            "is_vip": cust.is_vip
        }

    @staticmethod
    def evaluate_return_policy(category: str, days_since_delivery: int, is_opened: bool = False, stated_condition: str = "GOOD") -> Dict[str, Any]:
        """Evaluates whether the requested return complies with merchant category policies."""
        policy = store.get_policy(category)
        if not policy:
            # Fallback to general policy
            policy = ReturnPolicy(
                category=category,
                return_window_days=30,
                allows_opened=True,
                requires_photos=False,
                restocking_fee_pct=0.0,
                high_value_escalation_threshold=500.0,
                policy_code="POL-GEN-2026",
                description="General 30-day return policy."
            )

        is_within_window = days_since_delivery <= policy.return_window_days
        days_overdue = max(0, days_since_delivery - policy.return_window_days)

        opened_allowed = True
        opened_violation_reason = None
        if not policy.allows_opened and is_opened:
            opened_allowed = False
            opened_violation_reason = f"Category '{category}' prohibits returns on unsealed/opened items under hygiene & safety policy {policy.policy_code}."

        is_eligible = is_within_window and opened_allowed

        return {
            "policy_code": policy.policy_code,
            "category": category,
            "allowed_window_days": policy.return_window_days,
            "days_since_delivery": days_since_delivery,
            "is_within_window": is_within_window,
            "days_overdue": days_overdue,
            "allows_opened": policy.allows_opened,
            "opened_allowed": opened_allowed,
            "opened_violation_reason": opened_violation_reason,
            "requires_photos": policy.requires_photos,
            "restocking_fee_pct": policy.restocking_fee_pct,
            "high_value_threshold": policy.high_value_escalation_threshold,
            "is_policy_compliant": is_eligible,
            "description": policy.description
        }

    @staticmethod
    def verify_damage_photo(image_data: str, item_name: str, category: str, reason: str) -> Dict[str, Any]:
        """Runs multimodal computer vision analysis on uploaded photo evidence."""
        from backend.app.agent.vision_inspector import VisionInspector
        res = VisionInspector.inspect_evidence(
            image_data=image_data,
            item_name=item_name,
            category=category,
            claimed_reason=reason
        )
        return {
            "is_verified": res.is_verified,
            "defect_detected": res.defect_detected,
            "confidence": res.confidence,
            "visual_indicators": res.visual_indicators,
            "image_summary": res.image_summary
        }

    @staticmethod
    def retrieve_policy_clauses(query: str, category: str) -> Dict[str, Any]:
        """Performs semantic policy retrieval across merchant legal clauses and exceptions."""
        policy = store.get_policy(category)
        clauses = [
            f"[{policy.policy_code}-SEC1] Standard Return Window: Returns must be requested within {policy.return_window_days} calendar days of confirmed carrier delivery.",
            f"[{policy.policy_code}-SEC2] Condition Mandate: Opened packaging is {'PERMITTED' if policy.allows_opened else 'PROHIBITED'} for {category}.",
            f"[{policy.policy_code}-SEC3] Transit & Defect Exception: Items damaged during transit require photo evidence and are exempt from restocking fees.",
            f"[{policy.policy_code}-SEC4] Financial Authorization: Automated payouts capped at ${policy.high_value_escalation_threshold:.2f}. Orders exceeding this limit require supervisor review."
        ]
        return {
            "category": category,
            "policy_code": policy.policy_code,
            "matching_clauses": clauses,
            "relevance_score": 0.96
        }

    @staticmethod
    def calculate_fraud_risk(
        order_id: str, 
        customer_id: str, 
        reason: str, 
        days_elapsed: int, 
        item_price: float, 
        category: str, 
        condition: str = "GOOD",
        has_verified_photo: bool = False
    ) -> Dict[str, Any]:
        """Calculates multi-dimensional fraud and abuse risk score (0-100) and extracts risk signals."""
        cust = store.get_customer(customer_id)
        flags = []
        risk_score = 10 # Base clean score

        # 1. Customer Trust Score impact
        if cust:
            if cust.trust_score < 40:
                risk_score += 35
                flags.append(f"Low Customer Trust Score ({cust.trust_score}/100)")
            elif cust.trust_score < 70:
                risk_score += 15

            if cust.is_flagged_serial_returner:
                risk_score += 30
                flags.append(f"Serial Returner Profile (Return rate {cust.return_rate_pct}%)")

            if cust.empty_box_claims > 0:
                risk_score += 40
                flags.append(f"History of Empty-Box/Missing-Item claims ({cust.empty_box_claims} prior)")

        # 2. Wardrobing heuristic (Fashion items worn / requested late)
        reason_lower = reason.lower()
        if category == "Fashion & Apparel":
            if "worn" in reason_lower or "party" in reason_lower or "event" in reason_lower or "perfume" in reason_lower or condition.upper() == "WORN":
                risk_score += 45
                flags.append("Wardrobing Risk: Evening wear worn/used for occasion")
            if days_elapsed > 25:
                risk_score += 20
                flags.append(f"Late fashion return attempt ({days_elapsed} days elapsed)")

        # 3. Empty Box / Never Received claims on Delivered items
        if "empty" in reason_lower or "missing" in reason_lower:
            risk_score += 40
            flags.append("High Severity Claim: Empty box / contents missing claim")

        # 4. High Dollar Value Threshold
        if item_price >= 500:
            risk_score += 25
            flags.append(f"High-Value Transaction (${item_price:.2f} >= $500 threshold)")

        # 5. Overdue Return Window
        if days_elapsed > 30:
            risk_score += 30
            flags.append(f"Extremely delayed return attempt ({days_elapsed} days post-delivery)")

        # 6. Photographic Evidence Mitigation Bonus (Crucial AI enhancement)
        if has_verified_photo:
            risk_score = max(5, risk_score - 25)
            flags.append("Photo Evidence Authenticated (Risk Discount Applied)")

        # Bound score between 5 and 99
        risk_score = min(99, max(5, risk_score))

        escalation_recommended = risk_score >= 65 or item_price >= 500 or "empty" in reason_lower

        return {
            "fraud_risk_score": risk_score,
            "risk_level": "CRITICAL" if risk_score >= 80 else "HIGH" if risk_score >= 60 else "MEDIUM" if risk_score >= 35 else "LOW",
            "flags": flags,
            "escalation_recommended": escalation_recommended,
            "assessment_summary": (
                f"Risk score {risk_score}/100. " + ("; ".join(flags) if flags else "No anomalous risk indicators detected.")
            )
        }

    @staticmethod
    def trigger_automated_refund(order_id: str, amount: float, reason: str, payment_method: str = "Original Payment Method") -> Dict[str, Any]:
        """Triggers the automated payment refund through the payment gateway mock."""
        order = store.get_order(order_id)
        if not order:
            return {"error": f"Cannot refund non-existent order {order_id}"}

        refund_id = f"REF-{random.randint(1000, 9999)}"
        tx_ref = f"tx_acct_{uuid.uuid4().hex[:12]}"
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Check category for restocking fee
        item = order.items[0] if order.items else None
        restocking_fee = 0.0
        if item:
            policy = store.get_policy(item.category)
            if policy and policy.restocking_fee_pct > 0:
                restocking_fee = round(amount * (policy.restocking_fee_pct / 100.0), 2)

        net_refund = round(amount - restocking_fee, 2)

        receipt = RefundReceipt(
            refund_id=refund_id,
            order_id=order_id,
            amount=amount,
            restocking_fee_deducted=restocking_fee,
            net_refunded=net_refund,
            payment_method=payment_method or order.payment_method,
            transaction_ref=tx_ref,
            issued_at=now_str
        )

        store.record_refund(receipt)
        store.update_order_status(order_id, OrderStatus.REFUNDED)

        return {
            "success": True,
            "refund_id": receipt.refund_id,
            "amount": receipt.amount,
            "restocking_fee": receipt.restocking_fee_deducted,
            "net_refunded": receipt.net_refunded,
            "payment_method": receipt.payment_method,
            "transaction_ref": receipt.transaction_ref,
            "issued_at": receipt.issued_at,
            "message": f"Refund of ${net_refund:.2f} successfully executed to {receipt.payment_method}."
        }

    @staticmethod
    def generate_rma_label(order_id: str, carrier: str = "FedEx Ground") -> Dict[str, Any]:
        """Generates a return merchandise authorization (RMA) with tracking code and shipping instructions."""
        rma_code = f"RMA-{random.randint(100000, 999999)}"
        tracking = f"{carrier[:3].upper()}-{random.randint(10000000, 99999999)}"
        expiry = (datetime.now() + datetime.resolution).strftime("%Y-%m-%d") # 14 days standard

        label = RMALabel(
            rma_code=rma_code,
            order_id=order_id,
            carrier=carrier,
            tracking_number=tracking,
            dropoff_location="Any authorized FedEx Drop-off / Walgreens counter",
            expires_at=expiry,
            barcode_value=f"*{rma_code}*{tracking}*",
            instructions=[
                "Securely pack the item in original manufacturer packaging with all accessories.",
                "Affix the prepaid shipping label to the outside of the carton.",
                "Drop off at any carrier collection hub within 14 business days.",
                "Instant refund confirmation is sent the moment the carrier scans the package into transit."
            ]
        )

        store.update_order_status(order_id, OrderStatus.RETURN_REQUESTED)

        return {
            "rma_code": label.rma_code,
            "order_id": label.order_id,
            "carrier": label.carrier,
            "tracking_number": label.tracking_number,
            "dropoff_location": label.dropoff_location,
            "expires_at": label.expires_at,
            "barcode_value": label.barcode_value,
            "instructions": label.instructions
        }

    @staticmethod
    def route_to_escalation_queue(order_id: str, risk_score: int, flags: List[str], dossier: str) -> Dict[str, Any]:
        """Routes complex, high-risk, or high-value cases to the Tier-2 Human Review Dashboard."""
        order = store.get_order(order_id)
        if not order:
            return {"error": f"Cannot escalate unverified order {order_id}"}

        item = order.items[0] if order.items else None
        ticket_id = f"ESC-{random.randint(1000, 9999)}"
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        ticket = EscalationTicket(
            ticket_id=ticket_id,
            order_id=order_id,
            customer_id=order.customer_id,
            customer_name=order.customer_name,
            category=item.category if item else "General",
            item_name=item.name if item else "Item",
            amount=order.total_amount,
            risk_score=risk_score,
            flags=flags,
            agent_dossier=dossier,
            status="PENDING",
            created_at=now_str
        )

        store.add_escalation(ticket)
        store.update_order_status(order_id, OrderStatus.ESCALATED)

        return {
            "ticket_id": ticket.ticket_id,
            "status": "ESCALATED_TO_HUMAN",
            "risk_score": ticket.risk_score,
            "flags": ticket.flags,
            "assigned_queue": "Tier-2 Fraud & Operations Review Team",
            "sla": "Under 4 business hours",
            "message": "Case routed to Human Review Desk with complete AI audit dossier."
        }

    @staticmethod
    def issue_store_credit_concession(order_id: str, amount: float, customer_id: str) -> Dict[str, Any]:
        """Proposes a store credit courtesy concession when an item is strictly non-returnable (e.g. opened beauty item)."""
        coupon_code = f"CREDIT-{uuid.uuid4().hex[:8].upper()}"
        return {
            "concession_offered": True,
            "credit_amount": round(amount, 2),
            "voucher_code": coupon_code,
            "validity_days": 90,
            "message": f"A goodwill store credit voucher of ${amount:.2f} has been created for customer satisfaction."
        }
