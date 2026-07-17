# API Documentation 🔌

CreatorMind AI exposes a purely async, RESTful FastAPI interface powering the dashboard, workspaces, streaming generation routines, and RAG ingestions.

All routes are prefixed with `/api/v1`.

### 🛡️ Authentication (`/auth`)
- `POST /auth/register`: Creates a new user relying heavily on secure Argon2/Bcrypt hash generation.
- `POST /auth/login`: Issues standard application JWT bounds via `access_token`.
- `GET /auth/me`: Decodes JWT payload headers checking live database existence.

### 🏢 Workspaces (`/workspaces`)
- `GET /workspaces`: Lists all workspaces belonging to the `current_user.id`.
- `POST /workspaces`: Instantiates a blank isolated workspace.
- `DELETE /workspaces/{id}`: Drops the workspace, cascading via SQLite PRAGMA execution across conversations, documents, and generated output.

### 🧠 Knowledge Engine (`/documents`)
- `POST /documents/upload`: Consumes `multipart/form-data`. Invokes `DocumentService.process_upload()` returning indexed chunk counts. 
  - **Query Required:** `workspace_id`
- `GET /documents/`: Returns paginated lists of RAG files isolated cleanly. 

### 💬 Chat interface (`/chat`)
- `POST /chat/stream`: Initiates the Vector similarity search, binds the Creator Profile, and executes a Server-Sent Event (SSE) response directly to the active listener while writing the persistent transcript via localized Sessions.

### ✍️ Writing Studio (`/writing`)
- `POST /writing/generate/stream`: Expects a content type limit (e.g. `linkedin_post`). Triggers the heavy `PromptComposer` combining static style templates, semantic chunk relevance, and the overriding active Profile parameters.
- `GET /writing/drafts`: Yields recent generation outcomes.

### 📊 Dashboard (`/dashboard`)
- `GET /dashboard/metrics`: Generates multi-table SQL queries mapped natively aggregating Vector memory status, LLM invocation latency, total tokens, and overall NLP model parameter confidence scores. Utilizes an ephemeral 15-second dict cache.

### 🚨 Error Codes
- `401 Unauthorized`: Denied/invalid or expired JWT request headers.
- `404 Not Found`: Hard isolation fallback preventing cross-tenant vector matching.
- `422 Unprocessable Entity`: Direct Pydantic bounds schema validation failures.
