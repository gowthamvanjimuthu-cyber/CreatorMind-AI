# Project Structure 📂

Mapping out the macro repository to ensure fluid developer navigation.

```text
CreatorMind/
├── backend/                  # The RESTful Python Server
│   ├── app/
│   │   ├── ai/               # LLM Provider logic bounded for IBM Granite
│   │   ├── api/              # FastAPI Router V1 Declarations
│   │   ├── core/             # Configuration & Security (JWT, Secrets)
│   │   ├── database/         # SQLite Config & Table schemas
│   │   ├── memory_engine/    # Magic! Extracts Creator Styles and Profiles
│   │   ├── rag/              # ChromaDB vector embedding logic
│   │   └── services/         # Decoupled business logic
│   ├── docs/                 # General API specification dumps
│   ├── tests/                # Pytest Mocks checking logic regression
│   └── main.py               # Uvicorn entry point
│
├── frontend/                 # Decoupled React / Vite Dashboard
│   ├── src/
│   │   ├── app/              # Router configs & global stores
│   │   ├── features/         # Domain-driven feature structures
│   │   │   ├── dashboard/ 
│   │   │   ├── knowledge/
│   │   │   └── workspace/    
│   │   ├── shared/           # UI Elements (Buttons, Inputs)
│   │   └── App.tsx           # Primary React Tree Mount
│
├── docs/                     # You are reading this folder right now.
└── build_knowledge.py        # Hackathon bootstrap utility script
```

## Key Developer Principles
1. **Domain-Driven Design (Frontend):** Every feature boundary natively isolates its logic via `components/`, `hooks/`, and `api/` limiting global prop drilling.
2. **Service Locator Design (Backend):** Routers invoke `services`, never DB instances natively. Repositories manage the database transactions limiting the scope of bug blasts.
