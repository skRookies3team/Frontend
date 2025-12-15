import { httpClient } from '@/shared/api/http-client';
import { CreateFeedRequest, FeedSliceResponse, UpdateFeedRequest } from '../types/feed';

// 게이트웨이 라우팅 규칙에 따름
const BASE_URL = '/feeds';

// 회원 서비스 연결 전 테스트를 위한 임시 ID (로그인 안 했을 때 사용)
export const TEST_USER_ID = 1;

export const feedApi = {
  /**
   * 전체 피드 조회 (무한 스크롤)
   * Backend: GET /api/feeds/viewer/{userId}?page=0&size=10
   */
  getFeeds: async (userId: number, page: number = 0, size: number = 10) => {
    // 로그인이 안 되어있으면 테스트 ID 사용
    const targetUserId = userId || TEST_USER_ID;

    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    return await httpClient.get<FeedSliceResponse>(
      `${BASE_URL}/viewer/${targetUserId}?${params.toString()}`
    );
  },

  /**
   * 피드 작성 (Multipart File + JSON)
   * Backend: POST /api/feeds (consumes = multipart/form-data)
   */
  createFeed: async (data: CreateFeedRequest, file: File | null) => {
    const formData = new FormData();

    // 백엔드 @RequestPart("request") 에 대응
    // JSON 데이터를 Blob으로 감싸서 보내야 Spring이 올바르게 인식함
    const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    formData.append('request', jsonBlob);

    // 백엔드 @RequestPart("file") 에 대응
    if (file) {
      formData.append('file', file);
    }

    return await httpClient.post<number>(BASE_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * 피드 수정
   * Backend: PUT /api/feeds/{feedId}
   */
  updateFeed: async (feedId: number, data: UpdateFeedRequest) => {
    return await httpClient.put<void>(`${BASE_URL}/${feedId}`, data);
  },

  /**
   * 피드 삭제
   * Backend: DELETE /api/feeds/{feedId}?userId={userId}
   */
  deleteFeed: async (feedId: number, userId: number) => {
    const targetUserId = userId || TEST_USER_ID;
    return await httpClient.delete<void>(`${BASE_URL}/${feedId}?userId=${targetUserId}`);
  },

  /**
   * 좋아요 토글
   * Backend: POST /api/feeds/{feedId}/likes?userId={userId}
   */
  toggleLike: async (feedId: number, userId: number) => {
    const targetUserId = userId || TEST_USER_ID;
    return await httpClient.post<string>(`${BASE_URL}/${feedId}/likes?userId=${targetUserId}`);
  }
};