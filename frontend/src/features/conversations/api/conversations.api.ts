import { apiClient } from '../../../shared/utils/axios';

export const createConversationAPI = async (workspaceId = 'default_workspace') => {
  const { data } = await apiClient.post('/conversations/', { workspace_id: workspaceId });
  return data;
};

export const listConversationsAPI = async (workspaceId = 'default_workspace', search = '') => {
  const { data } = await apiClient.get('/conversations/', {
    params: { workspace_id: workspaceId, search: search || undefined },
  });
  return data;
};

export const getConversationAPI = async (id: string) => {
  const { data } = await apiClient.get(`/conversations/${id}`);
  return data;
};

export const renameConversationAPI = async (id: string, title: string) => {
  const { data } = await apiClient.patch(`/conversations/${id}`, { title });
  return data;
};

export const deleteConversationAPI = async (id: string) => {
  await apiClient.delete(`/conversations/${id}`);
};
