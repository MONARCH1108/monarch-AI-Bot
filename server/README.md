# Monarch AI Bot

**An AI-powered chatbot API built with FastAPI and Groq.**

---

## Project Description

Monarch AI Bot is a backend REST API that allows guest users to register, authenticate, and chat with LLM models hosted on the Groq platform. Users sign up with a username, receive a unique UUID, and can interact with available AI models through a conversational interface. All conversations and messages are persisted in a PostgreSQL database.

## Project Vision

To provide a lightweight, self-hostable AI chatbot backend with simple guest authentication, multi-model support via Groq, and conversation history — designed for experimentation and learning.

---

## Current Implementation Status

| Feature | Status |
|---|---|
| Guest user signup | ✅ Implemented |
| User login (username + UUID) | ✅ Implemented |
| 24-hour account expiration | ✅ Implemented |
| Chat with LLM models via Groq | ✅ Implemented |
| Multi-model support (dynamic model listing) | ✅ Implemented |
| Conversation creation and management | ✅ Implemented |
| Message persistence (question + answer) | ✅ Implemented |
| Conversation history retrieval | ✅ Implemented |
| List all user conversations | ✅ Implemented |
| Token usage tracking (per response) | ✅ Implemented |
| Frontend application | ❌ Not implemented |
| Token/session-based authentication | ❌ Not implemented |
| Streaming responses | ❌ Not implemented |
| Conversation title generation | ❌ Not implemented |
| Account/data cleanup (expired users) | ❌ Not implemented |

---

## Technology Stack

| Technology | Role |
|---|---|
| **Python 3.14** | Programming language |
| **FastAPI** | Web framework for the REST API |
| **Uvicorn** | ASGI server |
| **Groq SDK** | LLM inference provider (chat completions + model listing) |
| **PostgreSQL (Neon)** | Cloud-hosted relational database |
| **psycopg 3** | PostgreSQL adapter |
| **Pydantic** | Request validation and serialization |
| **python-dotenv** | Environment variable management |
| **uv** | Python package and project manager |

---

## Architecture Overview

```
API Client
    │
    ▼
FastAPI (main.py)
    │
    ├── auth/          → User signup & login (PostgreSQL)
    ├── chat/          → Chat orchestration, history, persistence
    ├── chat_Management/ → Conversation listing & history access
    └── LLM/           → Groq API integration & system prompt
          │
          ▼
    Groq API (external)
```

All operations are synchronous. There is no frontend in this repository.

---

## Repository Structure

```
monarch-AI-Bot/
├── auth/                    # Authentication module
│   ├── database.py          # Database connection factory
│   ├── login.py             # User login with 24h validation
│   └── signup.py            # Guest user registration
├── chat/                    # Core chat module
│   ├── chat_service.py      # Chat orchestration service
│   ├── create_chat.py       # Conversation creation
│   ├── get_history.py       # Message history retrieval
│   └── save_message.py      # Message persistence
├── chat_Management/         # Chat management module
│   ├── chat_history.py      # Validated history access
│   └── get_all_chats.py     # List all user conversations
├── Documents/               # Project documentation
│   ├── PROJECT_FLOWS.md     # Application flow documentation
│   ├── PROJECT_STRUCTURE.md # Technical structure documentation
│   └── PROMPT.md            # Documentation generation instructions
├── LLM/                     # LLM integration module
│   ├── groq_chat.py         # Groq chat completions
│   ├── groq_connection.py   # Groq model listing
│   └── prompt.py            # System prompt definition
├── .gitignore
├── .python-version
├── main.py                  # Application entry point
├── pyproject.toml           # Project metadata & dependencies
├── README.md
└── uv.lock                  # Dependency lock file
```

---

## Getting Started

### Prerequisites

- **Python 3.14+**
- **uv** package manager ([install guide](https://docs.astral.sh/uv/getting-started/installation/))
- **Neon PostgreSQL** database (or any PostgreSQL instance)
- **Groq API key** ([get one here](https://console.groq.com/))

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd monarch-AI-Bot
   ```

2. Install dependencies using uv:
   ```bash
   uv sync
   ```

### Environment Configuration

Create a `.env` file in the project root with the following variables:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string (e.g., Neon database URL) |
| `GROQ_API_KEY` | Yes | API key for Groq LLM service |

Example `.env`:
```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
GROQ_API_KEY=gsk_your_api_key_here
```

> ⚠️ Never commit the `.env` file. It is already in `.gitignore`.

### Database Setup

The application expects the following tables in your PostgreSQL database:

- **`users`** — stores registered users (`user_uuid`, `username`, `created_at`).
- **`conversations`** — stores chat conversations (`chat_id`, `user_uuid`, `title`, `created_at`, `updated_at`).
- **`messages`** — stores individual messages (`message_id`, `user_uuid`, `chat_id`, `question`, `answer`, `model`, `created_at`).

No migration files are included. Set up the schema manually or with your preferred migration tool.

### Running the Frontend

No frontend application exists in this repository.

### Running the Backend

```bash
uv run uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

Interactive API docs (Swagger UI) are available at `http://127.0.0.1:8000/docs`.

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/models` | List available Groq LLM models |
| `POST` | `/signup` | Register a new guest user |
| `POST` | `/login` | Authenticate with username + UUID |
| `POST` | `/chat` | Send a message and get an LLM response |
| `POST` | `/chat/history` | Retrieve message history for a conversation |
| `POST` | `/chats` | List all conversations for a user |

For detailed request/response schemas and flow documentation, see the [Documentation](#documentation) section.

---

## Documentation

Detailed technical documentation is available in the `Documents/` directory:

- **[Project Structure](Documents/PROJECT_STRUCTURE.md)** — Complete directory tree with functions, database schema, API inventory, dependencies, and environment configuration.
- **[Project Flows](Documents/PROJECT_FLOWS.md)** — Application architecture, authentication flows, chat flows, LLM integration, data flows, error handling, and Mermaid diagrams.

---

## Project Roadmap

- [ ] Frontend application (React or similar)
- [ ] Token-based or session-based authentication
- [ ] Streaming LLM responses
- [ ] Automatic conversation title generation
- [ ] Expired account cleanup (scheduled background job)
- [ ] CORS middleware configuration
- [ ] Rate limiting
- [ ] Conversation deletion
- [ ] User account deletion

---

## Security and Privacy Considerations

- **No passwords:** Authentication uses username + UUID pairs (guest model).
- **24-hour expiration:** User accounts automatically become inaccessible after 24 hours (data persists in the database).
- **No token/session management:** Each request independently verifies identity.
- **Secrets management:** API keys and database credentials are stored in `.env` and excluded from version control.
- **No CORS configuration:** CORS is not currently configured; add middleware if serving a frontend.
- **No rate limiting:** The API does not implement rate limiting (Groq API has its own rate limits).

---

## Docker Build and Run Cmds
docker build -t monarch-ai-bot:latest .

docker run --env-file .env -p 8000:8000 monarch-ai-bot:latest