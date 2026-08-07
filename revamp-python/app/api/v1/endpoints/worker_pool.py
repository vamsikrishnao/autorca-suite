from fastapi import APIRouter
from typing import List
from app.models.domain import WorkerNode
from app.services.worker_pool_service import worker_pool_service

router = APIRouter(prefix="/workers", tags=["Worker Pool"])

@router.get("/", response_model=List[WorkerNode])
def list_workers():
    return worker_pool_service.list_workers()

@router.post("/register", response_model=WorkerNode)
def register_worker(worker_id: str = None, max_capacity: int = 5):
    return worker_pool_service.register_worker(worker_id, max_capacity)

@router.post("/allocate", response_model=WorkerNode)
def allocate_worker():
    worker = worker_pool_service.allocate_worker()
    return worker
