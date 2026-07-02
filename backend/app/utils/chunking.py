from app.core.config import settings

def chunk_text(text: str) -> list:
    chunk_size = settings.CHUNK_SIZE
    overlap = settings.CHUNK_OVERLAP
    
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        
        if chunk.strip():
            chunks.append(chunk)
        
        start += chunk_size - overlap
    
    return chunks

def create_chunks_with_metadata(text: str, document_id: str, file_name: str, page: int = 1) -> list:
    chunks = chunk_text(text)
    result = []
    
    for i, chunk in enumerate(chunks):
        result.append({
            "chunk_id": f"{document_id}_{i}",
            "document_id": document_id,
            "file_name": file_name,
            "page": page,
            "text": chunk
        })
    
    return result