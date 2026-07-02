from fastapi import APIRouter, Query, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_async_session
from app.core.elasticsearch import es_client
from app.core.config import settings
from app.models.search_history import SearchHistory

router = APIRouter()

@router.get("/search")
async def search(
    q: str = Query(..., description="Поисковый запрос"),
    page: int = Query(1, ge=1, description="Номер страницы"),
    session: AsyncSession = Depends(get_async_session)
):
    try:
        history_entry = SearchHistory(query=q)
        session.add(history_entry)
        await session.commit()
        
        es = await es_client.get_client()
        from_idx = (page - 1) * 10
        
        response = await es.search(
            index=settings.ELASTICSEARCH_INDEX,
            body={
                "query": {
                    "multi_match": {
                        "query": q,
                        "fields": ["text"],
                        "type": "best_fields",
                        "fuzziness": "AUTO"
                    }
                },
                "from": from_idx,
                "size": 10,
                "_source": ["chunk_id", "file_name", "page", "text"]
            }
        )
        
        results = []
        for hit in response["hits"]["hits"]:
            source = hit["_source"]
            results.append({
                "chunk_id": source["chunk_id"],
                "file_name": source["file_name"],
                "page": source.get("page", 1),
                "text": source["text"],
                "score": hit["_score"]
            })
        
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")

@router.get("/history")
async def get_search_history(
    limit: int = Query(10, ge=1, le=100),
    session: AsyncSession = Depends(get_async_session)
):
    try:
        result = await session.execute(
            select(SearchHistory)
            .order_by(SearchHistory.created_at.desc())
            .limit(limit)
        )
        history = result.scalars().all()
        
        return [
            {
                "id": item.id,
                "query": item.query,
                "created_at": item.created_at.isoformat()
            }
            for item in history
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")