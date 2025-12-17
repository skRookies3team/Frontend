import { httpClient } from '@/shared/api/http-client';
import { 
  CreateFeedRequest, 
  FeedSliceResponse, 
  UpdateFeedRequest, 
  FeedDto, 
  CommentDto, 
  CreateCommentRequest 
} from '../types/feed';

const BASE_URL = '/feeds';

export const feedApi = {
  /**
   * 전체 피드 조회 (무한 스크롤)
   */
  getFeeds: async (userId: number, page: number = 0, size: number = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    return await httpClient.get<FeedSliceResponse>(
      `${BASE_URL}/viewer/${userId}?${params.toString()}`
    );
  },

  /**
   * 피드 상세 조회 (모달용)
   */
  getFeedDetail: async (feedId: number, userId: number) => {
    return await httpClient.get<FeedDto>(`${BASE_URL}/${feedId}/viewer/${userId}`);
  },

  /**
   * 댓글 목록 조회
   */
  getComments: async (feedId: number) => {
    return await httpClient.get<CommentDto[]>(`${BASE_URL}/${feedId}/comments`);
  },

  /**
   * 댓글 작성
   */
  createComment: async (feedId: number, data: CreateCommentRequest) => {
    return await httpClient.post<void>(`${BASE_URL}/${feedId}/comments`, data);
  },

  /**
   * 댓글 삭제
   */
  deleteComment: async (commentId: number, userId: number) => {
    return await httpClient.delete<void>(`/comments/${commentId}?userId=${userId}`);
  },

  /**
   * 피드 작성 (JSON Only - 이미지 URL 방식)
   */
  createFeed: async (data: CreateFeedRequest) => {
    return await httpClient.post<number>(BASE_URL, data);
  },

  /**
   * 피드 수정
   */
  updateFeed: async (feedId: number, data: UpdateFeedRequest) => {
    return await httpClient.put<void>(`${BASE_URL}/${feedId}`, data);
  },

  /**
   * 피드 삭제
   */
  deleteFeed: async (feedId: number, userId: number) => {
    return await httpClient.delete<void>(`${BASE_URL}/${feedId}?userId=${userId}`);
  },

  /**
   * 좋아요 토글
   */
  toggleLike: async (feedId: number, userId: number) => {
    return await httpClient.post<void>(`${BASE_URL}/${feedId}/likes`, { userId });
  }
};