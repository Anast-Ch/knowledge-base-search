import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from httpx import AsyncClient, ASGITransport
from datetime import datetime

from app.core.database import get_async_session
from app.main import app

@pytest.mark.asyncio(loop_scope="session")
class TestSystemAndDocumentsAPI:
    @pytest.fixture(autouse=True)
    def setup_mocks(self):
        """Фикстура для изоляции тестов от реальной инфраструктуры"""
        self.db_session_mock = AsyncMock()
        
        # Делаем add обычным AsyncMock, чтобы бэкенд мог делать ему await, если у него так написано
        self.db_session_mock.add = AsyncMock()
        self.db_session_mock.commit = AsyncMock()
        self.db_session_mock.flush = AsyncMock()

        async def mock_get_session():
            yield self.db_session_mock

        app.dependency_overrides[get_async_session] = mock_get_session
        
        with patch("app.core.database.init_db", new_callable=AsyncMock), \
             patch("app.core.database.close_db", new_callable=AsyncMock), \
             patch("app.core.elasticsearch.es_client.create_index_if_not_exists", new_callable=AsyncMock), \
             patch("app.core.elasticsearch.es_client.close", new_callable=AsyncMock):
            yield
            
        app.dependency_overrides.clear()

    async def test_get_documents_list_contract(self):
        """Проверка контракта: получение списка загруженных файлов [FE-03]"""

        # Создаем mock-объекты документов
        mock_doc_1 = MagicMock()
        mock_doc_1.id = "123e4567-e89b-12d3-a456-426614174000"
        mock_doc_1.file_name = "лекция_1.pdf"
        mock_doc_1.upload_date = datetime(2026, 6, 25, 14, 30, 0)
        mock_doc_1.status = "Готово"

        mock_doc_2 = MagicMock()
        mock_doc_2.id = "789e1234-e89b-12d3-a456-426614174999"
        mock_doc_2.file_name = "черновик.docx"
        mock_doc_2.upload_date = datetime(2026, 6, 25, 15, 0, 0)
        mock_doc_2.status = "Ошибка"

        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [mock_doc_1, mock_doc_2]
        self.db_session_mock.execute = AsyncMock(return_value=mock_result)

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.get("/api/v1/documents")
            
            assert response.status_code == 200, f"Ожидался код 200, пришел {response.status_code}. Ответ: {response.text}"
            
            json_data = response.json()
            print(json_data)
            assert isinstance(json_data, list)
            assert len(json_data) == 2
            
            doc = json_data[0]
            assert "document_id" in doc, f"В ответе эндпоинта /documents отсутствует обязательный ключ 'document_id'. Ответ: {doc}"
            assert doc["document_id"] == "123e4567-e89b-12d3-a456-426614174000"
            assert doc["file_name"] == "лекция_1.pdf"
            assert "upload_date" in doc
            assert doc["status"] == "Готово"

    async def test_search_elasticsearch_down_returns_500(self):
        """Проверка устойчивости: падение Elasticsearch возвращает HTTP 500"""
        with patch("app.core.elasticsearch.es_client.get_client", new_callable=AsyncMock) as mock_get_client:
            mock_es_instance = AsyncMock()
            mock_es_instance.search.side_effect = Exception("Elasticsearch cluster is down")
            mock_get_client.return_value = mock_es_instance

            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as ac:
                response = await ac.get("/api/v1/search", params={"q": "тест"})
                
                assert response.status_code == 500, f"Ожидался код 500, пришел {response.status_code}. Ответ: {response.text}"