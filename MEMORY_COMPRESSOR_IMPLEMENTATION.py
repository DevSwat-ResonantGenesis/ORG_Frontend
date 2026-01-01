"""
LONG-TERM MEMORY COMPRESSOR
===========================

Runs periodically (every 1 hour) to compress and clean up long-term memories.
This keeps the database lightweight and performant.

Location: backend/fastapi_app/workers/memory_compressor.py

Usage:
    - Run as cron job: */60 * * * * python -m workers.memory_compressor
    - Or run as background service
"""

import logging
import time
from typing import List, Optional
from sqlalchemy.orm import Session
from contextlib import contextmanager

from ..database import get_db_engine
from ..services.memory.mesh_service import MeshService
from ..services.memory.hash_sphere import HashSphereService

logger = logging.getLogger(__name__)


@contextmanager
def get_compressor_session():
    """Create DB session for compressor operations"""
    engine = get_db_engine()
    session = Session(engine)
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        logger.error(f"Compressor session error: {e}", exc_info=True)
        raise
    finally:
        session.close()


def compress_daily_memories(user_id: Optional[int] = None):
    """
    Compress daily memories into summaries.
    
    Args:
        user_id: If provided, compress only for this user. Otherwise, all users.
    """
    try:
        with get_compressor_session() as session:
            mesh_service = MeshService(session)
            
            # Get users to process
            from ..models.auth import User
            if user_id:
                users = session.query(User).filter(User.id == user_id).all()
            else:
                users = session.query(User).all()
            
            for user in users:
                try:
                    # Compress daily memories
                    mesh_service.compress_daily_memories(user.id)
                    logger.info(f"Compressed daily memories for user {user.id}")
                except Exception as e:
                    logger.error(f"Error compressing memories for user {user.id}: {e}")
                    
    except Exception as e:
        logger.error(f"Error in compress_daily_memories: {e}", exc_info=True)


def update_monthly_summaries(user_id: Optional[int] = None):
    """
    Update monthly summaries from daily compressions.
    """
    try:
        with get_compressor_session() as session:
            mesh_service = MeshService(session)
            
            from ..models.auth import User
            if user_id:
                users = session.query(User).filter(User.id == user_id).all()
            else:
                users = session.query(User).all()
            
            for user in users:
                try:
                    mesh_service.update_monthly_summary(user.id)
                    logger.info(f"Updated monthly summary for user {user.id}")
                except Exception as e:
                    logger.error(f"Error updating monthly summary for user {user.id}: {e}")
                    
    except Exception as e:
        logger.error(f"Error in update_monthly_summaries: {e}", exc_info=True)


def create_knowledge_crystals(user_id: Optional[int] = None):
    """
    Create knowledge crystals from compressed memories.
    """
    try:
        with get_compressor_session() as session:
            mesh_service = MeshService(session)
            
            from ..models.auth import User
            if user_id:
                users = session.query(User).filter(User.id == user_id).all()
            else:
                users = session.query(User).all()
            
            for user in users:
                try:
                    mesh_service.create_knowledge_crystals(user.id)
                    logger.info(f"Created knowledge crystals for user {user.id}")
                except Exception as e:
                    logger.error(f"Error creating knowledge crystals for user {user.id}: {e}")
                    
    except Exception as e:
        logger.error(f"Error in create_knowledge_crystals: {e}", exc_info=True)


def prune_low_importance_nodes(user_id: Optional[int] = None, threshold: float = 0.1):
    """
    Prune nodes with low importance scores.
    
    Args:
        user_id: If provided, prune only for this user
        threshold: Importance threshold below which nodes are pruned
    """
    try:
        with get_compressor_session() as session:
            hash_service = HashSphereService(session)
            
            from ..models.auth import User
            if user_id:
                users = session.query(User).filter(User.id == user_id).all()
            else:
                users = session.query(User).all()
            
            for user in users:
                try:
                    pruned_count = hash_service.prune_low_importance_nodes(
                        user_id=user.id,
                        threshold=threshold
                    )
                    logger.info(f"Pruned {pruned_count} nodes for user {user.id}")
                except Exception as e:
                    logger.error(f"Error pruning nodes for user {user.id}: {e}")
                    
    except Exception as e:
        logger.error(f"Error in prune_low_importance_nodes: {e}", exc_info=True)


def merge_anchors(user_id: Optional[int] = None):
    """
    Merge similar anchors to reduce redundancy.
    """
    try:
        with get_compressor_session() as session:
            hash_service = HashSphereService(session)
            
            from ..models.auth import User
            if user_id:
                users = session.query(User).filter(User.id == user_id).all()
            else:
                users = session.query(User).all()
            
            for user in users:
                try:
                    merged_count = hash_service.merge_similar_anchors(user.id)
                    logger.info(f"Merged {merged_count} anchors for user {user.id}")
                except Exception as e:
                    logger.error(f"Error merging anchors for user {user.id}: {e}")
                    
    except Exception as e:
        logger.error(f"Error in merge_anchors: {e}", exc_info=True)


def regenerate_personality_matrix(user_id: Optional[int] = None):
    """
    Regenerate personality matrix from recent interactions.
    """
    try:
        with get_compressor_session() as session:
            mesh_service = MeshService(session)
            
            from ..models.auth import User
            if user_id:
                users = session.query(User).filter(User.id == user_id).all()
            else:
                users = session.query(User).all()
            
            for user in users:
                try:
                    mesh_service.regenerate_personality_matrix(user.id)
                    logger.info(f"Regenerated personality matrix for user {user.id}")
                except Exception as e:
                    logger.error(f"Error regenerating personality matrix for user {user.id}: {e}")
                    
    except Exception as e:
        logger.error(f"Error in regenerate_personality_matrix: {e}", exc_info=True)


def build_evidence_graphs(user_id: Optional[int] = None):
    """
    Build evidence graphs from compressed memories.
    """
    try:
        with get_compressor_session() as session:
            mesh_service = MeshService(session)
            
            from ..models.auth import User
            if user_id:
                users = session.query(User).filter(User.id == user_id).all()
            else:
                users = session.query(User).all()
            
            for user in users:
                try:
                    mesh_service.build_evidence_graph(user.id)
                    logger.info(f"Built evidence graph for user {user.id}")
                except Exception as e:
                    logger.error(f"Error building evidence graph for user {user.id}: {e}")
                    
    except Exception as e:
        logger.error(f"Error in build_evidence_graphs: {e}", exc_info=True)


def run_full_compression_cycle():
    """
    Run full compression cycle (all operations).
    This is what the cron job should call.
    """
    logger.info("Starting full compression cycle")
    start_time = time.time()
    
    try:
        # Run all compression operations
        compress_daily_memories()
        update_monthly_summaries()
        create_knowledge_crystals()
        prune_low_importance_nodes()
        merge_anchors()
        regenerate_personality_matrix()
        build_evidence_graphs()
        
        elapsed = time.time() - start_time
        logger.info(f"Completed full compression cycle in {elapsed:.2f}s")
        
    except Exception as e:
        logger.error(f"Error in full compression cycle: {e}", exc_info=True)


if __name__ == "__main__":
    # Run compression cycle
    # This can be called by cron: */60 * * * * python -m workers.memory_compressor
    run_full_compression_cycle()

