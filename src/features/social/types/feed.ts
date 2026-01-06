// 1. 피드 관련 타입
export interface FeedDto {
  feedId: number;
  writerId: number;
  writerNickname: string;
  writerSocialId: string;
  writerProfileImage: string | null;

  content: string;
  imageUrls: string[];

  likeCount: number;
  isLiked: boolean;
  commentCount: number;
  recentComments: CommentDto[];
  location?: string;
  petId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeedSliceResponse {
  content: FeedDto[];
  last: boolean;
  number: number;
}

// 2. 요청 DTO
export interface CreateFeedRequest {
  userId: number;
  // petId: number | null;  <-- 삭제
  content: string;
  imageUrls: string[];
  location: string;
}

export interface UpdateFeedRequest {
  userId: number;
  content: string;
  location?: string;
  imageUrls: string[];
}

// 3. 댓글 관련 타입
export interface CommentDto {
  commentId: number;
  content: string;
  writerId: number;
  userId?: number;
  writerNickname: string;
  writerProfileImage: string | null;
  createdAt: string;
  updatedAt: string;
  isMyComment: boolean;
  parentId: number | null;
  children?: CommentDto[];
}

export interface CreateCommentRequest {
  userId: number;
  content: string;
  parentId: number | null;
}

// 4. 검색 결과 타입
export interface SearchUserDto {
  userId: number;
  username: string;
  social: string;
  profileImage: string | null;
  statusMessage?: string;
  // [수정] pets 필드 추가 (UserPage 오류 해결)
  pets?: {
    petId: number;
    petName: string;
    profileImage: string | null;
    breed?: string;
  }[];
}

export interface SearchResponse {
  users?: SearchUserDto[];
  feeds: FeedSliceResponse;
}

// 5. 팔로우 및 좋아요 관련 타입
export interface FollowStatResponse {
  followerCount: number;
  followingCount: number;
}

export interface FollowListResponse {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  isFollow: boolean;
}

export interface LikerDto {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  profileImage?: string | null; // 백엔드 응답 대응 (프사 표시용)
}

export interface ToggleLikeResponse {
  isLiked: boolean;
  likeCount: number;
}