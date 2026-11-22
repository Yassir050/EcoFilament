"""Regression tests for defects identified during the Phase 1 review."""
import json
import urllib.request


class FakeHTTPResponse:
    def __init__(self, payload):
        self.payload = json.dumps(payload).encode("utf-8")

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def read(self):
        return self.payload


def test_whitespace_only_chat_message_is_rejected(client):
    response = client.post(
        "/api/chat",
        json={"messages": [{"role": "user", "content": "   \t  "}]},
    )
    assert response.status_code == 422


def test_provider_attribute_error_is_converted_to_safe_failure(monkeypatch, app_module):
    def broken_urlopen(*args, **kwargs):
        raise AttributeError("internal provider object detail")

    monkeypatch.setattr(urllib.request, "urlopen", broken_urlopen)
    result = app_module.call_nvidia("fake-key", [{"role": "user", "content": "hi"}])
    assert result["success"] is False
    assert result["provider_status"] is None
    assert "internal provider object detail" not in str(result)


def test_provider_os_error_is_converted_to_safe_failure(monkeypatch, app_module):
    def broken_urlopen(*args, **kwargs):
        raise OSError("private network detail")

    monkeypatch.setattr(urllib.request, "urlopen", broken_urlopen)
    result = app_module.call_nvidia("fake-key", [{"role": "user", "content": "hi"}])
    assert result["success"] is False
    assert result["provider_status"] is None
    assert "private network detail" not in str(result)
