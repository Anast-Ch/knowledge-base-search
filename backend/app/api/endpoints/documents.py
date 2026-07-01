import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_async_session
from app.core.elasticsearch import es_client
from app.core.config import settings
from app.models.document import Document
from app.utils.validators import validate_file
from app.utils.parsers import parse_document
from app.utils.chunking import create_chunks_with_metadata

router = APIRouter()

@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_async_session)
):
    try:
        validate_file(file)
        
        file_bytes = await file.read()
        
        document_id = uuid.uuid4()
        
        new_document = Document(
            id=document_id,
            file_name=file.filename,
            status="Индексация"
        )
        session.add(new_document)
        await session.commit()
        
        try:
            text = await parse_document(file_bytes, file.filename)
        except Exception as e:
            new_document.status = "Ошибка"
            await session.commit()
            raise HTTPException(status_code=500, detail=f"Ошибка парсинга: {str(e)}")
        
        chunks = create_chunks_with_metadata(
            text=text,
            document_id=str(document_id),
            file_name=file.filename
        )
        
        es = await es_client.get_client()
        for chunk in chunks:
            await es.index(
                index=settings.ELASTICSEARCH_INDEX,
                id=chunk["chunk_id"],
                body=chunk
            )
        
        new_document.status = "Готово"
        await session.commit()
        
        return {
            "document_id": str(document_id),
            "file_name": file.filename,
            "status": "Готово"
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

@router.get("/documents")
async def get_documents(
    session: AsyncSession = Depends(get_async_session)
):
    try:
        result = await session.execute(
            select(Document).order_by(Document.upload_date.desc())
        )
        documents = result.scalars().all()
        
        return [
            {
                "document_id": str(doc.id),
                "file_name": doc.file_name,
                "upload_date": doc.upload_date.isoformat(),
                "status": doc.status
            }
            for doc in documents
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")