"""Stable public API contract tests."""
def test_root_status(client):
    response = client.get("/")
    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "EcoFilament AI Backend"
    assert body["status"] == "running"


def test_health_status(client):
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "ecofilament-ai-backend"
    assert body["nvidia_configured"] is False


def test_chat_rejects_empty_messages(client):
    response = client.post("/api/chat", json={"messages": []})
    assert response.status_code == 422


def test_chat_rejects_unknown_role(client):
    response = client.post(
        "/api/chat",
        json={"messages": [{"role": "system", "content": "hello"}]},
    )
    assert response.status_code == 422


def test_chat_success_contract(client, monkeypatch, app_module, fake_nvidia):
    monkeypatch.setenv("NVIDIA_API_KEY", "test-key-not-real")
    response = client.post(
        "/api/chat",
        json={"messages": [{"role": "user", "content": "Hello"}]},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["reply"] == "Test response"
    assert body["model"] == "test-model"


def test_chat_requires_last_message_to_be_user(client):
    response = client.post(
        "/api/chat",
        json={"messages": [{"role": "assistant", "content": "Hello"}]},
    )
    assert response.status_code == 400
