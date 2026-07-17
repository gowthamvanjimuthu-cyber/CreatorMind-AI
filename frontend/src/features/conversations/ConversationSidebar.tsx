import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PlusCircle, Search, Trash2, Pencil, MessageSquare, Check, X,
} from 'lucide-react';
import {
  listConversationsAPI, createConversationAPI,
  renameConversationAPI, deleteConversationAPI,
} from './api/conversations.api';
import { useWorkspaceStore } from '../workspaces/useWorkspaceStore';

type Conversation = {
  id: string;
  title: string;
  message_count: number;
  updated_at: string;
};

export function ConversationSidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspaceStore();

  const load = useCallback(async () => {
    if (!activeWorkspace) return;
    try {
      const data = await listConversationsAPI(activeWorkspace.id, search);
      setConversations(data);
      if (!activeId && data.length > 0) {
        setActiveId(data[0].id);
        navigate(`/workspace/${data[0].id}`);
      }
    } catch { /* silently ignore */ }
  }, [search, activeWorkspace]);

  useEffect(() => { load(); }, [load]);

  const handleNew = async () => {
    if (!activeWorkspace) return;
    const conv = await createConversationAPI(activeWorkspace.id);
    setActiveId(conv.id);
    await load();
    navigate(`/workspace/${conv.id}`);
  };

  const handleRename = async (id: string) => {
    if (!editTitle.trim()) { setEditingId(null); return; }
    await renameConversationAPI(id, editTitle.trim());
    setEditingId(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this conversation? This cannot be undone.')) return;
    await deleteConversationAPI(id);
    if (activeId === id) {
      setActiveId(null);
      navigate('/workspace');
    }
    load();
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-white w-64">
      <div className="p-4 border-b border-neutral-700">
        <button
          onClick={handleNew}
          aria-label="New Chat"
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-semibold transition"
        >
          <PlusCircle className="w-4 h-4" /> New Chat
        </button>
        <div className="mt-3 flex items-center bg-neutral-800 rounded-md px-3 py-1.5">
          <Search className="w-4 h-4 text-neutral-400 mr-2 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            aria-label="Search conversations"
            className="bg-transparent text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none w-full"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {conversations.length === 0 && (
          <p className="text-xs text-neutral-500 text-center mt-8 px-4">
            No conversations yet. Start a new chat!
          </p>
        )}
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => { setActiveId(conv.id); navigate(`/workspace/${conv.id}`); }}
            className={`group flex items-start px-3 py-2.5 mx-2 rounded-lg cursor-pointer transition
              ${activeId === conv.id
                ? 'bg-indigo-700 text-white'
                : 'text-neutral-300 hover:bg-neutral-800'
              }`}
          >
            <MessageSquare className="w-4 h-4 mr-2.5 mt-0.5 flex-shrink-0 text-neutral-400" />

            <div className="flex-1 min-w-0">
              {editingId === conv.id ? (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleRename(conv.id); }}
                    autoFocus
                    aria-label="Edit conversation title"
                    className="bg-neutral-700 text-white text-xs rounded px-2 py-0.5 w-full focus:outline-none"
                  />
                  <button onClick={() => handleRename(conv.id)} aria-label="Save title"><Check className="w-3.5 h-3.5 text-green-400" /></button>
                  <button onClick={() => setEditingId(null)} aria-label="Cancel editing"><X className="w-3.5 h-3.5 text-neutral-400" /></button>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium truncate">{conv.title}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{conv.message_count} messages</p>
                </>
              )}
            </div>

            {editingId !== conv.id && (
              <div className="hidden group-hover:flex items-center gap-1 ml-1 flex-shrink-0"
                   onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => { setEditingId(conv.id); setEditTitle(conv.title); }}
                  className="p-1 rounded hover:bg-neutral-600"
                  title="Rename"
                  aria-label="Rename conversation"
                >
                  <Pencil className="w-3.5 h-3.5 text-neutral-400" />
                </button>
                <button
                  onClick={() => handleDelete(conv.id)}
                  className="p-1 rounded hover:bg-red-800"
                  title="Delete"
                  aria-label="Delete conversation"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
