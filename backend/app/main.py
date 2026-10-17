from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routers import chat, orders, policies, escalations, analytics

app = FastAPI(
    title="ReturnGuard API",
    description="Autonomous ReAct E-Commerce Refund & Return Agent with Governance & HITL",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(orders.router)
app.include_router(policies.router)
app.include_router(escalations.router)
app.include_router(analytics.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ReturnGuard Autonomous ReAct Agent",
        "governance_engine": "ACTIVE",
        "hitl_integration": "ONLINE"
    }
