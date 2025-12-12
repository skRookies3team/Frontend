import { httpClient } from '@/shared/api/http-client';
import { CreateFeedRequest, FeedSliceResponse, UpdateFeedRequest } from '../types/feed';

const BASE_URL = '/feeds'; 

export const feedApi = {
  getFeeds: async (userId: number, page: number = 0, size: number = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    return await httpClient.get<FeedSliceResponse>(
      `${BASE_URL}/viewer/${userId}?${params.toString()}`
    );
  },

  createFeed: async (data: CreateFeedRequest, file: File | null) => {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    formData.append('request', jsonBlob);
    if (file) {
      formData.append('file', file);
    }
    return await httpClient.post<void>(BASE_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateFeed: async (feedId: number, data: UpdateFeedRequest) => {
    return await httpClient.put<void>(`${BASE_URL}/${feedId}`, data);
  },

  deleteFeed: async (feedId: number) => {
    return await httpClient.delete<void>(`${BASE_URL}/${feedId}`);
  },

  toggleLike: async (feedId: number) => {
    return await httpClient.post<void>(`${BASE_URL}/${feedId}/like`);
  }
};