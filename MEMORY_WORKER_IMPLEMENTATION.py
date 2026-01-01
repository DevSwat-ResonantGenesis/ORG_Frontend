"""
MEMORY WORKER - Background Memory Operations
============================================

All heavy memory operations run here in the background.
Each function creates its own DB session to avoid transaction conflicts.

Location: backend/fastapi_app/workers/memory_worker.py
"""

import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from contextlib import contextmanager

from ..database import get_db_engine
from ..services.memory.hash_sphere import HashSphereService
from ..services.memory.rag_service import RAGService
from ..services.memory.mesh_service import MeshService

logger = logging.getLogger(__name__)


@contextmanager
def get_worker_session():
    """
    Create a new DB session for worker operations.
    
    CRITICAL: Each worker function MUST use its own session.
    Never share sessions between tasks or with the main request.
    """
    engine = get_db_engine()
    session = Session(engine)
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        logger.error(f"Worker session error: {e}", exc_info=True)
        raise
    finally:
        session.close()


def update_hash_sphere_graph(
    message_id: int,
    chat_id: str,
    user_id: int,
    content: str,
    **kwargs
):
    """
    Update Hash Sphere graph with new message.
    
    This was previously running in the main request handler.
    Now runs in background after response is sent.
    """
    try:
        with get_worker_session() as session:
            # Hash the message
            hash_service = HashSphereService(session)
            message_hash = hash_service.generate_hash(content)
            
            # Extract related memories
            related_memories = hash_service.extract_memories(
                message_hash=message_hash,
                user_id=user_id,
                proximity_threshold=0.7
            )
            
            # Update graph connections
            hash_service.update_graph_connections(
                message_hash=message_hash,
                related_hashes=[m.hash for m in related_memories],
                user_id=user_id
            )
            
            # Store message hash mapping
            hash_service.store_message_hash(
                message_id=message_id,
                hash=message_hash,
                user_id=user_id
            )
            
            logger.info(f"Updated Hash Sphere graph for message {message_id}")
            
    except Exception as e:
        logger.error(f"Error updating Hash Sphere graph: {e}", exc_info=True)


def update_memory_mesh(
    user_id: int,
    message_id: int,
    **kwargs
):
    """
    Update self-organizing memory mesh.
    
    This was previously running in the main request handler.
    Now runs in background.
    """
    try:
        with get_worker_session() as session:
            mesh_service = MeshService(session)
            
            # Get message
            from ..models.resonant_chat import ChatMessage
            message = session.query(ChatMessage).filter(
                ChatMessage.id == message_id
            ).first()
            
            if not message:
                logger.warning(f"Message {message_id} not found")
                return
            
            # Update mesh
            mesh_service.update_mesh(
                user_id=user_id,
                message_content=message.content,
                message_id=message_id
            )
            
            logger.info(f"Updated memory mesh for user {user_id}")
            
    except Exception as e:
        logger.error(f"Error updating memory mesh: {e}", exc_info=True)


def process_rag_ingestion(
    message_id: int,
    content: str,
    **kwargs
):
    """
    Process RAG ingestion for new message.
    
    This was previously running in the main request handler.
    Now runs in background.
    """
    try:
        with get_worker_session() as session:
            rag_service = RAGService(session)
            
            # Ingest message into RAG
            rag_service.ingest_message(
                message_id=message_id,
                content=content
            )
            
            logger.info(f"Processed RAG ingestion for message {message_id}")
            
    except Exception as e:
        logger.error(f"Error processing RAG ingestion: {e}", exc_info=True)


def reinforce_anchors(
    message_id: int,
    user_id: int,
    **kwargs
):
    """
    Reinforce memory anchors based on new message.
    
    This was previously running in the main request handler.
    Now runs in background.
    """
    try:
        with get_worker_session() as session:
            hash_service = HashSphereService(session)
            
            # Get message
            from ..models.resonant_chat import ChatMessage
            message = session.query(ChatMessage).filter(
                ChatMessage.id == message_id
            ).first()
            
            if not message:
                logger.warning(f"Message {message_id} not found")
                return
            
            # Reinforce anchors
            hash_service.reinforce_anchors(
                user_id=user_id,
                message_content=message.content,
                message_id=message_id
            )
            
            logger.info(f"Reinforced anchors for message {message_id}")
            
    except Exception as e:
        logger.error(f"Error reinforcing anchors: {e}", exc_info=True)


def propagate_knowledge(
    message_id: int,
    user_id: int,
    **kwargs
):
    """
    Propagate knowledge through memory graph.
    
    This was previously running in the main request handler.
    Now runs in background.
    """
    try:
        with get_worker_session() as session:
            mesh_service = MeshService(session)
            
            # Propagate knowledge
            mesh_service.propagate_knowledge(
                user_id=user_id,
                message_id=message_id
            )
            
            logger.info(f"Propagated knowledge for message {message_id}")
            
    except Exception as e:
        logger.error(f"Error propagating knowledge: {e}", exc_info=True)


def update_compression_tree(
    user_id: int,
    **kwargs
):
    """
    Update memory compression tree.
    
    This was previously running in the main request handler.
    Now runs in background.
    """
    try:
        with get_worker_session() as session:
            mesh_service = MeshService(session)
            
            # Update compression tree
            mesh_service.update_compression_tree(user_id=user_id)
            
            logger.info(f"Updated compression tree for user {user_id}")
            
    except Exception as e:
        logger.error(f"Error updating compression tree: {e}", exc_info=True)


def generate_synthetic_memory(
    chat_id: str,
    user_id: int,
    **kwargs
):
    """
    Generate synthetic memories from conversation.
    
    This was previously running in the main request handler.
    Now runs in background.
    """
    try:
        with get_worker_session() as session:
            mesh_service = MeshService(session)
            
            # Generate synthetic memories
            mesh_service.generate_synthetic_memories(
                chat_id=chat_id,
                user_id=user_id
            )
            
            logger.info(f"Generated synthetic memories for chat {chat_id}")
            
    except Exception as e:
        logger.error(f"Error generating synthetic memory: {e}", exc_info=True)


def calculate_resonance(
    message_id: int,
    user_id: int,
    **kwargs
):
    """
    Calculate resonance score for message.
    
    This was previously running in the main request handler.
    Now runs in background.
    """
    try:
        with get_worker_session() as session:
            hash_service = HashSphereService(session)
            
            # Get message
            from ..models.resonant_chat import ChatMessage
            message = session.query(ChatMessage).filter(
                ChatMessage.id == message_id
            ).first()
            
            if not message:
                logger.warning(f"Message {message_id} not found")
                return
            
            # Calculate resonance
            resonance_score = hash_service.calculate_resonance(
                user_id=user_id,
                message_content=message.content
            )
            
            # Update message with resonance score
            message.metadata = message.metadata or {}
            message.metadata["resonance_score"] = resonance_score
            session.commit()
            
            logger.info(f"Calculated resonance {resonance_score} for message {message_id}")
            
    except Exception as e:
        logger.error(f"Error calculating resonance: {e}", exc_info=True)


# ============================================
# ADDITIONAL WORKER FUNCTIONS
# ============================================

def run_topic_classification(message_id: int, **kwargs):
    """Classify message topic (background)"""
    # Implementation here
    pass


def run_emotion_analysis(message_id: int, **kwargs):
    """Analyze message emotion (background)"""
    # Implementation here
    pass


def run_intent_detection(message_id: int, **kwargs):
    """Detect message intent (background)"""
    # Implementation here
    pass


def run_semantic_parsing(message_id: int, **kwargs):
    """Parse message semantics (background)"""
    # Implementation here
    pass

