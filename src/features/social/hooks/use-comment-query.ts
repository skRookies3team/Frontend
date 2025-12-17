import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedApi } from '../api/feed-api';
import { CreateCommentRequest } from '../types/feed';

export const useComments = (feedId: number) => {
  return useQuery({
    queryKey: ['comments', feedId],
    queryFn: () => feedApi.getComments(feedId),
    enabled: !!feedId, // feedId가 있을 때만 조회
  });
};

export const useCreateComment = (feedId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentRequest) => feedApi.createComment(feedId, data),
    onSuccess: () => {
      // 댓글 작성 성공 시 댓글 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ['comments', feedId] });
      // 피드 목록의 댓글 개수도 갱신하려면 아래 주석 해제
      // queryClient.invalidateQueries({ queryKey: ['feeds'] });
    },
  });
};

export const useDeleteComment = (feedId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, userId }: { commentId: number; userId: number }) => 
      feedApi.deleteComment(commentId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', feedId] });
    },
  });
};