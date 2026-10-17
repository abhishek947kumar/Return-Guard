from datetime import datetime, timedelta
from typing import Dict, List, Optional
import copy
from backend.app.models.schemas import (
    Order, OrderItem, OrderStatus, CustomerProfile, ReturnPolicy, 
    EscalationTicket, RMALabel, RefundReceipt, ReActTrace, PhotoVerificationResult
)

class DataStore:
    def __init__(self):
        self.reset_data()

    def reset_data(self):
        today = datetime.now()
        def date_str(days_ago: int) -> str:
            return (today - timedelta(days=days_ago)).strftime("%Y-%m-%d")

        # 1. Standard Return Policies across E-Commerce Verticals
        self.policies: Dict[str, ReturnPolicy] = {
            "Electronics": ReturnPolicy(
                category="Electronics",
                return_window_days=14,
                allows_opened=True,
                requires_photos=False,
                restocking_fee_pct=0.0,
                high_value_escalation_threshold=500.0,
                policy_code="POL-ELEC-2026",
                description="14-day standard window. Must include original accessories. High value (> $500) requires agent inspection."
            ),
            "Fashion & Apparel": ReturnPolicy(
                category="Fashion & Apparel",
                return_window_days=30,
                allows_opened=True,
                requires_photos=False,
                restocking_fee_pct=0.0,
                high_value_escalation_threshold=400.0,
                policy_code="POL-FASH-2026",
                description="30-day window. Items must be unworn, unwashed with original security tags attached. Worn/scented items ineligible."
            ),
            "Beauty & Personal Care": ReturnPolicy(
                category="Beauty & Personal Care",
                return_window_days=30,
                allows_opened=False,
                requires_photos=True,
                restocking_fee_pct=0.0,
                high_value_escalation_threshold=200.0,
                policy_code="POL-BEAUTY-2026",
                description="Strict hygiene safety policy: Sealed/unopened only. Once protective seal is breached, non-returnable for customer safety."
            ),
            "Home & Appliances": ReturnPolicy(
                category="Home & Appliances",
                return_window_days=30,
                allows_opened=True,
                requires_photos=True,
                restocking_fee_pct=10.0,
                high_value_escalation_threshold=600.0,
                policy_code="POL-HOME-2026",
                description="30-day window. Heavy items subject to 10% restocking fee unless transit damage is verified with photos."
            ),
            "Luxury & Jewelry": ReturnPolicy(
                category="Luxury & Jewelry",
                return_window_days=14,
                allows_opened=False,
                requires_photos=True,
                restocking_fee_pct=5.0,
                high_value_escalation_threshold=300.0,
                policy_code="POL-LUX-2026",
                description="14-day window. Requires intact authenticity certificate and tamper-proof security seals intact."
            ),
            "Footwear": ReturnPolicy(
                category="Footwear",
                return_window_days=30,
                allows_opened=True,
                requires_photos=False,
                restocking_fee_pct=0.0,
                high_value_escalation_threshold=350.0,
                policy_code="POL-FOOT-2026",
                description="30-day window. Soles must be free of outdoor wear and in original shoe box. Size exchanges free."
            ),
        }

        # 2. Customers with Trust Profiles & Behavioral Indicators
        self.customers: Dict[str, CustomerProfile] = {
            "CUST-101": CustomerProfile(
                id="CUST-101",
                name="Sarah Jenkins",
                email="sarah.j@example.com",
                trust_score=95,
                return_rate_pct=8.5,
                total_orders_count=24,
                prior_returns_count=2,
                empty_box_claims=0,
                is_flagged_serial_returner=False,
                is_vip=True
            ),
            "CUST-202": CustomerProfile(
                id="CUST-202",
                name="Marcus Thorne",
                email="m.thorne@example.com",
                trust_score=38,
                return_rate_pct=64.2,
                total_orders_count=14,
                prior_returns_count=9,
                empty_box_claims=0,
                is_flagged_serial_returner=True,
                is_vip=False
            ),
            "CUST-303": CustomerProfile(
                id="CUST-303",
                name="Elena Rostova",
                email="elena.r@example.com",
                trust_score=92,
                return_rate_pct=12.0,
                total_orders_count=18,
                prior_returns_count=2,
                empty_box_claims=0,
                is_flagged_serial_returner=False,
                is_vip=True
            ),
            "CUST-404": CustomerProfile(
                id="CUST-404",
                name="Devon Vance",
                email="dvance99@example.com",
                trust_score=22,
                return_rate_pct=75.0,
                total_orders_count=8,
                prior_returns_count=6,
                empty_box_claims=3,
                is_flagged_serial_returner=True,
                is_vip=False
            ),
            "CUST-505": CustomerProfile(
                id="CUST-505",
                name="Liam Campbell",
                email="liam.c@example.com",
                trust_score=88,
                return_rate_pct=14.0,
                total_orders_count=7,
                prior_returns_count=1,
                empty_box_claims=0,
                is_flagged_serial_returner=False,
                is_vip=False
            )
        }

        # 3. Diverse Realistic E-Commerce Orders
        self.orders: Dict[str, Order] = {
            # Case 1: Low-risk, fast-clearing return (Apple AirPods Pro 2)
            "ORD-7821": Order(
                id="ORD-7821",
                customer_id="CUST-101",
                customer_name="Sarah Jenkins",
                customer_email="sarah.j@example.com",
                order_date=date_str(7),
                delivery_date=date_str(4),
                items=[
                    OrderItem(
                        sku="APL-APP2-WHT",
                        name="Apple AirPods Pro 2 (USB-C)",
                        category="Electronics",
                        price=249.99,
                        serial_number="H7Y9XZ101A",
                        is_final_sale=False,
                        is_hygiene_sensitive=False
                    )
                ],
                total_amount=249.99,
                status=OrderStatus.DELIVERED,
                payment_method="Visa ending in 4092",
                shipping_carrier="FedEx Express",
                tracking_number="FDX-9820194812"
            ),
            # Case 2: Fraud / Wardrobing risk - Luxury Silk Evening Gown returned 42 days later
            "ORD-9430": Order(
                id="ORD-9430",
                customer_id="CUST-202",
                customer_name="Marcus Thorne",
                customer_email="m.thorne@example.com",
                order_date=date_str(48),
                delivery_date=date_str(42),
                items=[
                    OrderItem(
                        sku="SL-DRS-EMERALD",
                        name="Saint Laurent Silk Evening Gown (Size 6)",
                        category="Fashion & Apparel",
                        price=890.00,
                        serial_number="SL-55102",
                        is_final_sale=False,
                        is_hygiene_sensitive=False
                    )
                ],
                total_amount=890.00,
                status=OrderStatus.DELIVERED,
                payment_method="Mastercard ending in 1184",
                shipping_carrier="UPS Next Day",
                tracking_number="1Z999AA10123456784"
            ),
            # Case 3: High value damaged in transit ($1,599 OLED TV) -> Triggers HITL escalation
            "ORD-5102": Order(
                id="ORD-5102",
                customer_id="CUST-303",
                customer_name="Elena Rostova",
                customer_email="elena.r@example.com",
                order_date=date_str(5),
                delivery_date=date_str(2),
                items=[
                    OrderItem(
                        sku="LG-OLED65-C3",
                        name="LG C3 65-Inch 4K OLED evo Smart TV",
                        category="Electronics",
                        price=1599.99,
                        serial_number="LG-OLED-65-88219",
                        is_final_sale=False,
                        is_hygiene_sensitive=False
                    )
                ],
                total_amount=1599.99,
                status=OrderStatus.DELIVERED,
                payment_method="Apple Pay",
                shipping_carrier="Freight Logistics",
                tracking_number="FRT-88201928"
            ),
            # Case 4: Hygiene / Opened cosmetic item -> Policy non-returnable, offer goodwill credit
            "ORD-3318": Order(
                id="ORD-3318",
                customer_id="CUST-505",
                customer_name="Liam Campbell",
                customer_email="liam.c@example.com",
                order_date=date_str(10),
                delivery_date=date_str(7),
                items=[
                    OrderItem(
                        sku="DE-POLYPEP-CRM",
                        name="Drunk Elephant Protini Polypeptide Cream (50ml)",
                        category="Beauty & Personal Care",
                        price=68.00,
                        serial_number=None,
                        is_final_sale=False,
                        is_hygiene_sensitive=True
                    )
                ],
                total_amount=68.00,
                status=OrderStatus.DELIVERED,
                payment_method="Amex ending in 3004",
                shipping_carrier="USPS Priority",
                tracking_number="9400100000000000000000"
            ),
            # Case 5: Wrong size sent on Nike Shoes -> Free exchange workflow
            "ORD-6241": Order(
                id="ORD-6241",
                customer_id="CUST-101",
                customer_name="Sarah Jenkins",
                customer_email="sarah.j@example.com",
                order_date=date_str(8),
                delivery_date=date_str(5),
                items=[
                    OrderItem(
                        sku="NK-PEG40-M10",
                        name="Nike Air Zoom Pegasus 40 (Black / Size 10)",
                        category="Footwear",
                        price=130.00,
                        serial_number=None,
                        is_final_sale=False,
                        is_hygiene_sensitive=False
                    )
                ],
                total_amount=130.00,
                status=OrderStatus.DELIVERED,
                payment_method="Visa ending in 4092",
                shipping_carrier="UPS Ground",
                tracking_number="1Z88220019283741"
            ),
            # Case 6: High fraud empty-box claim on Gold Jewelry -> Escalation to Fraud Desk
            "ORD-8852": Order(
                id="ORD-8852",
                customer_id="CUST-404",
                customer_name="Devon Vance",
                customer_email="dvance99@example.com",
                order_date=date_str(25),
                delivery_date=date_str(20),
                items=[
                    OrderItem(
                        sku="JWL-GLD-PND-14K",
                        name="14K Yellow Gold Solitaire Diamond Pendant (0.75ct)",
                        category="Luxury & Jewelry",
                        price=620.00,
                        serial_number="CERT-GIA-9921",
                        is_final_sale=False,
                        is_hygiene_sensitive=False
                    )
                ],
                total_amount=620.00,
                status=OrderStatus.DELIVERED,
                payment_method="Debit card ending in 9012",
                shipping_carrier="FedEx Signature Required",
                tracking_number="FDX-SIG-44019283"
            )
        }

        # 4. Human-In-The-Loop Escalation Queue
        self.escalations: Dict[str, EscalationTicket] = {
            "ESC-1001": EscalationTicket(
                ticket_id="ESC-1001",
                order_id="ORD-8852",
                customer_id="CUST-404",
                customer_name="Devon Vance",
                category="Luxury & Jewelry",
                item_name="14K Yellow Gold Solitaire Diamond Pendant (0.75ct)",
                amount=620.00,
                risk_score=94,
                flags=[
                    "Serial Empty-Box Claimer (3 prior claims)",
                    "High Dollar Value > $500",
                    "Tamper seal claimed breached"
                ],
                agent_dossier="Customer claims shipping box arrived intact but jeweler box inside was empty. Note: Carrier delivery scan weighed package at 0.42kg upon receipt. High discrepancy.",
                status="PENDING",
                created_at=date_str(1) + " 14:22:00",
                photo_evidence_url="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&auto=format&fit=crop&q=80",
                photo_verification=PhotoVerificationResult(
                    is_verified=False,
                    defect_detected="UNSUBSTANTIATED_EMPTY_BOX_CLAIM",
                    confidence=0.88,
                    visual_indicators=[
                        "Uploaded photo depicts pristine velvet jeweler box with zero transit puncture",
                        "Security tamper tape removed cleanly rather than torn in shipping",
                        "Carrier weigh station logged 0.42kg package weight at delivery"
                    ],
                    image_summary="Photo evidence shows pristine box interior. Discrepancy with delivery scan weight."
                )
            )
        }

        # 5. Refunds History
        self.refunds: List[RefundReceipt] = [
            RefundReceipt(
                refund_id="REF-9021",
                order_id="ORD-1094",
                amount=480.00,
                restocking_fee_deducted=0.0,
                net_refunded=480.00,
                payment_method="Mastercard ending in 5521",
                transaction_ref="tx_mock_98127391823",
                issued_at=date_str(2) + " 10:15:32"
            )
        ]

        # 6. Audit Traces & Decision Logs
        self.audit_traces: List[ReActTrace] = []

        # 7. Aggregate KPI Metrics
        self.metrics = {
            "total_requests_processed": 142,
            "automated_resolutions_count": 116,
            "escalations_count": 19,
            "policy_rejections_count": 7,
            "fraud_dollars_prevented": 14850.00,
            "total_refunded_amount": 12420.50,
            "average_latency_ms": 840,
            "automation_rate_pct": 81.7
        }

    # Order Methods
    def get_order(self, order_id: str) -> Optional[Order]:
        return self.orders.get(order_id)

    def list_orders(self) -> List[Order]:
        return list(self.orders.values())

    def update_order_status(self, order_id: str, new_status: OrderStatus) -> bool:
        if order_id in self.orders:
            self.orders[order_id].status = new_status
            return True
        return False

    # Customer Methods
    def get_customer(self, customer_id: str) -> Optional[CustomerProfile]:
        return self.customers.get(customer_id)

    # Policy Methods
    def get_policy(self, category: str) -> Optional[ReturnPolicy]:
        return self.policies.get(category)

    def list_policies(self) -> List[ReturnPolicy]:
        return list(self.policies.values())

    def update_policy(self, category: str, updated_policy: ReturnPolicy) -> bool:
        if category in self.policies:
            self.policies[category] = updated_policy
            return True
        return False

    # Escalation Methods
    def list_escalations(self) -> List[EscalationTicket]:
        return list(self.escalations.values())

    def add_escalation(self, ticket: EscalationTicket):
        self.escalations[ticket.ticket_id] = ticket
        self.metrics["escalations_count"] += 1
        self._update_automation_rate()

    def resolve_escalation(self, ticket_id: str, status: str, reviewer: str, notes: str) -> Optional[EscalationTicket]:
        if ticket_id in self.escalations:
            ticket = self.escalations[ticket_id]
            ticket.status = status
            ticket.resolved_by = reviewer
            ticket.resolution_notes = notes
            # Update order status accordingly
            if status == "APPROVED":
                self.update_order_status(ticket.order_id, OrderStatus.REFUNDED)
            elif status == "REJECTED":
                self.update_order_status(ticket.order_id, OrderStatus.DELIVERED)
            return ticket
        return None

    # Refund Methods
    def record_refund(self, receipt: RefundReceipt):
        self.refunds.append(receipt)
        self.metrics["total_refunded_amount"] += receipt.net_refunded
        self.metrics["automated_resolutions_count"] += 1
        self._update_automation_rate()

    def record_fraud_prevented(self, amount: float):
        self.metrics["fraud_dollars_prevented"] += amount
        self.metrics["policy_rejections_count"] += 1
        self._update_automation_rate()

    # Trace Logging
    def record_trace(self, trace: ReActTrace):
        self.audit_traces.insert(0, trace) # newest first
        self.metrics["total_requests_processed"] += 1
        if trace.total_duration_ms > 0:
            current_avg = self.metrics["average_latency_ms"]
            n = self.metrics["total_requests_processed"]
            self.metrics["average_latency_ms"] = int((current_avg * (n - 1) + trace.total_duration_ms) / n)
        self._update_automation_rate()

    def list_traces(self) -> List[ReActTrace]:
        return self.audit_traces

    def _update_automation_rate(self):
        total = self.metrics["total_requests_processed"]
        auto = self.metrics["automated_resolutions_count"]
        if total > 0:
            self.metrics["automation_rate_pct"] = round((auto / total) * 100, 1)

# Global Singleton Instance
store = DataStore()
