// 1. 피드 관련 타입
export interface FeedDto {
  feedId: number;
  // [변경] 작성자 정보 필드 추가
  writerId: number;
  writerNickname: string;
  writerSocialId: string;
  writerProfileImage: string | null;
  
  content: string;
  // [변경] 다중 이미지 지원 (String 배열)
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
  number: number; // 현재 페이지 번호
}

// 2. 요청 DTO
export interface CreateFeedRequest {
  userId: number;
  content: string;
  location?: string;
  petId: number;
  // [변경] 다중 이미지 URL 리스트
  imageUrls: string[]; 
}

export interface UpdateFeedRequest {
  userId: number;
  content: string;
  location?: string;
  // [변경] 이미지 목록 통째로 교체
  imageUrls: string[]; 
}

// 3. 댓글 관련 타입
export interface CommentDto {
  commentId: number;
  content: string;
  // userId 대신 writerId를 추가하거나, 둘 다 넣어줍니다.
  writerId: number; 
  userId?: number; // 호환성을 위해 남겨둠
  writerNickname: string;
  writerProfileImage: string | null;
  createdAt: string;
  updatedAt: string;
  isMyComment: boolean;
}

export interface CreateCommentRequest {
  userId: number;
  content: string;
  parentId: number | null; // 대댓글일 경우 ID, 원댓글이면 null
}

// 4. 검색 결과 타입
export interface SearchUserDto {
  userId: number;
  username: string; // 닉네임? 소셜ID? API 명세에 따라 맞춤
  nickname: string;
  profileImageUrl: string | null;
}

export interface SearchResponse {
  users?: SearchUserDto[]; // 유저 검색 결과
  feeds: FeedSliceResponse; // 피드(해시태그) 검색 결과
}