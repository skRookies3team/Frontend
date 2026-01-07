import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedApi } from '../api/feed-api';
import { CreateCommentRequest } from '../types/feed';
import { FEED_KEYS } from './use-feed-query'; // 아래 파일에서 정의

export const COMMENT_KEYS = {
  all: ['comments'] as const,
  list: (feedId: number) => [...COMMENT_KEYS.all, feedId] as const,
};

export const useComments = (feedId: number) => {
  return useQuery({
    queryKey: COMMENT_KEYS.list(feedId),
    queryFn: () => feedApi.getComments(feedId),
    enabled: !!feedId,
    // [추가] 3초마다 자동으로 댓글을 다시 가져옴
    refetchInterval: 3000,
  });
};

export const useCreateComment = (feedId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    // [수정] parentId: null 추가 (일반 댓글일 경우 null)
    mutationFn: (data: { userId: number; content: string; parentId?: number | null }) => {
      const request: CreateCommentRequest = {
        userId: data.userId,
        content: data.content,
        parentId: data.parentId || null // 여기가 빠져서 에러남
      };
      return feedApi.createComment(feedId, request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMENT_KEYS.list(feedId) });
      queryClient.invalidateQueries({ queryKey: FEED_KEYS.all });
    },
  });
};

export const useDeleteComment = (feedId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { commentId: number; userId: number }) =>
      feedApi.deleteComment(data.commentId, data.userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMENT_KEYS.list(feedId) });
      queryClient.invalidateQueries({ queryKey: FEED_KEYS.all }); // 댓글 수 갱신
    },
  });
};