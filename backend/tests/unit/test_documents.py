import pytest
from io import BytesIO
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import HTTPException
from httpx import AsyncClient, ASGITransport

from app.utils.validators import validate_file
from app.utils.chunking import chunk_text, create_chunks_with_metadata
from app.core.database import get_async_session
from app.main import app

class MockUploadFile:
    def __init__(self, filename: str, size_bytes: int):
        self.filename = filename
        self.size = size_bytes
        self.file = BytesIO(b"D" * size_bytes)

class TestDocumentValidatorsUnit:
    def test_validate_file_allowed_extensions(self):
        pdf_file = MockUploadFile("lecture_1.pdf", 1024)
        docx_file = MockUploadFile("notes.docx", 1024)
        assert validate_file(pdf_file) is None
        assert validate_file(docx_file) is None

    def test_validate_file_forbidden_extension(self):
        invalid_file = MockUploadFile("script.py", 500)
        with pytest.raises(HTTPException) as exc_info:
            validate_file(invalid_file)
        assert exc_info.value.status_code == 400
        assert "Неподдерживаемый формат" in exc_info.value.detail

    def test_validate_file_max_size_boundary(self):
        max_size = 20 * 1024 * 1024
        valid_large_file = MockUploadFile("big_lecture.pdf", max_size)
        assert validate_file(valid_large_file) is None

    def test_validate_file_too_large(self):
        too_large_size = (20 * 1024 * 1024) + 1
        invalid_large_file = MockUploadFile("huge_lecture.pdf", too_large_size)
        with pytest.raises(HTTPException) as exc_info:
            validate_file(invalid_large_file)
        assert exc_info.value.status_code == 400
        assert "Размер файла превышает 20 МБ" in exc_info.value.detail

class TestDocumentChunkingUnit:
    def test_chunk_text_generation(self):
        sample_text = "Короткий текст для проверки."
        chunks = chunk_text(sample_text)
        assert isinstance(chunks, list)
        assert len(chunks) > 0

    def test_create_chunks_with_metadata(self):
        doc_id = "123e4567-e89b-12d3-a456-426614174000"
        file_name = "лекция_1.pdf"
        text = "Тестовая строка для проверки структуры полей метаданных."
        result = create_chunks_with_metadata(text, doc_id, file_name, page=1)
        assert len(result) > 0
        first_chunk = result[0]
        assert "chunk_id" in first_chunk
        assert first_chunk["document_id"] == doc_id
        assert first_chunk["file_name"] == file_name
        assert first_chunk["page"] == 1
        assert "text" in first_chunk

@pytest.mark.asyncio(loop_scope="session")
class TestDocumentAPIContract:
    @pytest.fixture(autouse=True)
    def setup_mocks(self):
        self.db_session_mock = AsyncMock()
        
        # Заглушаем асинхронные методы сессии, чтобы избежать RuntimeWarning
        self.db_session_mock.commit = AsyncMock()
        self.db_session_mock.flush = AsyncMock()
        self.db_session_mock.refresh = AsyncMock()
        self.db_session_mock.add = MagicMock()

        async def mock_get_session():
            yield self.db_session_mock

        app.dependency_overrides[get_async_session] = mock_get_session
        
        with patch("app.core.database.init_db", new_callable=AsyncMock), \
             patch("app.core.database.close_db", new_callable=AsyncMock), \
             patch("app.core.elasticsearch.es_client.create_index_if_not_exists", new_callable=AsyncMock), \
             patch("app.core.elasticsearch.es_client.close", new_callable=AsyncMock), \
             patch("app.core.elasticsearch.es_client.get_client", new_callable=AsyncMock):
            yield
            
        app.dependency_overrides.clear()

    async def test_upload_document_success(self):
        with patch("app.api.endpoints.documents.parse_document", new_callable=AsyncMock) as mock_parse, \
             patch("app.api.endpoints.documents.es_client", new_callable=MagicMock) as mock_es_client:
            
            mock_parse.return_value = "Распарсенный текст из документа"
            mock_es_client.get_client = AsyncMock()
            
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as ac:
                files = {
                    "file": ("лекция_1.pdf", b"%PDF-1.5 fake content", "application/pdf")
                }
                response = await ac.post("/api/v1/documents/upload", files=files)
                
                assert response.status_code == 200, (
                    f"Ошибка контракта BE-01: ожидался код 200, пришел {response.status_code}. "
                    f"Ответ сервера: {response.text}"
                )
                
                json_data = response.json()
                assert "document_id" in json_data, "В ответе отсутствует document_id"
                assert json_data["file_name"] == "лекция_1.pdf", "Поле file_name не совпадает"
                assert json_data["status"] == "Готово", "Статус должен иметь значение 'Готово'"

    async def test_upload_document_invalid_format(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            files = {
                "file": ("malicious_script.sh", b"rm -rf /", "text/x-shellscript")
            }
            response = await ac.post("/api/v1/documents/upload", files=files)
            
            assert response.status_code == 400, (
                f"Ошибка контракта BE-02: ожидался код 400, пришел {response.status_code}"
            )

    async def test_get_documents_list_contract(self):
        from datetime import datetime
        
        mock_doc = MagicMock()
        mock_doc.id = "123e4567-e89b-12d3-a456-426614174000"
        mock_doc.file_name = "лекция_1.pdf"
        # Передаем реальный объект datetime, чтобы Pydantic смог вызвать .isoformat()
        mock_doc.upload_date = datetime(2026, 6, 25, 14, 30, 0)
        mock_doc.status = "Готово"
        
        # Настраиваем цепочку методов: result.scalars().all() вернет список документов
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [mock_doc]
        
        self.db_session_mock.execute = AsyncMock(return_value=mock_result)
        
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.get("/api/v1/documents")
            
            assert response.status_code == 200, f"Ожидался код 200, пришел {response.status_code}. Ответ: {response.text}"
            
            json_data = response.json()
            assert isinstance(json_data, list), "Эндпоинт должен возвращать JSON-массив"
            
            if len(json_data) > 0:
                first_doc = json_data[0]
                assert "document_id" in first_doc
                assert "file_name" in first_doc
                assert "upload_date" in first_doc
                assert "status" in first_doc
                assert first_doc["status"] in ["Загрузка", "Готово", "Ошибка"]