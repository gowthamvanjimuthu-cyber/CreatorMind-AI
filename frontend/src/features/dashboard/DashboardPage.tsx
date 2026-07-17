import { useEffect, useState } from 'react';
import { PageContainer } from '../../shared/components/PageContainer';
import { useAuthStore } from '../../shared/hooks/useAuth';
import { useWorkspaceStore } from '../workspaces/useWorkspaceStore';
import { getDashboardMetricsAPI, DashboardMetrics } from './api/dashboard.api';

export function DashboardPage() {
  const { user } = useAuthStore();
  const { activeWorkspace } = useWorkspaceStore();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true);
      setError(null);
      try {
        const data = await getDashboardMetricsAPI(activeWorkspace?.id || 'default_workspace');
        setMetrics(data);
      } catch (err: any) {
        console.error('Error fetching dashboard metrics:', err);
        setError('Failed to load dashboard metrics. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [activeWorkspace?.id]);

  if (loading) {
    return (
      <PageContainer title="Loading Dashboard..." subtitle="Gathering live metrics...">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      </PageContainer>
    );
  }

  if (error || !metrics) {
    return (
      <PageContainer title="Dashboard unavailable" subtitle="Something went wrong.">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error || 'No metrics gathered.'}
        </div>
      </PageContainer>
    );
  }

  const kpis = [
    { name: 'Total Documents', value: metrics.workspaces.total_documents, subtext: `${metrics.knowledge.failed_uploads} failed uploads` },
    { name: 'Vector Chunks', value: metrics.knowledge.total_chunks.toLocaleString(), subtext: `Avg size: ${metrics.knowledge.average_chunk_size} chars` },
    { name: 'AI Responses', value: metrics.ai.responses_generated, subtext: `Avg latency: ${metrics.ai.average_response_time}s` },
    { name: 'Original Content', value: metrics.writing.total_content, subtext: `${metrics.ai.granite_requests} Granite invokes` },
  ];

  return (
    <PageContainer
      title={`Welcome back, ${user?.email?.split('@')[0] || 'Creator'}!`}
      subtitle={`Active Workspace: ${metrics.workspaces.active_name}`}
    >
      <div className="space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <div key={kpi.name} className="relative overflow-hidden bg-white/70 backdrop-blur-md border border-neutral-200 rounded-2xl p-6 shadow-sm transition-all hover:shadow-md hover:scale-[1.01]">
              <dt className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">{kpi.name}</dt>
              <dd className="mt-2 text-3xl font-extrabold text-neutral-900 tracking-tight">{kpi.value}</dd>
              <dd className="mt-1 text-xs text-neutral-400 font-medium">{kpi.subtext}</dd>
              <div className="absolute right-3 bottom-3 h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Content generation breakdown chart (represented beautifully using styled bars) */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Original Content Studio Distribution</h3>
            {metrics.writing.total_content === 0 ? (
              <div className="h-48 flex items-center justify-center text-neutral-400 border border-dashed border-neutral-200 rounded-xl">
                No original content generated yet in this workspace.
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { label: 'LinkedIn Posts', count: metrics.writing.linkedin, color: 'bg-blue-600' },
                  { label: 'Blog Posts', count: metrics.writing.blog, color: 'bg-emerald-600' },
                  { label: 'Newsletters', count: metrics.writing.newsletter, color: 'bg-purple-600' },
                  { label: 'Twitter Threads', count: metrics.writing.twitter, color: 'bg-sky-500' },
                  { label: 'YouTube Scripts', count: metrics.writing.youtube, color: 'bg-red-600' },
                  { label: 'Instagram Captions', count: metrics.writing.instagram, color: 'bg-pink-600' },
                ].map((item) => {
                  const pct = metrics.writing.total_content > 0 
                    ? Math.round((item.count / metrics.writing.total_content) * 100)
                    : 0;
                  return (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-sm font-medium text-neutral-700">
                        <span>{item.label}</span>
                        <span>{item.count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all duration-500 ${item.color}`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Creator Persona Voice Match</h3>
              <p className="text-xs text-neutral-400">Calculated based on stylometrics confidence matches</p>
            </div>
            
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative flex items-center justify-center">
                {/* SVG Progress Ring */}
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="54" stroke="#f3f4f6" strokeWidth="10" fill="transparent" />
                  <circle cx="64" cy="64" r="54" stroke="#4f46e5" strokeWidth="10" fill="transparent"
                    strokeDasharray={339.29}
                    strokeDashoffset={339.29 - (339.29 * metrics.creator.average_style_match) / 100}
                    className="transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-extrabold text-neutral-900">{metrics.creator.average_style_match}%</span>
                  <span className="block text-[10px] uppercase font-bold text-indigo-600 tracking-widest mt-0.5">Confidence</span>
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-100 pt-4 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-500">Keywords analyzed</span>
                <span className="font-semibold text-neutral-800">{metrics.creator.keywords}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-500">Docs processed</span>
                <span className="font-semibold text-neutral-800">{metrics.creator.documents_analyzed} docs</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-500">Inference engine</span>
                <span className="font-semibold text-indigo-600">IBM Watsonx / Granite</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-neutral-900 mb-4">Workspace Activity Stream</h3>
          {metrics.timeline.length === 0 ? (
            <div className="text-center py-8 text-neutral-400 border border-dashed border-neutral-100 rounded-xl text-sm">
              Your recent uploads, generation logs, and conversations will show up here.
            </div>
          ) : (
            <div className="relative border-l border-neutral-200 mt-2 px-1 space-y-6">
              {metrics.timeline.map((act, index) => (
                <div key={index} className="relative pl-6">
                  {/* Outer circle dot */}
                  <span className="absolute -left-[5px] top-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-indigo-600 ring-4 ring-white"></span>
                  <div className="flex flex-col md:flex-row md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">{act.title}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{act.details}</p>
                    </div>
                    <span className="text-[11px] font-medium text-neutral-400 mt-1 md:mt-0">
                      {new Date(act.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
