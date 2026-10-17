from fastapi import APIRouter, HTTPException
from typing import List
from backend.app.models.schemas import EscalationTicket, HITLActionRequest
from backend.app.db.store import store

router = APIRouter(prefix="/api/escalations", tags=["HITL Escalation Center"])

@router.get("", response_model=List[EscalationTicket])
def list_escalations():
    """Returns all pending and resolved escalation tickets."""
    return store.list_escalations()

@router.post("/{ticket_id}/action", response_model=EscalationTicket)
def take_action_on_ticket(ticket_id: str, action_req: HITLActionRequest):
    """
    Operator action on escalated case:
    APPROVE_REFUND, REJECT_REQUEST, REQUEST_PHOTO, OFFER_STORE_CREDIT
    """
    valid_actions = {
        "APPROVE_REFUND": "APPROVED",
        "REJECT_REQUEST": "REJECTED",
        "REQUEST_PHOTO": "PHOTO_REQUESTED",
        "OFFER_STORE_CREDIT": "CREDIT_OFFERED"
    }

    if action_req.action not in valid_actions:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid action '{action_req.action}'. Must be one of {list(valid_actions.keys())}"
        )

    new_status = valid_actions[action_req.action]
    resolved = store.resolve_escalation(
        ticket_id=ticket_id,
        status=new_status,
        reviewer=action_req.reviewer_name,
        notes=action_req.reviewer_notes
    )

    if not resolved:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")

    return resolved
