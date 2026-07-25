<div align="center">
  <a href="https://github.com/gowthamvanjimuthu-cyber/CreatorMind-AI"> </a>
    <img src="docs/assets/banners/CreatorMindAI_Banner.png" alt="CreatorMind AI Banner" width="100%">
  
  <br />
  <br />

  <img src="docs/assets/logos/CreatorMindAI_Logo.png" alt="CreatorMind Logo" width="120" height="120">

  <h1 align="center">CreatorMind AI</h1>

  <p align="center">
    <strong>A next-generation AI content engine that clones, retains, and scales a creator's unique voice using IBM Watsonx and RAG.</strong>
    <br />
    <br />
    <a href="https://github.com/gowthamvanjimuthu-cyber/CreatorMind-AI/issues">Bug Report</a>
    ·
    <a href="https://github.com/gowthamvanjimuthu-cyber/CreatorMind-AI/issues">Feature Request</a>
    ·
    <a href="#demo">View Demo</a>
  </p>

  <p align="center">
   <a href="https://www.python.org/">
  <img src="https://img.shields.io/badge/Python-3.10+-blue.svg?logo=python&logoColor=white" alt="Python">
</a>
   <a href="https://fastapi.tiangolo.com/">
  <img src="https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi" alt="FastAPI">
</a>

<a href="https://react.dev/">
  <img src="https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB" alt="React">
</a>

<a href="https://www.typescriptlang.org/">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white" alt="TypeScript">
</a>

<a href="https://www.ibm.com/watsonx">
  <img src="https://img.shields.io/badge/IBM_Granite-0F62FE?style=flat&logo=ibm&logoColor=white" alt="IBM Granite">
</a>

<a href="https://www.trychroma.com/">
  <img src="https://img.shields.io/badge/ChromaDB-FF4F00?style=flat&logo=chroma" alt="ChromaDB">
</a>

<a href="https://supabase.com/">
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white" alt="Supabase">
</a>

<a href="https://www.docker.com/">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white" alt="Docker">
</a>
    <a href="LICENSE.md"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License"></a>
  </p>
</div>

---

## 📑 Table of Contents

- [Project Overview](#project-overview)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture Overview](#architecture-overview)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Running Locally](#running-locally)
- [Environment Variables](#environment-variables)
- [Screenshots & Demo](#screenshots--demo)
- [IBM Granite Integration](#ibm-granite-integration)
- [RAG Pipeline](#rag-pipeline)
- [Creator Profile](#creator-profile)
- [Deployment](#deployment)
- [Future Roadmap](#future-roadmap)
- [Contributors](#contributors)
- [License & Acknowledgements](#license--acknowledgements)

---
<a id="project-overview"></a>

## 🌍 Project Overview
CreatorMind AI is engineered for the **IBM AI Builders Challenge**. It is an advanced Retrieval-Augmented Generation (RAG) platform that ingests unstructured documents, mathematically extracts an author's tone using **IBM Granite**, and binds these persona traits into all future LLM generations—resulting in zero hallucination, pure voice-cloning content creation.

<a id="problem-statement"></a>

## ⚠️ Problem Statement
Scaling content creation inevitably dilutes an author's authentic voice. Relying on generic LLM prompts results in flat, impersonal writing lacking the nuanced formatting, reading level, and unique rhythm of the original creator.

<a id="solution"></a>

## 💡 Solution
A highly isolated, multi-tenant memory engine that dynamically constructs a strict Creator Persona schema by utilizing off-band inferences via **IBM Watsonx**. Every future request sent to the Writing Studio forces the LLM to route its knowledge through the constraints of this extracted persona.

<a id="key-features"></a>

## 🚀 Key Features
- **Deterministic Style Extraction:** Asynchronous extraction of tone, pacing, and vocabulary metrics.
- **Multi-Tenant Security Isolation:** Cryptographic barrier protecting RAG chunks across multiple Workspaces.
- **RAG Second Brain:** ChromaDB powered intelligence ingesting PDFs and DOCX files.
- **FastAPI SSE Streaming:** Extremely low-latency Server-Sent Events typing directly into the React UI.
- **Granular Dashboard Analytics:** Real-time generation tracing, average inference latency, and vector load times.

## ✨ Feature Showcase

| Feature | Description |
|---------|-------------|
| 📚 Knowledge Library | Upload PDFs, DOCX, and TXT files for AI knowledge retrieval. |
| 💬 AI Workspace | Chat with IBM Granite using Retrieval-Augmented Generation (RAG). |
| ✍️ Writing Studio | Generate blogs, LinkedIn posts, tweets, newsletters, and more. |
| 👤 Creator Profile | Learns writing style, tone, and audience from uploaded content. |
| 📊 Analytics Dashboard | Track content generation and workspace activity. |
| 📅 Calendar | Plan and organize publishing schedules. |
| ⚙️ Settings | Manage account preferences and application configuration. |


<a id="technology-stack"></a>

## 🛠️ Technology Stack
- **Frontend Layer:** React, Vite, TypeScript, TailwindCSS, Zustand
- **Backend API:** FastAPI, Pydantic, Python 3.10
- **AI / LLM Subsystem:** IBM Watsonx / Granite Models
- **Database / RAG:** ChromaDB (Semantic Search), SQLite / SQLAlchemy

<a id="architecture-overview"></a>

## 📐 Architecture Overview

![CreatorMind AI Architecture](docs/assets/architecture/system-architecture.png)

1. **Frontend:** Dispatches requests spanning multiple workspace UUIDs. 
2. **Knowledge Service:** Receives `.pdf` uploads, executing `RecursiveCharacterTextSplitter`.
3. **ChromaDB:** Ingests chunks attached with tight metadata clauses (strict `$and` tenant bounds).
4. **Style Analyzer:** Extracts a subset of chunks, passes to **IBM Granite**, and returns structured JSON Persona Traits.
5. **Prompt Composer:** Synthesizes the RAG context against the Persona Traits bounding Granite to strict outputs.

<a id="folder-structure"></a>

## 📁 Folder Structure
```text
CreatorMind/
├── backend/          # Python 3.10 FastAPI / SQLite / ChromaDB
├── frontend/         # React / TypeScript / Vite / Tailwind
├── docs/             # Extensive Architectural Documentation
└── .github/          # CI/CD, Issue Templates
```

<a id="installation"></a>

## ⚙️ Installation
**Prerequisites:** Node.js 18+, Python 3.10+, SQLite3.
1. Clone the repository natively:
   `git clone https://github.com/gowthamvanjimuthu-cyber/CreatorMind-AI.git`
2. Configure `.env` inside `/backend` (refer below).

<a id="running-locally"></a>

## 🏃 Running Locally
**Backend:**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
py -m uvicorn app.main:app --reload
```
**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

<a id="environment-variables"></a>

## 🔐 Environment Variables
In `backend/.env`, populate the following:
```env
CHROMA_DB_DIR=./chroma_data
```
<a id="screenshots--demo"></a>

## 📷 Screenshots & Demo
### 🔐 Login

![Login](docs/assets/screenshots/1-login.png)

---

### 📊 Dashboard

![Dashboard](docs/assets/screenshots/2-dashboard.png)

---

### 📚 Knowledge Library

![Knowledge Library](docs/assets/screenshots/3-knowledge-library.png)

---

### 💬 AI Workspace

![Workspace](docs/assets/screenshots/4-workspace-chat.png)

---

### ✍️ Writing Studio

![Writing Studio](docs/assets/screenshots/5-writing-studio.png)

---

### 📈 Analytics

![Analytics](docs/assets/screenshots/6-analytics.png)

---

### 📅 Calendar

![Calendar](docs/assets/screenshots/7-calendar.png)

---

### 👤 Profile

![Profile](docs/assets/screenshots/8-profile.png)

---

### ⚙️ Settings

![Settings](docs/assets/screenshots/9-setting.png)

---

<a id="demo"></a>
### 🎥 Demo Video
🎥 **Demo Video:** https://youtu.be/your-video-link
### Demo GIF
![CreatorMind Demo](docs/assets/demo/creatormind-demo.gif)

<a id="ibm-granite-integration"></a>

## 🧠 IBM Granite Integration
CreatorMind totally bypasses standard OpenAI paradigms. It strictly wraps connection payloads directly to IBM's Granite models (e.g., `granite-13b-chat-v2`). The AI Adapter binds explicitly to structure generation tasks natively optimized for enterprise reliability.

<a id="rag-pipeline"></a>

## 📚 RAG Pipeline
Powered by ChromaDB. When a document uploads, it is parsed by Document Processors (10MB limits), recursively chunked into 1000 characters, embedded, and tagged tightly with `$and` query clauses guaranteeing total multi-tenant vector isolation securely mapped.

<a id="creator-profile"></a>

## 👤 Creator Profile

![Creator Profile](docs/assets/screenshots/8-profile.png)

CreatorMind AI analyzes uploaded creator content to build a personalized AI persona by extracting:

- Writing style
- Tone
- Target audience
- Reading level
- Sentence structure
- Formatting habits
- Vocabulary complexity

These insights are injected into every AI generation, ensuring content closely matches the creator's unique voice and style.

<a id="deployment"></a>

## 🚢 Deployment
Ships production-ready using ASGI workers bounded by Gunicorn across Docker containers. Detailed deployment architectures (migrating from SQLite to Postgres) reside in `docs/DEPLOYMENT_GUIDE.md`.

<a id="future-roadmap"></a>

## 🔮 Future Roadmap
- [ ] Migrate `InMemory` Profile caches into distributed `Redis`.
- [ ] Offload heavy background RAG ingestion toward headless `Celery` workers.
- [ ] Incorporate semantic search against historical Chat Histories (Multi-Vector indexing).

<a id="contributors"></a>

## 🤝 Contributors
Contributions are entirely welcome! Reference the [CONTRIBUTING.md](CONTRIBUTING.md) guide and adhere to our [CODE OF CONDUCT](CODE_OF_CONDUCT.md).

<a id="license--acknowledgements"></a>

## 📜 License & Acknowledgements
Built under the **MIT License**.
A massive thank you to the **IBM AI Builders Challenge** for providing the Granite endpoints and enterprise scale inspiration!
