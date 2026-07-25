// TODO: React Query hook for fetching and caching knowledge base documents
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    listDocumentsAPI,
    uploadDocumentAPI,
    deleteDocumentAPI,
} from "../api/knowledge.api";


export const useDocuments = (workspaceId: string | undefined) => {

    const queryClient = useQueryClient();


    const documentsQuery = useQuery({
        queryKey: ["documents", workspaceId],
        queryFn: () =>
            listDocumentsAPI(workspaceId!),
        enabled: !!workspaceId,
    });


    const uploadMutation = useMutation({
        mutationFn: uploadDocumentAPI,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["documents", workspaceId],
            });
        },
    });


    const deleteMutation = useMutation({
        mutationFn: deleteDocumentAPI,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["documents", workspaceId],
            });
        },
    });


    return {
        documents: documentsQuery.data,
        isLoading: documentsQuery.isLoading,
        error: documentsQuery.error,

        refetch: documentsQuery.refetch,

        uploadDocument: uploadMutation.mutateAsync,
        uploading: uploadMutation.isPending,

        deleteDocument: deleteMutation.mutateAsync,
        deleting: deleteMutation.isPending,
    };
};