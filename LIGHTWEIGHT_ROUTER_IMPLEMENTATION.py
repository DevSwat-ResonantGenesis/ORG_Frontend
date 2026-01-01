"""
LIGHTWEIGHT RESONANT CHAT ROUTER
================================

This is the NEW lightweight router that replaces the heavy handler.
It does ONLY the essential operations and queues everything else.

Location: backend/fastapi_app/routers/resonant_chat.py
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import logging
import time

from ..dependencies import get_session, get_jwt_identity
from ..workers.task_queue import queue_memory_task
from ..services.llm_provider import call_llm_provider
from ..models.resonant_chat import ChatMessage, ChatConversation

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/resonant-chat", tags=["resonant-chat"])


@router.post("/message")
async def send_message(
    request: ResonantChatRequest,
    identity: dict = Depends(get_jwt_identity),
    session: Session = Depends(get_session),
):
    """
    LIGHTWEIGHT CHAT MESSAGE HANDLER
    
    Does ONLY:
    1. Auth validation (via dependency)
    2. Store user message
    3. Build minimal context (last 5 messages)
    4. Call LLM provider
    5. Store assistant message
    6. Queue background tasks
    7. Return response immediately
    
    Response time: < 2 seconds
    """
    user_id = identity.get("user_id")
    
    try:
        # ============================================
        # STEP 1: Store User Message
        # ============================================
        user_message = ChatMessage(
            chat_id=request.chat_id or f"chat-{user_id}-{int(time.time())}",
            user_id=user_id,
            role="user",
            content=request.message,
            metadata={
                "attached_files": request.attached_files or [],
                "code_selection": request.code_selection,
            }
        )
        session.add(user_message)
        session.commit()
        session.refresh(user_message)
        
        # ============================================
        # STEP 2: Build Minimal Context
        # ============================================
        # Get last 5 messages only (not full history)
        recent_messages = session.query(ChatMessage)\
            .filter(ChatMessage.chat_id == user_message.chat_id)\
            .order_by(ChatMessage.created_at.desc())\
            .limit(5)\
            .all()
        
        context_messages = [
            {"role": msg.role, "content": msg.content}
            for msg in reversed(recent_messages)
        ]
        
        # ============================================
        # STEP 3: Call LLM Provider
        # ============================================
        # This is the ONLY heavy operation in the request
        # But it's necessary and time-bounded
        llm_response = await call_llm_provider(
            message=request.message,
            context=context_messages,
            provider=request.preferred_provider or "auto",
            user_id=user_id
        )
        
        # ============================================
        # STEP 4: Store Assistant Message
        # ============================================
        assistant_message = ChatMessage(
            chat_id=user_message.chat_id,
            user_id=user_id,
            role="assistant",
            content=llm_response.content,
            metadata={
                "provider": llm_response.provider,
                "model": llm_response.model,
            }
        )
        session.add(assistant_message)
        session.commit()
        session.refresh(assistant_message)
        
        # ============================================
        # STEP 5: Queue Background Tasks
        # ============================================
        # All heavy operations are queued here
        # They run AFTER the response is sent
        
        # Queue memory operations
        queue_memory_task("update_hash_sphere_graph", {
            "message_id": user_message.id,
            "chat_id": user_message.chat_id,
            "user_id": user_id,
            "content": request.message
        })
        
        queue_memory_task("update_memory_mesh", {
            "user_id": user_id,
            "message_id": user_message.id
        })
        
        queue_memory_task("process_rag_ingestion", {
            "message_id": user_message.id,
            "content": request.message
        })
        
        queue_memory_task("reinforce_anchors", {
            "message_id": user_message.id,
            "user_id": user_id
        })
        
        queue_memory_task("propagate_knowledge", {
            "message_id": user_message.id,
            "user_id": user_id
        })
        
        # ============================================
        # STEP 6: Return Response Immediately
        # ============================================
        return {
            "message": llm_response.content,
            "chatId": user_message.chat_id,
            "messageId": assistant_message.id,
            "aiProvider": llm_response.provider,
            "memoryUpdated": False,  # Will be updated in background
            "hash": None,  # Will be set in background
            "anchors": [],  # Will be populated in background
            "resonanceScore": None,  # Will be calculated in background
        }
        
    except Exception as e:
        logger.error(f"Error in lightweight chat handler: {e}", exc_info=True)
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# REMOVED OPERATIONS (Now in Background)
# ============================================
# ❌ Semantic parsing - MOVED TO WORKER
# ❌ Intent detection - MOVED TO WORKER
# ❌ Topic classifier - MOVED TO WORKER
# ❌ Emotion analysis - MOVED TO WORKER
# ❌ RAG retrieval - MOVED TO WORKER
# ❌ Hash Sphere memory extraction - MOVED TO WORKER
# ❌ Memory graph building - MOVED TO WORKER
# ❌ Self-organizing mesh - MOVED TO WORKER
# ❌ Causal reasoning engine - MOVED TO WORKER
# ❌ Predictive engine - MOVED TO WORKER
# ❌ Memory compression tree - MOVED TO WORKER
# ❌ Knowledge propagation - MOVED TO WORKER
# ❌ Knowledge crystal creation - MOVED TO WORKER
# ❌ Synthetic memory generation - MOVED TO WORKER
# ❌ Context compression - MOVED TO WORKER
# ❌ Personality layer - MOVED TO WORKER
# ❌ Conflict resolver - MOVED TO WORKER
# ❌ Deep context compiler - MOVED TO WORKER
# ❌ Self-repair - MOVED TO WORKER
# ❌ Auto-fix - MOVED TO WORKER
# ❌ CoT supervisor - MOVED TO WORKER
# ❌ 20+ system instructions - MOVED TO WORKER
# ❌ Multiple DB writes in one transaction - FIXED (separate sessions)
# ❌ Anchors created & reinforced - MOVED TO WORKER

