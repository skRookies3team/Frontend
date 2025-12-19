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

const FEED_BASE_URL = '/feeds';

export const feedApi = {
  /**
   * [Step 1] 이미지 여러 장 업로드 (Image Controller)
   * Backend: @PostMapping("/api/images/upload")
   * Param: multipartFile (List<MultipartFile>)
   * Return: List<String> (URL 목록)
   */
  uploadImages: async (files: File[]) => {
    const formData = new FormData();
    
    // 백엔드 파라미터명 "multipartFile" 확인 (Controller와 일치해야 함)
    files.forEach((file) => {
      formData.append("multipartFile", file);
    });

    // [수정] '/api/images/upload' -> '/images/upload'
    // httpClient에 이미 '/api'가 기본 경로로 잡혀 있어서 중복 제거
    const response = await httpClient.post<string[]>('/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response;
  },

  /**
   * [Step 2] 피드 작성 (Social Service)
   * Body: { imageUrls: string[], ... }
   */
  createFeed: async (data: CreateFeedRequest) => {
    return await httpClient.post<number>(FEED_BASE_URL, data);
  },

  /**
   * 전체 피드 조회
   */
  getFeeds: async (userId: number, page: number = 0, size: number = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    return await httpClient.get<FeedSliceResponse>(
      `${FEED_BASE_URL}/viewer/${userId}?${params.toString()}`
    );
  },

  /**
   * 통합 검색 (유저 + 해시태그)
   */
  search: async (query: string, viewerId: number) => {
    const params = new URLSearchParams({ 
      query, 
      viewerId: viewerId.toString() 
    });
    return await httpClient.get<SearchResponse>(`/api/search?${params.toString()}`);
  },

  /**
   * 인기 급상승 피드 (Trending)
   */
  getTrendingFeeds: async (viewerId: number) => {
    return await httpClient.get<FeedSliceResponse>(`/api/search/trending?viewerId=${viewerId}`);
  },

  // ... 나머지 API (상세 조회, 댓글, 좋아요 등) 기존과 동일
  getFeedDetail: async (feedId: number, userId: number) => {
    return await httpClient.get<FeedDto>(`${FEED_BASE_URL}/${feedId}/viewer/${userId}`);
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

  updateFeed: async (feedId: number, data: UpdateFeedRequest) => {
    return await httpClient.put<void>(`${FEED_BASE_URL}/${feedId}`, data);
  },

  deleteFeed: async (feedId: number, userId: number) => {
    return await httpClient.delete<void>(`${FEED_BASE_URL}/${feedId}?userId=${userId}`);
  },

  toggleLike: async (feedId: number, userId: number) => {
    return await httpClient.post<void>(`${FEED_BASE_URL}/${feedId}/likes?userId=${userId}`, {});
  },

  searchUsers: async (query: string) => {
    // 뷰어 ID는 검색 결과에 팔로우 여부 표시용인데, 필요 없으면 0이나 null 처리
    const response = await feedApi.search(query, 0); 
    return response.users; // 통합 검색 결과에서 users만 반환
  }
};