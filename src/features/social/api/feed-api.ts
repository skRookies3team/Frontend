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

  // [추가] 특정 유저의 피드 목록 조회 (타 유저 프로필용)
  getUserFeeds: async (targetUserId: number, viewerId: number, page: number = 0) => {
    const params = new URLSearchParams({ page: String(page), size: '12' });
    // 백엔드 구현에 따라 경로가 다를 수 있으나, 일반적인 패턴으로 작성
    // 만약 백엔드에 이 경로가 없다면 getFeeds와 로직을 맞춰야 함
    return await httpClient.get<FeedSliceResponse>(`${FEED_BASE_URL}/user/${targetUserId}/viewer/${viewerId}?${params.toString()}`);
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

  updateComment: async (commentId: number, data: UpdateCommentRequest) => {
    return await httpClient.put<void>(`/comments/${commentId}`, data);
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

  // --- [추가] 팔로우 및 유저 관련 API ---

  getFollowStats: async (userId: number) => {
    // 경로에 /api 제거 (httpClient baseURL 사용 시)
    return await httpClient.get<FollowStatResponse>(`/follows/${userId}/stats`);
  },

  followUser: async (followerId: number, followingId: number) => {
    const params = new URLSearchParams({ followerId: String(followerId), followingId: String(followingId) });
    return await httpClient.post<void>(`/follows?${params.toString()}`);
  },

  unfollowUser: async (followerId: number, followingId: number) => {
    const params = new URLSearchParams({ followerId: String(followerId), followingId: String(followingId) });
    return await httpClient.delete<void>(`/follows?${params.toString()}`);
  },

  // 팔로우 여부 확인 (목록에서 조회)
  checkFollow: async (followerId: number, followingId: number) => {
    try {
        const followings = await feedApi.getFollowings(followerId);
        return followings.some(f => f.userId === followingId);
    } catch {
        return false;
    }
  },

  getFollowers: async (userId: number) => {
    return await httpClient.get<FollowListResponse[]>(`/follows/${userId}/followers`);
  },

  getFollowings: async (userId: number) => {
    return await httpClient.get<FollowListResponse[]>(`/follows/${userId}/followings`);
  },

  // [수정] viewerId 파라미터 추가하여 검색 정확도 향상
  searchUsers: async (query: string, viewerId: number = 0) => {
    try {
      const response = await feedApi.search(query, viewerId); 
      return response?.users || []; 
    } catch (e) {
      console.error("Search API Error:", e);
      return []; 
    }
  },

  report: async (reporterId: number, targetId: number, type: "FEED" | "USER" | "COMMENT", reason: string) => {
    const params = new URLSearchParams({ 
        reporterId: String(reporterId), 
        targetId: String(targetId), 
        type, 
        reason 
    });
    return await httpClient.post<void>(`/reports?${params.toString()}`, {});
  },

  blockUser: async (blockerId: number, blockedId: number) => {
    const params = new URLSearchParams({ blockerId: String(blockerId), blockedId: String(blockedId) });
    return await httpClient.post<void>(`/blocks?${params.toString()}`, {});
  },
};