import { httpClient } from '@/shared/api/http-client';
import { 
  CreateFeedRequest, 
  FeedSliceResponse, 
  UpdateFeedRequest, 
  FeedDto, 
  CommentDto, 
  CreateCommentRequest,
  SearchResponse,
  SearchUserDto
} from '../types/feed';

// 해시태그 검색 결과 타입 정의
export interface SearchHashtagDto {
  hashtagId: number;
  name: string;
  count: number;
}

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

  // 통합 검색 (피드 검색)
  search: async (query: string, viewerId: number) => {
    const params = new URLSearchParams({ query, viewerId: String(viewerId) });
    return await httpClient.get<SearchResponse>(`/search?${params.toString()}`);
  },

  // 해시태그 목록 검색 API 연동 (자동완성용)
  searchHashtags: async (query: string): Promise<SearchHashtagDto[]> => {
    try {
      const cleanQuery = query.replace(/^#/, '');
      if (!cleanQuery) return [];
      
      const params = new URLSearchParams({ query: cleanQuery });
      const response = await httpClient.get<SearchHashtagDto[]>(`/search/hashtags?${params.toString()}`);
      return response || []; 
    } catch (e) {
      console.error("Hashtag Search API Error:", e);
      return [];
    }
  },

  // [수정] 인기 피드 조회 (알고리즘 정렬 API 연결)11
  // httpClient가 이미 response body를 반환하므로 .data 제거
  getTrendingFeeds: async (viewerId: number, page: number = 0) => {
    const response = await httpClient.get<FeedSliceResponse>(`${FEED_BASE_URL}/popular`, {
      params: { page, size: 20 },
      headers: { "X-User-Id": viewerId.toString() } 
    });
    return response; 
  },

  // [추가] 해시태그 피드 검색 (알고리즘 정렬)
  // httpClient가 이미 response body를 반환하므로 .data 제거
  searchFeedsByHashtag: async (tag: string, userId: number, page: number = 0): Promise<FeedSliceResponse> => {
    const response = await httpClient.get<FeedSliceResponse>(`${FEED_BASE_URL}/search/hashtag`, {
      params: { tag, page, size: 20 },
      headers: { "X-User-Id": userId.toString() }
    });
    return response;
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
    const params = new URLSearchParams({ userId: String(userId) });
    return await httpClient.post<string>(
        `${FEED_BASE_URL}/${feedId}/likes?${params.toString()}`, 
        null
    );
  },

  getLikers: async (feedId: number) => {
    return await httpClient.get<LikerDto[]>(`${FEED_BASE_URL}/${feedId}/likes`);
  },

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

  searchUsers: async (query: string, viewerId: number = 0): Promise<SearchUserDto[]> => {
    try {
      if (query.startsWith('#')) return [];
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