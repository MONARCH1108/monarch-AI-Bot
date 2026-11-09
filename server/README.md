# Monarch AI Bot (Server)

**A containerized, production-grade AI chatbot REST API built with FastAPI, Groq, and PostgreSQL, deployed on Render.**

---

## Project Description

Monarch AI Bot is a backend REST API that enables authenticated clients to interact with LLM models hosted on Groq. The service features a dual-layer security model: API clients authenticate via HTTP Basic Auth to receive signed JWT tokens tracked in PostgreSQL (enforcing a single active token architecture), while end-users register as guest users with a 24-hour expiration window. All conversation threads and message histories are persisted in Neon PostgreSQL.

## Project Vision

To provide a lightweight, secure, and easily deployable AI backend suitable for microservices, mobile apps, and frontend web clients, featuring multi-model inference, active token lifecycle management, and ephemeral guest user sessions.

---

## Current Implementation Status

| Feature | Status |
|---|---|
| Health check endpoint (`GET /health`) | ✅ Implemented |
| HTTP Basic Auth token generation (`POST /token`) | ✅ Implemented |
| JWT issuance (HS256) & active database verification (`api_active_token`) | ✅ Implemented |
| Single active token enforcement (automatic revocation of older tokens) | ✅ Implemented |
| Guest user signup (`POST /signup`) | ✅ Implemented |
| Guest user login with 24-hour expiration window (`POST /login`) | ✅ Implemented |
| Multi-model catalog discovery via Groq (`GET /models`) | ✅ Implemented |
| Conversational chat with context memory & Groq LLM completions (`POST /chat`) | ✅ Implemented |
| Message persistence & conversation thread management | ✅ Implemented |
| Conversation history retrieval (`POST /chat/history`) | ✅ Implemented |
| User conversation listing (`POST /chats`) | ✅ Implemented |
| Token usage tracking per response | ✅ Implemented |
| Docker containerization (`Dockerfile`, `.dockerignore`) | ✅ Implemented |
| Render cloud deployment | ✅ Deployed |
| Frontend web application | ❌ Not implemented |
| Streaming LLM responses (SSE / WebSockets) | ❌ Not implemented |
| Automatic conversation title generation | ❌ Not implemented |
| Automated background database cleanup cron jobs | ❌ Not implemented |

---

## Technology Stack

| Technology | Role |
|---|---|
| **Python 3.14** | Primary programming language |
| **FastAPI** | Modern, high-performance web framework for the REST API |
| **Uvicorn** | ASGI web server hosting the application |
| **Groq SDK** | High-speed LLM inference provider for chat completions and model metadata |
| **PostgreSQL (Neon)** | Cloud serverless relational database |
| **psycopg 3** | Database adapter for direct, parameterized SQL connectivity |
| **PyJWT** | Cryptographic signing and decoding of JSON Web Tokens |
| **Pydantic** | Request body validation and data serialization |
| **python-dotenv** | Environment variable management |
| **uv** | Ultra-fast Python package and project manager |
| **Docker** | Containerization with lightweight multi-stage Python 3.14-slim image |
| **Render** | Cloud hosting platform managing the Docker web service and TLS |

---

## Architecture Overview

```
API Client
    │
    ▼ [HTTPS]
Render Web Service (Docker Container on Port 8000)
    │
    ▼
FastAPI Application (main.py)
    │
    ├── Public: GET /health
    │
    ├── Basic Auth: POST /token ──► APIAuth/ (Issues JWT & records jti in DB)
    │
    └── Protected (Requires Bearer JWT + DB Verification):
          ├── GET /models          ──► LLM/ (Groq API)
          ├── POST /signup         ──► auth/ (Neon PostgreSQL)
          ├── POST /login          ──► auth/ (24-Hour Expiration Check)
          ├── POST /chat           ──► chat/ ──► LLM/ (Groq API) & Neon PostgreSQL
          ├── POST /chat/history   ──► chat_Management/ (Neon PostgreSQL)
          └── POST /chats          ──► chat_Management/ (Neon PostgreSQL)
```

---

## Repository Structure

```
server/
├── APIAuth/                 # API security & JWT lifecycle
│   ├── basic_auth.py        # HTTP Basic Auth verification
│   ├── generate_jwt.py      # HS256 JWT generator
│   ├── token_database.py    # Active token (jti) DB upsert & check
│   └── verify_jwt.py        # JWT decode & active state verification
├── auth/                    # Guest user identity module
│   ├── database.py          # PostgreSQL connection factory
│   ├── login.py             # User login with 24-hour eligibility
│   └── signup.py            # Guest user registration
├── chat/                    # Core chat orchestration module
│   ├── chat_service.py      # Message flow, history prep, LLM call
│   ├── create_chat.py       # Thread creation
│   ├── get_history.py       # Chronological message retrieval
│   └── save_message.py      # Message persistence & timestamp update
├── chat_Management/         # Thread & history management
│   ├── chat_history.py      # Validated message history access
│   └── get_all_chats.py     # User conversation listing
├── Documents/               # Technical specifications
│   ├── PROJECT_FLOWS.md     # Detailed application & authentication flows
│   ├── PROJECT_STRUCTURE.md # Complete technical inventory & directory tree
│   └── PROMPT.md            # Maintenance instructions
├── LLM/                     # LLM integration module
│   ├── groq_chat.py         # Groq chat completions
│   ├── groq_connection.py   # Groq model catalog listing
│   └── prompt.py            # System prompt configuration
├── .dockerignore
├── .env
├── .gitignore
├── .python-version
├── Dockerfile               # Container build definition
├── main.py                  # FastAPI entry point & route definitions
├── pyproject.toml           # Project metadata & dependencies
├── README.md
└── uv.lock                  # Pinned dependency lockfile
```

---

## Getting Started

### Prerequisites

- **Python 3.14+**
- **uv** package manager ([Install Guide](https://docs.astral.sh/uv/getting-started/installation/))
- **Docker** (optional, for local container runs)
- **Neon PostgreSQL** database instance
- **Groq API Key** ([Console](https://console.groq.com/))

### Installation

1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```

2. Install dependencies with `uv`:
   ```bash
   uv sync
   ```

### Environment Configuration

Create a `.env` file in the `server/` directory:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection URI (e.g., Neon connection string) |
| `GROQ_API_KEY` | Yes | API key for Groq LLM inference service |
| `API_AUTH_USERNAME` | Yes | Username for Basic Auth to issue JWT tokens |
| `API_AUTH_PASSWORD` | Yes | Password for Basic Auth to issue JWT tokens |
| `JWT_SECRET` | Yes | Secret key (minimum 32 bytes) for signing JWTs |
| `JWT_ALGORITHM` | Optional | Algorithm for JWT (default: `HS256`) |

Example `.env`:
```ini
DATABASE_URL=postgresql://user:password@ep-host.neon.tech/neondb?sslmode=require
GROQ_API_KEY=gsk_your_groq_api_key_here
API_AUTH_USERNAME=admin
API_AUTH_PASSWORD=SuperSecretPassword123!
JWT_SECRET=super-secret-key-that-is-at-least-32-bytes-long!
JWT_ALGORITHM=HS256
```

> ⚠️ Never commit `.env` to source control. It is ignored by both `.gitignore` and `.dockerignore`.

### Database Setup

Ensure the following tables exist in your PostgreSQL database:

1. **`api_active_token`**:
   ```sql
   CREATE TABLE IF NOT EXISTS api_active_token (
       id INTEGER PRIMARY KEY DEFAULT 1,
       jti UUID NOT NULL,
       created_at TIMESTAMP NOT NULL DEFAULT NOW()
   );
   ```

2. **`users`**:
   ```sql
   CREATE TABLE IF NOT EXISTS users (
       user_uuid UUID PRIMARY KEY,
       username VARCHAR(50) UNIQUE NOT NULL,
       created_at TIMESTAMP NOT NULL DEFAULT NOW()
   );
   ```

3. **`conversations`**:
   ```sql
   CREATE TABLE IF NOT EXISTS conversations (
       chat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       user_uuid UUID REFERENCES users(user_uuid) ON DELETE CASCADE,
       title TEXT,
       created_at TIMESTAMP NOT NULL DEFAULT NOW(),
       updated_at TIMESTAMP NOT NULL DEFAULT NOW()
   );
   ```

4. **`messages`**:
   ```sql
   CREATE TABLE IF NOT EXISTS messages (
       message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       user_uuid UUID REFERENCES users(user_uuid) ON DELETE CASCADE,
       chat_id UUID REFERENCES conversations(chat_id) ON DELETE CASCADE,
       question TEXT NOT NULL,
       answer TEXT NOT NULL,
       model TEXT NOT NULL,
       created_at TIMESTAMP NOT NULL DEFAULT NOW()
   );
   ```

---

## Running the Application

### Running the Frontend
No frontend application currently exists in this repository.

### Running the Backend Locally

```bash
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Interactive API documentation will be available at `http://127.0.0.1:8000/docs`.

### Running with Docker

1. **Build the Docker container:**
   ```bash
   docker build -t monarch-ai-bot:latest .
   ```

2. **Run the container with your `.env` file:**
   ```bash
   docker run --env-file .env -p 8000:8000 monarch-ai-bot:latest
   ```

### Render Deployment

The server is configured for deployment on **Render** as a Docker Web Service:
- **Build Command:** Automatically handled via `server/Dockerfile`.
- **Environment Variables:** Configured in the Render dashboard (`DATABASE_URL`, `GROQ_API_KEY`, `API_AUTH_USERNAME`, `API_AUTH_PASSWORD`, `JWT_SECRET`, `JWT_ALGORITHM`).
- **Health Check Path:** `/health`.
- **Port:** `8000`.

---

## API Overview

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| `GET` | `/health` | Public | Server uptime and health verification |
| `POST` | `/token` | HTTP Basic Auth | Generate and activate a JWT access token |
| `GET` | `/models` | Bearer JWT | List active Groq LLM models |
| `POST` | `/signup` | Bearer JWT | Register a guest user |
| `POST` | `/login` | Bearer JWT | Authenticate guest user (24-hour limit) |
| `POST` | `/chat` | Bearer JWT | Send a message and receive an LLM completion |
| `POST` | `/chat/history` | Bearer JWT | Retrieve full chat history for a thread |
| `POST` | `/chats` | Bearer JWT | List all conversation threads for a user |

---

## Documentation References

For exhaustive technical flows and complete architectural inventories:
- **[PROJECT_STRUCTURE.md](Documents/PROJECT_STRUCTURE.md)**: Full tree breakdown with function descriptions, database schema, and endpoint listings.
- **[PROJECT_FLOWS.md](Documents/PROJECT_FLOWS.md)**: Complete step-by-step traces, Mermaid sequence diagrams, LLM context flow, and error handling layers.

---

## Security and Privacy Considerations

- **Constant-Time Verification:** HTTP Basic Auth credentials are verified using `hmac.compare_digest` to prevent timing attacks.
- **Single Active Token Architecture:** Storing the active token's `jti` in `api_active_token (id=1)` ensures immediate invalidation of previous tokens upon new generation.
- **Guest Expiration:** Guest user accounts are constrained to a 24-hour lifespan evaluated via SQL (`created_at > NOW() - INTERVAL '24 hours'`).
- **Secret Isolation:** All secrets, keys, and credentials are provided via environment variables and excluded from image layers and repositories.

---

## Project Roadmap

- [ ] Frontend client (React / Next.js)
- [ ] Streaming LLM responses (Server-Sent Events)
- [ ] Automatic conversation title summarization
- [ ] Automated background pruning of expired guest accounts
- [ ] Per-IP rate limiting middleware
- [ ] Conversation and account deletion endpoints

---

## License

No license file is currently included in the repository.
