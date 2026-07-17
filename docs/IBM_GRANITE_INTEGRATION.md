# IBM Granite Integration 🧠⚡

CreatorMind natively bypasses generic OpenAI integration by binding directly to the enterprise-grade foundation models housed inside **IBM watsonx**. 

## 1. The Granite Provider Adapter
Inside `/backend/app/ai/providers/granite_provider.py`, we implement a strict Factory adapter conforming to the unified `AIProvider` base class.

This pattern specifically abstracts external API invocations away from the core business loop.

### Why Granite?
- **Speed:** Models optimized highly for structured text generation.
- **Safety:** Built natively for zero-hallucination compliance.
- **Structure mapping:** Performs outstandingly mapping JSON outputs during `StyleExtraction`.

## 2. Real-World Execution Flows

### A) The Profile Extractor
When a Creator uploads a PDF to mimic:
1. `StyleAnalyzer` samples 5 random document chunks to prevent Context Token limits overflowing.
2. The `AIOrchestrator` requests the IBM Granite instance.
3. Granite extracts semantic characteristics (Reading level, Tone, Format Preferences) and maps them into rigid JSON mapping schemas bypassing generic raw string hallucinations.
4. The traits persist back into the profile database.

### B) Streaming Inferences
Through the Writing Studio, users request content generations.
1. The RAG vector store yields relevance contexts.
2. The `PromptComposer` builds:
   ```text
   [SYSTEM INSTRUCTIONS]
   You are generating <X>. Base it solely on <KNOWLEDGE BASE>.
   Wait! Mimic this exact style constraint: <CREATOR PERSONA>.
   ```
3. Granite generates streams over Server Sent Events directly into the React UI yielding extreme low latency.
