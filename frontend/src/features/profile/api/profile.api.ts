import { apiClient } from '../../../shared/utils/axios';

export interface CreatorProfile {
  creator_style: string;
  tone: string;
  audience: string;
  reading_level: string;
  vocabulary: string;
  writing_patterns: string;
  sentence_length: string;
  paragraph_length: string;
  question_usage: string;
  emoji_usage: string;
  cta_frequency: string;
  preferred_formatting: string;
  keywords: string[];
  confidence_score: number;
  last_updated: string;
}

export const getCreatorProfileAPI = async (): Promise<CreatorProfile> => {
  const { data } = await apiClient.get('/profile/');
  return data;
};

export const reanalyzeProfileAPI = async (): Promise<{ status: string; job_id: string }> => {
  const { data } = await apiClient.post('/profile/reanalyze');
  return data;
};
