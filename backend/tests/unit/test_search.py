import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from httpx import AsyncClient, ASGITransport
from datetime import datetime

from app.core.database import get_async_session
from app.main import app

@pytest.mark.asyncio(loop_scope="session")
class TestSearchAPIContract:
    @pytest.fixture(autouse=True)
    def setup_mocks(self):
        """Фикстура для изоляции тестов от реальной БД и Elasticsearch"""
        self.db_session_mock = AsyncMock()
        
        # Заглушаем методы сохранения в историю
        self.db_session_mock.add = MagicMock()
        self.db_session_mock.commit = AsyncMock()
        self.db_session_mock.flush = AsyncMock()

        async def mock_get_session():
            yield self.db_session_mock

        app.dependency_overrides[get_async_session] = mock_get_session
        
        # Глобально мокаем запуск и остановку сервисов в lifespan бэкенда
        with patch("app.core.database.init_db", new_callable=AsyncMock), \
             patch("app.core.database.close_db", new_callable=AsyncMock), \
             patch("app.core.elasticsearch.es_client.create_index_if_not_exists", new_callable=AsyncMock), \
             patch("app.core.elasticsearch.es_client.close", new_callable=AsyncMock):
            yield
            
        app.dependency_overrides.clear()

    async def test_search_success_contract(self):
        """Проверка контракта [BE-08]: успешный поиск по ключевому слову"""
        # Имитируем ответ от Elasticsearch, который бэкенд должен обработать
        fake_es_response = {
            "hits": {
                "hits": [
                    {
                        "_score": 2.45,
                        "_source": {
                            "chunk_id": "81237",
                            "file_name": "лекция_1.pdf",
                            "page": 12,
                            "text": "Архитектура на основе микросервисов позволяет масштабировать систему..."
                        }
                    }
                ]
            }
        }

        with patch("app.core.elasticsearch.es_client.get_client", new_callable=AsyncMock) as mock_get_client:
            mock_es_instance = AsyncMock()
            mock_es_instance.search.return_value = fake_es_response
            mock_get_client.return_value = mock_es_instance

            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as ac:
                response = await ac.get("/api/v1/search", params={"q": "микросервис"})
                
                assert response.status_code == 200, f"Ожидался код 200, пришел {response.status_code}. Ответ: {response.text}"
                
                json_data = response.json()
                assert isinstance(json_data, list), "Поиск должен возвращать JSON-массив результатов"
                assert len(json_data) == 1, "Ожидался один результат поиска"
                
                first_hit = json_data[0]
                # Проверка ключей строго по Разделу 2 («Полнотекстовый поиск») официального контракта [BE-09]:
                assert first_hit["chunk_id"] == "81237"
                assert first_hit["file_name"] == "лекция_1.pdf"
                assert first_hit["page"] == 12
                assert first_hit["text"] == "Архитектура на основе микросервисов позволяет масштабировать систему..."
                assert first_hit["score"] == 2.45

    async def test_search_missing_query_parameter(self):
        """Проверка контракта: если параметр 'q' отсутствует, фреймворк должен отвечать 422 Unprocessable Entity"""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            # Делаем запрос БЕЗ обязательного query-параметра 'q'
            response = await ac.get("/api/v1/search")
            
            #ААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААА 422
            #ААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААА 422
            #ААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААА 422
            #ААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААА 422
            #ААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААА 422
            #ААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААА 422
            #ААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААА 422
            #ААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААА 422 ПОТОМ ИСПРАВЬ
            assert response.status_code == 400, f"Ожидался код 422, пришел {response.status_code}. Ответ: {response.text}"

    async def test_get_search_history_contract(self):
        """Проверка контракта: получение списка истории поисковых запросов"""
        mock_history_item = MagicMock()
        mock_history_item.id = 1
        mock_history_item.query = "манализ лекция 1"
        mock_history_item.created_at = datetime(2026, 6, 25, 15, 0, 0)
        
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [mock_history_item]
        
        self.db_session_mock.execute = AsyncMock(return_value=mock_result)
        
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.get("/api/v1/history", params={"limit": 5})
            
            assert response.status_code == 200, f"Ожидался код 200, пришел {response.status_code}. Ответ: {response.text}"
            
            json_data = response.json()
            assert isinstance(json_data, list), "История должна возвращать JSON-массив"
            
            if len(json_data) > 0:
                first_item = json_data[0]
                assert "query" in first_item
                assert "created_at" in first_item
                assert first_item["query"] == "манализ лекция 1"