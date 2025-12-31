import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessage } from '../types/chat';

const SOCKET_URL = 'http://localhost:8089/ws-chat'; // 백엔드 포트 확인 (8000 or 8089)

export function useChatSocket(chatRoomId: number | null, userId: number) {
  const [connected, setConnected] = useState(false);
  const [realtimeMessages, setRealtimeMessages] = useState<ChatMessage[]>([]);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    setRealtimeMessages([]);
  }, [chatRoomId]);

  useEffect(() => {
    if (!chatRoomId || !userId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      connectHeaders: {},
      // [수정] 사용하지 않는 파라미터 경고 해결: str -> _str (또는 제거)
      debug: (_str) => {
        // console.log('STOMP Debug:', _str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setConnected(true);
      console.log('✅ 소켓 연결 성공!');

      client.subscribe(`/topic/chat/${chatRoomId}`, (message) => {
        if (message.body) {
          const newMessage: ChatMessage = JSON.parse(message.body);
          setRealtimeMessages((prev) => [...prev, newMessage]);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('❌ 소켓 에러:', frame.headers['message']);
      console.error('Details:', frame.body);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        setConnected(false);
      }
    };
  }, [chatRoomId, userId]);

  const sendMessage = useCallback((content: string) => {
    if (clientRef.current && clientRef.current.connected && chatRoomId) {
      const payload = {
        chatRoomId,
        senderId: userId,
        content,
        messageType: 'TEXT',
      };
      
      clientRef.current.publish({
        destination: '/app/chat/send',
        body: JSON.stringify(payload),
      });
      return true;
    }
    return false;
  }, [chatRoomId, userId]);

  return {
    connected,
    realtimeMessages,
    sendMessage,
  };
}