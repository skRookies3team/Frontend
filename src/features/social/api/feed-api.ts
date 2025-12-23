import { httpClient } from '@/shared/api/http-client';
import { 
  CreateFeedRequest, 
  FeedSliceResponse, 
  UpdateFeedRequest, 
  FeedDto, 
  CommentDto, 
  CreateCommentRequest,
  SearchResponse
} from '../types/feed';

export interface FollowStatResponse {
  followerCount: number;
  followingCount: number;
}
export interface FollowListResponse {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  isFollow: boolean;
}
export interface LikerDto {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
}

const FEED_BASE_URL = '/feeds';

export const feedApi = {
  uploadImages: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("multipartFile", file));
    // [중요] /api 제거 -> /images/upload
    return await httpClient.post<string[]>('/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  createFeed: async (data: CreateFeedRequest) => {
    return await httpClient.post<number>(FEED_BASE_URL, data);
  },

  getFeeds: async (userId: number, page: number = 0, size: number = 10) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    return await httpClient.get<FeedSliceResponse>(`${FEED_BASE_URL}/viewer/${userId}?${params.toString()}`);
  },

  /**
   * [통합 검색]
   * 프론트엔드에서 가장 중요한 수정 부분입니다.
   * /api/search -> /search 로 변경하여 중복 경로(/api/api/search) 방지
   */
  search: async (query: string, viewerId: number) => {
    const params = new URLSearchParams({ query, viewerId: String(viewerId) });
    return await httpClient.get<SearchResponse>(`/search?${params.toString()}`);
  },

  getTrendingFeeds: async (viewerId: number) => {
    return await httpClient.get<FeedSliceResponse>(`/search/trending?viewerId=${viewerId}`);
  },

  getFeedDetail: async (feedId: number, userId: number) => {
    return await httpClient.get<FeedDto>(`${FEED_BASE_URL}/${feedId}/viewer/${userId}`);
  },
  
  updateFeed: async (feedId: number, data: UpdateFeedRequest) => {
    return await httpClient.put<void>(`${FEED_BASE_URL}/${feedId}`, data);
  },

  deleteFeed: async (feedId: number, userId: number) => {
    return await httpClient.delete<void>(`${FEED_BASE_URL}/${feedId}?userId=${userId}`);
  },

  getComments: async (feedId: number) => {
    return await httpClient.get<CommentDto[]>(`${FEED_BASE_URL}/${feedId}/comments`);
  },

  createComment: async (feedId: number, data: CreateCommentRequest) => {
    return await httpClient.post<void>(`${FEED_BASE_URL}/${feedId}/comments`, data);
  },

  deleteComment: async (commentId: number, userId: number) => {
    return await httpClient.delete<void>(`/comments/${commentId}?userId=${userId}`);
  },

  toggleLike: async (feedId: number, userId: number) => {
    return await httpClient.post<void>(`${FEED_BASE_URL}/${feedId}/likes?userId=${userId}`, {});
  },

  getLikers: async (feedId: number) => {
    return await httpClient.get<LikerDto[]>(`${FEED_BASE_URL}/${feedId}/likes`);
  },

  getFollowStats: async (userId: number) => {
    return await httpClient.get<FollowStatResponse>(`/api/follows/${userId}/stats`);
  },

  getFollowers: async (userId: number) => {
    return await httpClient.get<FollowListResponse[]>(`/api/follows/${userId}/followers`);
  },

  getFollowings: async (userId: number) => {
    return await httpClient.get<FollowListResponse[]>(`/api/follows/${userId}/followings`);
  },

  searchUsers: async (query: string) => {
    try {
      const response = await feedApi.search(query, 0); 
      return response?.users || []; 
    } catch (e) {
      console.error("Search API Error:", e);
      return []; 
    }
  }
};