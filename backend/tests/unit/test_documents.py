from io import BytesIO


def test_upload_valid_docx(client):
    response = client.post(
        "/api/v1/documents/upload",
        files={
            "file": (
                "test.docx",
                BytesIO(b"Fake docx"),
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            )
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["file_name"] == "test.docx"
    assert data["status"] == "Готово"

def test_upload_valid_document(client):
    """Успешная загрузка документа"""
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
    """Получение списка документов"""
    response = client.get("/api/v1/documents")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_upload_without_file(client):
    response = client.post("/api/v1/documents/upload")

    assert response.status_code == 422