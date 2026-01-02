import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, MoreVertical, Send, ArrowLeft, Phone, Video, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card } from "@/shared/ui/card";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { useAuth } from "@/features/auth/context/auth-context";
import { useChat } from "../hooks/use-chat";
import { ChatRoom, messageApi } from "../api/message-api";

export default function MessagesPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userId = user?.id ? Number(user.id) : 0;
  const targetUserId = searchParams.get("userId");

  const {
    messages,
    chatRooms,
    isConnected,
    isLoading,
    sendMessage,
    loadMessages,
    loadChatRooms,
    deleteRoom,
  } = useChat({ userId, chatRoomId: selectedRoomId });

  // URL에서 userId가 있으면 해당 사용자와의 채팅방 열기
  useEffect(() => {
    if (targetUserId && userId) {
      if (isNaN(Number(targetUserId))) return;

      messageApi.createOrGetChatRoom(userId, Number(targetUserId))
        .then((room) => {
          setSelectedRoomId(room.id);
          // useChat handles message loading when chatRoomId prop changes
          loadChatRooms(); // 목록 갱신
          // 파라미터 제거
          setSearchParams({});
        })
        .catch((err) => {
          console.error(err);
          alert("채팅을 시작할 수 없습니다. 서로 매칭된 친구가 아니거나 문제가 발생했습니다.");
          setSearchParams({});
          setSelectedRoomId(null);
        });
    }
  }, [targetUserId, userId, loadChatRooms, setSearchParams]);

  // 채팅방 선택
  const handleSelectRoom = (room: ChatRoom) => {
    setSelectedRoomId(room.id);
    // useChat will load messages automatically
  };

  // 메시지 전송
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    sendMessage(inputMessage);
    setInputMessage("");
  };

  // 엔터 키로 전송
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 채팅방 삭제 (나가기)
  const handleDeleteRoom = async () => {
    if (!selectedRoomId) return;
    if (window.confirm("정말 채팅방을 나가시겠습니까? 대화 내용이 모두 삭제됩니다.")) {
      try {
        await deleteRoom(selectedRoomId);
        setSelectedRoomId(null);
      } catch (e) {
        alert("채팅방 나가기에 실패했습니다.");
      }
    }
  };

  // 준비 중인 기능 알림
  const handleComingSoon = () => {
    alert("준비 중인 기능입니다.");
  };

  // 새 메시지 시 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 검색 필터링
  const filteredRooms = chatRooms.filter((room) =>
    room.otherUserName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 선택된 채팅방 정보
  const selectedRoom = chatRooms.find((r) => r.id === selectedRoomId);

  // 시간 포맷팅
  const formatTime = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "방금 전";
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString("ko-KR");
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex h-screen bg-[#FDFBFD] pt-16">
      <div className="container max-w-6xl mx-auto flex h-[calc(100vh-5rem)] gap-6 p-4">

        {/* 채팅 목록 사이드바 */}
        <Card className={`${selectedRoomId ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-none shadow-lg rounded-3xl overflow-hidden bg-white`}>
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-xl">메시지</h2>
              {isConnected && (
                <span className="flex items-center gap-1 text-xs text-green-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  실시간
                </span>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="검색..."
                className="pl-9 bg-gray-50 border-none rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {filteredRooms.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <p>채팅이 없습니다</p>
                  <p className="text-sm mt-2">펫메이트에서 친구를 만들어보세요!</p>
                </div>
              ) : (
                filteredRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => handleSelectRoom(room)}
                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-colors ${selectedRoomId === room.id ? "bg-[#FFF0F5]" : "hover:bg-gray-50"
                      }`}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarImage src={room.petPhoto || room.otherUserAvatar || "/placeholder.svg"} />
                        <AvatarFallback>{room.otherUserName?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      {room.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-[#FF69B4] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-bold text-sm">{room.petName || room.otherUserName}</span>
                        <span className="text-[10px] text-gray-400">{formatTime(room.lastMessageAt)}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{room.lastMessage || "대화를 시작해보세요"}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* 채팅방 영역 */}
        <Card className={`${selectedRoomId ? 'flex' : 'hidden md:flex'} flex-1 flex-col border-none shadow-lg rounded-3xl overflow-hidden bg-white`}>
          {selectedRoom ? (
            <>
              <div className="p-4 border-b flex justify-between items-center bg-white">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden rounded-full"
                    onClick={() => setSelectedRoomId(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedRoom.petPhoto || selectedRoom.otherUserAvatar || "/placeholder.svg"} />
                    <AvatarFallback>{selectedRoom.otherUserName?.[0] || "?"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-sm">{selectedRoom.petName || selectedRoom.otherUserName}</div>
                    <div className="text-xs text-gray-500">{selectedRoom.otherUserName}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={handleComingSoon}>
                    <Phone className="h-5 w-5 text-gray-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={handleComingSoon}>
                    <Video className="h-5 w-5 text-gray-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full text-red-400 hover:text-red-500 hover:bg-red-50" onClick={handleDeleteRoom}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4 bg-gray-50/50">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {messages.map((msg) => {
                      const isMe = msg.senderId === userId;
                      return (
                        <div key={msg.id} className={`flex gap-3 ${isMe ? "justify-end" : "justify-start"}`}>
                          {!isMe && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={msg.senderAvatar || "/placeholder.svg"} />
                              <AvatarFallback>{msg.senderName?.[0] || "?"}</AvatarFallback>
                            </Avatar>
                          )}
                          <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                            <div
                              className={`p-3 rounded-2xl text-sm max-w-[280px] ${isMe
                                  ? "bg-[#FF69B4] text-white rounded-tr-none shadow-md shadow-pink-100"
                                  : "bg-white rounded-tl-none shadow-sm border border-gray-100"
                                }`}
                            >
                              {msg.content}
                            </div>
                            <span className="text-[10px] text-gray-400 mt-1">
                              {formatMessageTime(msg.createdAt)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              <div className="p-4 bg-white border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="메시지를 입력하세요..."
                    className="rounded-xl border-gray-200 bg-gray-50 focus-visible:ring-[#FF69B4]"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <Button
                    size="icon"
                    className="bg-[#FF69B4] hover:bg-[#FF1493] rounded-xl shadow-lg shadow-pink-200"
                    onClick={handleSendMessage}
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