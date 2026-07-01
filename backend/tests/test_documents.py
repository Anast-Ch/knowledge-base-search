import pytest
from fastapi import UploadFile
from io import BytesIO


def test_upload_valid_docx(client):
    with open("tests/fixtures/valid.docx", "rb") as f:
        response = client.post(
            "/api/v1/documents/upload",
            files={
                "file": (
                    "valid.docx",
                    f,
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                )
            },
        )
    
    assert response.status_code == 200, f"Response: {response.text}"
    data = response.json()
    assert "document_id" in data
    assert data["status"] == "Готово"

    data = response.json()

    assert data["file_name"] == "valid.docx"
    assert data["status"] == "Готово"

def test_upload_valid_document(client):
    with open("tests/fixtures/valid.pdf", "rb") as f: 
        response = client.post(
            "/api/v1/documents/upload",
            files={"file": ("valid.pdf", f, "application/pdf")}
        )
    
    assert response.status_code == 200
    data = response.json()
    assert "document_id" in data
    assert data["status"] == "Готово"


def test_get_documents_list(client):
    response = client.get("/api/v1/documents")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_upload_without_file(client):
    response = client.post("/api/v1/documents/upload")

    assert response.status_code == 422