import io
from unittest.mock import patch, MagicMock

def test_upload_txt_document(client):
    mock_result = MagicMock()
    mock_result.success = True
    mock_result.chunks = [MagicMock(chunk_index=0, text="Hello world")]
    mock_result.error_message = None

    with patch("app.services.document_service.DocumentPipeline.process_file", return_value=mock_result), \
         patch("app.services.document_service.VectorStore.add_documents", return_value=True), \
         patch("app.memory_engine.style_analyzer.StyleAnalyzer.extract_and_update"):

        file_data = io.BytesIO(b"This is a test document content.")
        resp = client.post(
            "/api/v1/documents/upload",
            files={"file": ("test_doc.txt", file_data, "text/plain")},
        )
    assert resp.status_code == 200
    data = resp.json()
    assert data["filename"] == "test_doc.txt"
    assert data["status"] == "INDEXED"

def test_upload_invalid_type(client):
    resp = client.post(
        "/api/v1/documents/upload",
        files={"file": ("bad.exe", b"binary", "application/octet-stream")},
    )
    assert resp.status_code == 400

def test_list_documents(client):
    resp = client.get("/api/v1/documents/")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
