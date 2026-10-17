from fastapi import APIRouter, HTTPException
from typing import List
from backend.app.models.schemas import ReturnPolicy, PolicyUpdateRequest
from backend.app.db.store import store

router = APIRouter(prefix="/api/policies", tags=["Return Policies"])

@router.get("", response_model=List[ReturnPolicy])
def list_policies():
    """Lists current return policies across categories."""
    return store.list_policies()

@router.get("/{category}", response_model=ReturnPolicy)
def get_policy(category: str):
    """Fetches policy details for a given vertical."""
    policy = store.get_policy(category)
    if not policy:
        raise HTTPException(status_code=404, detail=f"Policy for {category} not found")
    return policy

@router.put("/{category}", response_model=ReturnPolicy)
def update_policy(category: str, update: PolicyUpdateRequest):
    """Updates category return policy dynamically."""
    existing = store.get_policy(category)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Policy for {category} not found")
    
    updated = ReturnPolicy(
        category=category,
        return_window_days=update.return_window_days,
        allows_opened=update.allows_opened,
        requires_photos=update.requires_photos,
        restocking_fee_pct=update.restocking_fee_pct,
        high_value_escalation_threshold=update.high_value_escalation_threshold,
        policy_code=existing.policy_code,
        description=update.description
    )
    store.update_policy(category, updated)
    return updated
