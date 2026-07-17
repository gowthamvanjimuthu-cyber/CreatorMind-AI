from unittest.mock import patch, MagicMock

def test_chat_returns_answer(client):
    mock_chunks = []

    with patch("app.rag.store.VectorStore.similarity_search", return_value=mock_chunks), \
         patch("app.ai.dependencies.get_ai_provider") as mock_prov:
        provider = MagicMock()
        provider.generate.return_value = "Mocked AI answer."
        mock_prov.return_value = provider

        resp = client.post("/api/v1/chat/", json={
            "question": "What is CreatorMind?",
            "workspace_id": "default_workspace"
        })

    assert resp.status_code == 200
    data = resp.json()
    assert "answer" in data
    assert "citations" in data
    assert "response_time" in data


def test_chat_stream(client):
    mock_chunks = []

    async def mock_stream_chat(prompt, history=None):
        yield "Streaming"
        yield " "
        yield "answer"

    with patch("app.rag.store.VectorStore.similarity_search", return_value=mock_chunks), \
         patch("app.ai.dependencies.get_ai_provider") as mock_prov:
        provider = MagicMock()
        provider.stream_chat = mock_stream_chat
        mock_prov.return_value = provider

        resp = client.post("/api/v1/chat/stream", json={
            "question": "What is CreatorMind?",
            "workspace_id": "default_workspace"
        })

    assert resp.status_code == 200
    # Make sure we have SSE chunks
    lines = [line.decode("utf-8") for line in resp.iter_lines() if line]
    assert len(lines) > 0
    assert any("completed" in line or "token" in line for line in lines)

