import { httpClient } from '@/shared/api/http-client';
import { 
  CreateFeedRequest, 
  FeedSliceResponse, 
  UpdateFeedRequest, 
  FeedDto, 
  CommentDto, 
  CreateCommentRequest 
} from '../types/feed';

// API 기본 경로 (백엔드 컨트롤러 경로와 일치해야 함)
const FEED_BASE_URL = '/feeds';
const SEARCH_BASE_URL = '/search'; // (가정) 검색 컨트롤러 경로

// 검색 결과 DTO
export interface UserSearchDto {
  userId: number;
  username: string;
  nickname: string;
  profileImageUrl: string | null;
  petName?: string;
}

export const feedApi = {
  // --- 피드 관련 ---
  /** 전체 피드 조회 (무한 스크롤) */
  getFeeds: async (userId: number, page: number = 0, size: number = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    return await httpClient.get<FeedSliceResponse>(
      `${FEED_BASE_URL}/viewer/${userId}?${params.toString()}`
    );
  },

  /** 피드 상세 조회 */
  getFeedDetail: async (feedId: number, userId: number) => {
    return await httpClient.get<FeedDto>(`${FEED_BASE_URL}/${feedId}/viewer/${userId}`);
  },

  /** 피드 작성 */
  createFeed: async (data: CreateFeedRequest) => {
    return await httpClient.post<number>(FEED_BASE_URL, data);
  },

  /** 피드 수정 */
  updateFeed: async (feedId: number, data: UpdateFeedRequest) => {
    return await httpClient.put<void>(`${FEED_BASE_URL}/${feedId}`, data);
  },

  /** 피드 삭제 */
  deleteFeed: async (feedId: number, userId: number) => {
    return await httpClient.delete<void>(`${FEED_BASE_URL}/${feedId}?userId=${userId}`);
  },

  /** 좋아요 토글 */
  toggleLike: async (feedId: number, userId: number) => {
    return await httpClient.post<void>(`${FEED_BASE_URL}/${feedId}/likes?userId=${userId}`, {});
  },

  // --- 댓글 관련 ---
  /** 댓글 목록 조회 */
  getComments: async (feedId: number) => {
    return await httpClient.get<CommentDto[]>(`${FEED_BASE_URL}/${feedId}/comments`);
  },

  /** 댓글 작성 */
  createComment: async (feedId: number, data: CreateCommentRequest) => {
    return await httpClient.post<void>(`${FEED_BASE_URL}/${feedId}/comments`, data);
  },

  /** 댓글 삭제 */
  deleteComment: async (commentId: number, userId: number) => {
    // 경로 예시: /feeds/comments/{commentId}?userId={userId}
    // 백엔드 경로 확인 필요. 만약 /comments/{id} 라면 아래와 같이 수정
    return await httpClient.delete<void>(`${FEED_BASE_URL}/comments/${commentId}?userId=${userId}`);
  },

  // --- 검색 관련 ---
  /** 유저 검색 */
  searchUsers: async (keyword: string) => {
    if (!keyword) return [];
    const params = new URLSearchParams({ keyword });
    // 백엔드 API 엔드포인트에 맞춰 수정 (예: /users/search?keyword=...)
    // 여기서는 별도 SearchController가 있다고 가정하거나 UserClient 사용
    return await httpClient.get<UserSearchDto[]>(`/users/search?${params.toString()}`);
  }
};