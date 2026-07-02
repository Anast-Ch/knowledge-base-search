from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "running"

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_upload_invalid_format():
    response = client.post(
        "/api/v1/documents/upload",
        files={"file": ("test.txt", b"content", "text/plain")}
    )
    assert response.status_code == 400
    assert "Неподдерживаемый формат" in response.json()["detail"]

def test_upload_large_file():
    large_file = b"0" * (25 * 1024 * 1024)
    response = client.post(
        "/api/v1/documents/upload",
        files={"file": ("large.pdf", large_file, "application/pdf")}
    )
    assert response.status_code == 400
    assert "превышает" in response.json()["detail"]

def test_get_documents_empty():
    response = client.get("/api/v1/documents")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_search_empty():
    response = client.get("/api/v1/search?q=test")
    assert response.status_code == 200
    assert isinstance(response.json(), list)