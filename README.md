# Monarch AI Bot

**A full-stack, production-grade AI chatbot platform featuring a React & Vite web client and a FastAPI & Groq backend deployed on Render with PostgreSQL.**

---

## 1. Project Title
**Monarch AI Bot** — Full-Stack Intelligent Conversational Platform

---

## 2. Project Description
Monarch AI Bot is a complete conversational AI application comprising a responsive web frontend and a containerized backend REST API. The system enables authenticated users to engage in multi-turn dialogues with advanced Large Language Models hosted on Groq. The platform employs a dual-layer security model: API communication is secured via HTTP Basic Auth-issued signed JWT tokens tracked in PostgreSQL (enforcing a single active token architecture), while end users register as ephemeral guest users governed by a 24-hour expiration window. Conversations and complete message histories are persisted in Neon PostgreSQL, and responses are formatted with real-time Markdown and syntax-highlighted code blocks in the React interface.

---

## 3. Project Vision
To provide a lightweight, privacy-focused, and seamlessly deployable AI assistant platform that combines multi-model inference discovery, active token lifecycle management, ephemeral guest sessions, and an intuitive modern user interface suitable for individuals and organizations.

---

## 4. Current Implementation Status

| Component | Feature | Status |
|---|---|---|
| **Backend** | Health check probe (`GET /health`) | ✅ Implemented |
| **Backend** | Basic Auth token issuance (`POST /token`) | ✅ Implemented |
| **Backend** | JWT issuance (HS256) & active DB verification (`api_active_token`) | ✅ Implemented |
| **Backend** | Single active token enforcement (automatic revocation of older tokens) | ✅ Implemented |
| **Backend** | Guest user registration (`POST /signup`) | ✅ Implemented |
| **Backend** | Guest user authentication with 24-hour expiration window (`POST /login`) | ✅ Implemented |
| **Backend** | Multi-model catalog discovery via Groq (`GET /models`) | ✅ Implemented |
| **Backend** | Conversational chat with context memory & Groq completions (`POST /chat`) | ✅ Implemented |
| **Backend** | Message persistence & thread tracking in Neon PostgreSQL | ✅ Implemented |
| **Backend** | Conversation history retrieval (`POST /chat/history`) | ✅ Implemented |
| **Backend** | User conversation listing (`POST /chats`) | ✅ Implemented |
| **Backend** | Docker containerization (`Dockerfile`, `.dockerignore`) | ✅ Implemented |
| **Backend** | Render cloud deployment configuration | ✅ Implemented |
| **Frontend** | React 19 SPA powered by Vite | ✅ Implemented |
| **Frontend** | Full-screen interactive particle/network canvas background | ✅ Implemented |
| **Frontend** | Guest signup and login modal with UUID clipboard copy | ✅ Implemented |
| **Frontend** | Local session persistence (`localStorage`) & expiration recovery | ✅ Implemented |
| **Frontend** | Three-column workspace (Sidebar, Chat Area, Control Panel) | ✅ Implemented |
| **Frontend** | Dynamic model discovery and selection dropdown | ✅ Implemented |
| **Frontend** | Markdown rendering with GitHub Dark code syntax highlighting | ✅ Implemented |
| **Frontend** | Conversation switching and "New Chat" thread initiation | ✅ Implemented |
| **Frontend** | User profile panel with calculated 24-hour expiry and logout | ✅ Implemented |
| **Full Stack** | Streaming LLM responses (SSE / WebSockets) | ❌ Roadmap |

---

## 5. Features Currently Implemented

### Backend Capabilities
- **Dual-Tier Authentication**: Protects API access with HTTP Basic Auth and single-active JWT tokens stored in Neon PostgreSQL, while scoping user activity to 24-hour guest accounts.
- **Groq LLM Integration**: Multi-model chat completion powered by Groq SDK with custom system persona and token-efficient instruction formatting.
- **Dynamic Model Catalog**: Fetches real-time active models directly from Groq API.
- **Relational Data Persistence**: Stores users, conversations, messages, and active tokens in Neon PostgreSQL via direct parameterized SQL with `psycopg 3`.
- **Docker & Cloud Ready**: Production-ready `Dockerfile` using lightweight `python:3.14-slim` and `uv` package manager.

### Frontend Capabilities
- **Interactive Authentication Screen**: Canvas-based interactive particle network responding to pointer hover with accessibility support for `prefers-reduced-motion`.
- **Guest Identity Management**: Mode switching between login and registration, automatic UUID display with one-click clipboard copying.
- **Centralized Application State**: Custom `useAppState` hook managing user sessions, chat history, thread lists, and model catalogs.
- **Rich Message Display**: Renders responses using `react-markdown`, `remark-gfm`, and `rehype-highlight` with code blocks styled in GitHub Dark.
- **Collapsible Control Panels**: Expandable navigation sidebar for conversations and profile control panel showing calculated account expiration time in IST.

---

## 6. Technology Stack

### Backend Stack
| Technology | Role |
|---|---|
| **Python 3.14** | Core backend language |
| **FastAPI** | High-performance asynchronous REST API framework |
| **Uvicorn** | ASGI web server hosting FastAPI |
| **Groq SDK** | Cloud LLM inference provider for completions and model catalog discovery |
| **PostgreSQL (Neon)** | Serverless cloud relational database |
| **psycopg 3** | High-performance PostgreSQL database adapter |
| **PyJWT** | Cryptographic HS256 JSON Web Token issuance and decoding |
| **Pydantic** | Request validation, payload schema definition, and serialization |
| **uv** | Fast Python package and project manager |
| **Docker** | Multi-stage container packaging |
| **Render** | Cloud hosting platform for Docker web service |

### Frontend Stack
| Technology | Role |
|---|---|
| **React 19** | Declarative component UI library |
| **Vite 8** | Modern frontend build tool and dev server |
| **Ant Design (antd 6)** | UI component framework (Layout, Menu, Buttons, Inputs, Select, Alerts) |
| **@ant-design/icons** | Vector icons for Ant Design components |
| **react-markdown** | Markdown rendering library for assistant messages |
| **remark-gfm** | GitHub Flavored Markdown plugin for tables and formatting |
| **rehype-highlight** | Syntax highlighting plugin for code blocks |
| **highlight.js** | Code syntax highlighting engine |

---

## 7. Combined Architecture Overview

```mermaid

flowchart TB
    subgraph Browser["User Browser - Client"]
        UI["React 19 SPA - Vite"]
        State["useAppState Hook"]
        Storage[("localStorage")]

        UI <--> State
        State <--> Storage
    end

    subgraph Cloud["Render Cloud Platform"]
        Docker["Docker Container - Port 8000"]
        FastAPI["FastAPI Application - main.py"]

        Docker --> FastAPI
    end

    subgraph External["External Cloud Services"]
        NeonDB[("Neon PostgreSQL")]
        GroqAPI["Groq Cloud LLM API"]
    end

    Browser -->|"1. Public Health Check"| FastAPI
    Browser -->|"2. Basic Auth Token Request"| FastAPI
    Browser -->|"3. Bearer JWT Requests"| FastAPI

    FastAPI -->|"Token Validation and Revocation"| NeonDB
    FastAPI -->|"User Signup and Login - 24 Hour Session"| NeonDB
    FastAPI -->|"Store and Fetch Conversations and Messages"| NeonDB
    FastAPI -->|"Model Discovery and Chat Completions"| GroqAPI

```

---

## 8. Repository Structure

```text
monarch-AI-Bot/
├── client/                      # Frontend React application
│   ├── public/                  # Static assets
│   ├── src/                     # Source components, hooks, and services
│   │   ├── assets/              # Logos and graphics
│   │   ├── Auth/                # Authentication screen & canvas animation
│   │   ├── ChatArea/            # Chat interface & chatApi service
│   │   ├── ControlPanel/        # Settings drawer & user account auth service
│   │   ├── Sidebar/             # Conversation history sidebar
│   │   ├── App.jsx              # Main view switcher
│   │   ├── main.jsx             # React entry point
│   │   └── state.jsx            # useAppState central hook
│   ├── .env                     # Frontend environment variables
│   ├── package.json             # NPM dependencies & scripts
│   └── vite.config.js           # Vite configuration
│
├── server/                      # Backend FastAPI application
│   ├── APIAuth/                 # HTTP Basic Auth & active JWT database verification
│   ├── auth/                    # Guest user signup, login & database connection
│   ├── chat/                    # Chat orchestration, history & message saving
│   ├── chat_Management/         # Conversation listings & message history
│   ├── LLM/                     # Groq LLM integration & system prompt
│   ├── .env                     # Backend environment variables
│   ├── Dockerfile               # Container build definition
│   ├── main.py                  # FastAPI entry point & API routes
│   ├── pyproject.toml           # Python dependencies & metadata
│   └── uv.lock                  # Pinned Python lockfile
│
├── Documents/                   # Project documentation
│   ├── client/                  # Client technical documentation
│   │   ├── PROJECT_FLOWS.md     # Detailed frontend execution traces & diagrams
│   │   └── PROJECT_STRUCTURE.md # Frontend technical component inventory
│   ├── server/                  # Server technical documentation
│   │   ├── PROJECT_FLOWS.md     # Detailed backend execution traces & diagrams
│   │   └── PROJECT_STRUCTURE.md # Backend technical component inventory
│   └── PROMPT.md                # Documentation maintenance prompt
│
└── README.md                    # Root project documentation
```

---

## 9. Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Python**: v3.14 or higher
- **uv**: Python project and package manager ([Install Guide](https://docs.astral.sh/uv/getting-started/installation/))
- **PostgreSQL**: Neon cloud instance or local PostgreSQL instance
- **Groq API Key**: Account at [Groq Console](https://console.groq.com/)
- **Docker** *(Optional)*: For containerized local backend execution

---

## 10. Installation Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd monarch-AI-Bot
```

### 2. Install Backend Dependencies
```bash
cd server
uv sync
cd ..
```

### 3. Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

---

## 11. Environment Configuration

### Backend Environment Configuration (`server/.env`)
Create a `.env` file in the `server/` directory:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection URI (Neon connection string with SSL) |
| `GROQ_API_KEY` | Yes | Groq API Key for LLM chat inference |
| `API_AUTH_USERNAME` | Yes | Username for HTTP Basic Auth token generation |
| `API_AUTH_PASSWORD` | Yes | Password for HTTP Basic Auth token generation |
| `JWT_SECRET` | Yes | Secret key (minimum 32 bytes) for signing and verifying JWTs |
| `JWT_ALGORITHM` | Optional | Algorithm for JWT (default: `HS256`) |

Example `server/.env`:
```ini
DATABASE_URL=postgresql://user:password@ep-host.neon.tech/neondb?sslmode=require
GROQ_API_KEY=gsk_your_groq_api_key_here
API_AUTH_USERNAME=admin
API_AUTH_PASSWORD=SuperSecretPassword123!
JWT_SECRET=super-secret-key-that-is-at-least-32-bytes-long!
JWT_ALGORITHM=HS256
```

### Frontend Environment Configuration (`client/.env`)
Create a `.env` file in the `client/` directory:

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | Base URL of the backend API (e.g. `http://localhost:8000` or deployed URL) |
| `VITE_API_TOKEN` | Yes | Active Bearer JWT access token generated by the backend |

Example `client/.env`:
```ini
VITE_API_BASE_URL=https://monarch-ai-bot.onrender.com
VITE_API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ **Security Warning:** Never commit `.env` files to source control. They are ignored by `.gitignore` and `.dockerignore`.

---

## 12. Running the Frontend

Navigate to the `client/` directory and run:

```bash
cd client
npm run dev
```

The frontend application will start locally at:
`http://localhost:5173`

To build for production:
```bash
npm run build
npm run preview
```

---

## 13. Running the Backend

### Local Development (with uv)
Navigate to the `server/` directory and execute:

```bash
cd server
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Interactive OpenAPI documentation will be accessible at:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

### Local Execution with Docker
1. Build the container:
   ```bash
   cd server
   docker build -t monarch-ai-bot:latest .
   ```
2. Run the container:
   ```bash
   docker run --env-file .env -p 8000:8000 monarch-ai-bot:latest
   ```

### Render Cloud Deployment
The backend is configured for deployment on **Render** as a Docker Web Service:
- **Build**: Automatically executed via `server/Dockerfile`.
- **Health Check**: `/health`.
- **Port**: `8000`.
- **Environment Variables**: Managed via Render Dashboard.

---

## 14. API Overview

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| `GET` | `/health` | Public | Server uptime and health verification |
| `POST` | `/token` | HTTP Basic Auth | Authenticate API client and generate active JWT token |
| `GET` | `/models` | Bearer JWT | Retrieve active Groq LLM model catalog |
| `POST` | `/signup` | Bearer JWT | Register a new guest user |
| `POST` | `/login` | Bearer JWT | Authenticate guest user (enforces 24-hour validity) |
| `POST` | `/chat` | Bearer JWT | Send conversation message and receive LLM response |
| `POST` | `/chat/history` | Bearer JWT | Retrieve full chronological message history for a conversation |
| `POST` | `/chats` | Bearer JWT | List all conversation threads for a user |

---

## 15. Database Setup

Execute the following DDL statements in your PostgreSQL database instance:

```sql
-- 1. Singleton table tracking the currently active JWT
CREATE TABLE IF NOT EXISTS api_active_token (
    id INTEGER PRIMARY KEY DEFAULT 1,
    jti UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Guest user accounts
CREATE TABLE IF NOT EXISTS users (
    user_uuid UUID PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. Conversation threads
CREATE TABLE IF NOT EXISTS conversations (
    chat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_uuid UUID REFERENCES users(user_uuid) ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. Message exchanges
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

## 16. Documentation References

For exhaustive technical flows, complete inventories, and sequence diagrams:

### Server Documentation
- **[Documents/server/PROJECT_STRUCTURE.md](Documents/server/PROJECT_STRUCTURE.md)**: Server file tree, function-level breakdown, database schema, and endpoint listings.
- **[Documents/server/PROJECT_FLOWS.md](Documents/server/PROJECT_FLOWS.md)**: Server execution traces, authentication layers, sequence diagrams, and error handling architecture.

### Client Documentation
- **[Documents/client/PROJECT_STRUCTURE.md](Documents/client/PROJECT_STRUCTURE.md)**: Client file tree, component breakdown, React hooks, API services, and dependencies.
- **[Documents/client/PROJECT_FLOWS.md](Documents/client/PROJECT_FLOWS.md)**: Client execution traces, authentication flows, session persistence, message sending, and UI states.

---

## 17. Project Roadmap

- [ ] Real-time streaming LLM responses (Server-Sent Events / WebSockets)
- [ ] Automatic conversation title summarization
- [ ] Automated database cleanup cron jobs for expired guest accounts
- [ ] Per-IP rate limiting middleware
- [ ] User conversation deletion and export functionality
- [ ] Dark / Light UI theme toggle
- [ ] Multi-turn file and attachment support

---

## 18. Security and Privacy Considerations

- **Constant-Time Verification**: Basic Auth credentials are validated with `hmac.compare_digest` to prevent timing attacks.
- **Single Active Token Architecture**: The active JWT identifier (`jti`) is persisted in `api_active_token` with `id = 1`. Any new token issuance immediately revokes all prior tokens.
- **24-Hour Guest Lifecycle**: Guest accounts expire 24 hours after creation, verified dynamically via SQL (`created_at > NOW() - INTERVAL '24 hours'`).
- **Secret Isolation**: All credentials, keys, and connection strings are managed strictly through environment variables.
- **Safe Response Sanitization**: User-facing errors do not leak stack traces or internal connection details.

---

## 19. License

No license file is currently included in the repository.
