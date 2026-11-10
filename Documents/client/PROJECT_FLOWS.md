# PROJECT_FLOWS.md — Monarch AI Bot (Client)

---

## A. Application Overview

The Monarch AI Bot client is a single-page React application built with **React 19**, **Vite**, and **Ant Design**. It provides an interface for interacting with Monarch AI backend services.

The frontend communicates with the backend REST API over HTTPS using JSON payloads and Bearer JWT authorization. It supports dynamic model selection, conversational history management, guest user registration and authentication, local session persistence, and Markdown rendering with code syntax highlighting.

### High-Level Frontend Architecture Diagram

```mermaid
flowchart TD
    User["End User"]
    Browser["Web Browser"]
    App["App.jsx (Root View Switcher)"]
    UseState["useAppState Hook (state.jsx)"]
    LocalStorage["Browser localStorage (monarch_ai_session)"]

    subgraph AuthView["Unauthenticated View"]
        AuthScreen["AuthenticationScreen.jsx"]
        CanvasBg["NetworkBackground.jsx (Canvas Animation)"]
        Account["Account.jsx (Login & Signup Form)"]
    end

    subgraph WorkspaceView["Authenticated Workspace"]
        Layout["Ant Design Workspace Layout"]
        Sidebar["Sidebar.jsx (Conversations & Brand)"]
        ChatArea["ChatArea.jsx (Markdown, Model Picker, Composer)"]
        ControlPanel["ControlPanel.jsx (Profile & Expiration Info)"]
    end

    subgraph Services["Frontend API Services"]
        AuthService["auth.js (signup, login, getAllChats, getChatHistory)"]
        ChatService["chatApi.js (sendChatMessage, getAvailableModels)"]
    end

    BackendAPI["Backend REST API (FastAPI)"]

    User --> Browser
    Browser --> App
    App --> UseState
    UseState <--> LocalStorage
    App -->|No Active User| AuthView
    AuthScreen --> CanvasBg
    AuthScreen --> Account
    Account --> AuthService

    App -->|Active User| WorkspaceView
    WorkspaceView --> Sidebar
    WorkspaceView --> ChatArea
    WorkspaceView --> ControlPanel
    Sidebar --> AuthService
    ChatArea --> ChatService
    ChatArea --> AuthService
    ControlPanel --> UseState

    AuthService -->|HTTPS + Bearer JWT| BackendAPI
    ChatService -->|HTTPS + Bearer JWT| BackendAPI
```

---

## B. Application Initialization and Session Restoration Flow

```mermaid
sequenceDiagram
    participant Browser
    participant Main as main.jsx
    participant App as App.jsx
    participant Hook as useAppState (state.jsx)
    participant Storage as localStorage
    participant ChatAPI as chatApi.js
    participant AuthAPI as auth.js
    participant Backend as Backend API

    Browser->>Main: Loads index.html & executes main.jsx
    Main->>App: Mounts <App /> inside StrictMode
    App->>Hook: Invokes useAppState()
    Hook->>Storage: getSavedSession() reads 'monarch_ai_session'
    alt Valid Saved Session Exists
        Storage-->>Hook: { user, selectedChatId, selectedModel }
        Hook->>Hook: Initializes user, selectedChatId, selectedModel state
    else No Saved Session
        Storage-->>Hook: null / empty
        Hook->>Hook: Initializes user = null, selectedModel = "openai/gpt-oss-20b"
    end

    par Parallel: Fetch Available Models
        Hook->>ChatAPI: getAvailableModels(signal)
        ChatAPI->>Backend: GET /models (Authorization: Bearer <token>)
        Backend-->>ChatAPI: { success: true, models: [...] }
        ChatAPI-->>Hook: models list
        Hook->>Hook: Updates availableModels & ensures selectedModel is valid
    and Parallel: Fetch Conversations (if user signed in)
        opt If user exists in session
            Hook->>AuthAPI: getAllChats(user.user_uuid, signal)
            AuthAPI->>Backend: POST /chats { user_uuid }
            Backend-->>AuthAPI: { success: true, conversations: [...] }
            AuthAPI-->>Hook: conversations list
            Hook->>Hook: Updates conversations state
        end
    end

    alt User is null
        App-->>Browser: Renders <AuthenticationScreen><Account /></AuthenticationScreen>
    else User is present
        App-->>Browser: Renders <Layout> [Sidebar, ChatArea, ControlPanel]
    end
```

---

## C. Guest Authentication Flows (Signup and Login)

### 1. Guest Registration Flow

```mermaid
sequenceDiagram
    participant User
    participant Account as Account.jsx
    participant AuthAPI as auth.js
    participant Backend as Backend API (POST /signup)
    participant Hook as useAppState (state.jsx)
    participant Storage as localStorage

    User->>Account: Inputs username & clicks "Create Account"
    Account->>Account: Validates non-empty trimmed username
    Account->>Account: Sets loading = true, clears prior errors
    Account->>AuthAPI: signup(username)
    AuthAPI->>AuthAPI: Checks pendingSignups map (prevents duplicates)
    AuthAPI->>Backend: POST /signup { username } with Bearer JWT
    alt Signup Error (duplicate username, length > 50, server error)
        Backend-->>AuthAPI: 400 Bad Request { detail: "Username already exists." }
        AuthAPI-->>Account: Throws Error
        Account->>Account: Sets loading = false, displays <Alert type="error" />
    else Signup Succeeded
        Backend-->>AuthAPI: 200 OK { success: true, user: { user_uuid, username, created_at } }
        AuthAPI-->>Account: Returns user payload
        Account->>Account: Stores userUUID in state
        Account->>Account: Displays UUID copy container & success alert
        User->>Account: Clicks "Copy" button
        Account->>Account: navigator.clipboard.writeText(userUUID) & sets copied = true
    end
```

### 2. Guest Login Flow

```mermaid
sequenceDiagram
    participant User
    participant Account as Account.jsx
    participant AuthAPI as auth.js
    participant Backend as Backend API (POST /login)
    participant App as App.jsx
    participant Hook as useAppState (state.jsx)
    participant Storage as localStorage

    User->>Account: Inputs username, userUUID & clicks "Login"
    Account->>Account: Validates input fields, sets loading = true
    Account->>AuthAPI: login(username, user_uuid)
    AuthAPI->>AuthAPI: Checks pendingLogins map
    AuthAPI->>Backend: POST /login { username, user_uuid } with Bearer JWT
    alt Login Error (invalid credentials or expired >24h)
        Backend-->>AuthAPI: 401 Unauthorized { detail: "Account expired..." }
        AuthAPI-->>Account: Throws Error
        Account->>Account: Displays error Alert, loading = false
    else Login Succeeded
        Backend-->>AuthAPI: 200 OK { success: true, user: { user_uuid, username, created_at } }
        AuthAPI-->>Account: Returns user object
        Account->>Hook: onAuthenticated(user) -> handleAuthenticated(user)
        Hook->>Hook: Sets user state, resets conversation states
        Hook->>Storage: useEffect persists session to 'monarch_ai_session'
        App->>App: Re-evaluates user !== null -> switches to Workspace Layout
    end
```

---

## D. Chat Interaction and Message Flow

```mermaid
sequenceDiagram
    participant User
    participant ChatArea as ChatArea.jsx
    participant Hook as useAppState (state.jsx)
    participant ChatAPI as chatApi.js
    participant AuthAPI as auth.js
    participant Backend as Backend API

    User->>ChatArea: Types message into TextArea and presses Enter / clicks Send
    ChatArea->>ChatArea: handleSendMessage() validates message.trim()
    ChatArea->>Hook: onSend(cleanMessage) -> handleSendMessage(message)
    Hook->>Hook: Sets sending = true, clears sendingError

    Hook->>ChatAPI: sendChatMessage({ user_uuid, chat_id, model, message })
    ChatAPI->>Backend: POST /chat { user_uuid, chat_id, model, message }
    alt Request Failure (HTTP error or connection timeout)
        Backend-->>ChatAPI: Error response (e.g. 400 Bad Request)
        ChatAPI-->>Hook: Throws Error
        Hook->>Hook: Sets sendingError = error.message, sending = false
        Hook-->>ChatArea: Returns false (preserves typed text in composer)
    else Request Succeeded
        Backend-->>ChatAPI: 200 OK { success: true, chat_id, question, answer, model, usage }
        ChatAPI-->>Hook: Returns response data
        opt If currentChatId was null (new thread created)
            Hook->>Hook: setSelectedChatId(returnedChatId)
        end
        Hook->>Hook: Appends newMessage { question, answer, model, created_at } to chatHistory
        Hook->>AuthAPI: getAllChats(user.user_uuid)
        AuthAPI->>Backend: POST /chats { user_uuid }
        Backend-->>AuthAPI: Updated conversations list
        AuthAPI-->>Hook: Updated conversations
        Hook->>Hook: setConversations(updatedConversations)
        Hook->>Hook: Sets sending = false
        Hook-->>ChatArea: Returns true
        ChatArea->>ChatArea: Clears composer input (setMessage(""))
        ChatArea->>ChatArea: Renders assistant markdown bubble with syntax highlighting
    end
```

---

## E. Conversation Navigation and History Retrieval

```mermaid
sequenceDiagram
    participant User
    participant Sidebar as Sidebar.jsx
    participant Hook as useAppState (state.jsx)
    participant AuthAPI as auth.js
    participant Backend as Backend API
    participant ChatArea as ChatArea.jsx

    Note over User,ChatArea: Case 1: Switching to an existing conversation
    User->>Sidebar: Clicks a conversation item in the menu
    Sidebar->>Hook: onSelectChat(chatId) -> handleSelectChat(chatId)
    Hook->>Hook: setSelectedChatId(chatId)
    Hook->>Hook: useEffect triggers on selectedChatId change
    Hook->>Hook: Sets historyLoading = true, clears chatHistory
    Hook->>AuthAPI: getChatHistory(user_uuid, selectedChatId, signal)
    AuthAPI->>Backend: POST /chat/history { user_uuid, chat_id }
    Backend-->>AuthAPI: { success: true, history: [...] }
    AuthAPI-->>Hook: history list
    Hook->>Hook: setChatHistory(history), historyLoading = false
    Hook-->>ChatArea: Passes updated messages prop
    ChatArea->>ChatArea: Renders chronological user and assistant message pairs

    Note over User,ChatArea: Case 2: Creating a new conversation
    User->>Sidebar: Clicks "+ New Chat" button
    Sidebar->>Hook: onNewChat() -> handleNewChat()
    Hook->>Hook: setSelectedChatId(null), setChatHistory([])
    Hook-->>ChatArea: Passes chatTitle = null, messages = []
    ChatArea->>ChatArea: Renders Welcome Screen with suggestion cards
```

---

## F. Model Selection Flow

```mermaid
sequenceDiagram
    participant Hook as useAppState (state.jsx)
    participant ChatAPI as chatApi.js
    participant Backend as Backend API
    participant ChatArea as ChatArea.jsx
    participant User

    Note over Hook,Backend: Model Catalog Discovery on App Mount
    Hook->>ChatAPI: getAvailableModels(signal)
    ChatAPI->>Backend: GET /models (Authorization: Bearer <token>)
    Backend-->>ChatAPI: { success: true, models: [{ id, ... }] }
    ChatAPI-->>Hook: models array
    Hook->>Hook: setAvailableModels(allModels)
    Hook->>Hook: Validates whether selectedModel exists in allModels
    opt If saved model not in returned list
        Hook->>Hook: Falls back to default ("openai/gpt-oss-20b") or allModels[0].id
    end
    Hook-->>ChatArea: availableModels, selectedModel, modelsLoading = false
    ChatArea->>ChatArea: Maps models to Select options { value: id, label: id }

    Note over User,ChatArea: User Changes Selected Model
    User->>ChatArea: Opens Select dropdown and selects a different model
    ChatArea->>Hook: onModelChange(newModelId) -> setSelectedModel(newModelId)
    Hook->>Hook: Updates selectedModel in state
    Hook->>Hook: useEffect updates 'monarch_ai_session' in localStorage
```

---

## G. Logout and Session Expiration Handling

```mermaid
sequenceDiagram
    participant User
    participant ControlPanel as ControlPanel.jsx
    participant Hook as useAppState (state.jsx)
    participant Storage as localStorage
    participant App as App.jsx

    Note over User,App: Manual Logout
    User->>ControlPanel: Clicks "Logout" button
    ControlPanel->>Hook: onLogout() -> handleLogout()
    Hook->>Storage: localStorage.removeItem('monarch_ai_session')
    Hook->>Hook: Resets user = null, conversations = [], selectedChatId = null, chatHistory = []
    Hook->>Hook: Resets selectedModel to default
    App->>App: Detects user is null -> Renders <AuthenticationScreen>

    Note over User,App: Automatic Session Expiration (401 / 403 API Response)
    Note over Hook,App: Any API call (chats, history, or chat) receives HTTP 401 or 403
    Hook->>Hook: isAuthenticationError(error) detects 401/403
    Hook->>Hook: handleSessionExpired()
    Hook->>Storage: localStorage.removeItem('monarch_ai_session')
    Hook->>Hook: Resets user = null and all conversation state
    App->>App: Detects user is null -> Renders <AuthenticationScreen> with login prompt
```

---

## H. Error Handling and UI States

| Scenario | Originating Service | Catch & Handle Location | UI Presentation | User Recovery Action |
|---|---|---|---|---|
| **Network Timeout (>15s / >30s)** | `auth.js` / `chatApi.js` | `AbortController` timeout timer | Ant Design Alert (`type="error"`) or chat composer error banner | User can retry request |
| **Duplicate In-flight Request** | `auth.js` | `pendingSignups` / `pendingLogins` Map | Throws Error: `"Request is already in progress"` | Request throttling prevents redundant submissions |
| **Expired 24-Hour Account** | Backend API (401 response) | `useAppState.handleSessionExpired()` | Clears session, resets UI to `<AuthenticationScreen>` | User creates new guest account or logs into active account |
| **Invalid Credentials on Login** | Backend API (401 response) | `Account.jsx` `handleSubmit()` | Ant Design Alert (`type="error"`): `"Invalid username or UUID."` | User re-enters credentials |
| **Model Fetch Failure** | `getAvailableModels()` | `useAppState` models effect | Error text beneath model selector; selector disabled | User can refresh or rely on default model |
| **Message Send Failure** | `sendChatMessage()` | `ChatArea.jsx` `handleSendMessage()` | Error banner in ChatArea; message text preserved in composer | User reviews error and clicks Send again |

---

## I. Verification Notes

- All flows traced directly from verified source files in `client/src/`.
- Interactive particle canvas matches `AuthenticationScreen.jsx` Canvas 2D implementation with custom pointer event dispatch.
- Dynamic markdown formatting uses `react-markdown` with `remark-gfm` and `rehype-highlight` configured for GitHub Dark syntax styles.
- Session persistence uses standard HTML5 `localStorage` under the key `monarch_ai_session`.

