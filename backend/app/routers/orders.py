from fastapi import APIRouter, HTTPException
from typing import List
from backend.app.models.schemas import Order, CustomerProfile
from backend.app.db.store import store

router = APIRouter(prefix="/api/orders", tags=["Orders & Customers"])

@router.get("", response_model=List[Order])
def list_all_orders():
    """Lists all orders in the simulated store."""
    return store.list_orders()

@router.get("/{order_id}", response_model=Order)
def get_order_by_id(order_id: str):
    """Fetches details of a specific order."""
    order = store.get_order(order_id)
    if not order:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
    return order

@router.get("/customers/{customer_id}", response_model=CustomerProfile)
def get_customer_profile(customer_id: str):
    """Fetches trust score and behavioral history of a customer."""
    customer = store.get_customer(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail=f"Customer {customer_id} not found")
    return customer
