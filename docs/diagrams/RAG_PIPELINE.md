# RAG Pipeline Execution

```mermaid
graph TD
    %% Ingestion Flow
    Upload[User Uploads PDF/DOCX] --> Parse[Document Processor\n(Docling/PyMuPDF limit: 10MB)]
    Parse --> Chunking[RecursiveCharacterTextSplitter\n1000 char blocks, 200 overlap]
    Chunking --> Embed[Embedding Generator]
    Embed --> ChromaStore[(ChromaDB)]
    
    %% Security Injection
    AuthData[user_id & workspace_id] -.->|Metadata Bind| ChromaStore
    
    %% Style Injection
    Parse --> StyleAnalyzer[Style Analyzer]
    StyleAnalyzer -->|Sample Chunk Inference| GraniteExtraction[IBM Granite Extraction]
    GraniteExtraction --> ProfileStore[(Creator Profile Store\nTone, Formatting, Reading Level)]

    %% Retrieval & Generation Flow
    UserQuery[User Prompt Context] --> ChromaSearch[ChromaDB Similarity Search]
    AuthData -.->|Metadata \n $and clauses | ChromaSearch
    ChromaSearch --> RelChunks[Top K Relevant Vectors]
    
    RelChunks --> Composer[Prompt Composer]
    ProfileStore --> Composer
    
    Composer -->|Strict Formatted Template\n[CREATOR PERSONA]\n[KNOWLEDGE BASE]| GraniteInference[IBM Granite Inference Engine]
    
    GraniteInference -->|Async Generator| SSEStream[Server Sent Events (SSE) Stream]
    SSEStream --> UI[React UI]
```
