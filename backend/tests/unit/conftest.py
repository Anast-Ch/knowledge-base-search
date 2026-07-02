import pytest
import asyncio
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="module")
def client():
    # Используем TestClient для базовых API проверок
    with TestClient(app) as c:
        yield c