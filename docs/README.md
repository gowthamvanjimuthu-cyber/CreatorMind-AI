# CreatorMind AI 🧠

Welcome to **CreatorMind AI**, a next-generation AI content engine explicitly designed to clone, retain, and scale a creator's unique voice across all mediums. Built for the **IBM AI Builders Challenge**, CreatorMind maps raw uploaded documents into specialized **Creator Profiles** utilizing **IBM Watsonx / Granite AI** and Retrieval-Augmented Generation (RAG).

## 🌍 Problem Statement
Content creators face inevitable scaling bottlenecks. Delegating content creation natively dilutes their authentic voice, and standard LLM interfaces produce flat, generic outputs lacking the rhythm, formatting, and domain expertise that originally built their audience.

## 💡 Solution
CreatorMind AI introduces a persistent **Memory Engine** that uses offline style extraction against an author's uploaded repository to create a strict JSON boundary injected into all LLM prompt streams. The result is perfectly hallucination-free, voice-cloned content leveraging private RAG databases with multi-tenant workspace isolation.

## 🚀 Features
- **Style Extraction Pipeline:** Asynchronously pulls tone, pacing, vocabulary, and reading level traits from raw document dumps.
- **Strict Multi-Tenant Workspaces:** `user_id` and `workspace_id` barriers cryptographically prevent RDB and Vector DB data leakage.
- **RAG Second Brain:** ChromaDB-powered backend chunks user files (PDF, DOCX) and contextually injects similarities via Python.
- **IBM Granite Inference:** Abstracted LLM dependency injection powers all intelligent generation directly via IBM's enterprise foundation models.
- **Writing Studio:** Real-time localized SSE streams generate LinkedIn Posts, Blogs, Twitter Threads, and YouTube Scripts securely.
- **Agile Dashboard:** Live visualization caching RAG index metrics, Granites inference speeds, and overall profile "Confidence Scores".

## 🛠️ Technology Stack
- **Frontend:** React, TypeScript, Vite, TailwindCSS, Zustand
- **Backend:** FastAPI, Python 3.10+, SQLAlchemy (SQLite with `PRAGMA foreign_keys=ON`)
- **AI/Vector:** ChromaDB, `RecursiveCharacterTextSplitter`, IBM Watsonx / Granite Models

## 📐 Architecture Overview
1.  **User uploads files.** Files are parsed, chunked, and pushed to ChromaDB.
2.  **Style Analyzer** fires, passing document samples to IBM Granite to extract explicit NLP metrics forming the Creator Profile.
3.  **Writing Studio Generation**: The `MemoryOrchestrator` fetches relevant vector mappings, binds the exact Creator Profile traits into a highly rigid format, and requests SSE completions from IBM Granite. 

## 📦 Installation
Requirements: Node.js 18+, Python 3.10+, SQLite3.
*See the detailed [Installation Guide](INSTALLATION_GUIDE.md) for step-by-step setups.*

## 🏃 Running Locally
1. Initialize the backend: `cd backend && uvicorn app.main:app --reload`
2. Initialize the frontend: `cd frontend && npm run dev`
3. Hit `http://localhost:5173`.

## 📷 Screenshots
> *[Placeholders for UI Screenshots]*
- `Dashboard_View.png`
- `Chat_Workspace_Streaming.png`
- `Writing_Studio_Config.png`

## 🔮 Future Roadmap
- Celery / Redis offloaded batch processing for massive NLP profile generations.
- Multi-vector DB aggregation for long-tail memory mapping.

## 🤝 Contributors
*Refer to [CONTRIBUTORS.md](CONTRIBUTORS.md).*

## 📜 License
*Refer to the [LICENSE](LICENSE.md) file for details.*
