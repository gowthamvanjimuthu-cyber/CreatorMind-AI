# Deployment Guide 🚢

Preparing CreatorMind AI for a robust external cloud environment (like an IBM Cloud cluster or a standalone VM setup) requires shifting isolated mock logic into true scaled boundaries.

## 1. Database Migrations
CreatorMind ships fundamentally mapped onto Python SQLite (leveraging specific runtime loops enabling `PRAGMA foreign_keys = ON`).

**For Production:**
It is absolutely critical to pivot the `DATABASE_URL` against a PostgreSQL instance (such as IBM Cloud Databases for PostgreSQL). SQLite limits concurrent transactional generation loads.

```env
DATABASE_URL=postgresql://user:pass@host:5432/creatormind
```

## 2. Docker Containerization (Recommended)
While running native processes suffices locally, Docker guarantees environment parity.
- **Frontend Dockerfile:** Utilize a standard multi-stage Node/Nginx setup copying `npm run build` artifacts into `/usr/share/nginx/html`.
- **Backend Dockerfile:** Build from `python:3.10-slim`. Start ASGI runtime via `gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker`.

## 3. ChromaDB Deployment Considerations
Currently, Vector stores are housed identically next to the ASGI loop via a `PersistentClient()`.
For scaled cloud operations, stand up a distinct `chromadb` HTTP process externally, and update `rag_settings`:
```python
client = chromadb.HttpClient(host="chromadb-service")
```

## 4. Removing Memory Hashmaps
In `/backend/app/memory_engine/profile_service.py`, `PROFILE_DB` relies heavily on single-process RAM allocation dictionaries. 
When load-balancing `Uvicorn` behind loadbalancers, user requests will hit disparate memory pools. Replace `PROFILE_DB` with strict Redis integration referencing `.env` `REDIS_URL`.

## 5. Security Certificates
Never expose `FastAPI` tokens or `Vite` apps externally without mapping DNS logic behind a WAF or Nginx proxy securing Let's Encrypt TLS/SSL certs via port 443 termination.
