import io
import pdfplumber
from docx import Document
from fastapi import HTTPException

async def parse_pdf(file_bytes: bytes) -> str:
    try:
        text = ""
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text() or ""
                text += page_text + "\n"
        return text
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка парсинга PDF: {str(e)}"
        )

async def parse_docx(file_bytes: bytes) -> str:
    try:
        doc = Document(io.BytesIO(file_bytes))
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])

        if not text.strip():
            raise ValueError("Документ не содержит текста")
        return text
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка парсинга DOCX: {str(e)}"
        )

async def parse_document(file_bytes: bytes, filename: str) -> str:
    if filename.lower().endswith('.pdf'):
        return await parse_pdf(file_bytes)
    elif filename.lower().endswith('.docx'):
        return await parse_docx(file_bytes)
    else:
        raise HTTPException(
            status_code=400,
            detail="Неподдерживаемый формат файла"
        )