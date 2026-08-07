import time
import uuid
from typing import Dict, List, Optional
from app.models.domain import WorkerNode

class WorkerPoolService:
    def __init__(self):
        self._workers: Dict[str, WorkerNode] = {
            "worker-node-1": WorkerNode(worker_id="worker-node-1", status="IDLE", active_tasks=0, max_capacity=5),
            "worker-node-2": WorkerNode(worker_id="worker-node-2", status="IDLE", active_tasks=0, max_capacity=5)
        }

    def register_worker(self, worker_id: Optional[str] = None, max_capacity: int = 5) -> WorkerNode:
        wid = worker_id or f"worker-{uuid.uuid4().hex[:6]}"
        worker = WorkerNode(worker_id=wid, status="IDLE", active_tasks=0, max_capacity=max_capacity)
        self._workers[wid] = worker
        return worker

    def allocate_worker(self) -> Optional[WorkerNode]:
        # Find idle or lowest load worker with available capacity
        available = [w for w in self._workers.values() if w.status != "OFFLINE" and w.active_tasks < w.max_capacity]
        if not available:
            return None
        # Sort by fewest active tasks
        available.sort(key=lambda x: x.active_tasks)
        selected = available[0]
        selected.active_tasks += 1
        selected.status = "BUSY" if selected.active_tasks >= selected.max_capacity else "BUSY"
        return selected

    def release_worker(self, worker_id: str):
        worker = self._workers.get(worker_id)
        if worker and worker.active_tasks > 0:
            worker.active_tasks -= 1
            if worker.active_tasks == 0:
                worker.status = "IDLE"

    def heartbeat(self, worker_id: str) -> bool:
        worker = self._workers.get(worker_id)
        if worker:
            worker.last_heartbeat = time.time()
            return True
        return False

    def list_workers(self) -> List[WorkerNode]:
        return list(self._workers.values())

worker_pool_service = WorkerPoolService()
