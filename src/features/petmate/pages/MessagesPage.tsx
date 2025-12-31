import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { Search, MoreVertical, Phone, Video, Send, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card } from "@/shared/ui/card";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { useAuth } from "@/features/auth/context/auth-context";
import { messageApi, ChatRoom, Message } from "../api/message-api";
import { toast } from "sonner";

export default function MessagesPage() {
  const { user } = useAuth();
  const currentUserId = user ? Number(user.id) : 0;
  
  // URL 쿼리 파라미터에서 roomId 가져오기 (/messages?roomId=123)
  const [searchParams] = useSearchParams();
  const initialRoomId = searchParams.get('roomId');

  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(
    initialRoomId ? Number(initialRoomId) : null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [stompClient, setStompClient] = useState<Client | null>(null);
  
  // 스크롤 자동 이동을 위한 Ref
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. 초기 로딩: 채팅방 목록 불러오기
  useEffect(() => {
    if (currentUserId) {
      loadChatRooms();
    }
  }, [currentUserId]);

  const loadChatRooms = async () => {
    try {
      const rooms = await messageApi.getMyChatRooms(currentUserId);
      setChatRooms(rooms);
    } catch (error) {
      console.error("Failed to load chat rooms:", error);
    }
  };

  // 2. WebSocket 연결 설정 (페이지 진입 시 1회)
  useEffect(() => {
    if (!currentUserId) return;

    // [중요] Vite Proxy 설정(/ws-chat)을 통해 연결
    const socket = new SockJS("/ws-chat"); 
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => {
        // console.log(str); // 디버깅 필요 시 주석 해제
      },
      onConnect: () => {
        console.log("✅ WebSocket Connected");
        // 연결 되자마자 선택된 방이 있다면 구독 (URL로 들어온 경우 등)
        if (selectedRoomId) {
          subscribeToRoom(client, selectedRoomId);
        }
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
      },
    });

    client.activate();
    setStompClient(client);

    return () => {
      if (client) client.deactivate();
    };
  }, [currentUserId]);

  // 3. 채팅방 선택 변경 시 로직 (메시지 로드 + 소켓 구독)
  useEffect(() => {
    if (selectedRoomId && currentUserId) {
      // (1) HTTP로 이전 대화 내역 먼저 로드
      loadMessages(selectedRoomId);

      // (2) 소켓이 연결된 상태라면 해당 방 구독
      if (stompClient && stompClient.connected) {
        subscribeToRoom(stompClient, selectedRoomId);
      }
    }
  }, [selectedRoomId, stompClient, currentUserId]);

  // 스크롤 자동 하단 이동
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const loadMessages = async (roomId: number) => {
    try {
      const history = await messageApi.getChatHistory(roomId, currentUserId);
      setMessages(history);
      // 채팅방 들어왔으니 읽음 처리 -> 목록 갱신 (안읽은 배지 제거)
      loadChatRooms();
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  // 구독 헬퍼 함수
  const subscribeToRoom = (client: Client, roomId: number) => {
    // 백엔드 Config에 맞춰 '/sub/chat/room/{id}' 경로 구독
    client.subscribe(`/sub/chat/room/${roomId}`, (message) => {
      if (message.body) {
        const newMessage: Message = JSON.parse(message.body);
        
        // 현재 보고 있는 방의 메시지면 화면에 추가
        if (Number(newMessage.chatRoomId) === roomId) {
          setMessages((prev) => [...prev, newMessage]);
        }

        // 사이드바 목록의 마지막 메시지 업데이트
        setChatRooms((prev) => prev.map(room => 
          room.id === Number(newMessage.chatRoomId)
          ? { 
              ...room, 
              lastMessage: newMessage.content, 
              lastMessageAt: newMessage.createdAt,
              // 내가 보낸게 아니고, 현재 안보고 있는 방이면 안읽은 수 증가
              unreadCount: (selectedRoomId !== Number(newMessage.chatRoomId) && newMessage.senderId !== currentUserId) 
                ? room.unreadCount + 1 
                : 0
            }
          : room
        ));
      }
    });
  };

  // 메시지 전송
  const handleSendMessage = () => {
    if (!inputMessage.trim() || !selectedRoomId || !stompClient || !stompClient.connected) {
        if (!stompClient?.connected) toast.error("채팅 서버와 연결이 끊어졌습니다.");
        return;
    }

    const chatMessage = {
      chatRoomId: selectedRoomId,
      senderId: currentUserId,
      content: inputMessage,
      messageType: 'TEXT'
    };

    // 백엔드 Controller의 @MessageMapping 경로로 발행
    stompClient.publish({
      destination: "/pub/chat/message", 
      body: JSON.stringify(chatMessage),
    });

    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectedRoom = chatRooms.find(r => r.id === selectedRoomId);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#FDFBFD] pt-4">
      <div className="container max-w-6xl mx-auto flex h-full gap-6 p-4">
        
        {/* === 왼쪽 사이드바 (채팅 목록) === */}
        <Card className={`w-full md:w-80 flex-col border-none shadow-lg rounded-3xl overflow-hidden bg-white ${selectedRoomId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b">
            <h2 className="font-bold text-xl mb-4">메시지</h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input placeholder="검색..." className="pl-9 bg-gray-50 border-none rounded-xl" />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {chatRooms.length === 0 ? (
                 <div className="p-4 text-center text-gray-400 text-sm mt-10">
                    아직 대화가 없어요.<br/>펫메이트와 매칭을 시작해보세요!
                 </div>
              ) : (
                chatRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-colors ${
                      selectedRoomId === room.id ? "bg-[#FFF0F5]" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarImage src={room.otherUserAvatar || "/placeholder-user.jpg"} />
                        <AvatarFallback>{room.otherUserName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {room.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-[#FF69B4] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-bold text-sm">{room.otherUserName}</span>
                        <span className="text-[10px] text-gray-400">
                            {room.lastMessageAt ? new Date(room.lastMessageAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {room.lastMessage || "대화를 시작해보세요!"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* === 오른쪽 메인 (채팅방) === */}
        <Card className={`flex-1 flex-col border-none shadow-lg rounded-3xl overflow-hidden bg-white ${selectedRoomId ? 'flex' : 'hidden md:flex'}`}>
          {selectedRoomId ? (
            <>
              {/* 채팅방 헤더 */}
              <div className="p-4 border-b flex justify-between items-center bg-white">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedRoomId(null)}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedRoom?.otherUserAvatar || "/placeholder-user.jpg"} />
                    <AvatarFallback>{selectedRoom?.otherUserName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-sm">{selectedRoom?.otherUserName || "알 수 없는 사용자"}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      {selectedRoom?.petName} 보호자님
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full"><Phone className="h-5 w-5 text-gray-500" /></Button>
                  <Button variant="ghost" size="icon" className="rounded-full"><Video className="h-5 w-5 text-gray-500" /></Button>
                  <Button variant="ghost" size="icon" className="rounded-full"><MoreVertical className="h-5 w-5 text-gray-500" /></Button>
                </div>
              </div>
              
              {/* 메시지 리스트 영역 */}
              <ScrollArea className="flex-1 p-4 bg-gray-50/50">
                <div className="flex flex-col gap-4">
                  {messages.map((msg, index) => {
                    const isMyMessage = msg.senderId === currentUserId;
                    return (
                        <div key={msg.id || index} className={`flex gap-3 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                            {!isMyMessage && (
                                <Avatar className="h-8 w-8 mt-1">
                                    <AvatarImage src={msg.senderAvatar} />
                                    <AvatarFallback>?</AvatarFallback>
                                </Avatar>
                            )}
                            <div className={`max-w-[70%] ${isMyMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                                <div className={`p-3 rounded-2xl shadow-sm text-sm ${
                                    isMyMessage 
                                    ? 'bg-[#FF69B4] text-white rounded-tr-none' 
                                    : 'bg-white border border-gray-100 rounded-tl-none'
                                }`}>
                                    {msg.content}
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1 px-1">
                                    {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                        </div>
                    );
                  })}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              {/* 메시지 입력창 */}
              <div className="p-4 bg-white border-t">
                <div className="flex gap-2">
                  <Input 
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="메시지를 입력하세요..." 
                    className="rounded-xl border-gray-200 bg-gray-50 focus-visible:ring-[#FF69B4]" 
                  />
                  <Button 
                    onClick={handleSendMessage}
                    size="icon" 
                    className="bg-[#FF69B4] hover:bg-[#FF1493] rounded-xl shadow-lg shadow-pink-200"
                    disabled={!inputMessage.trim()}
                  >
                    <Send className="h-5 w-5 text-white" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Send className="h-10 w-10 text-gray-300" />
              </div>
              <p>대화를 시작할 친구를 선택해주세요!</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}