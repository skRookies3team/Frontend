import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, MoreVertical, Phone, Video, Send, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card } from "@/shared/ui/card";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { useAuth } from "@/features/auth/context/auth-context";
import { toast } from "sonner";

import { chatApi } from "../api/chat-api";
import { ChatRoom, ChatMessage } from "../types/chat";
import { useChatSocket } from "../hooks/use-chat-socket";

export default function MessagesPage() {
  const { user } = useAuth();
  
  // [수정] user가 없으면 0 대신 null로 처리하여 요청 방지
  const currentUserId = user ? Number(user.id) : null;
  
  const [searchParams] = useSearchParams();
  const initialRoomId = searchParams.get('roomId');

  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(
    initialRoomId ? Number(initialRoomId) : null
  );
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // 커스텀 훅: userId가 있을 때만 동작하도록 (0이 아닌 값)
  const { connected, newMessages, sendMessage } = useChatSocket(currentUserId || 0, selectedRoomId);

  // 1. 초기 로딩: 채팅방 목록
  useEffect(() => {
    // [중요] userId가 없으면 요청 보내지 않음
    if (!currentUserId) return;

    const loadChatRooms = async () => {
      try {
        console.log("Fetching chat rooms for user:", currentUserId);
        const rooms = await chatApi.getMyChatRooms(currentUserId);
        
        if (Array.isArray(rooms)) {
            setChatRooms(rooms);
        } else {
            console.warn("Unexpected chat rooms format:", rooms);
            setChatRooms([]);
        }
      } catch (error) {
        console.error("Failed to load chat rooms:", error);
      }
    };
    loadChatRooms();
  }, [currentUserId]);

  // 2. 채팅방 선택 시: 메시지 내역 로드 및 읽음 처리
  useEffect(() => {
    // [중요] 방 ID나 유저 ID가 없으면 요청 보내지 않음
    if (!selectedRoomId || !currentUserId) return;

    const fetchMessages = async () => {
      try {
        const history = await chatApi.getMessages(selectedRoomId, currentUserId);
        if (Array.isArray(history)) {
            setMessages(history);
        } else {
            setMessages([]);
        }
        
        // 읽음 처리 (에러 나도 무시)
        try {
            await chatApi.markAsRead(selectedRoomId, currentUserId);
        } catch (e) {
            console.warn("Mark as read failed", e);
        }
        
        // 로컬 상태 업데이트
        setChatRooms(prev => prev.map(room => 
          room.id === selectedRoomId ? { ...room, unreadCount: 0 } : room
        ));
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    };
    fetchMessages();
  }, [selectedRoomId, currentUserId]);

  // 3. 실시간 메시지 수신 처리
  useEffect(() => {
    if (newMessages.length > 0) {
      const lastMsg = newMessages[newMessages.length - 1];
      
      if (lastMsg.chatRoomId === selectedRoomId) {
        setMessages(prev => {
          if (prev.some(m => m.id === lastMsg.id && lastMsg.id !== null)) return prev;
          return [...prev, lastMsg];
        });
        
        // 내가 보낸 게 아니면 읽음 처리 요청
        if (lastMsg.senderId !== currentUserId && currentUserId) {
           chatApi.markAsRead(selectedRoomId, currentUserId).catch(() => {});
        }
      }

      setChatRooms(prev => prev.map(room => {
        if (room.id === lastMsg.chatRoomId) {
          const isMyMsg = lastMsg.senderId === currentUserId;
          const isCurrentRoom = selectedRoomId === lastMsg.chatRoomId;
          
          return {
            ...room,
            lastMessage: lastMsg.content,
            lastMessageAt: lastMsg.createdAt,
            unreadCount: (!isMyMsg && !isCurrentRoom) 
              ? room.unreadCount + 1 
              : room.unreadCount
          };
        }
        return room;
      }));
    }
  }, [newMessages, selectedRoomId, currentUserId]);

  // 스크롤 자동 이동
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedRoomId || !currentUserId) return;

    if (!connected) {
      toast.error("연결이 불안정합니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const success = sendMessage(inputMessage, selectedRoomId);
    if (success) {
      setInputMessage("");
    } else {
      toast.error("메시지 전송 실패");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectedRoom = chatRooms.find(r => r.id === selectedRoomId);

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '';
    }
  };

  if (!user) {
      return <div className="p-10 text-center">로그인이 필요합니다.</div>;
  }

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
                        <AvatarImage src={room.otherUserAvatar || undefined} />
                        <AvatarFallback>{room.otherUserName ? room.otherUserName.charAt(0) : '?'}</AvatarFallback>
                      </Avatar>
                      {room.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-[#FF69B4] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-bold text-sm">{room.otherUserName || '알 수 없음'}</span>
                        <span className="text-[10px] text-gray-400">
                            {formatTime(room.lastMessageAt)}
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
                    <AvatarImage src={selectedRoom?.otherUserAvatar || undefined} />
                    <AvatarFallback>{selectedRoom?.otherUserName ? selectedRoom.otherUserName.charAt(0) : '?'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-sm">{selectedRoom?.otherUserName || "알 수 없는 사용자"}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      {selectedRoom?.petName || "반려동물"} 보호자님
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
                                    <AvatarImage src={msg.senderAvatar || undefined} />
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
                                    {formatTime(msg.createdAt)}
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