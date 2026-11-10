# PROJECT_STRUCTURE.md — Monarch AI Bot (Server)

---

## A. Project Overview

| Field | Details |
|---|---|
| **Project Name** | Monarch AI Bot (Server) |
| **Project Purpose** | A containerized, production-ready backend REST API chatbot deployed on Render. Features dual-layer authentication (HTTP Basic Auth issuing single-active JWT tokens alongside guest user 24-hour expiration), persistent conversations and messages in PostgreSQL (Neon), and LLM completions via Groq API. |
| **Main Technologies** | Python 3.14, FastAPI, Uvicorn, Groq SDK, PostgreSQL (Neon), psycopg 3, PyJWT, Pydantic, python-dotenv, uv, Docker, Render |
| **High-Level Architecture** | Dockerized backend REST API hosted on Render. Inbound requests to protected endpoints require Bearer JWT authentication verified against an active database token record (`api_active_token`). In addition, end-user guest accounts are managed with 24-hour validity windows. Business logic is organized into `APIAuth/`, `auth/`, `chat/`, `chat_Management/`, and `LLM/` modules. Data persistence is managed via Neon PostgreSQL, and AI inference is powered by Groq. |

---

## B. Complete Directory Structure

```text
server/
├── APIAuth/
│   ├── basic_auth.py
│   │   └── verify_basic_auth() — Verifies HTTP Basic Auth credentials against configured environment variables using secure constant-time comparison.
│   ├── generate_jwt.py
│   │   └── generate_jwt() — Generates a signed HS256 JWT access token containing a unique UUID identifier (jti) and issue timestamp.
│   ├── token_database.py
│   │   ├── store_active_token() — Inserts or updates the single active JWT identifier in the api_active_token database table.
│   │   └── verify_active_token() — Checks whether a supplied JWT identifier matches the active token record in the database.
│   └── verify_jwt.py
│       └── verify_jwt() — Decodes and verifies the signature, algorithm, payload, and active database status of a JWT access token.
│
├── auth/
│   ├── database.py
│   │   └── get_db_connection() — Establishes and returns a connection to Neon PostgreSQL using DATABASE_URL.
│   ├── login.py
│   │   └── login() — Authenticates a user by matching username and UUID, enforcing a 24-hour validity window.
│   └── signup.py
│       └── signup() — Validates username, generates a UUID v4, and inserts a new guest user into the database.
│
├── chat/
│   ├── chat_service.py
│   │   └── chat_service() — Orchestrates the full chat flow: validates user, checks eligibility, manages conversation, retrieves history, calls LLM, saves message, and returns the response.
│   ├── create_chat.py
│   │   └── create_chat() — Inserts a new conversation into the conversations table and returns its metadata.
│   ├── get_history.py
│   │   └── get_chat_history() — Retrieves all messages for a specific conversation ordered chronologically.
│   └── save_message.py
│       └── save_message() — Persists a question-answer pair to the messages table and updates the conversation timestamp.
│
├── chat_Management/
│   ├── chat_history.py
│   │   └── chat_history() — Validates UUID formats and delegates to get_chat_history to retrieve conversation messages.
│   └── get_all_chats.py
│       └── get_all_chats() — Retrieves all conversations belonging to a user ordered by most recently updated.
│
├── LLM/
│   ├── groq_chat.py
│   │   └── groq_chat() — Builds a messages array from history and system prompt, calls Groq chat completions, and returns the generated response with token usage.
│   ├── groq_connection.py
│   │   ├── format_created_date() — Converts a Unix timestamp into a human-readable UTC date string.
│   │   └── get_available_models() — Fetches all active models from the Groq API and returns their metadata.
│   └── prompt.py
│       └── SYSTEM_PROMPT — System prompt constant defining persona, conciseness, and behavior guidelines.
│
├── .dockerignore
├── .env
├── .gitignore
├── .python-version
├── Dockerfile
├── main.py
│   ├── health_check() — GET /health handler; reports server operational status.
│   ├── require_basic_auth() — FastAPI dependency; extracts and validates HTTP Basic Auth credentials.
│   ├── require_jwt() — FastAPI dependency; extracts, validates, and checks active database status of Bearer JWT credentials.
│   ├── create_access_token() — POST /token handler; authenticates via Basic Auth and generates a new active JWT access token.
│   ├── available_models() — GET /models handler; retrieves all available Groq LLM models (requires JWT).
│   ├── user_signup() — POST /signup handler; registers a new guest user (requires JWT).
│   ├── user_login() — POST /login handler; authenticates a user with username and UUID (requires JWT).
│   ├── user_chat() — POST /chat handler; sends a message and returns the LLM response (requires JWT).
│   ├── user_chat_history() — POST /chat/history handler; retrieves message history for a conversation (requires JWT).
│   └── user_all_chats() — POST /chats handler; retrieves all conversations for a user (requires JWT).
├── pyproject.toml
└── uv.lock
```

---

## C. Dependency Overview

### Backend Dependencies (from `pyproject.toml`)

| Package | Version | Purpose |
|---|---|---|
| `fastapi` | ≥ 0.162.0 | High-performance web framework for building the REST API, dependencies, and OpenAPI documentation |
| `uvicorn` | ≥ 0.54.0 | ASGI web server used to run the FastAPI application |
| `groq` | ≥ 1.7.0 | Official Groq SDK for LLM chat completions and dynamic model catalog discovery |
| `psycopg[binary]` | ≥ 3.3.8 | PostgreSQL database adapter (psycopg 3) for relational data persistence |
| `pyjwt` | ≥ 2.15.1 | JSON Web Token encoding, decoding, signature verification, and payload claims validation |
| `dotenv` | ≥ 0.9.9 | Loads environment variables from `.env` file |
| `pydantic` | (bundled with FastAPI) | Request validation, payload schema definition, and serialization |

### Database

| Service | Purpose |
|---|---|
| Neon PostgreSQL | Serverless cloud-hosted PostgreSQL database for storing user accounts, active JWT metadata, conversations, and message history |

### External Services and APIs

| Service | Purpose |
|---|---|
| Groq API | High-throughput cloud LLM inference platform for model catalog queries and chat completions |
| Render | Cloud platform hosting the containerized Docker web service with automatic deployment and TLS termination |

### Development and Deployment Tools

| Tool | Purpose |
|---|---|
| `uv` | Fast Python package and project manager; manages dependencies and generates `uv.lock` |
| `Docker` | Multi-stage slim container packaging (`python:3.14-slim`) running Uvicorn on port 8000 |

### Frontend Dependencies

The frontend application is maintained independently in the `client/` workspace; there are no frontend dependencies within the server package.

---

## D. Database Structure

The database schema is inferred from SQL queries executed across the codebase on **Neon PostgreSQL**.

### Table: `api_active_token`

Maintains the single currently active JWT identifier for API access. When a new token is generated, the record with `id = 1` is updated, immediately revoking previous tokens.

| Column | Data Type (inferred) | Constraints | Description |
|---|---|---|---|
| `id` | `INTEGER` | Primary Key, Default `1` | Singleton row identifier ensuring only one active token exists globally. |
| `jti` | `UUID` | Not Null | Unique identifier of the currently authorized JWT access token. |
| `created_at` | `TIMESTAMP` | Not Null, Default `NOW()` | Timestamp when the active token was generated or replaced. |

### Table: `users`

Stores end-user guest accounts and enforces the 24-hour expiration window.

| Column | Data Type (inferred) | Constraints | Description |
|---|---|---|---|
| `user_uuid` | `UUID` | Primary Key | Unique identifier for the user, generated server-side via `uuid.uuid4()`. |
| `username` | `VARCHAR(50)` | Unique (`users_username_key`), Not Null | Case-sensitive user-chosen display name. |
| `created_at` | `TIMESTAMP` | Not Null, Default `NOW()` | Account creation timestamp used to evaluate the 24-hour validity condition. |

### Table: `conversations`

Stores conversation threads associated with a guest user.

| Column | Data Type (inferred) | Constraints | Description |
|---|---|---|---|
| `chat_id` | `UUID` | Primary Key, Default generated | Unique conversation identifier. |
| `user_uuid` | `UUID` | Foreign Key → `users.user_uuid`, Not Null | Owner of the conversation. |
| `title` | `VARCHAR` / `TEXT` | Nullable | Conversation title (reserved for future title generation). |
| `created_at` | `TIMESTAMP` | Not Null, Default `NOW()` | Timestamp of conversation creation. |
| `updated_at` | `TIMESTAMP` | Not Null, Default `NOW()` | Timestamp of latest conversation activity. Updated on every `save_message` call. |

### Table: `messages`

Stores individual question-answer exchanges within conversations.

| Column | Data Type (inferred) | Constraints | Description |
|---|---|---|---|
| `message_id` | `UUID` | Primary Key, Default generated | Unique message exchange identifier. |
| `user_uuid` | `UUID` | Foreign Key → `users.user_uuid`, Not Null | User who submitted the message. |
| `chat_id` | `UUID` | Foreign Key → `conversations.chat_id`, Not Null | Conversation to which this exchange belongs. |
| `question` | `TEXT` | Not Null | User prompt/query submitted to the LLM. |
| `answer` | `TEXT` | Not Null | Response content generated by the LLM. |
| `model` | `VARCHAR` / `TEXT` | Not Null | Groq model identifier used to generate the answer. |
| `created_at` | `TIMESTAMP` | Not Null, Default `NOW()` | Timestamp when the message exchange occurred. |

### Relational Schema

```text
api_active_token (singleton active token record)

users.user_uuid ──< conversations.user_uuid
users.user_uuid ──< messages.user_uuid
conversations.chat_id ──< messages.chat_id
```

### Database Models and Source Locations

No ORM is used; all operations execute raw parameterized SQL via `psycopg`:
- `APIAuth/token_database.py` — manages upsert and lookup in `api_active_token`
- `auth/database.py` — connection factory (`get_db_connection`)
- `auth/signup.py` — inserts new records into `users`
- `auth/login.py` — selects and validates records in `users`
- `chat/chat_service.py` — validates ownership and validity in `users` and `conversations`
- `chat/create_chat.py` — inserts new records into `conversations`
- `chat/get_history.py` — selects chronological messages from `messages`
- `chat/save_message.py` — inserts new records into `messages` and updates `conversations.updated_at`
- `chat_Management/get_all_chats.py` — selects user threads from `conversations`

### Migrations

No migration scripts exist in the repository; tables are provisioned directly in PostgreSQL.

---

## E. API Inventory

| Method | Endpoint | File | Function | Auth Requirement | Purpose |
|---|---|---|---|---|---|
| `GET` | `/health` | `main.py` | `health_check` | None | Public health check verifying the server is operational. |
| `POST` | `/token` | `main.py` | `create_access_token` | HTTP Basic Auth (`API_AUTH_USERNAME`, `API_AUTH_PASSWORD`) | Issues a new HS256 JWT access token and registers its `jti` in `api_active_token`. |
| `GET` | `/models` | `main.py` | `available_models` | HTTP Bearer JWT | Retrieves all active Groq LLM models and their metadata. |
| `POST` | `/signup` | `main.py` | `user_signup` | HTTP Bearer JWT | Registers a new guest user with a unique username; returns user UUID. |
| `POST` | `/login` | `main.py` | `user_login` | HTTP Bearer JWT | Authenticates a guest user with username + UUID within the 24-hour period. |
| `POST` | `/chat` | `main.py` | `user_chat` | HTTP Bearer JWT | Sends a user message, calls Groq LLM, stores question/answer, and returns the response. |
| `POST` | `/chat/history` | `main.py` | `user_chat_history` | HTTP Bearer JWT | Retrieves full chronological message history for a conversation. |
| `POST` | `/chats` | `main.py` | `user_all_chats` | HTTP Bearer JWT | Retrieves all conversation threads belonging to a user. |

### Authentication Scheme Details

1. **HTTP Basic Auth (`POST /token`):**
   - Header: `Authorization: Basic <base64(username:password)>`
   - Validated against `API_AUTH_USERNAME` and `API_AUTH_PASSWORD` via `hmac.compare_digest`.
   - On success, generates a signed JWT and writes `jti` to `api_active_token (id=1)`.
2. **HTTP Bearer JWT (Protected Endpoints):**
   - Header: `Authorization: Bearer <token>`
   - Validates cryptographic signature using `JWT_SECRET` (HS256).
   - Validates required claims `jti` and `iat`.
   - Verifies `jti` against `api_active_token` in the database to guarantee the token has not been superseded.
3. **End-User Guest Authorization (Application Layer):**
   - Validates `user_uuid` existence in the `users` table.
   - Enforces `created_at > NOW() - INTERVAL '24 hours'`.

---

## F. Environment Configuration

| Variable | Purpose | Used By | Required |
|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection URI for Neon database | `auth/database.py` | **Yes** |
| `GROQ_API_KEY` | API key for Groq cloud LLM platform | `LLM/groq_connection.py`, `LLM/groq_chat.py` | **Yes** |
| `API_AUTH_USERNAME` | Username required for HTTP Basic Auth to issue JWT tokens | `APIAuth/basic_auth.py` | **Yes** |
| `API_AUTH_PASSWORD` | Password required for HTTP Basic Auth to issue JWT tokens | `APIAuth/basic_auth.py` | **Yes** |
| `JWT_SECRET` | Cryptographic secret key (minimum 32 bytes) for HS256 JWT signing and verification | `APIAuth/generate_jwt.py`, `APIAuth/verify_jwt.py` | **Yes** |
| `JWT_ALGORITHM` | JWT signing algorithm (defaults to `HS256`) | `APIAuth/generate_jwt.py`, `APIAuth/verify_jwt.py` | Optional (default: `HS256`) |

> **Security Note:** Environment variables are loaded via `dotenv` locally and supplied via Render Environment Settings in production. No secret values are hardcoded in the repository.

