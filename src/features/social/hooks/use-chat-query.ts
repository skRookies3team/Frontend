import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageApi } from '../api/message-api';
import { SendMessageRequest } from '@/features/social/types/message';

export const CHAT_KEYS = {
    all: ['chats'] as const,
    rooms: (userId: number) => [...CHAT_KEYS.all, 'rooms', userId] as const,
    messages: (roomId: number) => [...CHAT_KEYS.all, 'messages', roomId] as const,
    unread: (userId: number) => [...CHAT_KEYS.all, 'unread', userId] as const,
};

// 채팅방 목록
export const useChatRooms = (userId: number) => {
    return useQuery({
        queryKey: CHAT_KEYS.rooms(userId),
        queryFn: () => messageApi.getChatRooms(userId),
        enabled: !!userId,
    });
};

// 특정 채팅방의 메시지 목록
export const useChatMessages = (chatRoomId: number | null, userId: number) => {
    return useQuery({
        queryKey: CHAT_KEYS.messages(chatRoomId!),
        queryFn: () => messageApi.getMessages(chatRoomId!, userId),
        enabled: !!chatRoomId && !!userId,
        refetchInterval: 3000, // 3초마다 폴링 (실시간성 확보)
    });
};

// 메시지 전송
export const useSendMessage = (userId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: SendMessageRequest) => messageApi.sendMessage(request),
        onSuccess: (newMessage) => {
            // 메시지 목록 즉시 갱신
            queryClient.invalidateQueries({ queryKey: CHAT_KEYS.messages(newMessage.chatRoomId) });
            // 채팅방 목록(마지막 메시지) 갱신
            queryClient.invalidateQueries({ queryKey: CHAT_KEYS.rooms(userId) });
        },
    });
};

// 읽음 처리
export const useMarkAsRead = (userId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ chatRoomId }: { chatRoomId: number }) => messageApi.markAsRead(chatRoomId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CHAT_KEYS.rooms(userId) });
            queryClient.invalidateQueries({ queryKey: CHAT_KEYS.unread(userId) });
        },
    });
};