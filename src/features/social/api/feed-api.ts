import { httpClient } from '@/shared/api/http-client';
import { 
  CreateFeedRequest, 
  FeedSliceResponse, 
  UpdateFeedRequest, 
  FeedDto, 
  CommentDto, 
  CreateCommentRequest 
} from '../types/feed';

// 백엔드 API 경로와 일치 (FeedController 참고)
const BASE_URL = '/feeds';

export const feedApi = {
  /**
   * 전체 피드 조회 (무한 스크롤)
   * Backend: @GetMapping("/viewer/{userId}")
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
   * Backend: @GetMapping("/{feedId}/viewer/{userId}")
   */
  getFeedDetail: async (feedId: number, userId: number) => {
    return await httpClient.get<FeedDto>(`${BASE_URL}/${feedId}/viewer/${userId}`);
  },

  /**
   * 댓글 목록 조회
   * Backend: CommentController 참고 (가정)
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
   * Backend: @PostMapping
   */
  createFeed: async (data: CreateFeedRequest) => {
    return await httpClient.post<number>(BASE_URL, data);
  },

  /**
   * 피드 수정
   * Backend: @PutMapping("/{feedId}")
   */
  updateFeed: async (feedId: number, data: UpdateFeedRequest) => {
    return await httpClient.put<void>(`${BASE_URL}/${feedId}`, data);
  },

  /**
   * 피드 삭제
   * Backend: @DeleteMapping("/{feedId}") -> @RequestParam userId
   */
  deleteFeed: async (feedId: number, userId: number) => {
    return await httpClient.delete<void>(`${BASE_URL}/${feedId}?userId=${userId}`);
  },

  /**
   * 좋아요 토글
   * Backend: @PostMapping("/{feedId}/likes") -> @RequestParam userId
   * 수정: Body가 아닌 Query Parameter로 userId 전달
   */
  toggleLike: async (feedId: number, userId: number) => {
    // POST 요청이지만 데이터를 쿼리 파라미터로 보냄 (빈 객체 {}는 body 자리)
    return await httpClient.post<void>(`${BASE_URL}/${feedId}/likes?userId=${userId}`, {});
  }
};