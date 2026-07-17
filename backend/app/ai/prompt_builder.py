from typing import List

class PromptTemplates:
    """Central registry for all prompt skeletons (No hardcoded domain strings)."""
    BASE_SYSTEM = "You are a helpful AI assistant."
    
class ContextBuilder:
    """Separates chunk aggregation logic from prompt templating."""
    @staticmethod
    def build_context(chunks: List[str]) -> str:
        if not chunks:
            return ""
        return "\n".join([f"Context {i+1}: {chunk}" for i, chunk in enumerate(chunks)])

class PromptBuilder:
    """Orchestrates templates, context, and user input into a final string."""
    @staticmethod
    def construct_prompt(system: str, context: str, query: str) -> str:
        return f"{system}\n\n# CONTEXT:\n{context}\n\n# QUERY:\n{query}"

class ResponseParser:
    """Handles post-generation unstructured text shaping."""
    @staticmethod
    def parse(raw_response: str) -> str:
        return raw_response.strip()
