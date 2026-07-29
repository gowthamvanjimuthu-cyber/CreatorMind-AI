import { apiClient } from "../../../shared/utils/axios";

export interface Draft {
    id: string;
    topic: string;
    content_type: string;
    generated_content: string;
    status: string;
    is_favorite: boolean;
    created_at: string;
}

export interface DraftsResponse {
    items: Draft[];
    total: number;
    page: number;
    page_size: number;
}

export async function getDraftsAPI(
    page: number = 1,
    pageSize: number = 100
): Promise<DraftsResponse> {
    const response = await apiClient.get(
        `/library?page=${page}&page_size=${pageSize}`
    );

    return response.data;
}