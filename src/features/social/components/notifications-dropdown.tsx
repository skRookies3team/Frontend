import { useState } from "react"
import { Bell, Heart, MessageCircle, Users, AlertTriangle, Activity, Sparkles } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { ScrollArea } from "@/shared/ui/scroll-area"

interface Notification {
  id: string
  type: "follower" | "like" | "comment" | "missing_pet" | "healthcare" | "recap"
  title: string
  message: string
  time: string
  isRead: boolean
  icon: any
  iconColor: string
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "follower",
    title: "새로운 팔로워",
    message: "김민수님이 회원님을 팔로우하기 시작했습니다",
    time: "5분 전",
    isRead: false,
    icon: Users,
    iconColor: "text-blue-500",
  },
  {
    id: "2",
    type: "like",
    title: "좋아요",
    message: "박지영님이 회원님의 게시물을 좋아합니다",
    time: "1시간 전",
    isRead: false,
    icon: Heart,
    iconColor: "text-pink-500",
  },
  {
    id: "3",
    type: "comment",
    title: "새 댓글",
    message: "이서준님이 회원님의 게시물에 댓글을 남겼습니다",
    time: "2시간 전",
    isRead: true,
    icon: MessageCircle,
    iconColor: "text-green-500",
  },
  {
    id: "4",
    type: "recap",
    title: "AI 리캡 생성 완료",
    message: "2025년 1-2월 리캡이 생성되었습니다",
    time: "3시간 전",
    isRead: false,
    icon: Sparkles,
    iconColor: "text-purple-500",
  },
  {
    id: "5",
    type: "missing_pet",
    title: "실종견 제보",
    message: "근처에서 실종견 목격 정보가 등록되었습니다",
    time: "5시간 전",
    isRead: true,
    icon: AlertTriangle,
    iconColor: "text-orange-500",
  },
  {
    id: "6",
    type: "healthcare",
    title: "헬스케어 알림",
    message: "오늘의 활동량이 목표의 80%에 도달했습니다",
    time: "어제",
    isRead: true,
    icon: Activity,
    iconColor: "text-red-500",
  },
]

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 p-0 text-xs flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-white">
        <div className="flex items-center justify-between p-4 pb-2">
          <h3 className="font-semibold text-lg">알림</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto py-1 px-2 text-xs">
              모두 읽음
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`p-4 cursor-pointer ${!notification.isRead ? "bg-pink-50/50" : ""}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex gap-3 w-full">
                <div className={`flex-shrink-0 ${notification.iconColor}`}>
                  <notification.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{notification.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                </div>
                {!notification.isRead && <div className="flex-shrink-0 h-2 w-2 rounded-full bg-pink-500 mt-1" />}
              </div>
            </DropdownMenuItem>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
