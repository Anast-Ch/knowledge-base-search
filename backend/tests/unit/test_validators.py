import pytest
from io import BytesIO
from fastapi import HTTPException
from app.utils.validators import validate_file

class MockUploadFile:
    """
    Фейковый класс, имитирующий структуру объекта UploadFile из FastAPI,
    чтобы тестировать функцию validate_file без реальной загрузки файлов.
    """
    def __init__(self, filename: str, size_bytes: int):
        self.filename = filename
        self.size = size_bytes
        self.file = BytesIO(b"D" * size_bytes)  # Заполняем фейковыми байтами

def test_validate_file_allowed_extensions():
    pdf_file = MockUploadFile("lecture_1.pdf", 1024)
    docx_file = MockUploadFile("notes.docx", 5000)
    
    # Если функция ничего не возвращает и не выбрасывает исключений — тест пройден успешно
    assert validate_file(pdf_file) is None
    assert validate_file(docx_file) is None

def test_validate_file_case_insensitivity():
    uppercase_pdf = MockUploadFile("LECTURE.PDF", 1024)
    mixed_docx = MockUploadFile("document.DocX", 2048)
    
    assert validate_file(uppercase_pdf) is None
    assert validate_file(mixed_docx) is None

def test_validate_file_forbidden_extension():
    invalid_file = MockUploadFile("script.py", 500)
    
    with pytest.raises(HTTPException) as exc_info:
        validate_file(invalid_file)
        
    assert exc_info.value.status_code == 400
    assert "Неподдерживаемый формат" in exc_info.value.detail

def test_validate_file_max_size_boundary():
    max_size = 20 * 1024 * 1024  # 20 МБ в байтах
    valid_large_file = MockUploadFile("big_lecture.pdf", max_size)
    
    assert validate_file(valid_large_file) is None

def test_validate_file_too_large():
    too_large_size = (20 * 1024 * 1024) + 1  # 20 МБ + 1 байт
    invalid_large_file = MockUploadFile("huge_lecture.pdf", too_large_size)
    
    with pytest.raises(HTTPException) as exc_info:
        validate_file(invalid_large_file)
        
    assert exc_info.value.status_code == 400
    assert "Размер файла превышает 20 МБ" in exc_info.value.detail