from fastapi import APIRouter
from typing import List, Dict, Any
from backend.app.models.schemas import ReActTrace
from backend.app.db.store import store

router = APIRouter(prefix="/api/analytics", tags=["Analytics & Governance"])

@router.get("", response_model=Dict[str, Any])
def get_analytics_metrics():
    """Fetches high-level operational metrics, fraud savings, and resolution rate."""
    return store.metrics

@router.get("/audit-logs", response_model=List[ReActTrace])
def get_audit_traces():
    """Fetches decision history with ReAct steps and policy citations for AI governance."""
    return store.list_traces()

@router.post("/reset")
def reset_system():
    """Resets database state, orders, policies, and test cases to initial baseline."""
    store.reset_data()
    return {"status": "SUCCESS", "message": "ReturnGuard data store reset to initial state."}
