"""Shared, network-isolated fixtures for EcoFilament backend tests."""
import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

BACKEND_DIR = str(Path(__file__).resolve().parents[1])
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Set safe test configuration before importing the application module.
os.environ["NVIDIA_API_KEY"] = ""
os.environ["NVIDIA_TEST_TOKEN"] = ""
os.environ["RATE_LIMIT_ENFORCE"] = "false"

import main  # noqa: E402


@pytest.fixture
def app_module():
    return main


@pytest.fixture
def client(app_module):
    return TestClient(app_module.app)


@pytest.fixture(autouse=True)
def isolate_limiters(app_module):
    """Reset in-memory limiter state between tests when limiter objects exist."""
    for name in ("chat_limiter", "test_limiter", "general_limiter"):
        limiter = getattr(app_module, name, None)
        if limiter is not None:
            reset = getattr(limiter, "reset", None)
            if callable(reset):
                reset()
            elif hasattr(limiter, "requests"):
                limiter.requests.clear()
    yield


@pytest.fixture
def fake_nvidia(monkeypatch, app_module):
    """Replace the provider call; tests never contact NVIDIA."""
    def _fake(*args, **kwargs):
        return {
            "success": True,
            "provider_status": 200,
            "model": "test-model",
            "reply": "Test response",
        }

    monkeypatch.setattr(app_module, "call_nvidia", _fake)
    return _fake
