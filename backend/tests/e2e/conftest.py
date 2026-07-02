import pytest
import os

@pytest.fixture(scope="session")
def browser_context_args(browser_context_args):
    """Глобальная настройка контекста браузера для E2E сценариев"""
    return {
        **browser_context_args,
        "viewport": {"width": 1280, "height": 720}, # Стандартное разрешение экрана
        "base_url": "http://localhost:3000"         # ЕСЛИ ЗАПУСКАЕТЕ ЧЕРЕЗ npm dev run, ТО ПОМЕНЯЙТЕ ПОРТ НА 5173, щас просто в докере стоит 3000
    }

@pytest.fixture(scope="function")
def create_test_file():
    """Фикстура для автоматического создания и очистки тестового файла"""
    file_name = "лекция_1.pdf"
    file_path = os.path.abspath(file_name)
    
    # Создаем файл с контентом, который точно есть в моках фронтенда
    with open(file_path, "w", encoding="utf-8") as f:
        f.write("Архитектура на основе микросервисов позволяет масштабировать систему...")
        
    yield file_path
    
    # Гарантированная очистка диска после завершения теста
    if os.path.exists(file_path):
        os.remove(file_path)