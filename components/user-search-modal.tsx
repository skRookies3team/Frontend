"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, X, Clock, UserPlus, UserCheck } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface UserSearchResult {
  id: string
  name: string
  username: string
  avatar: string
  petName?: string
  petBreed?: string
  isFollowing: boolean
  mutualFollowers: number
}

interface UserSearchModalProps {
  open: boolean
  onClose: () => void
}

export function UserSearchModal({ open, onClose }: UserSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<UserSearchResult[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Mock data for demonstration
  const mockUsers: UserSearchResult[] = [
    {
      id: "1",
      name: "김민수",
      username: "@minsu_kim",
      avatar: "/abstract-geometric-shapes.png",
      petName: "초코",
      petBreed: "골든 리트리버",
      isFollowing: false,
      mutualFollowers: 5,
    },
    {
      id: "2",
      name: "이서연",
      username: "@seoyeon_lee",
      avatar: "/abstract-geometric-shapes.png",
      petName: "모카",
      petBreed: "푸들",
      isFollowing: true,
      mutualFollowers: 12,
    },
    {
      id: "3",
      name: "박지훈",
      username: "@jihoon_park",
      avatar: "/diverse-group-collaborating.png",
      petName: "뭉치",
      petBreed: "시바견",
      isFollowing: false,
      mutualFollowers: 3,
    },
  ]

  // Load recent searches from localStorage
  useEffect(() => {
    if (open) {
      const saved = localStorage.getItem("recentSearches")
      if (saved) {
        setRecentSearches(JSON.parse(saved))
      }
      // Focus input when modal opens
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // Search users when query changes
  useEffect(() => {
    if (searchQuery.length >= 2) {
      setIsSearching(true)
      // Simulate API call
      setTimeout(() => {
        const filtered = mockUsers.filter(
          (user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.petName?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setResults(filtered)
        setIsSearching(false)
      }, 300)
    } else {
      setResults([])
    }
  }, [searchQuery])

  const handleSearch = (query: string) => {
    if (query.trim() && !recentSearches.includes(query)) {
      const updated = [query, ...recentSearches].slice(0, 10)
      setRecentSearches(updated)
      localStorage.setItem("recentSearches", JSON.stringify(updated))
    }
  }

  const handleFollow = (userId: string) => {
    setResults((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user
      )
    )
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem("recentSearches")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 gap-0 bg-white">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="sr-only">사용자 검색</DialogTitle>
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="이름, 닉네임, 반려동물 이름으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  handleSearch(searchQuery)
                }
              }}
              className="border-0 focus-visible:ring-0 text-base p-0 h-auto"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery("")}
                className="h-8 w-8 shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(80vh-100px)]">
          {searchQuery.length < 2 ? (
            // Recent Searches
            <div className="p-6">
              {recentSearches.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      최근 검색
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearRecentSearches}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      전체 삭제
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {recentSearches.map((query, index) => (
                      <button
                        key={index}
                        onClick={() => setSearchQuery(query)}
                        className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{query}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    이름, 닉네임, 반려동물 이름으로 검색해보세요
                  </p>
                </div>
              )}
            </div>
          ) : isSearching ? (
            // Loading
            <div className="p-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="h-12 w-12 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            // Search Results
            <div className="p-4">
              <div className="space-y-2">
                {results.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <Link href={`/user/${user.id}`} onClick={onClose}>
                      <Avatar className="h-12 w-12 cursor-pointer border-2 border-pink-100">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/user/${user.id}`}
                        onClick={onClose}
                        className="hover:underline"
                      >
                        <p className="font-semibold text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.username}</p>
                      </Link>
                      {user.petName && (
                        <p className="text-xs text-muted-foreground mt-1">
                          🐾 {user.petName} ({user.petBreed})
                        </p>
                      )}
                      {user.mutualFollowers > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          공통 팔로워 {user.mutualFollowers}명
                        </p>
                      )}
                    </div>

                    <Button
                      variant={user.isFollowing ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleFollow(user.id)}
                      className={
                        user.isFollowing
                          ? ""
                          : "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                      }
                    >
                      {user.isFollowing ? (
                        <>
                          <UserCheck className="h-4 w-4 mr-1" />
                          팔로잉
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-1" />
                          팔로우
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // No Results
            <div className="p-6 text-center py-12">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">검색 결과가 없습니다</p>
              <p className="text-xs text-muted-foreground mt-1">
                다른 검색어를 입력해보세요
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
