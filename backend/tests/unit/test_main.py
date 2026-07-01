def test_root(client):
    response = client.get("/")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "running"
    assert "message" in data
    assert data["docs"] == "/docs"


def test_health(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_docs_available(client):
    response = client.get("/docs")

    assert response.status_code == 200


def test_openapi_available(client):
    response = client.get("/openapi.json")

    assert response.status_code == 200

    data = response.json()

    assert "/api/v1/documents/upload" in data["paths"]
    assert "/api/v1/documents" in data["paths"]