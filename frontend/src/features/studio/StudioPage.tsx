import { useState, useEffect, useRef } from 'react';
import { PageContainer } from '../../shared/components/PageContainer';
import {
  PenLine, Loader2, Copy, RotateCcw, CheckCheck, BookOpen, Zap,
  Save, Star, StarOff, Download, Trash, ChevronLeft, ChevronRight, FileText, DownloadCloud, History, XCircle, RotateCw
} from 'lucide-react';
import { 
  generateContentAPI, getDraftsAPI, getDraftVersionsAPI, 
  toggleFavoriteAPI, changeStatusAPI, deleteDraftAPI 
} from './api/studio.api';
import { fetchStream, StreamEvent } from '../../shared/utils/stream';

const CONTENT_TYPES = [
  { value: 'linkedin_post',     label: 'LinkedIn Post',      emoji: '💼' },
  { value: 'blog',              label: 'Blog Article',       emoji: '📝' },
  { value: 'twitter_thread',    label: 'Twitter Thread',     emoji: '🐦' },
  { value: 'newsletter',        label: 'Newsletter',         emoji: '📧' },
  { value: 'youtube_script',    label: 'YouTube Script',     emoji: '🎬' },
  { value: 'instagram_caption', label: 'Instagram Caption',  emoji: '📸' },
];

export function StudioPage() {
  const [contentType, setContentType] = useState('linkedin_post');
  const [topic, setTopic] = useState('');
  const [instructions, setInstructions] = useState('');
  const [toneOverride, setToneOverride] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Drafts list
  const [drafts, setDrafts] = useState<any[]>([]);
  const [draftsPage, setDraftsPage] = useState(1);
  const [draftsTotal, setDraftsTotal] = useState(0);
  const draftsLimit = 5;

  // Active generation / draft state
  const [activeDraft, setActiveDraft] = useState<any>(null);
  const [activeVersions, setActiveVersions] = useState<any[]>([]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(0);
  
  // Live Streaming Generation State
  const [streamingResult, setStreamingResult] = useState<any>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Regenerate instruction mode
  const [regenMode, setRegenMode] = useState<string>(''); 

  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<any>(null);
  const lastActionRef = useRef<any>(null);
  const editorRef = useRef<HTMLPreElement | null>(null);

  useEffect(() => { loadDrafts(1); }, []);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Auto-scroll logic as streaming text grows
  useEffect(() => {
    if (editorRef.current && streamingResult) {
      editorRef.current.scrollTop = editorRef.current.scrollHeight;
    }
  }, [streamingResult]);

  const loadDrafts = async (page: number) => {
    try {
      const res = await getDraftsAPI(page, draftsLimit);
      setDrafts(res.items);
      setDraftsTotal(res.total);
      setDraftsPage(page);
    } catch(e) {}
  };
  
  const onDraftSelect = async (d: any) => {
    setActiveDraft(d);
    setTopic(d.topic);
    setContentType(d.content_type);
    setStreamingResult(null);
    
    try {
      const versions = await getDraftVersionsAPI(d.id);
      setActiveVersions(versions);
      setCurrentVersionIndex(0); // 0 is latest usually as it was sorted DESC
    } catch(e) {}
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
      setRegenMode('');
      if (timerRef.current) clearInterval(timerRef.current);
      setStreamingResult((prev: any) => prev ? { ...prev, status: 'cancelled', generated_content: prev.generated_content + ' [Generation Cancelled]' } : null);
    }
  };
  
  const handleGenerate = async (customInst?: string) => {
    if (!topic.trim()) { setError('Please enter a topic.'); return; }
    setError('');
    
    // Save last action for retry/regeneration
    lastActionRef.current = { customInst };
    
    setLoading(true);
    setElapsedTime(0);
    
    const parentId = activeDraft ? activeDraft.id : undefined;
    const finalInst = customInst || instructions;
    const targetVersionNumber = activeVersions.length > 0 ? activeVersions[0].version_number + 1 : 1;

    setStreamingResult({
      version_number: targetVersionNumber,
      generated_content: '',
      status: 'thinking',
      style_match_score: 0,
      generation_time: 0
    });

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulatedText = '';

    await fetchStream(
      '/writing/generate/stream',
      {
        content_type: contentType,
        topic,
        instructions: finalInst,
        tone_override: toneOverride || undefined,
        parent_id: parentId
      },
      {
        signal: controller.signal,
        onEvent: async (event: StreamEvent) => {
          if (event.type === 'status') {
            if (event.status === 'thinking') {
              setStreamingResult((prev: any) => ({ ...prev, status: 'thinking' }));
            } else if (event.status === 'generating') {
              setStreamingResult((prev: any) => ({ ...prev, status: 'generating' }));
            } else if (event.status === 'completed') {
              if (timerRef.current) clearInterval(timerRef.current);
              
              setStreamingResult(null);
              setLoading(false);
              setRegenMode('');
              setInstructions('');
              
              // If it's a new draft, refresh drafts list and load
              if (!parentId) {
                await loadDrafts(1);
                // Fetch the new workspace item schema from backend
                const versions = await getDraftVersionsAPI(event.id);
                // Automatically find and setup the parent draft in state
                const res = await getDraftsAPI(1, draftsLimit);
                const active = res.items.find((i: any) => i.id === event.id);
                if (active) {
                  setActiveDraft(active);
                }
                setActiveVersions(versions);
                setCurrentVersionIndex(0);
              } else {
                const versions = await getDraftVersionsAPI(parentId);
                setActiveVersions(versions);
                setCurrentVersionIndex(0);
              }
            }
          } else if (event.type === 'token') {
            accumulatedText += event.content || '';
            setStreamingResult((prev: any) => ({
              ...prev,
              status: 'generating',
              generated_content: accumulatedText
            }));
          } else if (event.type === 'error') {
            if (timerRef.current) clearInterval(timerRef.current);
            setLoading(false);
            setStreamingResult((prev: any) => ({
              ...prev,
              status: 'failed',
              generated_content: accumulatedText + `\n\n[Generation error: ${event.message}]`
            }));
          }
        },
        onError: (err: any) => {
          if (timerRef.current) clearInterval(timerRef.current);
          setLoading(false);
          setStreamingResult((prev: any) => ({
            ...prev,
            status: 'failed',
            generated_content: accumulatedText + `\n\n[Connection failure: ${err.message}]`
          }));
        }
      }
    );
  };

  const currentResult = streamingResult || activeVersions[currentVersionIndex];

  // Stats calculate
  const getWordCount = (text: string) => {
    if (!text) return 0;
    return text.split(/\s+/).filter(Boolean).length;
  };
  const getReadingTime = (words: number) => Math.ceil(words / 200);
  const getGradeLevel = (words: number, sentences: number, syllables: number) => {
    // simplified grading approx
    if (words === 0 || sentences === 0) return 0;
    return Math.max(1, Math.min(12, Math.round(0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59)));
  };
  
  // Helpers
  const handleCopy = () => {
    if (!currentResult) return;
    navigator.clipboard.writeText(currentResult.generated_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleToggleFavorite = async () => {
    if (!activeDraft) return;
    const val = activeDraft.is_favorite ? 0 : 1;
    await toggleFavoriteAPI(activeDraft.id, val);
    setActiveDraft({...activeDraft, is_favorite: val});
    setDrafts(drafts.map(d => d.id === activeDraft.id ? {...d, is_favorite: val} : d));
  };

  const handleExport = (type: string) => {
    if (!currentResult) return;
    let mime = 'text/plain';
    let ext = '.txt';
    let content = currentResult.generated_content;
    
    if (type === 'markdown') {
      mime = 'text/markdown'; ext = '.md';
    } else if (type === 'html') {
      mime = 'text/html'; ext = '.html';
      content = `<html><body><pre>${content}</pre></body></html>`;
    }
    
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `draft_${topic.replace(/\s+/g,'_').substring(0,15)}${ext}`;
    a.click();
  };

  const handleDelete = async () => {
    if(!activeDraft) return;
    await deleteDraftAPI(activeDraft.id);
    setActiveDraft(null); setActiveVersions([]); currentVersionIndex === 0;
    loadDrafts(draftsPage);
  };

  return (
    <PageContainer
      title="Writing Studio"
      subtitle="Professional AI writing environment. Auto-saving, version history, and advanced generation tools."
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT DRAFTS SIDEBAR */}
        <div className="lg:col-span-1 bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full min-h-[600px]">
          <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center">
            <h3 className="font-semibold text-neutral-800 flex items-center">
              <History className="w-4 h-4 mr-2" /> Recent Drafts
            </h3>
            <button 
              onClick={() => { setActiveDraft(null); setTopic(''); setActiveVersions([]); setContentType('linkedin_post'); setRegenMode(''); setInstructions(''); setStreamingResult(null); }} 
              className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 font-medium"
            >
              + New
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {drafts.length === 0 ? (
              <p className="text-center text-sm text-neutral-500 mt-10">No drafts yet.</p>
            ) : drafts.map(d => (
              <div 
                key={d.id} 
                className={`p-3 rounded-lg border text-sm cursor-pointer transition ${activeDraft?.id === d.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-neutral-100 hover:border-neutral-300'}`}
                onClick={() => onDraftSelect(d)}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-neutral-700 truncate w-3/4">{d.topic || 'Untitled'}</span>
                  {d.is_favorite === 1 && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                </div>
                <div className="flex justify-between text-xs text-neutral-500">
                  <span className="capitalize">{d.content_type.replace('_',' ')}</span>
                  <span>{new Date(d.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-neutral-200 p-3 bg-neutral-50 flex justify-between items-center">
            <button 
              disabled={draftsPage <= 1} onClick={() => loadDrafts(draftsPage - 1)}
              className="p-1 rounded hover:bg-neutral-200 disabled:opacity-50"
            ><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-xs font-medium text-neutral-500">Page {draftsPage} of {Math.ceil(draftsTotal / draftsLimit) || 1}</span>
            <button 
              disabled={draftsPage >= Math.ceil(draftsTotal / draftsLimit)} onClick={() => loadDrafts(draftsPage + 1)}
              className="p-1 rounded hover:bg-neutral-200 disabled:opacity-50"
            ><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>

        {/* EDITOR AREA */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Top Form Controls if NEW draft or editable parameters for regeneration */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">Topic</label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} 
                className="w-full border-0 bg-neutral-50 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500" 
                placeholder="What are we writing about?"
                disabled={loading}
              />
            </div>
            <div>
               <label className="block text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">Type</label>
               <select value={contentType} onChange={(e) => setContentType(e.target.value)}
                disabled={loading}
                className="w-full border-0 bg-neutral-50 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500" >
                  {CONTENT_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
               </select>
            </div>
            {!activeDraft && (
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">Action</label>
              <button
                onClick={() => handleGenerate()}
                disabled={loading || !topic.trim()}
                className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Zap className="w-4 h-4 mr-2"/>} Generate
              </button>
            </div>
            )}
          </div>

          {/* MAIN OUTPUT */}
          <div className="bg-white border border-neutral-200 rounded-xl shadow-sm min-h-[500px] flex flex-col">
            
            {/* Header Toolbar */}
            <div className="border-b border-neutral-200 p-4 flex justify-between items-center bg-neutral-50 rounded-t-xl">
              <div className="flex items-center space-x-4">
                {activeDraft && (
                  <>
                    <button onClick={handleToggleFavorite} className="text-neutral-500 hover:text-yellow-600 tooltip" title="Favorite">
                       {activeDraft?.is_favorite === 1 ? <Star className="w-5 h-5 text-yellow-500 fill-current" /> : <StarOff className="w-5 h-5" />}
                    </button>
                    {activeVersions.length > 1 && !streamingResult && (
                      <div className="flex items-center space-x-2 text-sm font-medium bg-neutral-200/50 rounded-lg px-2 py-1">
                        <button disabled={currentVersionIndex >= activeVersions.length - 1} onClick={() => setCurrentVersionIndex(prev => prev + 1)} className="hover:text-black disabled:opacity-30"><ChevronLeft className="w-4 h-4"/></button>
                        <span>Version {currentResult?.version_number}</span>
                        <button disabled={currentVersionIndex <= 0} onClick={() => setCurrentVersionIndex(prev => prev - 1)} className="hover:text-black disabled:opacity-30"><ChevronRight className="w-4 h-4"/></button>
                      </div>
                    )}
                  </>
                )}
                {!activeDraft && !streamingResult && <span className="text-sm font-medium text-neutral-500">New Document</span>}
                {streamingResult && (
                  <span className="text-xs font-semibold bg-indigo-100 text-indigo-750 px-2.5 py-1 rounded-full flex items-center space-x-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-650 inline-block"></span>
                    <span>Version {streamingResult.version_number} ({streamingResult.status})</span>
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {loading && streamingResult && (
                  <button 
                    onClick={handleCancel}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-red-50 text-red-650 hover:bg-red-105 border border-red-200 rounded text-xs font-semibold transition"
                  >
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>Cancel Generation ({elapsedTime}s)</span>
                  </button>
                )}

                {streamingResult && (streamingResult.status === 'failed' || streamingResult.status === 'cancelled') && (
                  <button 
                    onClick={() => handleGenerate(lastActionRef.current?.customInst)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded text-xs font-semibold transition"
                  >
                    <RotateCw className="w-4 h-4 text-indigo-600" />
                    <span>Retry Generation</span>
                  </button>
                )}

                {activeDraft && !loading && (
                  <>
                    <button onClick={() => handleDelete()} className="p-2 text-neutral-500 hover:bg-red-50 hover:text-red-600 rounded">
                      <Trash className="w-4 h-4" />
                    </button>
                    <div className="h-4 w-px bg-neutral-300 mx-1 font-sans"></div>
                    <button onClick={handleCopy} className="p-2 text-neutral-500 hover:bg-neutral-200 rounded animate-fade-in">
                      {copied ? <CheckCheck className="w-4 h-4 text-green-600"/> : <Copy className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleExport('markdown')} title="Export MD" className="p-2 text-neutral-500 hover:bg-neutral-200 rounded flex items-center text-xs font-medium">
                      <Download className="w-4 h-4 mr-1" /> MD
                    </button>
                    <button onClick={() => handleExport('html')} title="Export HTML" className="p-2 text-neutral-500 hover:bg-neutral-200 rounded flex items-center text-xs font-medium">
                       <FileText className="w-4 h-4 mr-1" /> HTML
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* ERROR DISPLAY */}
            {error && <div className="p-4 bg-red-50 text-red-600 border-b border-red-100 text-sm font-sans">{error}</div>}

            {/* CONTENT AREA */}
            <div className="flex-1 p-6 flex flex-col relative overflow-hidden">
               {!currentResult && !loading && (
                  <div className="m-auto text-center text-neutral-400">
                    <PenLine className="w-12 h-12 mb-4 mx-auto text-neutral-300" />
                    <p className="font-medium">Define your topic and click Generate.</p>
                  </div>
               )}
               {loading && (!streamingResult || streamingResult.status === 'thinking') && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center m-auto text-indigo-500">
                     <Loader2 className="w-10 h-10 animate-spin mb-4" />
                     <p className="text-sm font-medium">Connecting and ranking workspace contexts...</p>
                  </div>
               )}
               {currentResult && (
                  <pre 
                    ref={editorRef}
                    className="whitespace-pre-wrap text-[15px] text-neutral-800 leading-relaxed font-sans overflow-y-auto pr-4 h-[400px]"
                  >
                    {currentResult.generated_content}
                    {streamingResult && streamingResult.status === 'generating' && (
                      <span className="inline-block w-2 h-4 bg-indigo-650 ml-1 animate-pulse" style={{ verticalAlign: 'middle' }} />
                    )}
                  </pre>
               )}
            </div>

            {/* RICH METADATA & REGENERATION FOOTER */}
            {currentResult && (
              <div className="border-t border-neutral-200 bg-neutral-50 p-4 rounded-b-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between text-xs text-neutral-500 font-medium">
                   <div className="flex space-x-4">
                      {/* Using a rough heuristic for sentences/syllables assuming ~15 words per sentence and simple english */}
                      {(() => {
                         const words = getWordCount(currentResult.generated_content);
                         return (
                           <>
                             <span>Words: {words}</span>
                             <span>Chars: {currentResult.generated_content.length}</span>
                             <span>Read Time: {getReadingTime(words)}m</span>
                             <span className="text-indigo-600 font-semibold">Grade Lvl: {getGradeLevel(words, Math.max(1, words/15), Math.max(1, words*1.5))}</span>
                           </>
                         )
                      })()}
                   </div>
                   <div className="flex space-x-4">
                      <span>Style: {currentResult.style_match_score ?? currentResult.confidence_score * 100}%</span>
                      <span>{currentResult.generation_time || elapsedTime}s</span>
                   </div>
                </div>

                {/* Regeneration controls */}
                <div className="flex items-center space-x-2 pt-2 border-t border-neutral-200/60">
                   <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mr-2">Evolve:</span>
                   {['improve', 'shorten', 'expand', 'rewrite'].map(cmd => (
                     <button key={cmd} onClick={() => { setRegenMode(cmd); handleGenerate(cmd); }}
                       disabled={loading}
                       className="px-3 py-1.5 text-xs font-medium border border-neutral-200 bg-white text-neutral-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 rounded capitalize transition disabled:opacity-50"
                     >
                       {cmd}
                     </button>
                   ))}
                   
                   <div className="flex-1 ml-4 relative">
                      <input 
                        type="text" 
                        value={instructions}
                        onChange={e => setInstructions(e.target.value)}
                        disabled={loading}
                        placeholder="Or type custom instruction..."
                        className="w-full border border-neutral-200 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500"
                        onKeyDown={e => { if(e.key === 'Enter') handleGenerate(instructions); }}
                      />
                      <button 
                        onClick={() => handleGenerate(instructions)} 
                        disabled={loading}
                        className="absolute right-1.5 top-1.5 z-10 text-indigo-600 hover:text-indigo-800 p-0.5 disabled:opacity-50"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </PageContainer>
  );
}
