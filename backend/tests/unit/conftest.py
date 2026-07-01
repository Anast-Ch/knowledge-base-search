import asyncio
from contextlib import asynccontextmanager
from io import BytesIO
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import UploadFile
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    async_sessionmaker,
)

from app.main import app
from app.core.database import Base, get_async_session


@pytest.fixture(scope="function")
def client():
    # Асинхронная SQLite
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False,
    )

    TestingSessionLocal = async_sessionmaker(
        bind=engine,
        expire_on_commit=False,
    )

    async def create_tables():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    async def drop_tables():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)

    asyncio.run(create_tables())

    async def override_get_db():
        async with TestingSessionLocal() as session:
            yield session

    app.dependency_overrides[get_async_session] = override_get_db

    @asynccontextmanager
    async def fake_lifespan(app):
        yield

    with (
        patch("app.main.init_db", new=AsyncMock()),
        patch("app.main.close_db", new=AsyncMock()),
        patch.object(app.router, "lifespan_context", fake_lifespan),
    ):
        with TestClient(app) as client:
            yield client

    app.dependency_overrides.clear()

    asyncio.run(drop_tables())
    asyncio.run(engine.dispose())


@pytest.fixture
def fake_pdf():
    content = b"%PDF-1.4 Test"

    return UploadFile(
        file=BytesIO(content),
        filename="test.pdf",
        size=len(content),
    )