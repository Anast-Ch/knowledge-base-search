from pathlib import Path

import pytest
from playwright.sync_api import Browser, Page


# Корень backend
BACKEND_DIR = Path(__file__).resolve().parents[2]

# backend/tests
TESTS_DIR = BACKEND_DIR / "tests"

# backend/tests/fixtures
FIXTURES_DIR = TESTS_DIR / "fixtures"


@pytest.fixture(scope="session")
def base_url(pytestconfig) -> str:
    """
    Адрес фронтенда.

    ЧТОБЫ ПЕРЕОПРЕДЕЛИТЬ!:

        pytest --base-url=http://localhost:3000

    (или через playwright.config).
    """
    return pytestconfig.getoption("base_url")


@pytest.fixture
def app_page(browser: Browser, base_url: str) -> Page:
    """
    Создает новую вкладку браузера и открывает приложение.
    """
    page = browser.new_page()
    page.goto(base_url)
    yield page
    page.close()


@pytest.fixture(scope="session")
def fixtures_dir() -> Path:
    """
    Папка с тестовыми файлами.
    """
    return FIXTURES_DIR


@pytest.fixture(scope="session")
def valid_pdf(fixtures_dir: Path) -> Path:
    return fixtures_dir / "valid.pdf"


@pytest.fixture(scope="session")
def valid_docx(fixtures_dir: Path) -> Path:
    return fixtures_dir / "valid.docx"


@pytest.fixture(scope="session")
def large_pdf(fixtures_dir: Path) -> Path:
    return fixtures_dir / "large.pdf"


@pytest.fixture(scope="session")
def invalid_file(fixtures_dir: Path) -> Path:
    return fixtures_dir / "virus.exe"