
"""EcoFilament AI Backend — Phase 2.1
Secure NVIDIA connectivity test.
"""

import os
import json
import hmac
import asyncio
import urllib.request
import urllib.error

from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

APP_NAME = "EcoFilament AI Backend"
APP_VERSION = "0.2.0"

NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
NVIDIA_MODEL = "nvidia/nemotron-3.5-bolt-e4b"
REQUEST_TIMEOUT = 30

def get_allowed_origins() -> list[str]:
    configured = os.getenv("ALLOWED_ORIGINS", "")
    if configured.strip():
        return [
            origin.strip()
            for origin in configured.split(",")
            if origin.strip()
        ]

    return [
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "https://yassir050.github.io",
    ]


app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="EcoFilament backend — NVIDIA connectivity test phase.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-Test-Token"],
)


@app.get("/", tags=["Status"])
async def root() -> dict[str, str]:
    return {
        "name": APP_NAME,
        "version": APP_VERSION,
        "status": "running",
        "phase": "2.1 - NVIDIA connectivity test",
        "docs": "/docs",
    }


@app.get("/health")
async def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "service": "ecofilament-ai-backend",
        "version": APP_VERSION,
        "nvidia_connected": False,
        "note": "Use POST /api/test-nvidia to test NVIDIA connectivity.",
    }


def call_nvidia(api_key: str) -> dict[str, Any]:
    payload = {
        "model": NVIDIA_MODEL,
        "messages": [
            {
                "role": "user",
                "content": "Reply with exactly: EcoFilament NVIDIA connection successful."
            }
        ],
        "temperature": 0.2,
        "max_tokens": 60,
    }

    request = urllib.request.Request(
        NVIDIA_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(
            request,
            timeout=REQUEST_TIMEOUT,
        ) as response:
            result = json.loads(response.read().decode("utf-8"))

        choices = result.get("choices", [])
        if not choices:
            raise ValueError("Provider returned no choices.")

        message = choices[0].get("message", {})
        reply = message.get("content", "")

        if not isinstance(reply, str) or not reply.strip():
            raise ValueError("Provider returned an empty response.")

        return {
            "success": True,
            "provider_status": 200,
            "model": NVIDIA_MODEL,
            "reply": reply.strip(),
        }

    except urllib.error.HTTPError as error:
        # Do not return the provider response body or credentials.
        return {
            "success": False,
            "provider_status": error.code,
            "error": {
                401: "NVIDIA rejected the API key.",
                403: "NVIDIA denied access to this model or API.",
                429: "NVIDIA rate limit or quota reached.",
            }.get(error.code, "NVIDIA returned an HTTP error."),
        }

    except urllib.error.URLError:
        return {
            "success": False,
            "provider_status": None,
            "error": "Could not reach the NVIDIA API.",
        }

    except (ValueError, KeyError, TypeError, json.JSONDecodeError):
        return {
            "success": False,
            "provider_status": None,
            "error": "NVIDIA returned an unexpected response.",
        }


@app.post("/api/test-nvidia", tags=["NVIDIA"])
async def test_nvidia(
    x_test_token: str = Header(..., alias="X-Test-Token"),
) -> dict[str, Any]:

    expected_token = os.getenv("NVIDIA_TEST_TOKEN")
    api_key = os.getenv("NVIDIA_API_KEY")

    if not expected_token:
        raise HTTPException(
            status_code=503,
            detail="NVIDIA_TEST_TOKEN is not configured on the server.",
        )

    if not hmac.compare_digest(x_test_token, expected_token):
        raise HTTPException(
            status_code=401,
            detail="Invalid test token.",
        )

    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="NVIDIA_API_KEY is not configured on the server.",
        )

    result = await asyncio.to_thread(call_nvidia, api_key)

    if not result["success"]:
        raise HTTPException(
            status_code=502,
            detail=result,
        )

    return result
