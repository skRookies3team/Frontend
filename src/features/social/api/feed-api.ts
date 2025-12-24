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

  getUserFeeds: async (targetUserId: number, viewerId: number, page: number = 0) => {
    const params = new URLSearchParams({ page: String(page), size: '12' });
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

  // [수정 완료] httpClient 사용하도록 변경
  toggleLike: async (feedId: number, userId: number) => {
    // POST /api/feeds/{feedId}/likes?userId={userId}
    // Body(data)는 null로, Query Param(params)으로 userId 전달
    const params = new URLSearchParams({ userId: String(userId) });
    
    // httpClient.post(url, body) 형태라면 url에 쿼리 스트링을 붙여서 호출
    return await httpClient.post<string>(
        `${FEED_BASE_URL}/${feedId}/likes?${params.toString()}`, 
        null
    );
  },

  // [수정 완료] httpClient 사용하도록 변경
  getLikers: async (feedId: number) => {
    // GET /api/feeds/{feedId}/likes
    return await httpClient.get<LikerDto[]>(`${FEED_BASE_URL}/${feedId}/likes`);
  },

  // --- 팔로우 API ---

  getFollowStats: async (userId: number) => {
    return await httpClient.get<FollowStatResponse>(`/follows/${userId}/stats`);
  },

  followUser: async (followerId: number, followingId: number) => {
    const params = new URLSearchParams({ followerId: String(followerId) });
    return await httpClient.post<void>(`/follows/${followingId}?${params.toString()}`);
  },

  unfollowUser: async (followerId: number, followingId: number) => {
    const params = new URLSearchParams({ followerId: String(followerId) });
    return await httpClient.post<void>(`/follows/${followingId}?${params.toString()}`);
  },

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