import { httpClient } from '@/shared/api/http-client';
import { 
  CreateFeedRequest, 
  FeedSliceResponse, 
  UpdateFeedRequest, 
  FeedDto, 
  CommentDto, 
  CreateCommentRequest 
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
    
    // 🚨 중요: 여러 파일을 같은 키("multipartFile")로 append 해야 백엔드에서 List로 받음
    files.forEach((file) => {
      formData.append("multipartFile", file);
    });

    const response = await httpClient.post<string[]>('/api/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    // 배열 전체를 반환 (이제 [0]으로 접근해서 나는 오류가 사라짐)
    return response.data; 
  },

  /**
   * [Step 2] 피드 작성
   * 주의: 백엔드 DTO가 imageUrls(List)를 받을 수 있어야 합니다.
   * 만약 단일 String만 받는다면 imageUrls.join(',') 등으로 변환해서 보내야 합니다.
   */
  createFeed: async (data: CreateFeedRequest) => {
    return await httpClient.post<number>(FEED_BASE_URL, data);
  },

  // ... 나머지 API는 기존과 동일
  getFeeds: async (userId: number, page: number = 0, size: number = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    return await httpClient.get<FeedSliceResponse>(
      `${FEED_BASE_URL}/viewer/${userId}?${params.toString()}`
    );
  },
  
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
  }
};