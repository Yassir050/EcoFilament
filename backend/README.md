# EcoFilament AI Backend — Phase 1

This folder contains the initial FastAPI server only. It does **not** connect to NVIDIA yet and does not modify the EcoFilament frontend.

## Requirements

- Python 3.10 or newer
- Internet access for installing Python packages

## Windows PowerShell setup

Run these commands from the `backend` folder:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn main:app --reload
```

If PowerShell blocks activation, you can run the server without activating the environment:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --reload
```

## Test the server

Open these URLs in a browser:

- `http://127.0.0.1:8000/` — service information
- `http://127.0.0.1:8000/health` — health check
- `http://127.0.0.1:8000/docs` — interactive FastAPI documentation

Expected health response includes `"status": "ok"` and `"nvidia_connected": false`.

Stop the server with `Ctrl+C`.

## Security

- Never commit `.env` or publish a real NVIDIA API key.
- If an API key was previously exposed, revoke it and create a new one before Phase 2.
- The NVIDIA key is not read or used in Phase 1.

## Scope

Phase 1 provides only `/` and `/health`. The `/api/chat` endpoint and NVIDIA request handling are intentionally deferred to Phase 2, after this server starts successfully.
