import { useEffect, useState } from 'react';
import { PageContainer } from '../../shared/components/PageContainer';
import { getDraftsAPI } from './api/library.api';

export function LibraryPage() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      const res = await getDraftsAPI(1, 100);
      setDrafts(res.items);
    } catch (error) {
      console.error('Failed to load drafts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      title="Content Library"
      subtitle="All your previously generated and saved content."
    >
      <div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid gap-4">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {draft.topic}
                    </h2>

                    <p className="text-sm text-gray-500 capitalize mt-1">
                      {draft.content_type.replace("_", " ")}
                    </p>
                  </div>

                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                    {draft.status}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mt-4 line-clamp-3">
                  {draft.generated_content}
                </p>

                <div className="flex justify-between items-center mt-5 text-xs text-gray-500">
                  <span>
                    {new Date(draft.created_at).toLocaleDateString()}
                  </span>

                  <span>
                    {draft.is_favorite ? "⭐ Favorite" : "Draft"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}