import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, X, MapPin, Star, MessageCircle, Sparkles, Settings2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useNavigate } from "react-router-dom"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface WalkMate {
  id: string
  userName: string
  userAvatar: string
  petName: string
  petBreed: string
  petAge: number
  petGender: string
  petPhoto: string
  distance: number
  bio: string
  activityLevel: number
  commonInterests: string[]
  matchScore: number
}

export default function WalkMatePage() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null)
  const [matchModalOpen, setMatchModalOpen] = useState(false)
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [distanceFilter, setDistanceFilter] = useState("1")
  const [matchedUser, setMatchedUser] = useState<WalkMate | null>(null)
  const [locationEnabled, setLocationEnabled] = useState(false)

  const candidates: WalkMate[] = [
    {
      id: "1",
      userName: "포메사랑",
      userAvatar: "/placeholder.svg?height=100&width=100",
      petName: "뭉치",
      petBreed: "포메라니안",
      petAge: 3,
      petGender: "남아",
      petPhoto: "/pomeranian-dog.png",
      distance: 0.68,
      bio: "매일 저녁 7시에 한강공원에서 산책해요! 같은 포메 친구 찾아요 🐾",
      activityLevel: 85,
      commonInterests: ["한강 산책", "소형견 모임", "미용 정보"],
      matchScore: 95,
    },
    {
      id: "2",
      userName: "골댕이집사",
      userAvatar: "/placeholder.svg?height=100&width=100",
      petName: "해피",
      petBreed: "골든 리트리버",
      petAge: 2,
      petGender: "여아",
      petPhoto: "/golden-retriever.png",
      distance: 1.2,
      bio: "활발한 골댕이와 함께 공원 러닝 즐겨요! 대형견 친구 환영합니다 🏃‍♀️",
      activityLevel: 95,
      commonInterests: ["러닝", "프리스비", "수영"],
      matchScore: 78,
    },
    {
      id: "3",
      userName: "닥스훈트맘",
      userAvatar: "/placeholder.svg?height=100&width=100",
      petName: "소시지",
      petBreed: "닥스훈트",
      petAge: 5,
      petGender: "남아",
      petPhoto: "/dachshund-dog.png",
      distance: 0.9,
      bio: "느긋하게 산책 좋아하는 소형견이에요. 주말 아침 산책 메이트 구해요!",
      activityLevel: 60,
      commonInterests: ["느긋한 산책", "카페 투어", "사진 찍기"],
      matchScore: 82,
    },
  ]

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      navigate("/login")
      return
    }

    // 위치 권한 요청
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setLocationEnabled(true),
        () => setLocationEnabled(false),
      )
    }
  }, [user, isLoading, navigate])

  const currentCandidate = candidates[currentIndex]

  const handleSwipe = (direction: "left" | "right") => {
    setSwipeDirection(direction)

    setTimeout(() => {
      if (direction === "right") {
        // 50% 확률로 매칭 성공 (실제로는 상대방도 좋아요를 눌렀는지 확인)
        const isMatch = Math.random() > 0.5
        if (isMatch) {
          setMatchedUser(currentCandidate)
          setMatchModalOpen(true)
        }
      }

      setSwipeDirection(null)
      if (currentIndex < candidates.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        // 모든 후보를 확인했을 때
        setCurrentIndex(0)
      }
    }, 300)
  }

  if (isLoading) {
    return null
  }

  if (!user) {
    return null
  }

  if (!locationEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white pt-20">
        <div className="container mx-auto max-w-2xl px-4 py-12">
          <Card className="p-8 text-center">
            <MapPin className="mx-auto mb-4 h-16 w-16 text-pink-400" />
            <h2 className="mb-2 text-2xl font-bold">위치 권한이 필요해요</h2>
            <p className="mb-6 text-muted-foreground">주변의 산책 메이트를 찾기 위해 위치 정보가 필요합니다.</p>
            <Button
              onClick={() => {
                navigator.geolocation.getCurrentPosition(
                  () => setLocationEnabled(true),
                  () => alert("위치 권한을 허용해주세요."),
                )
              }}
              className="bg-gradient-to-r from-pink-500 to-rose-500"
            >
              위치 권한 허용하기
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  if (!currentCandidate) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white pt-20">
        <div className="container mx-auto max-w-2xl px-4 py-12">
          <Card className="p-8 text-center">
            <Sparkles className="mx-auto mb-4 h-16 w-16 text-pink-400" />
            <h2 className="mb-2 text-2xl font-bold">모든 후보를 확인했어요!</h2>
            <p className="mb-6 text-muted-foreground">새로운 산책 메이트가 곧 나타날 거예요. 조금만 기다려주세요!</p>
            <Button onClick={() => setCurrentIndex(0)} className="bg-gradient-to-r from-pink-500 to-rose-500">
              처음부터 다시 보기
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-rose-50 to-white pt-20 pb-8">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                산책 메이트 찾기
              </h1>
              <p className="text-muted-foreground mt-1">우리 동네 산책 친구를 만나보세요</p>
            </div>
            <Button variant="outline" size="lg" onClick={() => setFilterModalOpen(true)} className="gap-2">
              <Settings2 className="h-5 w-5" />
              필터
            </Button>
          </div>

          {/* Distance Filter Info */}
          <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-pink-100 to-rose-100 px-6 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white p-2">
                <MapPin className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">현재 검색 범위</p>
                <p className="text-sm text-gray-600">{distanceFilter}km 이내</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-pink-600">{candidates.length}</p>
              <p className="text-sm text-gray-600">명 발견</p>
            </div>
          </div>
        </div>

        <div className="relative mb-8" style={{ height: "650px" }}>
          <Card
            className={`absolute inset-0 overflow-hidden shadow-2xl transition-all duration-300 ${swipeDirection === "right"
              ? "translate-x-[150%] rotate-12 opacity-0"
              : swipeDirection === "left"
                ? "-translate-x-[150%] -rotate-12 opacity-0"
                : ""
              }`}
          >
            {/* Pet Photo with Gradient Overlay */}
            <div className="relative h-96">
              <img
                src={currentCandidate.petPhoto || "/placeholder.svg"}
                alt={currentCandidate.petName}
                className="h-full w-full object-cover"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Match Score Badge */}
              <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2 shadow-xl">
                <Star className="h-5 w-5 fill-white text-white" />
                <span className="text-base font-bold text-white">{currentCandidate.matchScore}% 매칭</span>
              </div>

              {/* Distance Badge */}
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 shadow-xl backdrop-blur">
                <MapPin className="h-5 w-5 text-pink-500" />
                <span className="text-base font-semibold text-gray-900">{currentCandidate.distance}km</span>
              </div>

              {/* Pet Name Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h2 className="text-3xl font-bold mb-1">{currentCandidate.petName}</h2>
                <p className="text-lg opacity-90">
                  {currentCandidate.petAge}살 • {currentCandidate.petGender}
                </p>
              </div>
            </div>

            {/* Info Section */}
            <div className="space-y-5 p-6 bg-white">
              {/* Owner Info */}
              <div className="flex items-center gap-3 pb-4 border-b">
                <img
                  src={currentCandidate.userAvatar || "/placeholder.svg"}
                  alt={currentCandidate.userName}
                  className="h-12 w-12 rounded-full ring-2 ring-pink-200"
                />
                <div>
                  <p className="font-semibold text-gray-900">{currentCandidate.userName}</p>
                  <p className="text-sm text-muted-foreground">{currentCandidate.petBreed}</p>
                </div>
              </div>

              {/* Bio */}
              <p className="leading-relaxed text-gray-700 text-base">{currentCandidate.bio}</p>

              {/* Activity Level */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold text-gray-900">활동성</span>
                  <span className="text-sm font-medium text-pink-600">{currentCandidate.activityLevel}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all"
                    style={{ width: `${currentCandidate.activityLevel}%` }}
                  />
                </div>
              </div>

              {/* Common Interests */}
              <div>
                <h3 className="mb-3 font-semibold text-gray-900">공통 관심사</h3>
                <div className="flex flex-wrap gap-2">
                  {currentCandidate.commonInterests.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-full bg-gradient-to-r from-pink-100 to-rose-100 px-4 py-2 text-sm font-medium text-pink-700"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex items-center justify-center gap-8 mb-6">
          <Button
            size="lg"
            variant="outline"
            className="h-20 w-20 rounded-full border-4 border-gray-300 hover:border-gray-400 hover:bg-gray-50 hover:scale-110 transition-all shadow-lg bg-white"
            onClick={() => handleSwipe("left")}
          >
            <X className="h-10 w-10 text-gray-500" />
          </Button>
          <Button
            size="lg"
            className="h-24 w-24 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-90 hover:scale-110 transition-all shadow-2xl"
            onClick={() => handleSwipe("right")}
          >
            <Heart className="h-12 w-12 fill-white text-white" />
          </Button>
        </div>

        {/* Tips */}
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-gray-700">💡 스마트 매칭 알고리즘 작동 중</p>
          <p className="text-xs text-muted-foreground">같은 품종 우선 (50%) • 거리순 (30%) • 활동성 (20%)</p>
        </div>
      </div>

      <Dialog open={matchModalOpen} onOpenChange={setMatchModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-3xl">🎉 매칭 성공!</DialogTitle>
            <DialogDescription className="text-center text-base">
              {matchedUser?.userName}님과 매칭되었어요!
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-6">
            <div className="relative flex items-center justify-center">
              <img
                src={user?.pets?.[0]?.photo || "/placeholder.svg"}
                alt="My Pet"
                className="h-28 w-28 rounded-full object-cover ring-4 ring-pink-300 shadow-lg"
              />
              <div className="absolute bg-white rounded-full p-2 shadow-lg">
                <Heart className="h-6 w-6 fill-pink-500 text-pink-500" />
              </div>
              <img
                src={matchedUser?.petPhoto || "/placeholder.svg"}
                alt={matchedUser?.petName}
                className="h-28 w-28 rounded-full object-cover ring-4 ring-rose-300 shadow-lg"
              />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">
                {user?.pets?.[0]?.name} & {matchedUser?.petName}
              </p>
              <p className="text-sm text-muted-foreground">
                이제 {matchedUser?.userName}님과 대화를 시작하고
                <br />
                함께 산책 약속을 잡아보세요!
              </p>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 h-12 text-base font-semibold"
              onClick={() => {
                setMatchModalOpen(false)
                navigate(`/messages?user=${matchedUser?.id}`)
              }}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              메시지 보내기
            </Button>
            <Button variant="outline" className="w-full h-12 bg-transparent" onClick={() => setMatchModalOpen(false)}>
              계속 둘러보기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filter Modal */}
      <Dialog open={filterModalOpen} onOpenChange={setFilterModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>필터 설정</DialogTitle>
            <DialogDescription>원하는 조건으로 산책 메이트를 찾아보세요</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="mb-2 block text-sm font-medium">거리 범위</label>
              <Select value={distanceFilter} onValueChange={setDistanceFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">500m 이내</SelectItem>
                  <SelectItem value="1">1km 이내</SelectItem>
                  <SelectItem value="3">3km 이내</SelectItem>
                  <SelectItem value="5">5km 이내</SelectItem>
                  <SelectItem value="10">10km 이내</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500"
              onClick={() => setFilterModalOpen(false)}
            >
              적용하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
