# EcoFilament AI Backend

FastAPI backend powering the AI features of **EcoFilament**, an educational presentation about recycling plastic into 3D-printing filament.

The backend connects the EcoFilament frontend to NVIDIA AI services while keeping API credentials securely on the server.

## Current Status

- **Backend:** FastAPI
- **Language:** Python 3.10+
- **AI Chat Provider:** NVIDIA
- **AI Model:** `nvidia/nemotron-3.5-bolt-e4b`
- **Deployment:** Enzonic
- **Frontend:** GitHub Pages

## Architecture

```text
EcoFilament Frontend
        |
        | HTTPS / REST API
        v
FastAPI Backend
        |
        | Secure API Request
        v
NVIDIA AI API
        |
        v
AI Response
        |
        v
EcoFilament Chat Interface
```

The NVIDIA API key is stored in the backend environment. It must never be exposed in frontend JavaScript or committed to GitHub.

## Features

### AI Chat

- NVIDIA-powered AI responses.
- Arabic and English conversations.
- Conversation context maintained by the frontend during the current session.
- Message history validation.
- Request timeout handling.
- Safe error responses.
- Restricted CORS origins.

### Health Monitoring

- Root service information endpoint.
- Health check endpoint.
- NVIDIA configuration status.

### Future Development

- AI Presenter with professional text-to-speech.
- Improved Arabic and English speech generation.
- More advanced presentation voice controls.

**Note:** AI Presenter currently uses browser-based SpeechSynthesis. NVIDIA TTS integration is not yet part of the deployed backend.

---

## Requirements

- Python 3.10 or newer.
- Internet connection.
- NVIDIA API key for AI Chat functionality.
- Git (optional).

## Project Structure

```text
backend/
├── main.py
├── requirements.txt
├── .env.example
├── .env
└── README.md
```

`.env` is a local configuration file and must not be committed to the repository.

## Local Installation

### 1. Open the backend folder

```powershell
cd backend
```

### 2. Create a virtual environment

```powershell
py -m venv .venv
```

### 3. Activate the environment

```powershell
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, use the virtual environment's Python executable directly.

### 4. Install dependencies

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 5. Configure environment variables

Copy the example environment file:

```powershell
Copy-Item .env.example .env
```

Open `.env` and configure the required NVIDIA API key:

```env
NVIDIA_API_KEY=your_nvidia_api_key
```

Replace the example value with your own key. Never publish the real value.

### 6. Start the server

```powershell
uvicorn main:app --reload
```

The local backend should now be available at:

```text
http://127.0.0.1:8000
```

---

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Backend service information |
| GET | `/health` | Health and configuration status |
| POST | `/api/chat` | Send a message to the AI Chat service |
| GET | `/docs` | Interactive API documentation |

### Health Check

Open:

```text
http://127.0.0.1:8000/health
```

The response should indicate:

- `status: ok`
- The backend service is running.
- Whether the NVIDIA API key is configured.

The configuration status does not guarantee that NVIDIA is reachable. A successful AI Chat request is a separate connectivity test.

### Interactive API Documentation

Open:

```text
http://127.0.0.1:8000/docs
```

Use the Swagger interface to inspect the available endpoints and their actual request and response schemas.

### AI Chat

Endpoint:

```http
POST /api/chat
```

The endpoint accepts chat requests and communicates with NVIDIA through the backend.

For the exact request format, required fields, validation rules, and response structure, refer to the deployed API documentation at `/docs`.

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `NVIDIA_API_KEY` | Authenticates requests to NVIDIA AI services |

Keep environment variables on the server. Do not place API keys in:

- `index.html`
- Frontend JavaScript files
- Public GitHub repositories
- Browser local storage
- Client-side configuration files

---

## Deployment

The EcoFilament backend is deployed through Enzonic.

The deployed service is available at:

https://ecofilament-ai.enzonic.dev

Useful links:

- [Backend Service](https://ecofilament-ai.enzonic.dev)
- [Health Check](https://ecofilament-ai.enzonic.dev/health)
- [API Documentation](https://ecofilament-ai.enzonic.dev/docs)
- [Enzonic Deployment Dashboard](https://deploy.enzonic.com/projects/01m7zt0vh8sdpf0kzfhyjhke94)

Configure `NVIDIA_API_KEY` through the deployment environment settings. Do not commit production credentials.

---

## Testing

Before deploying backend changes:

1. Install the required Python dependencies.
2. Start the backend locally.
3. Check `/` and `/health`.
4. Inspect `/docs`.
5. Test `/api/chat` with a valid request.
6. Verify Arabic and English responses.
7. Verify that invalid requests return appropriate errors.
8. Check that secrets are not included in responses or logs.

The frontend also has Playwright end-to-end tests. These are executed separately through GitHub Actions.

---

## Troubleshooting

### Backend does not start

Check:

- Python version.
- Installed dependencies.
- Correct working directory.
- Port availability.
- Enzonic deployment logs when running in production.

### NVIDIA API request fails

Check:

- Whether `NVIDIA_API_KEY` is configured.
- Whether the key is valid.
- NVIDIA service availability.
- Request timeout and backend logs.

Never print the API key while debugging.

### CORS errors

Verify that the frontend origin is included in the backend's allowed CORS origins.

Remember that CORS is a browser security mechanism, not API authentication.

### Health check succeeds but AI Chat fails

A successful health check confirms that the backend is running. It does not necessarily confirm that the external NVIDIA API is reachable.

Test `/api/chat` separately.

---

## Security

- Never commit `.env`.
- Never publish API keys or access tokens.
- Keep NVIDIA credentials exclusively on the backend.
- Restrict CORS to trusted frontend origins.
- Validate incoming messages and conversation history.
- Apply appropriate request limits and timeout handling.
- Avoid logging confidential information.
- Rotate credentials immediately if they are exposed.

## Development Roadmap

- [x] Initial FastAPI backend.
- [x] NVIDIA AI Chat integration.
- [x] Arabic and English chat support.
- [x] Frontend integration.
- [x] Backend deployment.
- [x] Playwright end-to-end test workflow.
- [ ] NVIDIA-powered AI Presenter TTS.
- [ ] Improved speech quality and presentation delivery.
- [ ] Additional backend monitoring and production protections.

---

**Project:** EcoFilament  
**Repository:** https://github.com/Yassir050/EcoFilament  
**Backend:** FastAPI  
**AI Provider:** NVIDIA
