from fastapi import APIRouter
from backend.app.models.schemas import ChatRequest, ChatResponse
from backend.app.agent.react_agent import agent_instance

router = APIRouter(prefix="/api/chat", tags=["Agent Chat"])

@router.post("", response_model=ChatResponse)
def handle_chat_message(request: ChatRequest):
    """
    Submits a customer request to the autonomous ReAct agent.
    Returns the conversational response along with the step-by-step Thought/Action/Observation execution trace.
    """
    return agent_instance.process_request(
        user_message=request.message,
        order_id_param=request.order_id,
        session_id=request.session_id,
        image_data=request.image_data
    )

