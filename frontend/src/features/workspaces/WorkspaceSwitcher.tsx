import { useState, useEffect } from 'react';
import { Layers, PlusCircle, Pencil, Trash2, Check, X, ChevronDown } from 'lucide-react';
import {
  listWorkspacesAPI, createWorkspaceAPI,
  renameWorkspaceAPI, deleteWorkspaceAPI,
} from './api/workspaces.api';
import { useWorkspaceStore } from './useWorkspaceStore';

type Workspace = { id: string; name: string; description: string };

export function WorkspaceSwitcher() {
  const { activeWorkspace, workspaces, setActiveWorkspace, setWorkspaces } = useWorkspaceStore();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const load = async () => {
    try {
      const list = await listWorkspacesAPI();
      setWorkspaces(list);
      if (!activeWorkspace && list.length > 0) setActiveWorkspace(list[0]);
    } catch { /* ignore */ }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const ws = await createWorkspaceAPI(newName.trim());
    setCreating(false);
    setNewName('');
    await load();
    setActiveWorkspace(ws);
  };

  const handleRename = async (id: string) => {
    if (!editName.trim()) { setEditingId(null); return; }
    await renameWorkspaceAPI(id, editName.trim());
    setEditingId(null);
    await load();
  };

  const handleDelete = async (ws: Workspace) => {
    if (!confirm(`Delete workspace "${ws.name}"? All conversations and documents will be removed.`)) return;
    await deleteWorkspaceAPI(ws.id);
    if (activeWorkspace?.id === ws.id) setActiveWorkspace(workspaces.find(w => w.id !== ws.id) || null);
    await load();
  };

  const handleSwitch = (ws: Workspace) => {
    setActiveWorkspace(ws);
    setOpen(false);
    // Full page events trigger re-fetches in other components via Zustand subscription
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center w-full px-3 py-2 text-sm font-semibold text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition"
      >
        <Layers className="w-4 h-4 mr-2 text-indigo-400" />
        <span className="flex-1 truncate text-left">{activeWorkspace?.name || 'Select Workspace'}</span>
        <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-neutral-800 rounded-lg shadow-xl border border-neutral-700 overflow-hidden">
          <div className="max-h-64 overflow-y-auto py-1">
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                className={`group flex items-center px-3 py-2 cursor-pointer transition
                  ${activeWorkspace?.id === ws.id ? 'bg-indigo-700 text-white' : 'text-neutral-300 hover:bg-neutral-700'}`}
              >
                {editingId === ws.id ? (
                  <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleRename(ws.id); }}
                      autoFocus
                      className="flex-1 bg-neutral-600 text-white text-xs px-2 py-0.5 rounded focus:outline-none"
                    />
                    <button onClick={() => handleRename(ws.id)}><Check className="w-3.5 h-3.5 text-green-400" /></button>
                    <button onClick={() => setEditingId(null)}><X className="w-3.5 h-3.5 text-neutral-400" /></button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 text-sm truncate" onClick={() => handleSwitch(ws)}>{ws.name}</span>
                    <div className="hidden group-hover:flex gap-1 ml-1" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => { setEditingId(ws.id); setEditName(ws.name); }}
                              className="p-1 rounded hover:bg-neutral-600">
                        <Pencil className="w-3 h-3 text-neutral-400" />
                      </button>
                      <button onClick={() => handleDelete(ws)}
                              className="p-1 rounded hover:bg-red-800">
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Create New */}
          <div className="border-t border-neutral-700 p-2">
            {creating ? (
              <div className="flex items-center gap-1">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
                  placeholder="Workspace name…"
                  autoFocus
                  className="flex-1 bg-neutral-700 text-white text-xs px-2 py-1 rounded focus:outline-none"
                />
                <button onClick={handleCreate}><Check className="w-4 h-4 text-green-400" /></button>
                <button onClick={() => setCreating(false)}><X className="w-4 h-4 text-neutral-400" /></button>
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="flex items-center w-full px-2 py-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> New Workspace
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
