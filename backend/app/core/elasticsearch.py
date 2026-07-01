import logging
from typing import Optional
from elasticsearch import AsyncElasticsearch
from elasticsearch.exceptions import ConnectionError

from app.core.config import settings

logger = logging.getLogger(__name__)

class ElasticsearchClient:
    def __init__(self):
        self._client: Optional[AsyncElasticsearch] = None
        self._index_name = settings.ELASTICSEARCH_INDEX
        
    async def get_client(self) -> AsyncElasticsearch:
        if self._client is None:
            self._client = AsyncElasticsearch(
                hosts=[settings.ELASTICSEARCH_URL],
                verify_certs=False,
                timeout=30,
                max_retries=3,
                retry_on_timeout=True,
            )
            await self._check_connection()
        return self._client
    
    async def _check_connection(self) -> None:
        try:
            if await self._client.ping():
                logger.info(f"Connected to Elasticsearch at {settings.ELASTICSEARCH_URL}")
            else:
                raise ConnectionError("Could not connect to Elasticsearch")
        except Exception as e:
            logger.error(f"Elasticsearch connection error: {e}")
            raise
    
    async def create_index_if_not_exists(self) -> None:
        client = await self.get_client()
        
        exists = await client.indices.exists(index=self._index_name)
        if not exists:
            index_settings = {
                "settings": {
                    "number_of_shards": 1,
                    "number_of_replicas": 0,
                    "analysis": {
                        "analyzer": {
                            "russian_analyzer": {
                                "type": "custom",
                                "tokenizer": "standard",
                                "filter": ["lowercase", "russian_stop", "russian_stemmer"]
                            }
                        },
                        "filter": {
                            "russian_stop": {"type": "stop", "stopwords": "_russian_"},
                            "russian_stemmer": {"type": "stemmer", "language": "russian"}
                        }
                    }
                },
                "mappings": {
                    "properties": {
                        "chunk_id": {"type": "keyword"},
                        "document_id": {"type": "keyword"},
                        "file_name": {"type": "keyword"},
                        "page": {"type": "integer"},
                        "text": {"type": "text", "analyzer": "russian_analyzer"}
                    }
                }
            }
            
            await client.indices.create(index=self._index_name, body=index_settings)
            logger.info(f"Elasticsearch index '{self._index_name}' created")
    
    async def close(self) -> None:
        if self._client:
            await self._client.close()

es_client = ElasticsearchClient()