# Architecture Explanation 🏛️

CreatorMind AI bridges a scalable web frontend with an async-driven Python backend utilizing pure decoupling.

## 1. System Components
The architecture is divided natively into three massive pillars.
- **Client (React / Vite):** Highly reactive single-page app utilizing Zustand for global `workspace_id` stores mapping all active route filters.
- **API Server (FastAPI):** Exposes JSON responses async over REST. Connects securely to the database layer preventing blocking I/O across endpoints.
- **Inference & RAG Engine (Python):** Combines LLMs (IBM Granite), Vector Searching (ChromaDB), and logic bounding (`StyleAnalyzer` / `MemoryManager`).

## 2. Multi-Tenant Boundary Architecture
Due to its design scaling towards massive user volumes, standard REST bounds natively fail.
Every relational table uses explicit `.user_id` and `.workspace_id` columns hooked to `ON DELETE CASCADE`.

### The Boundary Flow
1. User logs via `auth_service` and generates a JWT.
2. `get_current_user` extracts `user_id`.
3. Client pushes UUID `workspace_id` over the Query param or schema.
4. Repositories (like `VectorStore`) explicitly concatenate filter `$and` arguments utilizing both keys ensuring vectors literally cannot be matched cross-tenant.

## 3. Asynchronous Pattern Execution
Long-running AI logic blocking the Python GIL is disastrous. 
- Fast endpoints (saving conversations, dashboard querying) map to standard async DB logic via `session.py`.
- Slow actions (Generating Granite SSE responses, embedding Chunk creation) are passed over iterators wrapping standard generator hooks ensuring Server Sent Events stream sequentially without dropping HTTP 2 connections.
