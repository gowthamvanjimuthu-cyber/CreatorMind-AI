# Future Scope 🚀

Although CreatorMind AI sits cleanly inside a highly functional, multi-tenant V1 capability, several enterprise scaling strategies will heavily mutate the architecture over the next year.

## 1. Migration from In-Memory State to Distributed Redis
### Current Constraint:
`CreatorProfileService` securely wraps UUID boundary logic around profiles statically generated inside Python standard memory dictionaries (`PROFILE_DB = {}`).
### Future Implementation:
Push real-time caching over `.env REDIS_URL` bindings. This entirely unblocks multi-pod horizontal scale, allowing Uvicorn workers behind a Kubernetes abstraction layer to fetch shared `user_id` bounds cleanly.

## 2. Advanced Multi-Database RDBMS
### Current Constraint:
SQLite runs concurrently but fundamentally struggles supporting robust concurrent WRITES, forcing explicit queue restrictions. Database referential cascading necessitates manually intercepting SQLite `PRAGMA`.
### Future Implementation:
Pivot SQLAlchemy configuration URL directly into IBM Cloud PostgreSQL enabling asynchronous scaling safely.

## 3. Celery Offloaded RAG Chunking
### Current Constraint:
Handling massive 80-page PDF ingestion concurrently blocks the FastAPI lifecycle router briefly due to Python GIL restrictions during Embedding creation.
### Future Implementation:
Route chunking and LangChain embeddings via RabbitMQ or Redis lists pushing workloads into headless Celery worker pods preventing client timeout failures on large inputs.

## 4. Multi-Vector "Forgetful" Conversations
### Current Constraint:
Conversation memory binds tightly against recent history lengths preventing infinite contexts.
### Future Implementation:
Spin up secondary ChromaDB conversational logic dynamically archiving historical chat records and vector-searching historical semantic chats rather than explicit file uploads specifically.
