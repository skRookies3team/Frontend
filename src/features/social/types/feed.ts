export interface FeedDto {
  feedId: number;
  writerNickname: string;
  petName: string;
  content: string;
  imageUrl: string | null;
  likeCount: number;
  isLiked: boolean;
  createdAt: string; // ISO 8601
  location: string;
  commentCount: number;
}

export interface FeedSliceResponse {
  content: FeedDto[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}