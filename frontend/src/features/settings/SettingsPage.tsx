import { PageContainer } from '../../shared/components/PageContainer';
import { useAuthStore } from '../../shared/hooks/useAuth';
import { useWorkspaceStore } from '../workspaces/useWorkspaceStore';


export function SettingsPage() {

  const { user } = useAuthStore();
  const { activeWorkspace } = useWorkspaceStore();


  return (
    <PageContainer
      title="Settings"
      subtitle="Manage your CreatorMind preferences and integrations."
    >

      <div className="space-y-6">


        {/* Profile Settings */}

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-neutral-900">
            Profile Settings
          </h2>


          <div className="mt-4 space-y-3 text-sm">

            <div className="flex justify-between">
              <span className="text-neutral-500">
                Email
              </span>

              <span className="font-medium">
                {user?.email || "Not available"}
              </span>
            </div>


            <div className="flex justify-between">
              <span className="text-neutral-500">
                Account Type
              </span>

              <span className="font-medium">
                Creator
              </span>
            </div>

          </div>

        </div>





        {/* Workspace Settings */}

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-neutral-900">
            Workspace
          </h2>


          <div className="mt-4 space-y-3 text-sm">


            <div className="flex justify-between">

              <span className="text-neutral-500">
                Active Workspace
              </span>

              <span className="font-medium">
                {activeWorkspace?.name || "Default Workspace"}
              </span>

            </div>



            <div className="flex justify-between">

              <span className="text-neutral-500">
                Description
              </span>

              <span className="font-medium">
                {activeWorkspace?.description || "Creator workspace"}
              </span>

            </div>


          </div>

        </div>






        {/* AI Preferences */}

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-neutral-900">
            AI Preferences
          </h2>


          <div className="mt-4 space-y-3 text-sm">


            <div className="flex justify-between">

              <span className="text-neutral-500">
                AI Provider
              </span>


              <span className="font-semibold text-indigo-600">
                IBM Granite / Watsonx
              </span>

            </div>




            <div className="flex justify-between">

              <span className="text-neutral-500">
                Content Generation
              </span>


              <span className="font-medium">
                Personalized Creator Style
              </span>

            </div>


          </div>

        </div>







        {/* System Information */}

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">


          <h2 className="text-lg font-bold text-neutral-900">
            System Information
          </h2>



          <div className="mt-4 space-y-3 text-sm">


            <div className="flex justify-between">

              <span className="text-neutral-500">
                Backend API
              </span>

              <span className="font-semibold text-green-600">
                Connected
              </span>

            </div>




            <div className="flex justify-between">

              <span className="text-neutral-500">
                Knowledge Engine
              </span>

              <span className="font-semibold text-green-600">
                Active
              </span>

            </div>




            <div className="flex justify-between">

              <span className="text-neutral-500">
                Vector Database
              </span>

              <span className="font-semibold text-green-600">
                ChromaDB
              </span>

            </div>


          </div>


        </div>



      </div>


    </PageContainer>
  );
}
