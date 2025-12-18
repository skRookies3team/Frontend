// 댓글 타입
export interface CommentDto {
  commentId: number;
  userId: number;           // [추가] 작성자 ID (본인 댓글 확인용)
  writerNickname: string;
  writerProfileImage?: string | null; // [추가] 작성자 프로필 이미지
  content: string;
  createdAt: string;
  isMyComment: boolean;     // [추가] 삭제 버튼 노출 여부
  children?: CommentDto[];  // 대댓글 리스트 (선택)
}

// 피드 타입
export interface FeedDto {
  feedId: number;
  writerId: number;         // [추가] 작성자 ID
  writerNickname: string;
  writerProfileImage?: string | null; // [추가] ⭐️ 이게 있어야 빨간줄이 사라집니다!
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

// 무한 스크롤 응답 타입 (Slice)
export interface FeedSliceResponse {
  content: FeedDto[];
  last: boolean;
  size: number;
  number: number;
  first: boolean;
  empty: boolean;
}

// 피드 작성 요청 타입
export interface CreateFeedRequest {
  userId: number;
  petId?: number;
  content: string;
  imageUrl?: string; // 이미지 URL 전송용
  location?: string;
}

// 피드 수정 요청 타입
export interface UpdateFeedRequest {
  userId: number;
  content: string;
  imageUrl?: string;
  location?: string;
}

// 댓글 작성 요청 타입
export interface CreateCommentRequest {
  userId: number;
  content: string;
  parentId?: number | null;
}