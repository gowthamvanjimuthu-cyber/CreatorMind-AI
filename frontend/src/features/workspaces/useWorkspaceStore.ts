import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Workspace = { id: string; name: string; description: string };

interface WorkspaceState {
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  setActiveWorkspace: (ws: Workspace) => void;
  setWorkspaces: (list: Workspace[]) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeWorkspace: null,
      workspaces: [],
      setActiveWorkspace: (ws) => set({ activeWorkspace: ws }),
      setWorkspaces: (list) => set({ workspaces: list }),
    }),
    { name: 'creatormind-workspace' }
  )
);
