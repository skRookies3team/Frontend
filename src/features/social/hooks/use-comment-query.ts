import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedApi } from '../api/feed-api';
import { CreateCommentRequest } from '../types/feed';
import { FEED_KEYS } from './use-feed-query';

// 댓글 쿼리 키 정의
export const COMMENT_KEYS = {
  all: ['comments'] as const,
  list: (feedId: number) => [...COMMENT_KEYS.all, feedId] as const,
};

/**
 * 댓글 목록 조회 훅
 */
export const useComments = (feedId: number) => {
  return useQuery({
    queryKey: COMMENT_KEYS.list(feedId),
    queryFn: () => feedApi.getComments(feedId),
    enabled: !!feedId, // feedId가 있을 때만 실행
  });
};

/**
 * 댓글 작성 훅
 */
export const useCreateComment = (feedId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: number; content: string }) => {
      const request: CreateCommentRequest = {
        userId: data.userId,
        content: data.content,
      };
      return feedApi.createComment(feedId, request);
    },
    onSuccess: () => {
      // 1. 해당 게시물의 댓글 목록 새로고침
      queryClient.invalidateQueries({ queryKey: COMMENT_KEYS.list(feedId) });
      // 2. 피드 목록(댓글 수 변경 반영) 새로고침
      queryClient.invalidateQueries({ queryKey: FEED_KEYS.all });
    },
  });
};

/**
 * 댓글 삭제 훅
 */
export const useDeleteComment = (feedId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { commentId: number; userId: number }) => 
      feedApi.deleteComment(data.commentId, data.userId),
    onSuccess: () => {
      // 1. 해당 게시물의 댓글 목록 새로고침
      queryClient.invalidateQueries({ queryKey: COMMENT_KEYS.list(feedId) });
      // 2. 피드 목록(댓글 수 변경 반영) 새로고침
      queryClient.invalidateQueries({ queryKey: FEED_KEYS.all });
    },
  });
};