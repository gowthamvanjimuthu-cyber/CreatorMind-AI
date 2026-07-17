import { apiClient } from '../../../shared/utils/axios';

export const uploadDocumentAPI = async (file: File, workspaceId: string, onProgress?: (percent: number) => void) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const { data } = await apiClient.post('/documents/upload', formData, {
    params: { workspace_id: workspaceId },
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    }
  });
  return data;
};

export const fetchDocumentsAPI = async (
  workspaceId: string,
  page = 1,
  limit = 20,
  search?: string,
  sortBy = 'created_at',
  sortOrder = 'desc',
  fileType?: string,
  status?: string
) => {
  const { data } = await apiClient.get('/documents/', {
    params: {
      workspace_id: workspaceId,
      page,
      limit,
      search: search || undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
      file_type: fileType || undefined,
      status: status || undefined
    }
  });
  return data;
};

export const deleteDocumentAPI = async (id: string) => {
  await apiClient.delete(`/documents/${id}`);
};

export const bulkDeleteDocumentsAPI = async (documentIds: string[]) => {
  const { data } = await apiClient.post('/documents/bulk/delete', { document_ids: documentIds });
  return data;
};

export const bulkReindexDocumentsAPI = async (documentIds: string[]) => {
  const { data } = await apiClient.post('/documents/bulk/reindex', { document_ids: documentIds });
  return data;
};
