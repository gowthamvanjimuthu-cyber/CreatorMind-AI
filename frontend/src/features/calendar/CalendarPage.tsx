import { useEffect, useState } from 'react';
import { PageContainer } from '../../shared/components/PageContainer';
import { useWorkspaceStore } from '../workspaces/useWorkspaceStore';
import {
  getDashboardMetricsAPI,
  DashboardMetrics,
} from '../dashboard/api/dashboard.api';


export function CalendarPage() {

  const { activeWorkspace } = useWorkspaceStore();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);



  useEffect(() => {

    async function loadCalendar() {

      try {

        const data = await getDashboardMetricsAPI(
          activeWorkspace?.id || 'default_workspace'
        );

        setMetrics(data);

      } catch (error) {

        console.error(
          "Calendar loading failed:",
          error
        );

      } finally {

        setLoading(false);

      }

    }


    loadCalendar();

  }, [activeWorkspace?.id]);




  if (loading) {

    return (

      <PageContainer
        title="Content Calendar"
        subtitle="Schedule and track your content pipeline."
      >

        <div className="flex h-64 items-center justify-center">
          Loading calendar...
        </div>

      </PageContainer>

    );

  }




  return (

    <PageContainer
      title="Content Calendar"
      subtitle="Schedule and track your content pipeline."
    >


      <div className="space-y-6">



        {/* Calendar Header */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold">
            July 2026
          </h2>


          <div className="mt-5 grid grid-cols-7 gap-3 text-center">


            {
              [
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
                "Sun"
              ].map(day => (

                <div
                  key={day}
                  className="text-sm font-semibold text-neutral-500"
                >
                  {day}
                </div>

              ))
            }



            {
              Array.from(
                { length: 31 },
                (_, index) => index + 1
              ).map(day => (

                <div
                  key={day}
                  className="min-h-20 rounded-xl border border-neutral-200 p-3 text-left"
                >

                  <span className="text-sm font-semibold">
                    {day}
                  </span>


                  {
                    metrics?.timeline.some(
                      item =>
                        new Date(item.timestamp)
                          .getDate() === day
                    )
                    &&
                    (
                      <div className="mt-2 rounded bg-indigo-50 p-1 text-xs text-indigo-700">

                        Content Created

                      </div>
                    )
                  }


                </div>

              ))
            }


          </div>

        </div>





        {/* Content Pipeline */}


        <div className="rounded-2xl border bg-white p-6 shadow-sm">


          <h2 className="mb-5 text-lg font-bold">
            Content Pipeline
          </h2>



          {
            metrics?.timeline.map(
              (item, index) => (

                <div
                  key={index}
                  className="border-b py-4"
                >

                  <p className="font-semibold">
                    {item.title}
                  </p>


                  <p className="text-sm text-neutral-500">
                    {item.details}
                  </p>


                  <p className="mt-1 text-xs text-neutral-400">
                    {
                      new Date(
                        item.timestamp
                      ).toLocaleDateString()
                    }
                  </p>


                </div>

              )
            )
          }


        </div>



      </div>


    </PageContainer>

  );

}
