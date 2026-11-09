# PROJECT_STRUCTURE.md — Monarch AI Bot

---

## A. Project Overview

| Field | Details |
|---|---|
| **Project Name** | Monarch AI Bot |
| **Project Purpose** | A backend REST API chatbot that allows guest users to sign up, log in (within a 24-hour window), and interact with LLM models through the Groq API. Conversations and messages are persisted in a PostgreSQL database. |
| **Main Technologies** | Python 3.14, FastAPI, Groq SDK, PostgreSQL (Neon), psycopg 3, Pydantic, uvicorn, python-dotenv |
| **High-Level Architecture** | Backend-only REST API. FastAPI serves HTTP endpoints; business logic is organized into `auth/`, `chat/`, `chat_Management/`, and `LLM/` modules. Data is persisted in a Neon PostgreSQL database. LLM completions are generated via the Groq cloud API. No frontend exists in this repository. |

---

## B. Complete Directory Structure

```
monarch-AI-Bot/
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
├── Documents/
│   ├── PROJECT_FLOWS.md
│   ├── PROJECT_STRUCTURE.md
│   └── PROMPT.md
│
├── LLM/
│   ├── groq_chat.py
│   │   └── groq_chat() — Builds a messages array from history and system prompt, calls Groq chat completions, and returns the generated response with token usage.
│   ├── groq_connection.py
│   │   ├── format_created_date() — Converts a Unix timestamp into a human-readable UTC date string.
│   │   └── get_available_models() — Fetches all active models from the Groq API and returns their metadata.
│   └── prompt.py
│
├── .gitignore
├── .python-version
├── main.py
│   ├── available_models() — GET /models handler; retrieves all available Groq LLM models.
│   ├── user_signup() — POST /signup handler; registers a new guest user.
│   ├── user_login() — POST /login handler; authenticates a user with username and UUID.
│   ├── user_chat() — POST /chat handler; sends a message and returns the LLM response.
│   ├── user_chat_history() — POST /chat/history handler; retrieves message history for a conversation.
│   └── user_all_chats() — POST /chats handler; retrieves all conversations for a user.
├── pyproject.toml
├── README.md
└── uv.lock
```

---

## E. Dependency Overview

### Backend Dependencies (from `pyproject.toml`)

| Package | Version | Purpose |
|---|---|---|
| `fastapi` | ≥ 0.162.0 | Web framework for building the REST API |
| `uvicorn` | ≥ 0.54.0 | ASGI server to run the FastAPI application |
| `groq` | ≥ 1.7.0 | Official Groq SDK for LLM chat completions and model listing |
| `psycopg[binary]` | ≥ 3.3.8 | PostgreSQL adapter (psycopg 3) for database connectivity |
| `dotenv` | ≥ 0.9.9 | Loads environment variables from `.env` file |
| `pydantic` | (bundled with FastAPI) | Request body validation and serialization |

### Database

| Service | Purpose |
|---|---|
| Neon PostgreSQL | Cloud-hosted PostgreSQL database for user, conversation, and message persistence |

### External Services and APIs

| Service | Purpose |
|---|---|
| Groq API | Cloud LLM inference provider — used for chat completions and model listing |

### Development Tools

| Tool | Purpose |
|---|---|
| `uv` | Python package and project manager (generates `uv.lock`) |

### Frontend Dependencies

No frontend exists in this repository. There are no frontend dependencies.

### Development and Testing Dependencies

No dedicated testing framework or development-only dependencies are declared in `pyproject.toml`.

---

## F. Database Structure

The database schema is inferred from SQL queries in the codebase. The database is hosted on **Neon PostgreSQL**.

### Table: `users`

| Column | Data Type (inferred) | Constraints | Description |
|---|---|---|---|
| `user_uuid` | `UUID` | Primary Key | Unique identifier for the user, generated server-side via `uuid.uuid4()`. |
| `username` | `VARCHAR(50)` | Unique (`users_username_key`), Not Null | User-chosen display name. Case-sensitive. |
| `created_at` | `TIMESTAMP` | Not Null, Default `NOW()` | Timestamp of account creation. Used to enforce the 24-hour validity window. |

### Table: `conversations`

| Column | Data Type (inferred) | Constraints | Description |
|---|---|---|---|
| `chat_id` | `UUID` | Primary Key, Default generated | Unique conversation identifier. |
| `user_uuid` | `UUID` | Foreign Key → `users.user_uuid`, Not Null | Owner of the conversation. |
| `title` | `VARCHAR` / `TEXT` | Nullable | Conversation title (returned as-is; no title generation logic is implemented). |
| `created_at` | `TIMESTAMP` | Not Null, Default `NOW()` | Timestamp of conversation creation. |
| `updated_at` | `TIMESTAMP` | Not Null, Default `NOW()` | Timestamp of last activity. Updated on each `save_message` call. |

### Table: `messages`

| Column | Data Type (inferred) | Constraints | Description |
|---|---|---|---|
| `message_id` | `UUID` | Primary Key, Default generated | Unique message identifier. |
| `user_uuid` | `UUID` | Foreign Key → `users.user_uuid`, Not Null | User who sent the message. |
| `chat_id` | `UUID` | Foreign Key → `conversations.chat_id`, Not Null | Conversation this message belongs to. |
| `question` | `TEXT` | Not Null | The user's input message. |
| `answer` | `TEXT` | Not Null | The LLM-generated response. |
| `model` | `VARCHAR` / `TEXT` | Not Null | The LLM model ID that generated the answer. |
| `created_at` | `TIMESTAMP` | Not Null, Default `NOW()` | Timestamp of message creation. |

### Relationships

```
users.user_uuid  ──<  conversations.user_uuid
users.user_uuid  ──<  messages.user_uuid
conversations.chat_id  ──<  messages.chat_id
```

### Unique Constraints

- `users_username_key` — enforces uniqueness on `users.username` (referenced in signup error handling).

### Database Models and Files

There are no ORM model classes. Database interactions are performed via raw SQL queries using `psycopg` in the following files:
- `auth/database.py` — connection factory
- `auth/signup.py` — inserts into `users`
- `auth/login.py` — selects from `users`
- `chat/chat_service.py` — selects from `users` and `conversations`
- `chat/create_chat.py` — inserts into `conversations`
- `chat/get_history.py` — selects from `messages`
- `chat/save_message.py` — inserts into `messages`, updates `conversations`
- `chat_Management/get_all_chats.py` — selects from `conversations`

### Migrations

No migration files or migration framework was found in the repository.

---

## G. API Inventory

| Method | Endpoint | File | Function | Purpose |
|---|---|---|---|---|
| `GET` | `/models` | `main.py` | `available_models` | Retrieve all available Groq LLM models and their metadata. |
| `POST` | `/signup` | `main.py` | `user_signup` | Register a new guest user with a username. Returns user UUID. |
| `POST` | `/login` | `main.py` | `user_login` | Authenticate a user with username + UUID. Enforces 24-hour validity. |
| `POST` | `/chat` | `main.py` | `user_chat` | Send a message and receive an LLM response. Creates a new conversation if `chat_id` is not provided. |
| `POST` | `/chat/history` | `main.py` | `user_chat_history` | Retrieve full message history for a specific conversation. |
| `POST` | `/chats` | `main.py` | `user_all_chats` | Retrieve all conversations belonging to a user. |

### Authentication

There is no token-based or session-based authentication middleware. User identity is verified per-request by matching `user_uuid` (and `username` for login) against database records. The 24-hour account expiration is checked in `login` and `chat_service`.

### Request/Response Details

All endpoints accept and return `application/json`. Request bodies are validated using Pydantic models defined in `main.py`:

| Pydantic Model | Fields | Used By |
|---|---|---|
| `SignupRequest` | `username: str` | `POST /signup` |
| `LoginRequest` | `username: str`, `user_uuid: str` | `POST /login` |
| `ChatRequest` | `user_uuid: str`, `model: str`, `message: str`, `chat_id: str \| None` | `POST /chat` |
| `ChatHistoryRequest` | `user_uuid: str`, `chat_id: str` | `POST /chat/history` |
| `AllChatsRequest` | `user_uuid: str` | `POST /chats` |

---

## H. Environment Configuration

| Variable | Purpose | Used By | Required |
|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string for Neon database | `auth/database.py` | **Yes** |
| `GROQ_API_KEY` | API key for authenticating with the Groq cloud API | `LLM/groq_connection.py`, `LLM/groq_chat.py` | **Yes** |

Both variables are loaded from a `.env` file using `python-dotenv`. The `.env` file is excluded from version control via `.gitignore`.

No actual secret values, API keys, or credentials are exposed in this documentation.
