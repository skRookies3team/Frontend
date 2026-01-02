import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, Heart, MessageCircle, Users, Sparkles, Calendar, BookOpen, Award } from 'lucide-react'
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getNotificationsApi, readNotificationApi, GetNotificationDto } from "@/features/auth/api/auth-api"
import { formatDistanceToNow, addHours } from 'date-fns'
import { ko } from 'date-fns/locale'

export function NotificationsDropdown() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notificationData } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotificationsApi,
    refetchInterval: 30000, // Poll every 30s
  });

  // Optimize UI response by tracking locally read notifications
  // This prevents the "flicker" if the server value comes back as false during refetch
  const [readIds, setReadIds] = useState<Set<number>>(new Set());

  const readMutation = useMutation({
    mutationFn: (userNotificationId: number) => readNotificationApi(userNotificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const notifications = notificationData?.notifications || [];
  // Server might return 'read' instead of 'isRead' for boolean fields
  const unreadCount = notifications.filter((n) => !(n.isRead || n.read) && !readIds.has(n.userNotificationId)).length;

  const handleNotificationClick = (notification: GetNotificationDto) => {
    const isAlreadyRead = notification.isRead || notification.read || readIds.has(notification.userNotificationId);

    // 1. Mark as read locally immediately
    if (!isAlreadyRead) {
      setReadIds(prev => new Set(prev).add(notification.userNotificationId));
      readMutation.mutate(notification.userNotificationId);
    }

    // 2. Navigate
    if (notification.alarmType === 'FOLLOW') {
      navigate(`/user/${notification.targetId}`);
    } else if (notification.alarmType === 'LIKE' || notification.alarmType === 'COMMENT') {
      navigate(`/feed?feedId=${notification.targetId}`);
    } else if (notification.alarmType === 'MATCH') {
      navigate(`/pet-mate?modal=requests`);
    } else if (notification.alarmType === 'DIARY') {
      navigate(`/ai-studio/diary/calendar`);
    } else if (notification.alarmType === 'RECAP') {
      navigate(`/ai-studio/recap`);
    } else if (notification.alarmType === 'COIN') {
      navigate(`/dashboard`);
    }
  };

  const markAllAsRead = () => {
    // Implement API call
    // For now optimistically update or invalidate query
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'FOLLOW': return { icon: Users, color: 'text-blue-500' };
      case 'LIKE': return { icon: Heart, color: 'text-pink-500' };
      case 'COMMENT': return { icon: MessageCircle, color: 'text-green-500' };
      case 'MATCH': return { icon: Sparkles, color: 'text-purple-500' };
      case 'DIARY': return { icon: Calendar, color: 'text-blue-500' };
      case 'RECAP': return { icon: BookOpen, color: 'text-orange-500' };
      case 'COIN': return { icon: Award, color: 'text-yellow-500' };
      default: return { icon: Bell, color: 'text-gray-500' };
    }
  };

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
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              알림이 없습니다.
            </div>
          ) : (
            notifications.map((notification) => {
              const { icon: Icon, color } = getIcon(notification.alarmType);
              // Check possible field names for read status
              const isRead = notification.isRead || notification.read || readIds.has(notification.userNotificationId);

              return (
                <DropdownMenuItem
                  key={notification.notificationId}
                  className={`p-4 cursor-pointer ${!isRead ? "bg-pink-50/50" : ""}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3 w-full">
                    <div className={`flex-shrink-0 ${color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(addHours(new Date(notification.time), 9), { addSuffix: true, locale: ko })}
                      </p>
                    </div>
                    {!isRead && <div className="flex-shrink-0 h-2 w-2 rounded-full bg-pink-500 mt-1" />}
                  </div>
                </DropdownMenuItem>
              )
            })
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
