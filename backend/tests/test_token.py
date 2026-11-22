"""Token comparison must handle HTTP header byte decoding safely."""
import pytest


@pytest.mark.parametrize(
    ("received", "expected", "matches"),
    [
        ("correct-token", "correct-token", True),
        ("wrong-token", "correct-token", False),
        ("", "", True),
        ("short", "a-much-longer-token", False),
        ("café", "café", False),  # Header value is Latin-1; expected token is UTF-8.
    ],
)
def test_token_matches_ascii_and_unicode_cases(app_module, received, expected, matches):
    assert app_module._token_matches(received, expected) is matches


def test_test_endpoint_rejects_wrong_token(client, monkeypatch):
    monkeypatch.setenv("NVIDIA_TEST_TOKEN", "expected-token")
    response = client.post(
        "/api/test-nvidia",
        headers={"X-Test-Token": "wrong-token"},
    )
    assert response.status_code == 401
