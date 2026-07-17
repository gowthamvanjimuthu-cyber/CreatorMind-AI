import { useAuthStore } from '../hooks/useAuth';

export interface StreamEvent {
  type: 'status' | 'token' | 'error' | 'done';
  status?: 'thinking' | 'generating' | 'completed';
  content?: string;
  message?: string;
  partial_content?: string;
  elapsed?: number;
  id?: string;
  version_number?: number;
  style_match_score?: number;
  confidence_score?: number;
  citations?: Array<{ source: string; chunk_index: number; text_preview: string }>;
  retrieved_chunks?: number;
}

interface StreamOptions {
  onEvent: (event: StreamEvent) => void;
  onError: (error: Error) => void;
  signal?: AbortSignal;
}

export const fetchStream = async (
  path: string,
  body: any,
  options: StreamOptions
) => {
  const token = useAuthStore.getState().token;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
  
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      signal: options.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Request failed with status ${response.status}`);
    }

    if (!response.body) {
      throw new Error('ReadableStream not supported by the response body.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      // Keep the last partial line (if any) in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed === 'data: [DONE]') {
          options.onEvent({ type: 'done' });
          continue;
        }
        if (trimmed.startsWith('data: ')) {
          try {
            const dataStr = trimmed.slice(6);
            const parsed = JSON.parse(dataStr) as StreamEvent;
            options.onEvent(parsed);
          } catch (e) {
            console.error('Failed to parse SSE JSON line:', trimmed, e);
          }
        }
      }
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      // Generation cancelled by user
      return;
    }
    options.onError(error);
  }
};
