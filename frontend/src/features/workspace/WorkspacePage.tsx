import { useState, useRef, useEffect } from 'react';
import { PageContainer } from '../../shared/components/PageContainer';
import { Send, Bot, User, Loader2, Quote, XCircle, RotateCw } from 'lucide-react';
import { fetchStream, StreamEvent } from '../../shared/utils/stream';
import { useWorkspaceStore } from '../workspaces/useWorkspaceStore';

type Citation = {
  source: string;
  chunk_index: number;
  text_preview: string;
};

type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  citations?: Citation[];
  responseTime?: number;
  status?: 'thinking' | 'generating' | 'completed' | 'failed' | 'cancelled';
  activeWorkspace?: string;
};

export function WorkspacePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      content: 'I am connected to your RAG Knowledge Base and Creator Profile. Start asking me questions!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<'idle' | 'thinking' | 'generating'>('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<any>(null);
  const lastQuestionRef = useRef<string>('');

  // Auto-scroll logic dependency
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStatus]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleSend = async (e?: React.FormEvent, retryText?: string) => {
    if (e) e.preventDefault();
    
    const query = retryText || input;
    if (!query.trim() || loading) return;

    if (!retryText) {
      setInput('');
    }
    
    lastQuestionRef.current = query;
    const userMsgId = Date.now().toString();
    const aiMsgId = (Date.now() + 1).toString();

    // Setup optimistic UI
    if (!retryText) {
      setMessages(prev => [...prev, { id: userMsgId, role: 'user', content: query }]);
    }
    
    setMessages(prev => [...prev, { 
      id: aiMsgId, 
      role: 'ai', 
      content: '', 
      status: 'thinking' 
    }]);

    setLoading(true);
    setCurrentStatus('thinking');
    setElapsedTime(0);

    // Setup elapsed time timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    // Setup AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulatedContent = '';

    await fetchStream(
      '/chat/stream',
      {
        question: query,
        workspace_id: useWorkspaceStore.getState().activeWorkspace?.id || '',
      },
      {
        signal: controller.signal,
        onEvent: (event: StreamEvent) => {
          if (event.type === 'status') {
            if (event.status === 'thinking') {
              setCurrentStatus('thinking');
              setMessages(prev =>
                prev.map(m => m.id === aiMsgId ? { ...m, status: 'thinking' } : m)
              );
            } else if (event.status === 'generating') {
              setCurrentStatus('generating');
              setMessages(prev =>
                prev.map(m => m.id === aiMsgId ? { ...m, status: 'generating' } : m)
              );
            } else if (event.status === 'completed') {
              setCurrentStatus('idle');
              if (timerRef.current) clearInterval(timerRef.current);
              setMessages(prev =>
                prev.map(m =>
                  m.id === aiMsgId
                    ? {
                        ...m,
                        status: 'completed',
                        citations: event.citations,
                        responseTime: event.elapsed,
                      }
                    : m
                )
              );
            }
          } else if (event.type === 'token') {
            accumulatedContent += event.content || '';
            setMessages(prev =>
              prev.map(m => m.id === aiMsgId ? { ...m, content: accumulatedContent } : m)
            );
          } else if (event.type === 'error') {
            setCurrentStatus('idle');
            if (timerRef.current) clearInterval(timerRef.current);
            setMessages(prev =>
              prev.map(m =>
                m.id === aiMsgId
                  ? {
                      ...m,
                      status: 'failed',
                      content: accumulatedContent + `\n\n[Generation error: ${event.message}]`,
                    }
                  : m
              )
            );
          }
        },
        onError: (err: any) => {
          setCurrentStatus('idle');
          if (timerRef.current) clearInterval(timerRef.current);
          setMessages(prev =>
            prev.map(m =>
              m.id === aiMsgId
                ? {
                    ...m,
                    status: 'failed',
                    content: accumulatedContent + `\n\n[Connection failure: ${err.message}]`,
                  }
                : m
            )
          );
        }
      }
    );

    setLoading(false);
    setCurrentStatus('idle');
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setCurrentStatus('idle');
      setLoading(false);
      if (timerRef.current) clearInterval(timerRef.current);
      // Update last message to cancelled status
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'ai' && last.status !== 'completed') {
          return prev.slice(0, -1).concat({
            ...last,
            status: 'cancelled',
            content: last.content + ' [Generation Cancelled]',
          });
        }
        return prev;
      });
    }
  };

  const handleRetry = () => {
    if (lastQuestionRef.current) {
      handleSend(undefined, lastQuestionRef.current);
    }
  };

  return (
    <PageContainer
      title="AI Workspace"
      subtitle="Draft and generate content safely grounded exclusively in your documents."
    >
      <div className="flex flex-col h-[70vh] border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm">
        
        {/* Chat Area */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-neutral-50 scroll-smooth">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {/* Avatar Ai */}
              {msg.role === 'ai' && (
                <div className="flex-shrink-0 bg-indigo-100 rounded-full p-2 mr-4 mt-1 shadow-sm">
                  <Bot className="w-5 h-5 text-indigo-600" />
                </div>
              )}
              
              {/* Message Content Bubble */}
              <div className={`max-w-[75%] rounded-lg py-3 px-5 shadow-sm text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-neutral-200 text-neutral-800'}`}>
                
                <div className="relative">
                  <p className="whitespace-pre-wrap leading-relaxed font-sans">
                    {msg.content}
                    {msg.status === 'generating' && (
                      <span className="inline-block w-2 h-4 bg-indigo-600 ml-1 animate-pulse" style={{ verticalAlign: 'middle' }} />
                    )}
                  </p>
                  
                  {/* Streaming Status Helper */}
                  {msg.status === 'thinking' && (
                    <p className="text-xs text-neutral-400 italic flex items-center space-x-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                      <span>Thinking...</span>
                    </p>
                  )}
                  {msg.status === 'generating' && msg.content === '' && (
                    <p className="text-xs text-neutral-400 italic">
                      Generating...
                    </p>
                  )}
                </div>
                
                {/* Citations block */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2">
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-tighter">Retrieved Context ({msg.citations.length} chunks)</p>
                    {msg.citations.map((cit, idx) => (
                      <div key={idx} className="bg-neutral-50 border border-neutral-100 rounded p-2 text-xs text-neutral-600 flex items-start">
                        <Quote className="w-3 h-3 mr-2 mt-0.5 text-neutral-400 flex-shrink-0" />
                        <div>
                          <span className="font-semibold">{cit.source}</span> (Idx: {cit.chunk_index})<br />
                          <span className="text-neutral-500 italic mt-0.5 block">{cit.text_preview}</span>
                        </div>
                      </div>
                    ))}
                    {msg.responseTime !== undefined && (
                      <p className="text-xs text-indigo-400 mt-2 italic text-right font-medium">Inference time: {msg.responseTime}s</p>
                    )}
                  </div>
                )}
                
                {/* Cancel/Retry buttons inside specific bubble if it failed or was cancelled */}
                {(msg.status === 'failed' || msg.status === 'cancelled') && (
                  <div className="mt-3 flex items-center space-x-2 pt-2 border-t border-dashed border-neutral-200">
                    <button 
                      onClick={handleRetry}
                      className="flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-805"
                    >
                      <RotateCw className="w-3 h-3 mr-1" /> Retry Generation
                    </button>
                  </div>
                )}
              </div>

               {/* Avatar User */}
               {msg.role === 'user' && (
                <div className="flex-shrink-0 bg-neutral-800 rounded-full p-2 ml-4 mt-1 shadow-sm">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Active Generation Metrics & Action buttons */}
          {currentStatus !== 'idle' && (
            <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-xs text-indigo-700 max-w-sm mx-auto shadow-sm">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="capitalize font-medium">{currentStatus}... ({elapsedTime}s)</span>
              </div>
              <button 
                onClick={handleCancel}
                className="flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-neutral-50 rounded border border-indigo-200 font-semibold transition"
              >
                <XCircle className="w-3.5 h-3.5 text-neutral-500" />
                <span>Cancel</span>
              </button>
            </div>
          )}
          
          <div ref={endOfMessagesRef} className="h-1" />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-neutral-200">
          <form 
            onSubmit={(e) => handleSend(e)}
            className="flex items-center bg-white border border-neutral-300 transition-colors focus-within:border-indigo-500 rounded-md shadow-sm"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your content..."
              className="flex-1 py-3 px-4 focus:outline-none rounded-l-md bg-transparent text-sm"
              disabled={loading}
            />
            <button 
              type="submit"
              aria-label="Send message"
              disabled={loading || !input.trim()}
              className="p-3 text-indigo-600 hover:text-indigo-700 hover:bg-neutral-50 transition border-l border-neutral-300 rounded-r-md disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </PageContainer>
  );
}

