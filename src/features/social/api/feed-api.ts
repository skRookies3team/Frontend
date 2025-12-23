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

// [타입 정의]
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
  /**
   * [이미지 업로드]
   * Backend: ImageController
   * Path: /images/upload (POST)
   */
  uploadImages: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("multipartFile", file));
    
    // 백엔드 엔드포인트에 맞춰 호출
    return await httpClient.post<string[]>('/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * [피드 생성]
   * Backend: FeedController
   * Path: /feeds (POST)
   */
  createFeed: async (data: CreateFeedRequest) => {
    return await httpClient.post<number>(FEED_BASE_URL, data);
  },

  /**
   * [전체 피드 조회] (최신순)
   * Backend: FeedController
   * Path: /feeds/viewer/{userId} (GET)
   */
  getFeeds: async (userId: number, page: number = 0, size: number = 10) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    return await httpClient.get<FeedSliceResponse>(`${FEED_BASE_URL}/viewer/${userId}?${params.toString()}`);
  },

  /**
   * [통합 검색]
   * Backend: SearchController
   * Path: /api/search (GET)
   */
  search: async (query: string, viewerId: number) => {
    const params = new URLSearchParams({ query, viewerId: String(viewerId) });
    return await httpClient.get<SearchResponse>(`/api/search?${params.toString()}`);
  },

  /**
   * [인기 게시물 조회] (좋아요순)
   * Backend: SearchController
   * Path: /api/search/trending (GET)
   */
  getTrendingFeeds: async (viewerId: number) => {
    return await httpClient.get<FeedSliceResponse>(`/api/search/trending?viewerId=${viewerId}`);
  },

  /**
   * [피드 상세 조회]
   * Backend: FeedController
   * Path: /feeds/{feedId}/viewer/{userId} (GET)
   */
  getFeedDetail: async (feedId: number, userId: number) => {
    return await httpClient.get<FeedDto>(`${FEED_BASE_URL}/${feedId}/viewer/${userId}`);
  },

  /**
   * [피드 수정]
   * Backend: FeedController
   * Path: /feeds/{feedId} (PUT)
   */
  updateFeed: async (feedId: number, data: UpdateFeedRequest) => {
    return await httpClient.put<void>(`${FEED_BASE_URL}/${feedId}`, data);
  },

  /**
   * [피드 삭제]
   * Backend: FeedController
   * Path: /feeds/{feedId} (DELETE)
   */
  deleteFeed: async (feedId: number, userId: number) => {
    return await httpClient.delete<void>(`${FEED_BASE_URL}/${feedId}?userId=${userId}`);
  },

  // --- 댓글 관련 (CommentController) ---

  getComments: async (feedId: number) => {
    return await httpClient.get<CommentDto[]>(`${FEED_BASE_URL}/${feedId}/comments`);
  },

  createComment: async (feedId: number, data: CreateCommentRequest) => {
    return await httpClient.post<void>(`${FEED_BASE_URL}/${feedId}/comments`, data);
  },

  deleteComment: async (commentId: number, userId: number) => {
    return await httpClient.delete<void>(`/comments/${commentId}?userId=${userId}`);
  },

  // --- 좋아요 관련 (FeedLikeController) ---

  toggleLike: async (feedId: number, userId: number) => {
    return await httpClient.post<void>(`${FEED_BASE_URL}/${feedId}/likes?userId=${userId}`, {});
  },

  /**
   * [좋아요 누른 사람 목록 조회]
   * Backend: FeedLikeController
   * Path: /feeds/{feedId}/likes (GET)
   */
  getLikers: async (feedId: number) => {
    return await httpClient.get<LikerDto[]>(`${FEED_BASE_URL}/${feedId}/likes`);
  },

  // --- 팔로우 관련 (FollowController) ---

  getFollowStats: async (userId: number) => {
    return await httpClient.get<FollowStatResponse>(`/api/follows/${userId}/stats`);
  },

  getFollowers: async (userId: number) => {
    return await httpClient.get<FollowListResponse[]>(`/api/follows/${userId}/followers`);
  },

  getFollowings: async (userId: number) => {
    return await httpClient.get<FollowListResponse[]>(`/api/follows/${userId}/followings`);
  },

  /**
   * [유저 검색] - 수정됨!
   * 통합 검색 API를 활용하여 유저 목록만 반환
   * 중요: 백엔드 응답이 null일 경우 빈 배열([])을 반환하여 map 에러 방지
   */
  searchUsers: async (query: string) => {
    try {
      // viewerId는 팔로우 여부 확인용 (여기서는 0으로 처리)
      const response = await feedApi.search(query, 0); 
      // users가 null 또는 undefined일 경우 빈 배열 반환
      return response?.users || []; 
    } catch (e) {
      console.error("Search API Error:", e);
      return []; // 에러 발생 시에도 빈 배열 반환하여 앱 멈춤 방지
    }
  }
};