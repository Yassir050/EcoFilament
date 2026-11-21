
"""
EcoFilament AI Backend — Phase 2.2
NVIDIA-powered AI Chat API.
"""

import os
import json
import hmac
import asyncio
import urllib.request
import urllib.error

from typing import Any, Literal

from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

APP_NAME = "EcoFilament AI Backend"
APP_VERSION = "0.3.0"

NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
NVIDIA_MODEL = "nvidia/nemotron-3.5-bolt-e4b"
REQUEST_TIMEOUT = 30

MAX_MESSAGES = 12
MAX_MESSAGE_LENGTH = 4000
CHAT_MAX_TOKENS = 700

SYSTEM_PROMPT = """
You are EcoFilament AI, the educational assistant inside EcoFilament.

EcoFilament is an educational project about recycling plastic
and transforming suitable recycled plastic into 3D-printing filament.

Your responsibilities:
- Explain plastic recycling and 3D-printing filament clearly.
- Help users understand EcoFilament's educational content.
- Answer questions about sustainability, recycling, and 3D printing.
- Provide accurate, practical, beginner-friendly explanations.
- Correct misunderstandings politely.
- Never invent project features, experimental results, or statistics.
- If you are uncertain, say so clearly.

Language:
- Reply in the language used by the user.
- Support Arabic and English.
- If the user mixes Arabic and English, respond naturally.
- Keep answers organized and easy to understand.

Style:
- Use clear headings and lists when useful.
- Avoid unnecessarily long answers.
- Explain technical terms when needed.
"""


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
    description="EcoFilament backend — NVIDIA AI Chat.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-Test-Token"],
)


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(
        min_length=1,
        max_length=MAX_MESSAGE_LENGTH,
    )


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(
        min_length=1,
        max_length=MAX_MESSAGES,
    )


def call_nvidia(
    api_key: str,
    messages: list[dict[str, str]],
    max_tokens: int = CHAT_MAX_TOKENS,
    temperature: float = 0.4,
) -> dict[str, Any]:

    payload = {
        "model": NVIDIA_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
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
            result = json.loads(
                response.read().decode("utf-8")
            )

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
        return {
            "success": False,
            "provider_status": error.code,
            "error": {
                401: "NVIDIA rejected the API key.",
                403: "NVIDIA denied access to this model or API.",
                429: "NVIDIA rate limit or quota reached.",
            }.get(
                error.code,
                "NVIDIA returned an HTTP error.",
            ),
        }

    except (urllib.error.URLError, TimeoutError):
        return {
            "success": False,
            "provider_status": None,
            "error": "Could not reach the NVIDIA API.",
        }

    except (
        ValueError,
        KeyError,
        TypeError,
        json.JSONDecodeError,
    ):
        return {
            "success": False,
            "provider_status": None,
            "error": "NVIDIA returned an unexpected response.",
        }


def get_api_key() -> str:
    api_key = os.getenv("NVIDIA_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="NVIDIA_API_KEY is not configured on the server.",
        )

    return api_key


@app.get("/", tags=["Status"])
async def root() -> dict[str, str]:
    return {
        "name": APP_NAME,
        "version": APP_VERSION,
        "status": "running",
        "phase": "2.2 - NVIDIA AI Chat",
        "docs": "/docs",
    }


@app.get("/health", tags=["Status"])
async def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "service": "ecofilament-ai-backend",
        "version": APP_VERSION,
        "nvidia_configured": bool(
            os.getenv("NVIDIA_API_KEY")
        ),
        "chat_endpoint": "/api/chat",
    }


@app.post("/api/chat", tags=["AI Chat"])
async def chat(request: ChatRequest) -> dict[str, Any]:

    messages = request.messages

    if messages[-1].role != "user":
        raise HTTPException(
            status_code=400,
            detail="The last message must be from the user.",
        )

    provider_messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT,
        }
    ]

    provider_messages.extend(
        {
            "role": message.role,
            "content": message.content.strip(),
        }
        for message in messages
    )

    api_key = get_api_key()

    result = await asyncio.to_thread(
        call_nvidia,
        api_key,
        provider_messages,
        CHAT_MAX_TOKENS,
        0.4,
    )

    if not result["success"]:
        raise HTTPException(
            status_code=502,
            detail={
                "error": "AI provider request failed.",
                "provider_status": result["provider_status"],
                "message": result["error"],
            },
        )

    return {
        "success": True,
        "model": result["model"],
        "reply": result["reply"],
    }


@app.post("/api/test-nvidia", tags=["NVIDIA"])
async def test_nvidia(
    x_test_token: str = Header(
        ...,
        alias="X-Test-Token",
    ),
) -> dict[str, Any]:

    expected_token = os.getenv("NVIDIA_TEST_TOKEN")

    if not expected_token:
        raise HTTPException(
            status_code=503,
            detail="NVIDIA_TEST_TOKEN is not configured on the server.",
        )

    if not hmac.compare_digest(
        x_test_token,
        expected_token,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid test token.",
        )

    api_key = get_api_key()

    test_messages = [
        {
            "role": "user",
            "content": (
                "Reply with exactly: "
                "EcoFilament NVIDIA connection successful."
            ),
        }
    ]

    result = await asyncio.to_thread(
        call_nvidia,
        api_key,
        test_messages,
        60,
        0.2,
    )

    if not result["success"]:
        raise HTTPException(
            status_code=502,
            detail=result,
        )

    return result
