import { apiClient } from '../../../shared/utils/axios';

export const listWorkspacesAPI = async () => {
  const { data } = await apiClient.get('/workspaces/');
  return data;
};

export const getDefaultWorkspaceAPI = async () => {
  const { data } = await apiClient.get('/workspaces/default');
  return data;
};

export const createWorkspaceAPI = async (name: string, description = '') => {
  const { data } = await apiClient.post('/workspaces/', { name, description });
  return data;
};

export const renameWorkspaceAPI = async (id: string, name: string) => {
  const { data } = await apiClient.patch(`/workspaces/${id}`, { name });
  return data;
};

export const deleteWorkspaceAPI = async (id: string) => {
  await apiClient.delete(`/workspaces/${id}`);
};
