import httpClient from '@/shared/api/http-client';
import { FeedSliceResponse } from '../types/feed';

const BASE_URL = '/feeds';

export const getFeeds = async (page: number, size: number): Promise<FeedSliceResponse> => {
  return httpClient.get<FeedSliceResponse>(`${BASE_URL}?page=${page}&size=${size}`);
};

export const toggleLike = async (feedId: number): Promise<void> => {
  return httpClient.post<void>(`${BASE_URL}/${feedId}/like`);
};

export const createFeed = async (data: { content: string; location?: string }, file?: File): Promise<void> => {
  const formData = new FormData();

  // JSON Blob for request part
  const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  formData.append('request', jsonBlob);

  // File part
  if (file) {
    formData.append('file', file);
  }

  // Use raw axios or handle multipart correctly. 
  // httpClient usually handles JSON, so we might need to override headers or let browser set boundary.
  // Assuming httpClient can handle FormData if passed directly, but usually we need to let the browser set Content-Type for FormData.
  // However, the provided httpClient sets 'Content-Type': 'application/json' in defaults.
  // We should probably use the skipAuth option or override headers if possible, but the current httpClient interface 
  // doesn't expose header overrides easily in the helper methods, but axiosInstance does.
  // Let's check httpClient implementation again. 
  // It takes config. We can override headers there.

  return httpClient.post<void>(BASE_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};