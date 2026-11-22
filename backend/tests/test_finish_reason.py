"""Provider finish_reason handling contract."""
import json
import urllib.request
import pytest


class FakeHTTPResponse:
    def __init__(self, payload):
        self.payload = json.dumps(payload).encode("utf-8")

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def read(self):
        return self.payload


def provider_payload(reason):
    choice = {"message": {"content": "A valid response"}}
    if reason is not ...:
        choice["finish_reason"] = reason
    return {"choices": [choice]}


def invoke(monkeypatch, app_module, reason):
    monkeypatch.setattr(
        urllib.request,
        "urlopen",
        lambda *args, **kwargs: FakeHTTPResponse(provider_payload(reason)),
    )
    return app_module.call_nvidia("fake-key", [{"role": "user", "content": "hi"}])


def test_stop_is_normal_completion(monkeypatch, app_module):
    result = invoke(monkeypatch, app_module, "stop")
    assert result["success"] is True
    assert result["truncated"] is False


def test_length_marks_response_truncated(monkeypatch, app_module):
    result = invoke(monkeypatch, app_module, "length")
    assert result["success"] is True
    assert result["truncated"] is True


@pytest.mark.parametrize("reason", ["content_filter", "tool_calls", "STOP"])
def test_unsupported_or_unknown_finish_reason_is_safe_failure(monkeypatch, app_module, reason):
    result = invoke(monkeypatch, app_module, reason)
    assert result["success"] is False
    assert result["provider_status"] is None


def test_missing_finish_reason_is_accepted_without_claiming_truncation(monkeypatch, app_module):
    result = invoke(monkeypatch, app_module, ...)
    assert result["success"] is True
    assert result["truncated"] is False
