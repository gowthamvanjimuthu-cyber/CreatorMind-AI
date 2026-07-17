import { apiClient } from '../../../shared/utils/axios';

export const generateContentAPI = async (payload: {
  content_type: string;
  topic: string;
  instructions?: string;
  tone_override?: string;
  parent_id?: string;
}) => {
  const { data } = await apiClient.post('/writing/generate', {
    ...payload,
    workspace_id: 'default_workspace',
  });
  return data;
};

export const getDraftsAPI = async (page: number = 1, limit: number = 10) => {
  const { data } = await apiClient.get(`/writing/drafts?page=${page}&limit=${limit}`);
  return data;
};

export const getDraftVersionsAPI = async (draftId: string) => {
  const { data } = await apiClient.get(`/writing/drafts/${draftId}/versions`);
  return data;
};

export const toggleFavoriteAPI = async (draftId: string, isFavorite: number) => {
  const { data } = await apiClient.put(`/writing/drafts/${draftId}/favorite?is_favorite=${isFavorite}`);
  return data;
};

export const changeStatusAPI = async (draftId: string, status: string) => {
  const { data } = await apiClient.put(`/writing/drafts/${draftId}/status?status=${status}`);
  return data;
};

export const deleteDraftAPI = async (draftId: string) => {
  const { data } = await apiClient.delete(`/writing/drafts/${draftId}`);
  return data;
};
