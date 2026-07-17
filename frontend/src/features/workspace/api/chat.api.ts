import { apiClient } from '../../../shared/utils/axios';

export const sendChatAPI = async (question: string) => {
  const { data } = await apiClient.post('/chat/', {
    question: question,
    workspace_id: 'default_workspace',
  });
  return data;
};
