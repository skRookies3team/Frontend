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
  content: string;
  location?: string;
  petId: number;
  imageUrls: string[]; 
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
}

export interface CreateCommentRequest {
  userId: number;
  content: string;
  parentId: number | null;
}

// 4. 검색 결과 타입
export interface SearchUserDto {
  userId: number;
  // 백엔드: username이 닉네임 역할
  username: string; 
  // 백엔드: social이 아이디 역할
  social: string;   
  // 백엔드: profileImage
  profileImage: string | null; 
  statusMessage?: string;
}

export interface SearchResponse {
  users?: SearchUserDto[];
  feeds: FeedSliceResponse;
}

// [추가] 5. 팔로우 및 좋아요 관련 타입 (오류 해결용)
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
}