import os
from fastapi import UploadFile, HTTPException
from app.core.config import settings

def validate_file(file: UploadFile) -> None:
    file_extension = os.path.splitext(file.filename)[1].lower().replace('.', '')
    if file_extension not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Неподдерживаемый формат файла. Разрешены: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    
    file_size = file.size
    max_size_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    
    if file_size > max_size_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"Размер файла превышает {settings.MAX_FILE_SIZE_MB} МБ"
        )