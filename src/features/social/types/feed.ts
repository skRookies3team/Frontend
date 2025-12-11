// src/features/social/types/feed.ts

/**
 * 댓글 정보 DTO
 */
export interface CommentDto {
  commentId: number;
  writerUsername: string; // 백엔드 CommentDto 확인 필요 (현재 명세상 username 권장)
  content: string;
  createdAt: string;
}

/**
 * 피드 조회 응답 DTO
 * Backend: FeedResponse.GetFeedDto
 */
export interface FeedDto {
  feedId: number;
  writerNickname: string; // 백엔드 필드명: writerNickname
  petName: string;
  content: string;
  imageUrl: string;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
  location: string;
  commentCount: number;
  recentComments: CommentDto[];
  hashtags: string[];
}

/**
 * 피드 생성 요청 DTO
 * Backend: FeedRequest.CreateFeedDto
 */
export interface CreateFeedRequest {
  userId: number;
  petId?: number;
  content: string;
  location?: string;
}

/**
 * 피드 수정 요청 DTO
 * Backend: FeedRequest.UpdateFeedDto
 */
export interface UpdateFeedRequest {
  userId: number;
  content: string;
  imageUrl?: string;
  location?: string;
}

/**
 * 무한 스크롤용 Slice 응답 래퍼
 */
export interface FeedSliceResponse {
  content: FeedDto[];
  last: boolean;
  size: number;
  number: number;
  first: boolean;
  empty: boolean;
}