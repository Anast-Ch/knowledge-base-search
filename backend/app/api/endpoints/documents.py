import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_async_session
from app.models.document import Document
from app.utils.validators import validate_file

router = APIRouter()

@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_async_session)
):
    try:
        validate_file(file)
        
        document_id = uuid.uuid4()
        
        new_document = Document(
            id=document_id,
            file_name=file.filename,
            status="Загрузка"
        )
        session.add(new_document)
        await session.commit()
        await session.refresh(new_document)
        
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
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

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