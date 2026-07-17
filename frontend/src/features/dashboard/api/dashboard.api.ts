import { apiClient } from '../../../shared/utils/axios';

export interface DashboardMetrics {
  workspaces: {
    total: number;
    active_name: string;
    total_documents: number;
    total_conversations: number;
    total_messages: number;
  };
  knowledge: {
    total_chunks: number;
    indexed_documents: number;
    failed_uploads: number;
    average_chunk_size: number;
  };
  ai: {
    questions_asked: number;
    responses_generated: number;
    average_response_time: number;
    granite_requests: number;
    average_confidence_score: number;
  };
  writing: {
    total_content: number;
    linkedin: number;
    blog: number;
    newsletter: number;
    twitter: number;
    youtube: number;
    instagram: number;
  };
  creator: {
    confidence: number;
    keywords: number;
    documents_analyzed: number;
    average_style_match: number;
  };
  timeline: Array<{
    type: 'document' | 'conversation' | 'generation';
    title: string;
    timestamp: string;
    details: string;
  }>;
}

export const getDashboardMetricsAPI = async (workspaceId = 'default_workspace'): Promise<DashboardMetrics> => {
  const { data } = await apiClient.get('/dashboard/metrics', {
    params: { workspace_id: workspaceId }
  });
  return data;
};
