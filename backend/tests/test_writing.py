from unittest.mock import patch, MagicMock

def test_generate_linkedin_post(client):
    mock_chunks = []

    with patch("app.rag.store.VectorStore.similarity_search", return_value=mock_chunks), \
         patch("app.ai.dependencies.get_ai_provider") as mock_prov:
        provider = MagicMock()
        provider.generate.return_value = "Here is your LinkedIn post about AI."
        mock_prov.return_value = provider

        resp = client.post("/api/v1/writing/generate", json={
            "content_type": "linkedin_post",
            "topic": "Why RAG beats fine-tuning",
        })

    assert resp.status_code == 200
    data = resp.json()
    assert "generated_content" in data
    assert data["style_match_score"] >= 0

def test_generate_invalid_content_type(client):
    resp = client.post("/api/v1/writing/generate", json={
        "content_type": "podcast",
        "topic": "Something",
    })
    assert resp.status_code == 422


def test_generate_stream(client):
    mock_chunks = []

    async def mock_stream_generate(prompt):
        yield "Streaming"
        yield " "
        yield "draft"

    with patch("app.rag.store.VectorStore.similarity_search", return_value=mock_chunks), \
         patch("app.ai.dependencies.get_ai_provider") as mock_prov:
        provider = MagicMock()
        provider.stream_generate = mock_stream_generate
        mock_prov.return_value = provider

        resp = client.post("/api/v1/writing/generate/stream", json={
            "content_type": "linkedin_post",
            "topic": "Why RAG beats fine-tuning",
        })

    assert resp.status_code == 200
    # Make sure we have SSE chunks
    lines = [line.decode("utf-8") for line in resp.iter_lines() if line]
    assert len(lines) > 0
    assert any("completed" in line or "token" in line for line in lines)

