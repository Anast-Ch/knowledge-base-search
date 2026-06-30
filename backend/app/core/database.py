import logging
from typing import AsyncGenerator
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
    AsyncEngine
)
from sqlalchemy.orm import declarative_base
from app.core.config import settings

logger = logging.getLogger(__name__)

Base = declarative_base()

def get_async_database_url() -> str:
    url = settings.DATABASE_URL or "sqlite:///./knowledge_base.db"
    
    if url.startswith("sqlite://"):
        return url.replace("sqlite://", "sqlite+aiosqlite://", 1)
    
    if "postgresql" in url:
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    return url

def get_async_engine_kwargs():
    url = settings.DATABASE_URL or "sqlite:///./knowledge_base.db"
    
    if "sqlite" in url:
        return {
            "echo": settings.DEBUG,
            "pool_pre_ping": True,
        }
    
    return {
        "echo": settings.DEBUG,
        "pool_size": 10,
        "max_overflow": 20,
        "pool_pre_ping": True,
        "pool_recycle": 3600,
    }

async_engine: AsyncEngine = create_async_engine(
    get_async_database_url(),
    **get_async_engine_kwargs()
)

async_session_factory = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

def get_sync_engine():
    url = settings.DATABASE_URL or "sqlite:///./knowledge_base.db"
    
    if "sqlite" in url:
        return create_engine(
            url,
            echo=settings.DEBUG,
            connect_args={"check_same_thread": False}
        )

    if "postgresql+psycopg2://" in url:
        url = url.replace("postgresql+psycopg2://", "postgresql+psycopg://", 1)
    elif url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+psycopg://", 1)
    
    return create_engine(
        url,
        echo=settings.DEBUG,
        pool_size=5,
        max_overflow=10,
    )

async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        try:
            yield session
        except Exception as e:
            logger.error(f"Database session error: {e}")
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_db() -> None:
    try:
        sync_engine = get_sync_engine()
        Base.metadata.create_all(sync_engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

async def close_db() -> None:
    await async_engine.dispose()
    logger.info("Database connection closed")

__all__ = [
    "Base",
    "async_engine",
    "async_session_factory",
    "get_async_session",
    "init_db",
    "close_db",
    "get_sync_engine",
]