# PROJECT_STRUCTURE.md — Monarch AI Bot (Client)

---

## A. Project Overview

| Field | Details |
|---|---|
| **Project Name** | Monarch AI Bot (Client) |
| **Project Purpose** | A modern, responsive React-based web client providing a chat interface for Monarch AI. Features guest user signup and login (24-hour expiration model), local session persistence, real-time model discovery and selection, Markdown and syntax-highlighted code rendering, conversation thread navigation, and a profile control panel. |
| **Main Technologies** | React 19, Vite 8, Ant Design (`antd`), `@ant-design/icons`, `react-markdown`, `remark-gfm`, `rehype-highlight`, `highlight.js` |
| **High-Level Architecture** | Single-page application built with Vite and React 19. Application state is centralized in a custom hook (`useAppState`) utilizing browser `localStorage` for session persistence and `AbortController` for clean network cancellation. Network communications route through modular API service layers (`auth.js` and `chatApi.js`) using Bearer JWT authorization. UI layout is divided into an unauthenticated interactive particle background view and an authenticated three-column workspace (`Sidebar`, `ChatArea`, and `ControlPanel`). |

---

## B. Complete Directory Structure

```text
client/
├── public/
│   └── vite.svg
│
├── src/
│   ├── assets/
│   │   ├── monarch-logo.png
│   │   ├── monarch-logo-transparent.png
│   │   └── purple-landscape.svg
│   │
│   ├── Auth/
│   │   ├── AuthenticationScreen.css — Stylesheet for full-screen authentication and interactive canvas.
│   │   └── AuthenticationScreen.jsx
│   │       ├── NetworkBackground() — Canvas-based interactive particle network responding to pointer hover and respecting prefers-reduced-motion.
│   │       │   ├── createNodes() — Generates network node positions and velocities.
│   │       │   ├── resizeCanvas() — Adjusts canvas dimensions and handles device pixel ratios.
│   │       │   ├── drawNetwork() — Renders nodes, inter-node connection lines, and cursor proximity glow.
│   │       │   ├── handleNetworkPointerMove() — Custom event handler updating target coordinates for cursor glow.
│   │       │   ├── handleNetworkPointerLeave() — Custom event handler disabling cursor glow.
│   │       │   └── animate() — RequestAnimationFrame loop driving background motion.
│   │       ├── handlePointerMove() — Dispatches custom pointer coordinates to canvas.
│   │       ├── handlePointerLeave() — Dispatches pointer deactivation event to canvas.
│   │       └── AuthenticationScreen() — Renders full-screen split layout: branding panel with logo and form panel.
│   │
│   ├── ChatArea/
│   │   ├── chatApi.js
│   │   │   ├── sendChatMessage() — Dispatches POST /chat requests with user message, active model, and conversation ID.
│   │   │   └── getAvailableModels() — Dispatches GET /models requests to discover active Groq LLM models.
│   │   ├── ChatArea.css — Stylesheet for chat workspace, message bubbles, markdown styling, and composer.
│   │   └── ChatArea.jsx
│   │       ├── handleMessageChange() — Updates local state as user types in composer.
│   │       ├── handleSendMessage() — Validates input and triggers message dispatch to backend.
│   │       ├── handleKeyDown() — Submits message on Enter (bypassed when Shift is pressed).
│   │       └── ChatArea() — Main chat pane rendering conversation header, welcome screen or message stream, and message composer with model selector.
│   │
│   ├── ControlPanel/
│   │   ├── Account/
│   │   │   ├── Account.css — Stylesheet for authentication cards, inputs, buttons, and alert banners.
│   │   │   ├── Account.jsx
│   │   │   │   ├── handleSubmit() — Executes signup or login flow based on active form mode.
│   │   │   │   ├── handleCopyUUID() — Copies newly registered user UUID to system clipboard.
│   │   │   │   ├── switchMode() — Toggles between signup and login form modes and clears alerts.
│   │   │   │   ├── handleKeyDown() — Triggers form submission when Enter is pressed in input fields.
│   │   │   │   └── Account() — Renders login and signup form with UUID copy display and status alerts.
│   │   │   └── auth.js
│   │   │       ├── signup() — Executes POST /signup to register guest user with in-flight deduplication.
│   │   │       ├── login() — Executes POST /login to authenticate guest user with in-flight deduplication.
│   │   │       ├── getAllChats() — Executes POST /chats to retrieve user conversation threads.
│   │   │       └── getChatHistory() — Executes POST /chat/history to retrieve chronological messages for a conversation.
│   │   ├── ControlPanel.css — Stylesheet for collapsible right-hand settings drawer.
│   │   └── ControlPanel.jsx
│   │       ├── formatDateTime() — Formats ISO timestamps into human-readable Indian Standard Time (IST).
│   │       ├── getAccountExpiry() — Computes 24-hour expiration timestamp based on account creation date.
│   │       └── ControlPanel() — Collapsible right sidebar displaying user profile, UUID, creation/expiry dates, and logout button.
│   │
│   ├── Sidebar/
│   │   ├── Sidebar.css — Stylesheet for collapsible left conversation navigation bar.
│   │   └── Sidebar.jsx
│   │       ├── formatChatDate() — Formats conversation timestamps for menu items.
│   │       ├── handleChatSelection() — Triggers switching active conversation on menu click.
│   │       ├── handleNewChat() — Resets active conversation to initiate a new thread.
│   │       └── Sidebar() — Collapsible left sidebar hosting brand logo, New Chat action, sorted conversation list, and user profile badge.
│   │
│   ├── App.css — Global application layout and workspace grid styles.
│   ├── App.jsx
│   │   └── App() — Top-level component orchestrating unauthenticated view vs. three-column authenticated workspace.
│   ├── index.css — Base typography, resets, and dark theme variables.
│   ├── main.jsx — Application entry point initializing React 19 StrictMode and mounting to DOM root.
│   └── state.jsx
│       ├── getSavedSession() — Restores persisted user session, active chat ID, and selected model from localStorage.
│       ├── isAuthenticationError() — Helper identifying 401 and 403 HTTP response codes.
│       └── useAppState() — Centralized custom hook managing authentication, conversation threads, chat history, model catalog, and network states.
│           ├── handleSessionExpired() — Clears persisted session and resets state upon token/account invalidation.
│           ├── handleAuthenticated() — Stores user identity and initializes empty chat state.
│           ├── handleNewChat() — Clears active conversation selection and resets message history.
│           ├── handleSelectChat() — Updates selected conversation ID to trigger history retrieval.
│           ├── handleSendMessage() — Sends prompt to backend, optimistically updates message history, and refreshes thread list.
│           └── handleLogout() — Clears local storage session and restores default application state.
│
├── .env — Environment variables defining backend API URL and bearer access token.
├── .gitignore — Git ignore specification for build output, dependencies, and environment files.
├── eslint.config.js — ESLint configuration with react-hooks and react-refresh plugins.
├── index.html — HTML document shell mounting React at #root.
├── package.json — NPM project metadata, build scripts, and dependency definitions.
├── package-lock.json — Pinned NPM dependency tree lockfile.
├── README.md — Vite + React project description.
└── vite.config.js — Vite build tool configuration with React plugin.
```

---

## C. Component Hierarchy and State Management

### Component Tree

```text
main.jsx
└── App.jsx (consumes useAppState)
    ├── [If !user]
    │   └── AuthenticationScreen.jsx
    │       ├── NetworkBackground.jsx (Canvas particle animation)
    │       └── Account.jsx (LoginForm / SignupForm)
    │
    └── [If user]
        └── Layout.workspace-layout
            ├── Sidebar.jsx (Conversations list, New Chat, Brand, User info)
            ├── Content.main-workspace
            │   └── ChatArea.jsx (Header, Welcome/Messages, Markdown, Model Selector, Composer)
            └── ControlPanel.jsx (Profile info, Expiration date, Logout action)
```

### Custom Hooks (`state.jsx`)

- **`useAppState()`**: The primary application state store exposing:
  - `user`: Authenticated user object (`{ user_uuid, username, created_at }`).
  - `conversations`: Array of conversation threads for the user.
  - `selectedChatId`: UUID of the active conversation, or `null` for a new unsaved conversation.
  - `chatsLoading`, `chatsError`: Status of conversations retrieval.
  - `chatHistory`: Array of message pairs (`{ question, answer, model, created_at }`).
  - `historyLoading`, `historyError`: Status of history retrieval.
  - `sending`, `sendingError`: Status of active message submission.
  - `availableModels`: Array of models returned by `GET /models`.
  - `selectedModel`, `setSelectedModel`: Active LLM model ID.
  - `modelsLoading`, `modelsError`: Status of model catalog fetch.
  - `selectedChatTitle`: Display title or formatted date of active conversation.
  - Action handlers: `handleAuthenticated`, `handleNewChat`, `handleSelectChat`, `handleSendMessage`, `handleLogout`.

---

## D. Frontend API Services

### 1. Account & Thread Management (`src/ControlPanel/Account/auth.js`)

| Function | Method | Endpoint | Request Payload | Response Data | Purpose |
|---|---|---|---|---|---|
| `signup(username, signal)` | `POST` | `/signup` | `{ username }` | `{ success, user: { user_uuid, username, created_at } }` | Register a new guest user. |
| `login(username, user_uuid, signal)` | `POST` | `/login` | `{ username, user_uuid }` | `{ success, user: { user_uuid, username, created_at } }` | Authenticate within 24-hour validity window. |
| `getAllChats(user_uuid, signal)` | `POST` | `/chats` | `{ user_uuid }` | `{ success, conversations: [...] }` | Fetch conversation threads list for user. |
| `getChatHistory(user_uuid, chat_id, signal)` | `POST` | `/chat/history` | `{ user_uuid, chat_id }` | `{ success, history: [...] }` | Fetch chronological message exchanges in thread. |

### 2. Chat & Model Operations (`src/ChatArea/chatApi.js`)

| Function | Method | Endpoint | Request Payload | Response Data | Purpose |
|---|---|---|---|---|---|
| `sendChatMessage({ user_uuid, message, model, chat_id, signal })` | `POST` | `/chat` | `{ user_uuid, model, message, chat_id? }` | `{ success, chat_id, question, answer, model, usage }` | Submit prompt to LLM and persist exchange. |
| `getAvailableModels(signal)` | `GET` | `/models` | None | `{ success, models: [...] }` | Retrieve active LLM models from Groq. |

---

## E. Dependency Overview

### Frontend Dependencies (from `package.json`)

| Package | Version | Purpose |
|---|---|---|
| `react` | `^19.3.1` | Core UI library for declarative component development |
| `react-dom` | `^19.3.1` | DOM renderer for React |
| `antd` | `^6.7.0` | Ant Design component library (Layout, Menu, Button, Input, Select, Avatar, Alert, Tooltip) |
| `@ant-design/icons` | `^6.3.4` | Icon library for Ant Design components |
| `react-markdown` | `^10.1.0` | Markdown parser and renderer for LLM assistant responses |
| `remark-gfm` | `^4.0.1` | GitHub Flavored Markdown plugin (tables, autolinks, strikethrough) |
| `rehype-highlight` | `^7.0.2` | Rehype syntax highlighter plugin using Highlight.js |
| `highlight` | `^0.2.4` | Syntax highlighting runtime and theme styles |

### Build and Development Dependencies

| Package | Version | Purpose |
|---|---|---|
| `vite` | `^8.3.6` | Next-generation frontend build tool and local development server |
| `@vitejs/plugin-react` | `^6.1.2` | Vite plugin providing fast refresh and Babel support for React |
| `eslint` | `^10.14.0` | JavaScript and JSX linter |
| `eslint-plugin-react-hooks` | `^7.1.1` | Linter plugin enforcing Rules of Hooks |
| `eslint-plugin-react-refresh` | `^0.5.7` | Linter plugin validating hot module replacement safety |

---

## F. Frontend Configuration and Environment Variables

Configuration is loaded at build/runtime via Vite's `import.meta.env`:

| Variable | Purpose | Used By | Required |
|---|---|---|---|
| `VITE_API_BASE_URL` | Root URL of the Monarch AI Bot backend REST API | `auth.js`, `chatApi.js` | **Yes** |
| `VITE_API_TOKEN` | Bearer JWT access token required by backend protected endpoints | `auth.js`, `chatApi.js` | **Yes** |

> **Security Note:** Environment variables prefixed with `VITE_` are embedded into client bundle outputs. Secret keys must not be hardcoded or stored in client repository configurations.

