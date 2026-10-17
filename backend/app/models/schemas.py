from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime

class OrderStatus(str, Enum):
    DELIVERED = "DELIVERED"
    SHIPPED = "SHIPPED"
    RETURN_REQUESTED = "RETURN_REQUESTED"
    RETURNED = "RETURNED"
    REFUNDED = "REFUNDED"
    ESCALATED = "ESCALATED"
    EXCHANGED = "EXCHANGED"

class ItemCondition(str, Enum):
    UNOPENED = "UNOPENED"
    OPENED_UNUSED = "OPENED_UNUSED"
    USED_LIKE_NEW = "USED_LIKE_NEW"
    DAMAGED_TRANSIT = "DAMAGED_TRANSIT"
    DEFECTIVE = "DEFECTIVE"
    WORN = "WORN"
    MISSING_PARTS = "MISSING_PARTS"

class ReturnCategory(str, Enum):
    ELECTRONICS = "Electronics"
    FASHION = "Fashion & Apparel"
    BEAUTY = "Beauty & Personal Care"
    HOME = "Home & Appliances"
    JEWELRY = "Luxury & Jewelry"
    FOOTWEAR = "Footwear"

class OrderItem(BaseModel):
    sku: str
    name: str
    category: str
    price: float
    serial_number: Optional[str] = None
    is_final_sale: bool = False
    is_hygiene_sensitive: bool = False

class Order(BaseModel):
    id: str
    customer_id: str
    customer_name: str
    customer_email: str
    order_date: str
    delivery_date: str
    items: List[OrderItem]
    total_amount: float
    status: OrderStatus
    payment_method: str
    shipping_carrier: str
    tracking_number: str

class CustomerProfile(BaseModel):
    id: str
    name: str
    email: str
    trust_score: int = Field(ge=0, le=100) # 0-100 score
    return_rate_pct: float
    total_orders_count: int
    prior_returns_count: int
    empty_box_claims: int = 0
    is_flagged_serial_returner: bool = False
    is_vip: bool = False

class ReturnPolicy(BaseModel):
    category: str
    return_window_days: int
    allows_opened: bool
    requires_photos: bool
    restocking_fee_pct: float
    high_value_escalation_threshold: float
    policy_code: str
    description: str

class ReActStep(BaseModel):
    step_number: int
    thought: str
    action: Optional[str] = None
    action_input: Optional[Dict[str, Any]] = None
    observation: Optional[Any] = None
    timestamp: str
    duration_ms: Optional[int] = None

class FinalResolutionType(str, Enum):
    AUTO_REFUND = "AUTO_REFUND"
    RMA_LABEL_ISSUED = "RMA_LABEL_ISSUED"
    EXCHANGE_PROCESSED = "EXCHANGE_PROCESSED"
    STORE_CREDIT_OFFER = "STORE_CREDIT_OFFER"
    HUMAN_ESCALATION = "HUMAN_ESCALATION"
    POLICY_REJECTION = "POLICY_REJECTION"

class RMALabel(BaseModel):
    rma_code: str
    order_id: str
    carrier: str
    tracking_number: str
    dropoff_location: str
    expires_at: str
    barcode_value: str
    instructions: List[str]

class RefundReceipt(BaseModel):
    refund_id: str
    order_id: str
    amount: float
    restocking_fee_deducted: float
    net_refunded: float
    payment_method: str
    transaction_ref: str
    issued_at: str

class PhotoVerificationResult(BaseModel):
    is_verified: bool
    defect_detected: str
    confidence: float
    visual_indicators: List[str]
    image_summary: str

class EscalationTicket(BaseModel):
    ticket_id: str
    order_id: str
    customer_id: str
    customer_name: str
    category: str
    item_name: str
    amount: float
    risk_score: int
    flags: List[str]
    agent_dossier: str
    status: str = "PENDING" # PENDING, APPROVED, REJECTED, REQUIRES_PHOTO
    created_at: str
    resolved_by: Optional[str] = None
    resolution_notes: Optional[str] = None
    photo_evidence_url: Optional[str] = None
    photo_verification: Optional[PhotoVerificationResult] = None

class ReActTrace(BaseModel):
    session_id: str
    order_id: Optional[str] = None
    customer_id: Optional[str] = None
    steps: List[ReActStep]
    final_resolution: Optional[FinalResolutionType] = None
    confidence_score: float = 0.0
    fraud_risk_score: int = 0
    policy_citations: List[str] = []
    total_duration_ms: int = 0
    guardrails_passed: bool = True
    photo_verification: Optional[PhotoVerificationResult] = None

class ChatRequest(BaseModel):
    message: str
    order_id: Optional[str] = None
    customer_id: Optional[str] = None
    session_id: Optional[str] = None
    image_data: Optional[str] = None # Base64 or image URL evidence


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    trace: ReActTrace
    rma_label: Optional[RMALabel] = None
    refund_receipt: Optional[RefundReceipt] = None
    escalation_ticket: Optional[EscalationTicket] = None

class PolicyUpdateRequest(BaseModel):
    return_window_days: int
    allows_opened: bool
    requires_photos: bool
    restocking_fee_pct: float
    high_value_escalation_threshold: float
    description: str

class HITLActionRequest(BaseModel):
    action: str # APPROVE_REFUND, REJECT_REQUEST, REQUEST_PHOTO, OFFER_STORE_CREDIT
    reviewer_notes: str
    reviewer_name: str = "Tier-2 Supervisor"
