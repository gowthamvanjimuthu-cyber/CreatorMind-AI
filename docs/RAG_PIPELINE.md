# Retrieval-Augmented Generation (RAG) 📚

CreatorMind's core capability depends heavily on grounding models exclusively against private data silos isolated entirely away from external foundation model training logic.

## 1. Ingestion Pipeline
`/backend/app/services/document_service.py` rules the ingestion pathway.

1. **Upload:** A user attaches `.pdf` or `.docx` structures.
2. **Parsing:** The document natively parses raw textual logic utilizing lightweight buffer extraction hooks mapping exactly up to 10 MB constraints.
3. **Chunking:** `RecursiveCharacterTextSplitter` breaks massive texts exactly into 1000-character matrices providing reasonable overlap (usually 100-200 characters) to ensure sentence boundaries aren't arbitrarily dropped.

## 2. Vector Persistence
Every generated chunk fires into **ChromaDB**.
- **Location:** Managed under `/backend/app/rag/store.py`.
- **Dimensionality:** Powered using robust embeddings mapping vectors against cosine similarity matrices.
- **Metadata Bindings:** Crucially, each vector attaches `{"user_id": UUID, "workspace_id": UUID}`.

## 3. Retrieval Pipeline
When User asks a question or generates a LinkedIn post:
1. ChromaDB runs `similarity_search(query, k=5)`.
2. A strict `$and` JSON meta-filter is appended against the query.
   ```python
   metadata_filter = {"$and": [{"user_id": user_id}, {"workspace_id": workspace_id}]}
   ```
3. The closest `k` vectors merge perfectly into an immutable string wrapper `[KNOWLEDGE BASE]` before firing into the IBM inference cycle.
