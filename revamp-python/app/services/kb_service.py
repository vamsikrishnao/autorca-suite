import time
import uuid
from typing import List, Dict, Optional
from app.models.domain import KBArticle, ConnectorConfig, ConnectorType

class KBService:
    def __init__(self):
        self._articles: Dict[str, KBArticle] = {
            "kb-1": KBArticle(
                article_id="kb-1",
                title="NullPointer Handling Runbook",
                content="Always check for null before accessing downstream service references.",
                source=ConnectorType.CONFLUENCE,
                url="https://confluence.internal/wiki/runbooks/nullpointer",
                tags=["runbook", "nullpointer", "java"]
            ),
            "kb-2": KBArticle(
                article_id="kb-2",
                title="SharePoint Infrastructure Timeout Incident History",
                content="Network timeout issue resolution: Increase socket keep-alive and pool size.",
                source=ConnectorType.SHAREPOINT,
                url="https://company.sharepoint.com/sites/kb/timeouts",
                tags=["sharepoint", "timeouts", "network"]
            )
        }
        self._connectors: Dict[str, ConnectorConfig] = {
            "conn-sharepoint": ConnectorConfig(
                connector_id="conn-sharepoint",
                connector_type=ConnectorType.SHAREPOINT,
                url="https://company.sharepoint.com/sites/kb",
                is_connected=True,
                auth_status="CONNECTED",
                last_synced_at=time.time()
            ),
            "conn-confluence": ConnectorConfig(
                connector_id="conn-confluence",
                connector_type=ConnectorType.CONFLUENCE,
                url="https://confluence.internal/wiki",
                is_connected=True,
                auth_status="CONNECTED",
                last_synced_at=time.time()
            )
        }

    def search_kb(self, query: str) -> List[KBArticle]:
        q = query.lower()
        results = []
        for article in self._articles.values():
            if q in article.title.lower() or q in article.content.lower() or any(q in t.lower() for t in article.tags):
                results.append(article)
        return results or list(self._articles.values())

    def add_article(self, article: KBArticle) -> KBArticle:
        self._articles[article.article_id] = article
        return article

    def configure_connector(self, connector_type: ConnectorType, url: str) -> ConnectorConfig:
        conn_id = f"conn-{connector_type.value.lower()}"
        config = ConnectorConfig(
            connector_id=conn_id,
            connector_type=connector_type,
            url=url,
            is_connected=True,
            auth_status="CONNECTED",
            last_synced_at=time.time()
        )
        self._connectors[conn_id] = config
        return config

    def get_connector(self, connector_id: str) -> Optional[ConnectorConfig]:
        return self._connectors.get(connector_id)

    def list_connectors(self) -> List[ConnectorConfig]:
        return list(self._connectors.values())

kb_service = KBService()
