# Changelog

All notable changes to **CreatorMind AI** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-17

### Added
- **Multi-Tenant Memory Engine:** Extracted JSON Creator Persona styles mapping dynamically bounded into IBM Granite inferences.
- **RAG Second Brain:** Asynchronous chunking logic powered by ChromaDB mapped with `$and` query clauses bounding user/workspace UUIDs natively.
- **Workspace Agility:** Contextual stores isolating conversations, documents, and style drafts cleanly across client accounts.
- **FastAPI SSE Router:** Lightning fast React streams parsing IBM Granite Server-Sent Event yields.
- **Dashboard Observability:** Real time ingestion visualization checking inference load bounds securely.

### Fixed
- **SQLite Constraint Bleeds:** Enforced `PRAGMA foreign_keys = ON` resolving cascading ghost dependencies.
- **API Boundary Isolation:** Explicitly removed `default_workspace` overrides from all API payloads forcing hard UUID validation natively.

### Security
- **Granite Prompt Bridging:** Implemented strict `[CREATOR PERSONA]` bracket logic entirely eliminating off-topic hallucinative AI drifts.
