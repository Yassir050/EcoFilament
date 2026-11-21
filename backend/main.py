"""EcoFilament AI backend — Phase 1 foundation.

This phase intentionally exposes only health/status endpoints. NVIDIA
integration and chat routes will be added in a later, separately approved phase.
"""

import os
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

APP_NAME = "EcoFilament AI Backend"
APP_VERSION = "0.1.0"


def get_allowed_origins() -> list[str]:
    """Read comma-separated browser origins from ALLOWED_ORIGINS."""
    configured = os.getenv("ALLOWED_ORIGINS", "")
    if configured.strip():
        return [origin.strip() for origin in configured.split(",") if origin.strip()]

    # Local development and the current GitHub Pages site.
    return [
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "https://yassir050.github.io",
    ]


app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description=(
        "Initial backend foundation for EcoFilament. "
        "Chat and NVIDIA integration are not enabled in this phase."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.get("/", tags=["Status"])
async def root() -> dict[str, str]:
    return {
        "name": APP_NAME,
        "version": APP_VERSION,
        "status": "running",
        "phase": "1 - backend foundation",
        "docs": "/docs",
    }


@app.get("/health", tags=["Status"])
async def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "service": "ecofilament-ai-backend",
        "version": APP_VERSION,
        "nvidia_connected": False,
        "note": "NVIDIA integration will be tested in Phase 2.",
    }
