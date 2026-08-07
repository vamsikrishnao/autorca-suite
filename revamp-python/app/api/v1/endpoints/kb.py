from fastapi import APIRouter
from typing import List
from app.models.domain import KBArticle, ConnectorConfig, ConnectorType
from app.services.kb_service import kb_service

router = APIRouter(prefix="/kb", tags=["Knowledge Base & RAG"])

@router.get("/search", response_model=List[KBArticle])
def search_kb(q: str = ""):
    return kb_service.search_kb(q)

@router.post("/articles", response_model=KBArticle)
def add_article(article: KBArticle):
    return kb_service.add_article(article)

@router.get("/connectors", response_model=List[ConnectorConfig])
def list_connectors():
    return kb_service.list_connectors()

@router.post("/connectors", response_model=ConnectorConfig)
def configure_connector(connector_type: ConnectorType, url: str):
    return kb_service.configure_connector(connector_type, url)
