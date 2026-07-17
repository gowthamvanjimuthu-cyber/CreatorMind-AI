# Technology Stack 🛠️

A comprehensive breakdown of the explicit dependencies firing under the hood of CreatorMind AI.

## Backend (Python)
- **FastAPI:** The foundational asynchronous API router mapping JSON responses via Starlette.
- **Uvicorn:** The lightning-fast ASGI server deployment logic bridging Python application workers to external ports.
- **SQLAlchemy:** Generates explicit Python ORM logic securely masking SQLite queries behind `SessionLocal` contexts. Applies PRAGMA bounds directly.
- **ChromaDB:** Localized highly-optimized vector semantic search persistence engine natively filtering meta strings in real-time.
- **Pydantic (V2):** Type validation natively hooking deep inside the API boundary ensuring models correctly ingest exact strings preventing injection payloads.
- **Python-Jose / Passlib:** Issues robust JWT authorization headers and encodes passwords across standard BCrypt/Argon vectors natively.
- **Docling / PyMuPDF / python-docx (*abstracted*):** Handles local ingestion abstractions breaking massive unstructured textual assets cleanly.

## Frontend (React)
- **Vite:** Blazing fast ESBuild replacement bypassing slow Webpack reloading times.
- **React (18.2):** Core view abstraction layer dynamically pushing states across rendering subtrees.
- **Zustand:** Ultra-lightweight reactive global hooking store bypassing bulky Context API implementations natively (Secures Authentication states and Workspace active filtering).
- **TailwindCSS:** Rapid styling grids executing pure utility mapping bounding UI to strict variables.
- **React Router (v6):** Browser history interception pushing users dynamically across client roots.
- **Lucide-React:** Lightweight zero-dependency SVG abstraction mapping standard aesthetic icons securely.

## AI Infrastructure
- **IBM watsonx:** Cloud connectivity binding native external REST payloads mapped against specific `project_id` access rights.
- **IBM Granite Models:** `granite-13b-chat-v2` / `granite-3-8b-instruct`. Highly specific and structured generation targets restricting drift.
