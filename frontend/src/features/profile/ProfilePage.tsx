import { useEffect, useState } from 'react';
import { PageContainer } from '../../shared/components/PageContainer';
import { getCreatorProfileAPI, reanalyzeProfileAPI, CreatorProfile } from './api/profile.api';
import { getDashboardMetricsAPI, DashboardMetrics } from '../dashboard/api/dashboard.api';
import { useWorkspaceStore } from '../workspaces/useWorkspaceStore';

export function ProfilePage() {
  const { activeWorkspace } = useWorkspaceStore();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [profData, dashData] = await Promise.all([
          getCreatorProfileAPI(),
          getDashboardMetricsAPI(activeWorkspace?.id || 'default_workspace')
        ]);
        setProfile(profData);
        setMetrics(dashData);
      } catch (err) {
        console.error('Failed to load profile data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeWorkspace?.id]);

  const handleReanalyze = async () => {
    setAnalyzing(true);
    try {
      await reanalyzeProfileAPI();
      // Simulate quick backend latency then reload
      setTimeout(async () => {
        const profData = await getCreatorProfileAPI();
        setProfile(profData);
        setAnalyzing(false);
      }, 1500);
    } catch (e) {
      console.error(e);
      setAnalyzing(false);
    }
  };

  if (loading || !profile || !metrics) {
    return (
      <PageContainer title="Loading Profile..." subtitle="Booting Stylometric Engine...">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      </PageContainer>
    );
  }

  const confidencePct = Math.round(profile.confidence_score * 100);
  
  // Tag cloud colors
  const tagColors = ['bg-indigo-100 text-indigo-800', 'bg-blue-100 text-blue-800', 'bg-emerald-100 text-emerald-800', 'bg-purple-100 text-purple-800', 'bg-pink-100 text-pink-800', 'bg-orange-100 text-orange-800'];

  return (
    <PageContainer
      title="Creator Profile"
      subtitle="The stylometric DNA that powers your Personalized AI."
      action={
        <button
          onClick={handleReanalyze}
          disabled={analyzing}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {analyzing ? 'Re-analyzing...' : 'Re-analyze Profile'}
        </button>
      }
    >
      <div className="space-y-6">
        
        {/* TOP ROW: Core Persona & Confidence */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Core Persona */}
          <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
             
            <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
              <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
            </div>
            
            <h3 className="text-xl font-bold mb-4 relative z-10">Persona Overview</h3>
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div>
                <dt className="text-xs uppercase tracking-wider text-indigo-300 font-semibold mb-1">Writing Style</dt>
                <dd className="text-lg font-medium">{profile.creator_style}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-indigo-300 font-semibold mb-1">Tone</dt>
                <dd className="text-lg font-medium">{profile.tone}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-indigo-300 font-semibold mb-1">Target Audience</dt>
                <dd className="text-lg font-medium">{profile.audience}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-indigo-300 font-semibold mb-1">Reading Level</dt>
                <dd className="text-lg font-medium">{profile.reading_level}</dd>
              </div>
            </div>
          </div>

          {/* AI Confidence Ring */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center">
            <h3 className="text-sm font-bold text-neutral-900 mb-4 whitespace-nowrap">Creator Confidence</h3>
            <div className="relative flex items-center justify-center">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle cx="72" cy="72" r="60" stroke="#f3f4f6" strokeWidth="12" fill="transparent" />
                <circle cx="72" cy="72" r="60" stroke="#4f46e5" strokeWidth="12" fill="transparent"
                  strokeDasharray={376.99}
                  strokeDashoffset={376.99 - (376.99 * confidencePct) / 100}
                  className="transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-extrabold text-neutral-900">{confidencePct}%</span>
              </div>
            </div>
          </div>

        </div>

        {/* MIDDLE ROW: Writing Fingerprint & AI Personalization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Writing Fingerprint Hub */}
          <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-900 mb-5">Writing Fingerprint</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                <p className="text-xs text-neutral-500 font-semibold uppercase mb-1">Sentence Length</p>
                <p className="text-sm font-medium text-neutral-900">{profile.sentence_length}</p>
              </div>
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                <p className="text-xs text-neutral-500 font-semibold uppercase mb-1">Paragraph Length</p>
                <p className="text-sm font-medium text-neutral-900">{profile.paragraph_length}</p>
              </div>
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                <p className="text-xs text-neutral-500 font-semibold uppercase mb-1">Question Usage</p>
                <p className="text-sm font-medium text-neutral-900">{profile.question_usage}</p>
              </div>
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                <p className="text-xs text-neutral-500 font-semibold uppercase mb-1">Emoji Usage</p>
                <p className="text-sm font-medium text-neutral-900">{profile.emoji_usage}</p>
              </div>
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                <p className="text-xs text-neutral-500 font-semibold uppercase mb-1">CTA Frequency</p>
                <p className="text-sm font-medium text-neutral-900">{profile.cta_frequency}</p>
              </div>
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                <p className="text-xs text-neutral-500 font-semibold uppercase mb-1">Formatting Habits</p>
                <p className="text-sm font-medium text-neutral-900">{profile.preferred_formatting}</p>
              </div>
            </div>
            
            <div className="mt-6 border-t border-neutral-100 pt-5">
              <p className="text-xs text-neutral-500 font-semibold uppercase mb-2">Vocabulary Complexity</p>
              <p className="text-sm font-medium text-neutral-900 bg-indigo-50 border border-indigo-100 rounded-lg p-3 inline-block">
                {profile.vocabulary}
              </p>
            </div>
          </div>

          {/* AI Personalization & Learning Progress */}
          <div className="space-y-6">
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">AI Personalization</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-neutral-600">Style Match</span>
                    <span className="text-indigo-600">{confidencePct}%</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-1.5"><div className="bg-indigo-600 h-1.5 rounded-full" style={{width: `${confidencePct}%`}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-neutral-600">Memory Strength</span>
                    <span className="text-emerald-500">{Math.min(100, Math.round(metrics.knowledge.total_chunks / 10))}%</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{width: `${Math.min(100, Math.round(metrics.knowledge.total_chunks / 10))}%`}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-neutral-600">Profile Completeness</span>
                    <span className="text-blue-500">100%</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{width: '100%'}}></div></div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Learning Progress</h3>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-neutral-600">Analyzed Docs</span>
                <span className="px-3 py-1 bg-neutral-100 rounded-full text-sm font-bold text-neutral-900">{metrics.knowledge.indexed_documents}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-neutral-600">Indexed Chunks</span>
                <span className="px-3 py-1 bg-neutral-100 rounded-full text-sm font-bold text-neutral-900">{metrics.knowledge.total_chunks.toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM ROW: Keyword Tag Cloud */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-neutral-900 mb-4">Keyword Intelligence (Tag Cloud)</h3>
          <div className="flex flex-wrap gap-2">
            {profile.keywords.map((kw, i) => {
              const bg = tagColors[i % tagColors.length];
              return (
                <span key={kw} className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${bg}`}>
                  {kw}
                </span>
              );
            })}
          </div>
        </div>

      </div>
    </PageContainer>
  );
}

