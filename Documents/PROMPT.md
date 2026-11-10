# Antigravity — Monarch AI Bot Documentation Execution Prompt

## 1. Your Role

You are responsible ONLY for inspecting, understanding, documenting, and maintaining the Monarch AI Bot project documentation.

Your task is to inspect the actual repository, understand its implementation, and generate accurate technical documentation independently for the Server and Client.

You must follow the existing documentation instructions provided in:

1. `Documents/server/PROMPT.md`
2. `Documents/client/PROMPT.md`

These files are the authoritative instructions for their respective documentation processes.

After completing both processes, update the root `README.md` to represent the complete Monarch AI Bot application.

**Documentation accuracy is your highest priority. Document what actually exists in the codebase, not what is planned or expected to exist.**

You are NOT responsible for:

- Writing or modifying application code.
- Refactoring existing code.
- Changing the project architecture.
- Installing dependencies.
- Changing application configuration.
- Implementing new features.
- Modifying the instructions inside either PROMPT.md.
- Creating additional documentation beyond the explicitly authorized files.

---

## 2. Repository Structure and Documentation Targets

The repository has two primary application components:

- `server/` — Backend application.
- `client/` — Frontend application.

Documentation instructions are maintained separately under `Documents/`.

The expected repository structure is:

```text
monarch-AI-Bot/
│
├── client/
│   ├── PROJECT_STRUCTURE.md
│   ├── PROJECT_FLOWS.md
│   └── ...existing frontend implementation
│
├── server/
│   ├── PROJECT_STRUCTURE.md
│   ├── PROJECT_FLOWS.md
│   └── ...existing backend implementation
│
├── Documents/
│   ├── client/
│   │   └── PROMPT.md
│   │
│   └── server/
│       ├── PROJECT_STRUCTURE.md
│       ├── PROJECT_FLOWS.md
│       └── PROMPT.md
│
└── README.md
```

This is the intended documentation layout. Always inspect the actual repository before proceeding.

Do not move, rename, or reorganize existing files or folders.

### Authorized files for modification

You are authorized to modify ONLY these five files:

**Server:**
1. `server/PROJECT_STRUCTURE.md`
2. `server/PROJECT_FLOWS.md`

**Client:**
3. `client/PROJECT_STRUCTURE.md`
4. `client/PROJECT_FLOWS.md`

**Root:**
5. `README.md`

The following files are read-only instruction sources:

- `Documents/server/PROMPT.md`
- `Documents/client/PROMPT.md`

Do not modify these instruction files.

Do not modify any other files.

### Documentation creation rules

Unlike the original documentation workflow, the four documentation output files must be created if they do not already exist.

- If the target directory exists but its documentation files are missing, create the missing documentation files.
- If a target directory does not exist, do not create it. Report the issue and continue with the remaining valid tasks.
- If a documentation file already exists, inspect its contents and update it based on the actual implementation.
- Preserve useful existing information where it remains accurate.
- Do not create duplicate documentation files.
- Do not create temporary reports, summaries, or additional documentation files.

The root `README.md` must be updated if it already exists. If it does not exist, report this limitation rather than creating it.

---

# 3. Execution Workflow

You MUST follow the sequence below.

Do not execute all documentation tasks simultaneously.

## PHASE 1 — SERVER DOCUMENTATION

### Step 1.1 — Read Server Instructions

Read the complete contents of:

`Documents/server/PROMPT.md`

Understand every instruction in that document before inspecting or documenting the server.

The server-specific PROMPT.md is authoritative for server documentation.

Do not replace its requirements with generic documentation practices.

### Step 1.2 — Inspect Server Codebase

Inspect the complete actual server implementation inside:

`server/`

Identify and understand:

- Backend framework.
- Application entry points.
- API routers and endpoints.
- Authentication implementation.
- Services.
- Business logic.
- Database connections.
- Database models and schemas.
- Database queries and operations.
- Utilities and helper functions.
- Middleware.
- Configuration.
- Environment variables.
- Dependencies.
- External API integrations.
- Error handling.
- Background and scheduled processes, if implemented.

Read the relevant source files and configuration files.

Do not rely solely on filenames or directory names to determine implementation behaviour.

Trace the actual implementation.

### Step 1.3 — Generate Server PROJECT_STRUCTURE.md

Create or update:

`server/PROJECT_STRUCTURE.md`

Follow the exact requirements in:

`Documents/server/PROMPT.md`

The document must describe ONLY the server implementation.

It must accurately document the server's:

- Project overview.
- Complete relevant directory structure.
- Functions and methods inside their corresponding files.
- Dependency overview.
- Database structure.
- API inventory.
- Environment configuration.

For the directory tree, use the required function-level hierarchy.

Example:

```text
server/
│
├── auth/
│   ├── router.py
│   │   ├── signup() — Handles user registration.
│   │   └── login() — Authenticates an existing user.
│   │
│   └── service.py
│       └── create_user() — Creates a user record.
│
└── main.py
    └── app initialization — Initializes the FastAPI application.
```

The example is illustrative only. Use the actual repository structure and exact implemented names.

Do not invent functions, APIs, models, dependencies, or database structures.

### Step 1.4 — Generate Server PROJECT_FLOWS.md

Create or update:

`server/PROJECT_FLOWS.md`

Follow the exact requirements in:

`Documents/server/PROMPT.md`

The document must explain ONLY the backend implementation.

Trace actual backend execution, including:

- Application initialization.
- Authentication lifecycle.
- API request processing.
- Backend service execution.
- Database operations.
- LLM integration.
- External service communication.
- Request and response processing.
- Error propagation.
- Data flow.
- Background processes, if implemented.

Use actual filenames, function names, API paths, and database operations.

Include accurate Mermaid diagrams wherever required.

### Step 1.5 — Verify Server Documentation

Before proceeding to the client, verify:

- Every documented file exists.
- Every documented function and method exists.
- API paths and HTTP methods are correct.
- Database relationships match the implementation.
- Environment variables are accurately identified.
- Mermaid diagrams represent actual execution.
- No secrets or credentials are exposed.
- No application source code was modified.
- Only the authorized server documentation files were modified.

**Complete the entire server documentation phase before moving to the client.**

---

## PHASE 2 — CLIENT DOCUMENTATION

### Step 2.1 — Read Client Instructions

Read the complete contents of:

`Documents/client/PROMPT.md`

Understand every instruction in that document.

The client-specific PROMPT.md is authoritative for client documentation.

Follow it independently. Do not assume that the client has the same documentation requirements or implementation structure as the server.

### Step 2.2 — Inspect Client Codebase

Inspect the complete actual frontend implementation inside:

`client/`

Identify and understand:

- Frontend framework.
- Application entry points.
- Main application components.
- Component hierarchy.
- Pages and layouts.
- State management.
- React hooks.
- Event handlers.
- Frontend API services.
- API integrations.
- Authentication screens and processing.
- Routing, if implemented.
- Styling and UI architecture.
- Configuration.
- Environment variables.
- Dependencies.
- Error handling.
- Loading states.
- User interaction flows.

Read the actual implementation files and configuration files.

Trace how frontend components communicate with backend APIs.

Do not infer functionality simply from component names.

### Step 2.3 — Generate Client PROJECT_STRUCTURE.md

Create or update:

`client/PROJECT_STRUCTURE.md`

Follow the exact requirements in:

`Documents/client/PROMPT.md`

The document must describe ONLY the client implementation.

Document the actual:

- Frontend project overview.
- Complete relevant directory structure.
- Components and their implemented functions.
- React hooks.
- Event handlers.
- API service functions.
- Dependencies.
- Frontend configuration.
- Environment variables.
- Relevant external integrations.

For the directory tree, use the required function-level hierarchy.

Example:

```text
client/
│
├── src/
│   ├── components/
│   │   └── ChatArea/
│   │       └── ChatArea.jsx
│   │           ├── handleSendMessage() — Sends the user's message.
│   │           └── handleMessageChange() — Updates the message input.
│   │
│   └── App.jsx
│       └── App() — Renders the main application interface.
│
└── package.json
```

The example is illustrative only.

Use exact filenames, component names, function names, and methods from the actual source code.

Do not invent functions or document imported third-party functionality as project implementations.

### Step 2.4 — Generate Client PROJECT_FLOWS.md

Create or update:

`client/PROJECT_FLOWS.md`

Follow the exact requirements in:

`Documents/client/PROMPT.md`

Document actual frontend execution and user-facing flows, including where implemented:

- Application initialization.
- Authentication interface.
- Guest registration and login.
- Session restoration.
- API communication.
- Conversation creation.
- Message submission.
- LLM response rendering.
- Model selection.
- Conversation history.
- Conversation switching.
- Logout.
- Error handling.
- Loading states.

Trace the actual execution sequence:

```text
User Interaction
       |
       v
React Component
       |
       v
Event Handler
       |
       v
Frontend API Service
       |
       v
Backend API
       |
       v
Frontend Response Processing
       |
       v
React State Update
       |
       v
UI Rendering
```

This is an illustrative flow. Replace generic descriptions with actual filenames, functions, components, API paths, and state updates from the repository.

Clearly distinguish:

- Frontend operations.
- Backend API requests.
- Backend processing.
- Responses returned to the frontend.
- State updates and UI rendering.

Include Mermaid diagrams where required by the client instructions.

### Step 2.5 — Verify Client Documentation

Before proceeding to the root README, verify:

- Every documented source file exists.
- Every documented component and function exists.
- Hooks and event handlers are correctly identified.
- API integrations match actual backend endpoints.
- Frontend execution flows match the code.
- Mermaid diagrams are accurate.
- Environment variables are correctly documented.
- No secrets are exposed.
- No application source code was modified.
- Only the authorized client documentation files were modified.

**Complete the entire client documentation phase before moving to the README.**

---

# 4. PHASE 3 — ROOT README MAINTENANCE

After completing and verifying BOTH the server and client documentation, update:

`README.md`

The root README represents the complete Monarch AI Bot project.

It must not describe only the frontend or only the backend.

Inspect the existing README and preserve useful project information wherever it remains accurate.

Update the README using the actual implementation and the documentation generated in the previous two phases.

### Required README sections

Ensure the root README contains relevant information about:

1. Project title.
2. Project description.
3. Project vision.
4. Current implementation status.
5. Features currently implemented.
6. Technology stack.
7. Combined architecture overview.
8. Repository structure.
9. Getting started.
10. Installation instructions.
11. Environment configuration.
12. Running the frontend.
13. Running the backend.
14. API overview.
15. Database setup.
16. Documentation references.
17. Project roadmap.
18. Security and privacy considerations.
19. License.

### README accuracy rules

- Describe the complete application.
- Clearly distinguish client and server responsibilities.
- Use actual technologies from their source code and configuration.
- Do not claim unimplemented functionality.
- Preserve the existing project vision where accurate.
- Keep completed and planned features separate.
- Do not duplicate the complete contents of the two documentation files.
- Include relative links to the client and server documentation.
- Include accurate installation and execution commands.
- Never expose credentials, secrets, API keys, or tokens.

### Documentation links

The README must include links to:

**Server documentation:**

- `server/PROJECT_STRUCTURE.md`
- `server/PROJECT_FLOWS.md`

**Client documentation:**

- `client/PROJECT_STRUCTURE.md`
- `client/PROJECT_FLOWS.md`

Use correct relative Markdown links.

---

# 5. IMPORTANT — INDEPENDENT DOCUMENTATION BOUNDARIES

The client and server must be documented independently.

### Server documentation must NOT:

- Include the complete frontend directory tree.
- Document React components as server implementations.
- Attribute frontend event handlers to the backend.
- Assume that frontend behaviour is implemented on the server.

### Client documentation must NOT:

- Include the complete backend directory tree.
- Document FastAPI handlers as frontend functions.
- Attribute backend database operations to the frontend.
- Assume that backend behaviour is implemented in the client.

### Cross-component communication

The two flow documents may refer to one another when explaining an API interaction.

For example:

- The client document explains how a frontend API service calls a backend endpoint.
- The server document explains how that endpoint processes the request and returns its response.

However, each document must retain its own implementation boundary.

The root README is responsible for explaining how both components work together.

---

# 6. Strict Execution Boundaries

The following permissions are mandatory.

| Action | Permission |
|---|---|
| Inspect server source code | Allowed |
| Inspect client source code | Allowed |
| Read configuration files | Allowed |
| Read database models | Allowed |
| Trace frontend and backend execution | Allowed |
| Read existing documentation | Allowed |
| Read both PROMPT.md files | Allowed |
| Create/update server PROJECT_STRUCTURE.md | Allowed |
| Create/update server PROJECT_FLOWS.md | Allowed |
| Create/update client PROJECT_STRUCTURE.md | Allowed |
| Create/update client PROJECT_FLOWS.md | Allowed |
| Update root README.md | Allowed |
| Modify either PROMPT.md | Not allowed |
| Modify application source code | Not allowed |
| Refactor application code | Not allowed |
| Install dependencies | Not allowed |
| Change environment configuration | Not allowed |
| Change application architecture | Not allowed |
| Create unrelated files | Not allowed |
| Create unrelated folders | Not allowed |
| Modify any other file | Not allowed |

If any information cannot be verified from the implementation, clearly identify the limitation rather than guessing.

If a target folder or file is missing and cannot be created within the authorized boundaries, report it.

---

# 7. Final Verification

After completing all three phases, perform a final verification.

### Server verification

- [ ] Server PROJECT_STRUCTURE.md exists and is accurate.
- [ ] Server PROJECT_FLOWS.md exists and is accurate.
- [ ] Server functions and methods are verified.
- [ ] API inventory is accurate.
- [ ] Database documentation is accurate.
- [ ] Environment configuration is accurate.
- [ ] Mermaid diagrams are consistent with the implementation.

### Client verification

- [ ] Client PROJECT_STRUCTURE.md exists and is accurate.
- [ ] Client PROJECT_FLOWS.md exists and is accurate.
- [ ] Components and functions are verified.
- [ ] Hooks and event handlers are accurately documented.
- [ ] API integrations are accurate.
- [ ] Frontend flows match the implementation.
- [ ] Mermaid diagrams are consistent with the implementation.

### README verification

- [ ] README represents the complete application.
- [ ] Frontend and backend responsibilities are distinguished.
- [ ] Technology stack matches actual code.
- [ ] Repository structure is accurate.
- [ ] Installation instructions are correct.
- [ ] Environment variables are documented safely.
- [ ] Documentation links work.
- [ ] Implemented features and roadmap items are separated.

### Repository safety verification

- [ ] No application source code was modified.
- [ ] No configuration files were modified.
- [ ] No dependencies were installed.
- [ ] No PROMPT.md files were modified.
- [ ] No unauthorized files or folders were created.
- [ ] No secrets or credentials were exposed.
- [ ] Only the five authorized documentation output files were modified.

---

# 8. Expected Completion Report

After completing the work, provide a concise completion report in your response.

Include:

1. Server files inspected.
2. Server documentation files created or updated.
3. Client files inspected.
4. Client documentation files created or updated.
5. README sections updated.
6. Main backend architecture identified.
7. Main frontend architecture identified.
8. How the frontend and backend communicate.
9. Missing files or folders, if any.
10. Any implementation details that could not be verified.
11. Confirmation that no application source code or unauthorized files were modified.

Do not create a separate completion report file.

---

# FINAL EXECUTION INSTRUCTION

Execute the workflow in this exact order:

```text
READ SERVER PROMPT
        |
        v
INSPECT SERVER
        |
        v
GENERATE SERVER PROJECT_STRUCTURE.md
        |
        v
GENERATE SERVER PROJECT_FLOWS.md
        |
        v
VERIFY SERVER DOCUMENTATION
        |
        v
READ CLIENT PROMPT
        |
        v
INSPECT CLIENT
        |
        v
GENERATE CLIENT PROJECT_STRUCTURE.md
        |
        v
GENERATE CLIENT PROJECT_FLOWS.md
        |
        v
VERIFY CLIENT DOCUMENTATION
        |
        v
UPDATE ROOT README.md
        |
        v
FINAL REPOSITORY VERIFICATION
        |
        v
COMPLETION REPORT
```

Do not skip phases.

Do not combine the client and server documentation into one document.

Do not infer implementation details from plans or roadmaps.

Do not modify application code.

**Your responsibility is to inspect, understand, document the Server, document the Client, update the root README, verify the result, and stop.**