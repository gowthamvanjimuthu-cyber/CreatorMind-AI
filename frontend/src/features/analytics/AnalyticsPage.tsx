import { useEffect, useState } from 'react';
import { PageContainer } from '../../shared/components/PageContainer';
import { useWorkspaceStore } from '../workspaces/useWorkspaceStore';
import {
  getDashboardMetricsAPI,
  DashboardMetrics,
} from '../dashboard/api/dashboard.api';

export function AnalyticsPage() {
  const { activeWorkspace } = useWorkspaceStore();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      setError(null);

      try {
        const data = await getDashboardMetricsAPI(
          activeWorkspace?.id || 'default_workspace'
        );

        setMetrics(data);

      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data.');

      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();

  }, [activeWorkspace?.id]);



  if (loading) {
    return (
      <PageContainer
        title="Analytics"
        subtitle="Analyzing your creator performance and AI usage."
      >
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      </PageContainer>
    );
  }



  if (error || !metrics) {
    return (
      <PageContainer
        title="Analytics"
        subtitle="Unable to load analytics."
      >
        <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
          {error || 'No analytics data available.'}
        </div>
      </PageContainer>
    );
  }



  const cards = [
    {
      title: 'Total Content Generated',
      value: metrics.writing.total_content,
      description: 'AI generated content pieces',
    },
    {
      title: 'AI Responses',
      value: metrics.ai.responses_generated,
      description: 'AI conversations completed',
    },
    {
      title: 'Documents Indexed',
      value: metrics.knowledge.indexed_documents,
      description: 'Knowledge base documents',
    },
    {
      title: 'Voice Match',
      value: `${metrics.creator.average_style_match}%`,
      description: 'Creator style accuracy',
    },
  ];



  const contentStats = [
    {
      name: 'LinkedIn Posts',
      value: metrics.writing.linkedin,
    },
    {
      name: 'Blog Posts',
      value: metrics.writing.blog,
    },
    {
      name: 'Newsletters',
      value: metrics.writing.newsletter,
    },
    {
      name: 'Twitter Threads',
      value: metrics.writing.twitter,
    },
    {
      name: 'YouTube Scripts',
      value: metrics.writing.youtube,
    },
    {
      name: 'Instagram Captions',
      value: metrics.writing.instagram,
    },
  ];



  return (
    <PageContainer
      title="Analytics"
      subtitle="Track your content performance and AI usage."
    >

      <div className="space-y-6">


        {/* KPI Cards */}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
            >

              <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                {card.title}
              </p>

              <h2 className="mt-3 text-3xl font-bold text-neutral-900">
                {card.value}
              </h2>

              <p className="mt-2 text-xs text-neutral-400">
                {card.description}
              </p>

            </div>
          ))}

        </div>




        {/* Content Distribution */}

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">

          <h3 className="mb-5 text-lg font-bold text-neutral-900">
            Content Generation Distribution
          </h3>


          <div className="space-y-4">

            {contentStats.map((item) => {

              const percentage =
                metrics.writing.total_content > 0
                  ? Math.round(
                    (item.value /
                      metrics.writing.total_content) *
                    100
                  )
                  : 0;


              return (

                <div key={item.name}>

                  <div className="mb-1 flex justify-between text-sm">

                    <span className="font-medium text-neutral-700">
                      {item.name}
                    </span>

                    <span className="text-neutral-500">
                      {item.value} ({percentage}%)
                    </span>

                  </div>


                  <div className="h-2 rounded-full bg-neutral-100">

                    <div
                      className="h-2 rounded-full bg-indigo-600 transition-all"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />

                  </div>

                </div>

              );

            })}

          </div>

        </div>





        {/* AI Usage */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">


          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">

            <h3 className="mb-4 text-lg font-bold text-neutral-900">
              AI Usage
            </h3>


            <div className="space-y-3 text-sm">

              <p>
                Questions Asked:
                <b className="ml-2">
                  {metrics.ai.questions_asked}
                </b>
              </p>


              <p>
                AI Responses:
                <b className="ml-2">
                  {metrics.ai.responses_generated}
                </b>
              </p>


              <p>
                Granite Requests:
                <b className="ml-2">
                  {metrics.ai.granite_requests}
                </b>
              </p>


              <p>
                Average Response Time:
                <b className="ml-2">
                  {metrics.ai.average_response_time}s
                </b>
              </p>

            </div>

          </div>




          {/* Creator Intelligence */}

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">

            <h3 className="mb-4 text-lg font-bold text-neutral-900">
              Creator Intelligence
            </h3>


            <div className="space-y-3 text-sm">

              <p>
                Keywords Learned:
                <b className="ml-2">
                  {metrics.creator.keywords}
                </b>
              </p>


              <p>
                Documents Analyzed:
                <b className="ml-2">
                  {metrics.creator.documents_analyzed}
                </b>
              </p>


              <p>
                Style Confidence:
                <b className="ml-2">
                  {metrics.creator.average_style_match}%
                </b>
              </p>

            </div>

          </div>


        </div>





        {/* Recent Activity */}

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">

          <h3 className="mb-5 text-lg font-bold text-neutral-900">
            Recent Activity
          </h3>


          {
            metrics.timeline.length === 0 ? (

              <p className="text-sm text-neutral-400">
                No recent activity available.
              </p>

            ) : (

              <div className="space-y-4">

                {metrics.timeline.map((activity, index) => (

                  <div
                    key={index}
                    className="border-b border-neutral-100 pb-3"
                  >

                    <p className="font-semibold text-neutral-800">
                      {activity.title}
                    </p>


                    <p className="text-sm text-neutral-500">
                      {activity.details}
                    </p>


                    <p className="mt-1 text-xs text-neutral-400">
                      {new Date(
                        activity.timestamp
                      ).toLocaleString()}
                    </p>

                  </div>

                ))}

              </div>

            )
          }

        </div>



      </div>

    </PageContainer>
  );
}
