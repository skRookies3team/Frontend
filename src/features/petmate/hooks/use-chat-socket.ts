import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessage, MessageRequest } from '../types/chat';

export function useChatSocket(userId: number, currentRoomId: number | null) {
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<any>(null);
  const [newMessages, setNewMessages] = useState<ChatMessage[]>([]);

  // 방 변경 시 메시지 버퍼 초기화
  useEffect(() => {
    setNewMessages([]);
  }, [currentRoomId]);

  // 1. 소켓 연결 설정
  useEffect(() => {
    if (!userId) return;

    if (clientRef.current) {
      clientRef.current.deactivate();
    }

    // [핵심 수정] HTTPS 환경에서는 wss(https), HTTP 환경에서는 ws(http)를 자동으로 선택
    // 배포 환경(VITE_API_URL)이 있다면 그것을 쓰고, 없다면 localhost 사용
    // 주의: 백엔드 서버도 반드시 SSL 인증서(HTTPS)가 적용되어 있어야 합니다.
    const isSecure = window.location.protocol === 'https:';

    // .env 파일에 VITE_API_URL이 있다면 사용, 없다면 localhost:8000
    // 예: VITE_API_URL=api.yourpetlog.com
    let apiHost = 'localhost:8000';
    if (import.meta.env.VITE_API_URL) {
      // http:// 또는 https:// 제거하고 도메인만 추출
      apiHost = import.meta.env.VITE_API_URL.replace(/^https?:\/\//, '');
    }

    // 최종 소켓 URL 생성 (https://api.domain.com/ws-chat 또는 http://localhost:8000/ws-chat)
    const socketUrl = `${isSecure ? 'https' : 'http'}://${apiHost}/ws-chat`;

    console.log("🔌 Connecting to WebSocket:", socketUrl);

    const socket = new SockJS(socketUrl);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (_str) => {
        // console.log('STOMP:', _str);
      },
      onConnect: () => {
        console.log('✅ WebSocket Connected Successfully!');
        setConnected(true);
      },
      onStompError: (frame) => {
        console.error('❌ Broker error:', frame.headers['message']);
      },
      onWebSocketClose: () => {
        console.log('❌ WebSocket Closed');
        setConnected(false);
      }
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        setConnected(false);
      }
    };
  }, [userId]);

  // 2. 방 구독 관리
  useEffect(() => {
    const client = clientRef.current;
    if (!client || !client.connected || !currentRoomId) return;

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    console.log(`📡 Subscribing to room: ${currentRoomId}`);
    subscriptionRef.current = client.subscribe(`/sub/chat/room/${currentRoomId}`, (message: IMessage) => {
      if (message.body) {
        try {
          const receivedMsg: ChatMessage = JSON.parse(message.body);
          setNewMessages((prev) => {
            if (prev.some(m => m.id === receivedMsg.id)) return prev;
            return [...prev, receivedMsg];
          });
        } catch (e) {
          console.error("Message parse error", e);
        }
      }
    });

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [currentRoomId, connected]);

  // 3. 메시지 전송
  const sendMessage = useCallback((content: string, roomId: number, messageType: 'TEXT' | 'IMAGE' = 'TEXT') => {
    if (clientRef.current && clientRef.current.connected) {
      const payload: MessageRequest = {
        chatRoomId: roomId,
        senderId: userId,
        content: content,
        messageType: messageType,
      };

      clientRef.current.publish({
        destination: '/pub/chat/message',
        body: JSON.stringify(payload),
      });
      return true;
    } else {
      console.warn("⚠️ Cannot send message: Socket not connected");
      return false;
    }
  }, [userId]);

  return {
    connected,
    newMessages,
    sendMessage,
  };
}