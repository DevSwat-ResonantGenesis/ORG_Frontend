"""
SIMPLE TASK QUEUE SYSTEM
========================

Zero-dependency task queue using Python threading.
No Redis, no Celery, no external services required.

Location: backend/fastapi_app/workers/task_queue.py
"""

import threading
import queue
import logging
from typing import Dict, Any, Callable, Optional
from functools import wraps
import time

logger = logging.getLogger(__name__)

# Global task queue
_task_queue = queue.Queue(maxsize=1000)
_worker_threads = []
_max_workers = 5  # Configurable
_running = True


def start_worker_pool():
    """Start background worker threads"""
    global _worker_threads, _running
    _running = True
    
    for i in range(_max_workers):
        thread = threading.Thread(
            target=_worker_loop,
            name=f"MemoryWorker-{i}",
            daemon=True
        )
        thread.start()
        _worker_threads.append(thread)
    
    logger.info(f"Started {_max_workers} background worker threads")


def stop_worker_pool():
    """Stop all worker threads (graceful shutdown)"""
    global _running
    _running = False
    
    # Wait for queue to empty
    while not _task_queue.empty():
        time.sleep(0.1)
    
    # Wait for threads to finish
    for thread in _worker_threads:
        thread.join(timeout=5)
    
    logger.info("Stopped all background worker threads")


def _worker_loop():
    """Main worker loop - processes tasks from queue"""
    global _running
    
    while _running:
        try:
            # Get task from queue (blocking with timeout)
            task = _task_queue.get(timeout=1)
            
            if task is None:  # Shutdown signal
                break
            
            task_type = task.get("type")
            task_data = task.get("data", {})
            task_func = task.get("func")
            
            try:
                # Execute task
                if task_func:
                    task_func(**task_data)
                else:
                    logger.warning(f"Task {task_type} has no function handler")
                
            except Exception as e:
                logger.error(
                    f"Error executing task {task_type}: {e}",
                    exc_info=True
                )
            finally:
                _task_queue.task_done()
                
        except queue.Empty:
            continue
        except Exception as e:
            logger.error(f"Error in worker loop: {e}", exc_info=True)
            time.sleep(1)


def queue_memory_task(task_type: str, data: Dict[str, Any], func: Optional[Callable] = None):
    """
    Queue a memory task for background processing
    
    Args:
        task_type: Type of task (e.g., "update_hash_sphere_graph")
        data: Task data dictionary
        func: Optional function to execute (if None, will look up by task_type)
    """
    try:
        # Get function handler if not provided
        if func is None:
            func = _get_task_handler(task_type)
        
        task = {
            "type": task_type,
            "data": data,
            "func": func,
            "queued_at": time.time()
        }
        
        _task_queue.put(task, block=False)
        logger.debug(f"Queued task: {task_type}")
        
    except queue.Full:
        logger.error(f"Task queue is full! Dropping task: {task_type}")
    except Exception as e:
        logger.error(f"Error queueing task {task_type}: {e}", exc_info=True)


def _get_task_handler(task_type: str) -> Optional[Callable]:
    """
    Get function handler for task type
    
    This maps task types to actual functions in memory_worker.py
    """
    from .memory_worker import (
        update_hash_sphere_graph,
        update_memory_mesh,
        process_rag_ingestion,
        reinforce_anchors,
        propagate_knowledge,
        update_compression_tree,
        generate_synthetic_memory,
        calculate_resonance,
    )
    
    handlers = {
        "update_hash_sphere_graph": update_hash_sphere_graph,
        "update_memory_mesh": update_memory_mesh,
        "process_rag_ingestion": process_rag_ingestion,
        "reinforce_anchors": reinforce_anchors,
        "propagate_knowledge": propagate_knowledge,
        "update_compression_tree": update_compression_tree,
        "generate_synthetic_memory": generate_synthetic_memory,
        "calculate_resonance": calculate_resonance,
    }
    
    return handlers.get(task_type)


def get_queue_size() -> int:
    """Get current queue size"""
    return _task_queue.qsize()


def get_queue_stats() -> Dict[str, Any]:
    """Get queue statistics"""
    return {
        "queue_size": _task_queue.qsize(),
        "max_workers": _max_workers,
        "active_threads": sum(1 for t in _worker_threads if t.is_alive()),
        "running": _running,
    }


# Auto-start workers on import (if in FastAPI context)
# In main.py, call start_worker_pool() during app startup
# In main.py, call stop_worker_pool() during app shutdown

