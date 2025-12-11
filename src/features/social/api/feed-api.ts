// src/features/social/api/feed-api.ts
import { httpClient } from '@/shared/api/http-client';
import { CreateFeedRequest, FeedSliceResponse, UpdateFeedRequest } from '../types/feed';

// API Gateway 라우팅 규칙에 따라 URL 설정 (/api/feeds)
const BASE_URL = '/feeds'; 

export const feedApi = {
  /**
   * 피드 목록 조회 (무한 스크롤)
   */
  getFeeds: async (userId: number, page: number = 0, size: number = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    // 백엔드 명세: GET /api/feeds/viewer/{userId}
    return await httpClient.get<FeedSliceResponse>(
      `${BASE_URL}/viewer/${userId}?${params.toString()}`
    );
  },

  /**
   * 피드 작성 (Multipart)
   */
  createFeed: async (data: CreateFeedRequest, file: File | null) => {
    const formData = new FormData();

    // 1. JSON 데이터 ('request' 파트)
    const jsonBlob = new Blob([JSON.stringify(data)], {
      type: 'application/json',
    });
    formData.append('request', jsonBlob);

    // 2. 이미지 파일 ('file' 파트)
    if (file) {
      formData.append('file', file);
    }

    return await httpClient.post<void>(BASE_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', 
      },
    });
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
  deleteFeed: async (feedId: number) => {
    return await httpClient.delete<void>(`${BASE_URL}/${feedId}`);
  },

  /**
   * 좋아요 토글
   */
  toggleLike: async (feedId: number) => {
    // 백엔드 URL 확인 필요 (예상: /feeds/{id}/like)
    return await httpClient.post<void>(`${BASE_URL}/${feedId}/like`);
  }
};