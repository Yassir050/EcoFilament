"""Rate-limit contract checks; no external service calls are made."""
def test_chat_rate_limit_monitor_mode_does_not_block(client, monkeypatch, fake_nvidia):
    monkeypatch.setenv("NVIDIA_API_KEY", "test-key-not-real")
    monkeypatch.setenv("RATE_LIMIT_ENFORCE", "false")

    # Monitor-only mode records would-limit events but does not return 429.
    statuses = []
    for _ in range(12):
        response = client.post(
            "/api/chat",
            json={"messages": [{"role": "user", "content": "hello"}]},
        )
        statuses.append(response.status_code)

    assert all(status == 200 for status in statuses)


def test_test_endpoint_uses_separate_token_gate(client, monkeypatch):
    monkeypatch.delenv("NVIDIA_TEST_TOKEN", raising=False)
    response = client.post("/api/test-nvidia", headers={"X-Test-Token": "anything"})
    assert response.status_code == 503
