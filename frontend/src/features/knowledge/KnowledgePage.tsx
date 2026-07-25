import { useState, useRef, useEffect, useCallback } from 'react';
import { PageContainer } from '../../shared/components/PageContainer';
import { Upload, Trash2, FileText, Loader2, AlertCircle, CheckCircle2, Search, Filter, ChevronLeft, ChevronRight, X, RefreshCw } from 'lucide-react';
import { uploadDocumentAPI, fetchDocumentsAPI, deleteDocumentAPI, bulkDeleteDocumentsAPI, bulkReindexDocumentsAPI } from './api/knowledge.api';
import { useWorkspaceStore } from '../workspaces/useWorkspaceStore';

export function KnowledgePage() {
  const { activeWorkspace } = useWorkspaceStore();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Table state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Selection & Details
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      if (!activeWorkspace) {
        setLoading(false);
        return;
      }

      const data = await fetchDocumentsAPI(
        activeWorkspace.id,
        page, limit, search, sortBy, sortOrder, filterType, filterStatus
      );
      setDocuments(data.items);
      setTotal(data.total);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load documents.' });
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace?.id, page, limit, search, sortBy, sortOrder, filterType, filterStatus]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Bulk Actions
  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === documents.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(documents.map(d => d.id)));
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} documents?`)) return;
    try {
      await bulkDeleteDocumentsAPI(Array.from(selectedIds));
      setMessage({ type: 'success', text: `Deleted ${selectedIds.size} documents` });
      setSelectedIds(new Set());
      loadDocuments();
    } catch (e) {
      setMessage({ type: 'error', text: 'Bulk delete failed.' });
    }
  };

  const handleBulkReindex = async () => {
    try {
      await bulkReindexDocumentsAPI(Array.from(selectedIds));
      setMessage({ type: 'success', text: `Queued ${selectedIds.size} documents for reindexing` });
      setSelectedIds(new Set());
      loadDocuments();
    } catch (e) {
      setMessage({ type: 'error', text: 'Bulk reindex failed.' });
    }
  };

  // Upload handler
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleUpload(e.target.files[0]);
  };

  const handleUpload = async (file: File) => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploading(true);
    setProgress(0);
    setMessage(null);
    try {
      if (!activeWorkspace) {
        setMessage({
          type: 'error',
          text: 'No workspace selected.'
        });
        return;
      }

      await uploadDocumentAPI(
        file,
        activeWorkspace.id,
        (p) => setProgress(p)
      );
      setMessage({ type: 'success', text: `${file.name} successfully uploaded!` });
      loadDocuments();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to upload document.' });
    } finally {
      setUploading(false);
    }
  };

  // File size formatter
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <PageContainer
      title="Knowledge Library"
      subtitle="Manage your extracted workspace documents, metadata, and intelligence readiness."
      action={
        <div className="flex space-x-3">
          <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx,.md,.txt,.markdown" onChange={handleFileChange} />
          {selectedIds.size > 0 && (
            <div className="flex space-x-2 mr-4 border-r border-neutral-300 pr-4">
              <span className="text-sm self-center text-neutral-500 font-medium">{selectedIds.size} selected</span>
              <button onClick={handleBulkReindex} className="px-3 py-1.5 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded-md text-sm transition">Re-index</button>
              <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm transition">Delete</button>
            </div>
          )}
          <button
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            {uploading ? `Uploading... ${progress}%` : 'Upload Document'}
          </button>
        </div>
      }
    >
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
        className="space-y-4"
      >
        {message && (
          <div className={`p-4 rounded-md flex items-center ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message.type === 'error' ? <AlertCircle className="w-5 h-5 mr-3" /> : <CheckCircle2 className="w-5 h-5 mr-3" />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        {/* Toolbar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search explicitly by filename or contents..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 w-full border border-neutral-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex space-x-3 w-full md:w-auto overflow-x-auto">
            <select className="border border-neutral-300 rounded-md text-sm px-3 py-2" value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}>
              <option value="">All Types</option>
              <option value=".pdf">PDF</option>
              <option value=".docx">DOCX</option>
              <option value=".txt">TXT</option>
            </select>
            <select className="border border-neutral-300 rounded-md text-sm px-3 py-2" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              <option value="INDEXED">Indexed</option>
              <option value="FAILED">Failed</option>
            </select>
            <select className="border border-neutral-300 rounded-md text-sm px-3 py-2" value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}>
              <option value="created_at">Sort by Date</option>
              <option value="filename">Sort by Name</option>
              <option value="file_size">Sort by Size</option>
              <option value="chunk_count">Sort by Chunks</option>
            </select>
            <select className="border border-neutral-300 rounded-md text-sm px-3 py-2" value={sortOrder} onChange={(e) => { setSortOrder(e.target.value); setPage(1); }}>
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
        </div>

        {/* Document Table */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          )}
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left w-12">
                  <input type="checkbox" checked={selectedIds.size === documents.length && documents.length > 0} onChange={toggleAll} className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500" />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">File Details</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Size</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Intelligence</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {documents.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-500">
                    <p className="font-medium text-neutral-900 border-2 border-dashed border-neutral-200 rounded-xl max-w-sm mx-auto p-12">Drag & Drop knowledge documents here to begin.</p>
                  </td>
                </tr>
              )}
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-neutral-50 cursor-pointer transition-colors" onClick={() => setSelectedDoc(doc)}>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds.has(doc.id)} onChange={() => toggleSelection(doc.id)} className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-neutral-900 truncate max-w-[200px] sm:max-w-xs">{doc.filename}</p>
                        <p className="text-xs text-neutral-500">{new Date(doc.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 hidden md:table-cell">
                    {formatBytes(doc.file_size)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 hidden md:table-cell">
                    <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-medium">{doc.chunk_count} Chunks</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${doc.status === 'INDEXED' ? 'bg-green-100 text-green-800' : doc.status === 'FAILED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {doc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-neutral-200">
            <div className="text-sm text-neutral-500">
              Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, total)}</span> of <span className="font-medium">{total}</span> results
            </div>
            <div className="flex space-x-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={page * limit >= total} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Snapshot Drawer */}
      {selectedDoc && (
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 bg-neutral-900/30 backdrop-blur-sm transition-opacity" onClick={() => setSelectedDoc(null)} />
          <div className="fixed inset-y-0 right-0 max-w-md w-full flex">
            <div className="w-full h-full bg-white shadow-2xl flex flex-col p-6 overflow-y-auto transform transition-transform">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <h2 className="text-lg font-bold text-neutral-900 truncate pr-4">{selectedDoc.filename}</h2>
                <button onClick={() => setSelectedDoc(null)} className="text-neutral-400 hover:text-neutral-500 bg-neutral-100 rounded-full p-1"><X className="w-5 h-5" /></button>
              </div>

              <div className="mt-6 space-y-6 flex-1">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-1">AI Readiness</h4>
                    <p className="text-sm font-semibold text-indigo-900">Fully Mapped in ChromaDB</p>
                  </div>
                  <FileText className="w-8 h-8 text-indigo-300" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-2">Meta Properties</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-50 rounded-lg p-3">
                      <p className="text-xs text-neutral-500 mb-1">File Type</p>
                      <p className="text-sm font-medium uppercase">{selectedDoc.file_type.substring(1)}</p>
                    </div>
                    <div className="bg-neutral-50 rounded-lg p-3">
                      <p className="text-xs text-neutral-500 mb-1">Size</p>
                      <p className="text-sm font-medium">{formatBytes(selectedDoc.file_size)}</p>
                    </div>
                    <div className="bg-neutral-50 rounded-lg p-3">
                      <p className="text-xs text-neutral-500 mb-1">Upload Date</p>
                      <p className="text-sm font-medium">{new Date(selectedDoc.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-neutral-50 rounded-lg p-3">
                      <p className="text-xs text-neutral-500 mb-1">Vector Chunks</p>
                      <p className="text-sm font-medium">{selectedDoc.chunk_count}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-2 whitespace-nowrap overflow-hidden">Extracted Preview (Chunk [0])</h3>
                  <div className="bg-slate-900 rounded-xl p-4 text-slate-300 font-mono text-xs leading-relaxed max-h-48 overflow-y-auto w-full">
                    {selectedDoc.preview_text || "No preview extracted or metadata only."}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100 flex gap-3">
                <button onClick={() => { setSelectedDoc(null); handleBulkReindex(); }} className="flex-1 px-4 py-2 bg-neutral-100 text-neutral-700 font-medium rounded-lg hover:bg-neutral-200 transition">Re-index</button>
                <button onClick={() => { const id = selectedDoc.id; setSelectedDoc(null); bulkDeleteDocumentsAPI([id]).then(() => loadDocuments()); }} className="flex-1 px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

