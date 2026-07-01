from pathlib import Path

import pytest
from fastapi import HTTPException, UploadFile

from app.utils.validators import validate_file

FIXTURES = Path(__file__).parent / "../fixtures"


def load_file(filename: str) -> UploadFile:
    """Создает UploadFile из файла в tests/fixtures."""
    path = FIXTURES / filename

    return UploadFile(
        filename=path.name,
        file=open(path, "rb"),
        size=path.stat().st_size,
    )


def test_validate_pdf():
    """Корректный PDF проходит проверку."""
    file = load_file("valid.pdf")

    validate_file(file)


def test_validate_docx():
    """Корректный DOCX проходит проверку."""
    file = load_file("valid.docx")

    validate_file(file)


def test_validate_forbidden_extension():
    """Файл с запрещенным расширением отклоняется."""
    file = load_file("virus.exe")

    with pytest.raises(HTTPException) as exc_info:
        validate_file(file)

    assert exc_info.value.status_code == 400


def test_validate_file_too_big():
    """Файл больше 20 МБ не проходит проверку."""
    file = load_file("large.pdf")

    with pytest.raises(HTTPException) as exc_info:
        validate_file(file)

    assert exc_info.value.status_code == 400


def test_validate_empty_filename():
    """Пустое имя файла вызывает ошибку."""
    file = UploadFile(
        filename="",
        file=open(FIXTURES / "valid.pdf", "rb"),
        size=(FIXTURES / "valid.pdf").stat().st_size,
    )

    with pytest.raises(HTTPException) as exc_info:
        validate_file(file)

    assert exc_info.value.status_code == 400


def test_validate_uppercase_extension():
    """Расширение в верхнем регистре должно приниматься."""
    file = load_file("UPPERCASE.PDF")

    validate_file(file)