// src/features/social/types/feed.ts

export interface CommentDto {
  commentId: number;
  writerNickname: string;
  content: string;
  createdAt: string;
}

export interface FeedDto {
  feedId: number;
  writerNickname: string; // 백엔드 필드명에 맞춤
  petName: string;
  content: string;
  imageUrl: string | null;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
  location: string | null;
  commentCount: number;
  recentComments: CommentDto[];
  hashtags: string[];
}

export interface FeedSliceResponse {
  content: FeedDto[];
  last: boolean;
  size: number;
  number: number;
  first: boolean;
  empty: boolean;
}

export interface CreateFeedRequest {
  userId: number;
  petId?: number;
  content: string;
  location?: string;
}

export interface UpdateFeedRequest {
  userId: number;
  content: string;
  imageUrl?: string;
  location?: string;
}