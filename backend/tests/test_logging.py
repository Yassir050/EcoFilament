"""Logging must not disclose prompts, credentials, or test tokens."""
def test_chat_logging_does_not_expose_message_or_secret(
    client, monkeypatch, app_module, fake_nvidia, caplog
):
    secret_message = "PRIVATE-USER-MESSAGE-DO-NOT-LOG"
    fake_api_key = "FAKE-NVIDIA-KEY-DO-NOT-LOG"
    monkeypatch.setenv("NVIDIA_API_KEY", fake_api_key)

    response = client.post(
        "/api/chat",
        json={"messages": [{"role": "user", "content": secret_message}]},
    )
    assert response.status_code == 200

    captured = caplog.text
    assert secret_message not in captured
    assert fake_api_key not in captured


def test_test_token_is_not_logged(client, monkeypatch, caplog):
    token = "PRIVATE-TEST-TOKEN-DO-NOT-LOG"
    monkeypatch.setenv("NVIDIA_TEST_TOKEN", token)

    response = client.post(
        "/api/test-nvidia",
        headers={"X-Test-Token": "incorrect-token"},
    )
    assert response.status_code == 401
    assert token not in caplog.text
