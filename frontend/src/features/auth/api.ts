import { apiClient } from '../../shared/utils/axios';

export const loginAPI = async (credentials: any) => {
  const { data } = await apiClient.post('/auth/login', credentials);
  return data;
};

export const registerAPI = async (credentials: any) => {
  const { data } = await apiClient.post('/auth/signup', credentials);
  return data;
};

export const getMeAPI = async () => {
  const { data } = await apiClient.get('/auth/me');
  return data;
};
