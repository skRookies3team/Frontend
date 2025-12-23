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

// [추가] 댓글 수정 요청 타입
export interface UpdateCommentRequest {
  userId: number;
  content: string;
}

const FEED_BASE_URL = '/feeds';

export const feedApi = {
  uploadImages: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("multipartFile", file));
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

  // [추가] 댓글 수정 API
  updateComment: async (commentId: number, data: UpdateCommentRequest) => {
    return await httpClient.put<void>(`/api/comments/${commentId}`, data);
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
  },

  // [추가] 신고 기능 (나중 구현을 위해 인터페이스만 유지)
  report: async (reporterId: number, targetId: number, type: "FEED" | "USER" | "COMMENT", reason: string) => {
    const params = new URLSearchParams({ 
        reporterId: String(reporterId), 
        targetId: String(targetId), 
        type, 
        reason 
    });
    return await httpClient.post<void>(`/api/reports?${params.toString()}`, {});
  },

  // [추가] 차단 기능
  blockUser: async (blockerId: number, blockedId: number) => {
    const params = new URLSearchParams({ blockerId: String(blockerId), blockedId: String(blockedId) });
    return await httpClient.post<void>(`/api/blocks?${params.toString()}`, {});
  },
};