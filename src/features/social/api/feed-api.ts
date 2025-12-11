// src/features/social/api/feed-api.ts
import { httpClient } from '@/shared/api/http-client';
import { CreateFeedRequest, FeedSliceResponse, UpdateFeedRequest } from '../types/feed';

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
    // 백엔드 명세: GET /api/feeds/viewer/{userId}?page={page}&size={size}
    return await httpClient.get<FeedSliceResponse>(
      `${BASE_URL}/viewer/${userId}?${params.toString()}`
    );
  },

  /**
   * 피드 작성 (Multipart)
   */
  createFeed: async (data: CreateFeedRequest, file: File | null) => {
    const formData = new FormData();
    // JSON 데이터는 Blob으로 감싸서 'request' 파트로 전송
    const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    formData.append('request', jsonBlob);
    
    if (file) {
      formData.append('file', file);
    }
    
    return await httpClient.post<void>(BASE_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
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
    return await httpClient.post<void>(`${BASE_URL}/${feedId}/like`);
  }
};