import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Heart,
  MapPin,
  Star,
  MessageCircle,
  Sparkles,
  Settings2,
  Power,
  Users,
  TrendingUp,
  User,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Search,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useNavigate, Link } from "react-router-dom"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PetMate {
  id: string
  userName: string
  userAvatar: string
  userGender: "남성" | "여성"
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
  isOnline: boolean
}

export default function PetMatePage() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [matchModalOpen, setMatchModalOpen] = useState(false)
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [locationModalOpen, setLocationModalOpen] = useState(false)
  const [locationSearch, setLocationSearch] = useState("")
  const [currentLocation, setCurrentLocation] = useState("서울 강남구")
  const [distanceFilter, setDistanceFilter] = useState("3")
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">("all")
  const [breedFilter, setBreedFilter] = useState("all")
  const [matchedUser, setMatchedUser] = useState<PetMate | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  const [stats] = useState({
    totalMatches: 12,
    thisWeek: 3,
    successRate: 85,
  })

  const [allCandidates] = useState<PetMate[]>([
    {
      id: "1",
      userName: "포메사랑",
      userAvatar: "/woman-profile.png",
      userGender: "여성",
      petName: "뭉치",
      petBreed: "포메라니안",
      petAge: 3,
      petGender: "남아",
      petPhoto: "/cute-pomeranian.png",
      distance: 0.68,
      bio: "매일 저녁 7시에 한강공원에서 산책해요! 같은 포메 친구 찾아요 🐾",
      activityLevel: 85,
      commonInterests: ["한강 산책", "소형견 모임", "미용 정보"],
      matchScore: 95,
      isOnline: true,
    },
    {
      id: "2",
      userName: "골댕이집사",
      userAvatar: "/man-profile.png",
      userGender: "남성",
      petName: "해피",
      petBreed: "골든 리트리버",
      petAge: 2,
      petGender: "여아",
      petPhoto: "/happy-golden-retriever.png",
      distance: 1.2,
      bio: "활발한 골댕이와 함께 공원 러닝 즐겨요! 대형견 친구 환영합니다 🏃‍♂️",
      activityLevel: 95,
      commonInterests: ["러닝", "프리스비", "수영"],
      matchScore: 88,
      isOnline: true,
    },
    {
      id: "3",
      userName: "닥스훈트맘",
      userAvatar: "/diverse-woman-smiling.png",
      userGender: "여성",
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
      isOnline: false,
    },
    {
      id: "4",
      userName: "시바견주인",
      userAvatar: "/casual-man.png",
      userGender: "남성",
      petName: "코코",
      petBreed: "시바견",
      petAge: 4,
      petGender: "여아",
      petPhoto: "/shiba-inu.png",
      distance: 2.1,
      bio: "산책 좋아하는 시바견이에요. 평일 저녁 함께 산책하실 분!",
      activityLevel: 75,
      commonInterests: ["산책", "간식", "놀이터"],
      matchScore: 78,
      isOnline: true,
    },
    {
      id: "5",
      userName: "비글사랑",
      userAvatar: "/woman-with-stylish-glasses.png",
      userGender: "여성",
      petName: "바니",
      petBreed: "비글",
      petAge: 3,
      petGender: "여아",
      petPhoto: "/beagle-puppy.png",
      distance: 1.5,
      bio: "에너지 넘치는 비글이에요! 주말 공원 런 같이 하실 분 찾아요 🏃‍♀️",
      activityLevel: 90,
      commonInterests: ["달리기", "공놀이", "간식 탐험"],
      matchScore: 91,
      isOnline: true,
    },
    {
      id: "6",
      userName: "말티즈엄마",
      userAvatar: "/woman-friendly.jpg",
      userGender: "여성",
      petName: "뽀미",
      petBreed: "말티즈",
      petAge: 2,
      petGender: "여아",
      petPhoto: "/white-maltese-dog.jpg",
      distance: 0.5,
      bio: "조용하고 착한 말티즈예요. 카페 투어 좋아하는 분 환영해요 ☕",
      activityLevel: 50,
      commonInterests: ["카페", "미용", "사진"],
      matchScore: 87,
      isOnline: true,
    },
  ])

  const candidates = allCandidates.filter((candidate) => {
    if (candidate.distance > Number.parseFloat(distanceFilter)) return false
    if (genderFilter !== "all") {
      if (genderFilter === "male" && candidate.userGender !== "남성") return false
      if (genderFilter === "female" && candidate.userGender !== "여성") return false
    }
    if (breedFilter !== "all" && candidate.petBreed !== breedFilter) return false
    return true
  })

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      navigate("/login")
      return
    }
  }, [user, isLoading, navigate])

  const currentCandidate = candidates[currentIndex]

  const handleLike = () => {
    const isMatch = Math.random() > 0.5
    if (isMatch) {
      setMatchedUser(currentCandidate)
      setMatchModalOpen(true)
    }

    setTimeout(() => {
      if (currentIndex < candidates.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        setCurrentIndex(0)
      }
    }, 300)
  }

  const handleNext = () => {
    if (currentIndex < candidates.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setCurrentIndex(0)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    } else {
      setCurrentIndex(candidates.length - 1)
    }
  }

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCurrentLocation(`위도: ${latitude.toFixed(2)}, 경도: ${longitude.toFixed(2)}`)
          setLocationModalOpen(false)
        },
        (error) => {
          console.error("위치 정보를 가져올 수 없습니다:", error)
          alert("위치 정보를 가져올 수 없습니다. 브라우저 설정을 확인해주세요.")
        },
      )
    } else {
      alert("이 브라우저는 위치 정보를 지원하지 않습니다.")
    }
  }

  if (isLoading) {
    return null
  }

  if (!user) {
    return null
  }

  if (!isOnline) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 pt-24 pb-12">
        <div className="container mx-auto max-w-2xl px-4">
          <Card className="p-12 text-center shadow-2xl border-2 border-pink-200 bg-white">
            <div className="mb-6 mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-pink-100 via-rose-100 to-orange-100 flex items-center justify-center shadow-lg">
              <Power className="h-16 w-16 text-pink-500" />
            </div>
            <h2 className="mb-4 text-4xl font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-orange-600 bg-clip-text text-transparent">
              매칭을 시작하세요
            </h2>
            <p className="mb-10 text-gray-600 text-lg leading-relaxed">
              온라인 상태로 전환하여
              <br />
              주변 펫메이트를 찾아보세요!
            </p>
            <Button
              size="lg"
              onClick={() => setIsOnline(true)}
              className="bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 hover:opacity-90 h-16 px-10 text-lg font-bold shadow-xl hover:shadow-2xl transition-all"
            >
              <Power className="mr-2 h-6 w-6" />
              온라인으로 전환하기
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  if (!currentCandidate || candidates.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 pt-24 pb-12">
        <div className="container mx-auto max-w-2xl px-4">
          <Card className="p-12 text-center shadow-2xl border-2 border-pink-200 bg-white">
            <div className="mb-6 mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-pink-100 via-rose-100 to-orange-100 flex items-center justify-center shadow-lg">
              <Sparkles className="h-16 w-16 text-pink-500" />
            </div>
            <h2 className="mb-4 text-4xl font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-orange-600 bg-clip-text text-transparent">
              조건에 맞는 펫메이트가 없어요
            </h2>
            <p className="mb-10 text-gray-600 text-lg leading-relaxed">
              필터 조건을 조정하거나
              <br />
              잠시 후 다시 확인해보세요!
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                variant="outline"
                onClick={() => setFilterModalOpen(true)}
                className="h-14 px-8 text-base font-semibold border-2 border-pink-300"
              >
                <Settings2 className="mr-2 h-5 w-5" />
                필터 변경하기
              </Button>
              <Button
                size="lg"
                onClick={() => setCurrentIndex(0)}
                className="bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 h-14 px-8 text-base font-semibold shadow-lg"
              >
                처음부터 다시 보기
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 pt-24 pb-12">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-orange-600 bg-clip-text text-transparent mb-3">
            펫메이트 찾기
          </h1>
          <p className="text-gray-600 text-xl">우리 동네 반려동물 친구를 만나보세요 🐾</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 왼쪽 사이드바 */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="p-6 bg-white border-2 border-pink-200 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 p-3 shadow-md">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">위치 설정</h3>
              </div>
              <div className="mb-3 p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                <p className="text-sm font-medium text-gray-700">{currentLocation}</p>
              </div>
              <Button
                variant="outline"
                className="w-full border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-50 bg-transparent"
                onClick={() => setLocationModalOpen(true)}
              >
                <Search className="mr-2 h-4 w-4" />
                위치 변경하기
              </Button>
            </Card>

            <Card className="p-6 bg-white border-2 border-pink-200 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-full bg-gradient-to-br from-pink-100 to-rose-100 p-3 shadow-md">
                  <TrendingUp className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">매칭 통계</h3>
              </div>
              <div className="space-y-5">
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 font-medium">총 매칭 수</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                      {stats.totalMatches}
                    </span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-xl p-4 border border-rose-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 font-medium">이번 주</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
                      {stats.thisWeek}
                    </span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600 font-medium">성공률</span>
                    <span className="text-xl font-bold text-green-600">{stats.successRate}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-inner"
                      style={{ width: `${stats.successRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white border-2 border-pink-200 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-full bg-gradient-to-br from-orange-100 to-rose-100 p-3 shadow-md">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">발견한 펫메이트</h3>
                  <p className="text-sm text-gray-500">{distanceFilter}km 이내</p>
                </div>
              </div>
              <div className="text-center py-4 bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl border border-orange-100">
                <p className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                  {candidates.length}
                </p>
              </div>
            </Card>
          </div>

          {/* 중앙 메인 카드 */}
          <div className="lg:col-span-6">
            <Card className="overflow-hidden shadow-2xl border-4 border-pink-200 bg-white">
              <div className="relative h-[500px]">
                <img
                  src={currentCandidate.petPhoto || "/placeholder.svg"}
                  alt={currentCandidate.petName}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* 네비게이션 버튼 */}
                <Button
                  size="lg"
                  variant="ghost"
                  className="absolute left-6 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/95 hover:bg-white shadow-2xl backdrop-blur-sm"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-7 w-7 text-gray-900" />
                </Button>

                <Button
                  size="lg"
                  variant="ghost"
                  className="absolute right-6 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/95 hover:bg-white shadow-2xl backdrop-blur-sm"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-7 w-7 text-gray-900" />
                </Button>

                {/* 좋아요 버튼 */}
                <Button
                  size="lg"
                  className="absolute bottom-8 right-8 h-20 w-20 rounded-full bg-white hover:bg-white/90 shadow-2xl hover:scale-110 transition-transform"
                  onClick={handleLike}
                >
                  <Heart className="h-10 w-10 text-pink-500" />
                </Button>

                {/* 매칭 점수 */}
                <div className="absolute right-6 top-6 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 px-6 py-4 shadow-2xl border-2 border-white/40">
                  <Star className="h-7 w-7 fill-white text-white" />
                  <span className="text-xl font-bold text-white">{currentCandidate.matchScore}%</span>
                </div>

                {/* 거리 */}
                <div className="absolute left-6 top-6 flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-2xl border-2 border-pink-200">
                  <MapPin className="h-6 w-6 text-pink-600" />
                  <span className="text-lg font-bold text-gray-900">{currentCandidate.distance}km</span>
                </div>

                {/* 온라인 상태 */}
                {currentCandidate.isOnline && (
                  <div className="absolute left-6 top-24 flex items-center gap-2 rounded-full bg-green-500 px-5 py-3 shadow-xl border-2 border-white">
                    <div className="h-3 w-3 rounded-full bg-white animate-pulse" />
                    <span className="text-sm font-bold text-white">온라인</span>
                  </div>
                )}

                {/* 펫 정보 */}
                <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
                  <h2 className="text-5xl font-bold mb-3 drop-shadow-2xl">{currentCandidate.petName}</h2>
                  <p className="text-2xl opacity-95 drop-shadow-lg">
                    {currentCandidate.petBreed} • {currentCandidate.petAge}살 • {currentCandidate.petGender}
                  </p>
                </div>
              </div>

              {/* 상세 정보 */}
              <div className="space-y-6 p-8 bg-gradient-to-b from-white to-pink-50/30">
                <Link
                  to={`/user/${currentCandidate.id}`}
                  className="block hover:bg-pink-50 -m-2 p-4 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-5 pb-6 border-b-2 border-pink-100">
                    <img
                      src={currentCandidate.userAvatar || "/placeholder.svg"}
                      alt={currentCandidate.userName}
                      className="h-20 w-20 rounded-full ring-4 ring-pink-300 object-cover shadow-xl"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-bold text-gray-900 text-xl">{currentCandidate.userName}</p>
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <Badge className="bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 border-2 border-pink-200 px-3 py-1">
                        {currentCandidate.userGender}
                      </Badge>
                    </div>
                  </div>
                </Link>

                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-5 border-2 border-pink-100">
                  <p className="leading-relaxed text-gray-700 text-lg font-medium">{currentCandidate.bio}</p>
                </div>

                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-lg">활동성</span>
                    <span className="text-lg font-bold text-pink-600">{currentCandidate.activityLevel}%</span>
                  </div>
                  <div className="h-5 overflow-hidden rounded-full bg-gray-200 shadow-inner">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 transition-all shadow-lg"
                      style={{ width: `${currentCandidate.activityLevel}%` }}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 font-bold text-gray-900 text-lg">공통 관심사</h3>
                  <div className="flex flex-wrap gap-3">
                    {currentCandidate.commonInterests.map((interest) => (
                      <Badge
                        key={interest}
                        className="rounded-full bg-gradient-to-r from-pink-100 via-rose-100 to-orange-100 px-6 py-3 text-base font-semibold text-pink-700 border-2 border-pink-200 hover:border-pink-300 shadow-md hover:shadow-lg transition-all"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* 인디케이터 */}
            <div className="flex items-center justify-center gap-3 mt-6">
              {candidates.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-3 rounded-full transition-all shadow-md ${index === currentIndex
                    ? "w-12 bg-gradient-to-r from-pink-500 to-rose-500"
                    : "w-3 bg-gray-300 hover:bg-gray-400"
                    }`}
                />
              ))}
            </div>

            {/* AI 매칭 정보 */}
            <Card className="mt-6 p-6 bg-white border-2 border-pink-200 shadow-lg">
              <div className="flex items-center justify-center gap-3">
                <Sparkles className="h-6 w-6 text-pink-500" />
                <div className="text-center">
                  <p className="text-base font-bold text-gray-900 mb-1">AI 스마트 매칭 알고리즘</p>
                  <p className="text-sm text-gray-600">같은 품종 우선 50% • 거리 30% • 활동성 20% 기준으로 매칭</p>
                </div>
              </div>
            </Card>
          </div>

          {/* 오른쪽 사이드바 */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="p-6 bg-white border-2 border-pink-200 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-full bg-gradient-to-br from-green-100 to-emerald-100 p-3 shadow-md">
                  <Power className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">매칭 상태</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">매칭 활성화</span>
                  <Button
                    size="sm"
                    variant={isOnline ? "default" : "outline"}
                    onClick={() => setIsOnline(!isOnline)}
                    className={
                      isOnline
                        ? "bg-gradient-to-r from-green-500 to-emerald-500"
                        : "border-2 border-gray-300 bg-transparent"
                    }
                  >
                    {isOnline ? "ON" : "OFF"}
                  </Button>
                </div>
                {isOnline && (
                  <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-green-700">온라인 상태</span>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-white border-2 border-pink-200 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-full bg-gradient-to-br from-purple-100 to-pink-100 p-3 shadow-md">
                  <Settings2 className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">필터 설정</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">거리 범위</Label>
                  <p className="text-2xl font-bold text-purple-600 mb-2">{distanceFilter}km</p>
                  <div className="text-sm text-gray-600">
                    성별: {genderFilter === "all" ? "전체" : genderFilter === "male" ? "남성" : "여성"}
                    <br />
                    품종: {breedFilter === "all" ? "전체" : breedFilter}
                  </div>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                  onClick={() => setFilterModalOpen(true)}
                >
                  <Settings2 className="mr-2 h-4 w-4" />
                  필터 변경하기
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-white border-2 border-pink-200 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 p-3 shadow-md">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">매칭 팁</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <p className="leading-relaxed">💡 프로필을 자주 업데이트하면 더 많은 매칭 기회가 생겨요</p>
                <p className="leading-relaxed">🌟 공통 관심사가 많을수록 매칭 확률이 높아져요</p>
                <p className="leading-relaxed">🐾 활동성이 비슷한 펫메이트를 추천해드려요</p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* 매칭 성공 모달 */}
      <Dialog open={matchModalOpen} onOpenChange={setMatchModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white"> {/* bg-white 추가 */}
          <DialogHeader>
            <DialogTitle className="text-center text-4xl mb-2">🎉 매칭 성공!</DialogTitle>
            <DialogDescription className="text-center text-lg">
              {matchedUser?.userName}님과 매칭되었어요!
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-8 py-8">
            <div className="relative flex items-center justify-center gap-6">
              <img
                src={user?.pets?.[0]?.photo || "/placeholder.svg?height=120&width=120&query=cute+pet"}
                alt="My Pet"
                className="h-32 w-32 rounded-full object-cover ring-4 ring-pink-300 shadow-2xl"
              />
              <div className="absolute bg-white rounded-full p-4 shadow-2xl">
                <Heart className="h-8 w-8 fill-pink-500 text-pink-500" />
              </div>
              <img
                src={matchedUser?.petPhoto || "/placeholder.svg?height=120&width=120&query=cute+pet"}
                alt={matchedUser?.petName}
                className="h-32 w-32 rounded-full object-cover ring-4 ring-rose-300 shadow-2xl"
              />
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold mb-3">
                {user?.pets?.[0]?.name} & {matchedUser?.petName}
              </p>
              <p className="text-base text-gray-600 leading-relaxed">
                이제 {matchedUser?.userName}님과 대화를 시작하고
                <br />
                함께 산책 약속을 잡아보세요!
              </p>
            </div>
            <div className="w-full space-y-3">
              <Button
                className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 h-16 text-lg font-bold shadow-xl hover:shadow-2xl transition-all"
                onClick={() => {
                  setMatchModalOpen(false)
                  navigate(`/messages?user=${matchedUser?.id}`)
                }}
              >
                <MessageCircle className="mr-3 h-6 w-6" />
                메시지 보내기
              </Button>
              <Button
                variant="outline"
                className="w-full h-14 border-2 border-pink-300 text-base font-semibold bg-transparent"
                onClick={() => {
                  setMatchModalOpen(false)
                  navigate(`/user/${matchedUser?.id}`)
                }}
              >
                <User className="mr-2 h-5 w-5" />
                프로필 보기
              </Button>
              <Button variant="ghost" className="w-full h-12 text-gray-600" onClick={() => setMatchModalOpen(false)}>
                계속 둘러보기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 필터 설정 모달 */}
      <Dialog open={filterModalOpen} onOpenChange={setFilterModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white"> {/* bg-white 추가 */}
          <DialogHeader>
            <DialogTitle className="text-3xl mb-2">필터 설정</DialogTitle>
            <DialogDescription className="text-base">원하는 조건으로 펫메이트를 찾아보세요</DialogDescription>
          </DialogHeader>
          <div className="space-y-8 py-6">
            <div>
              <Label className="mb-4 block text-lg font-bold">보호자 성별</Label>
              <Select value={genderFilter} onValueChange={(value: any) => setGenderFilter(value)}>
                <SelectTrigger className="h-14 text-base border-2 border-pink-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="male">남성</SelectItem>
                  <SelectItem value="female">여성</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-4 block text-lg font-bold">품종</Label>
              <Select value={breedFilter} onValueChange={(value: any) => setBreedFilter(value)}>
                <SelectTrigger className="h-14 text-base border-2 border-pink-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="포메라니안">포메라니안</SelectItem>
                  <SelectItem value="골든 리트리버">골든 리트리버</SelectItem>
                  <SelectItem value="닥스훈트">닥스훈트</SelectItem>
                  <SelectItem value="시바견">시바견</SelectItem>
                  <SelectItem value="비글">비글</SelectItem>
                  <SelectItem value="말티즈">말티즈</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-4 block text-lg font-bold">거리 범위</Label>
              <Select value={distanceFilter} onValueChange={(value: any) => setDistanceFilter(value)}>
                <SelectTrigger className="h-14 text-base border-2 border-pink-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="0.5">500m 이내</SelectItem>
                  <SelectItem value="1">1km 이내</SelectItem>
                  <SelectItem value="3">3km 이내</SelectItem>
                  <SelectItem value="5">5km 이내</SelectItem>
                  <SelectItem value="10">10km 이내</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 h-16 text-lg font-bold shadow-xl hover:shadow-2xl transition-all"
              onClick={() => {
                setFilterModalOpen(false)
                setCurrentIndex(0)
              }}
            >
              적용하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={locationModalOpen} onOpenChange={setLocationModalOpen}>
        <DialogContent className="sm:max-w-md bg-white"> {/* bg-white 추가 */}
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              위치 설정
            </DialogTitle>
            <DialogDescription>매칭할 지역을 설정해주세요</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                placeholder="서울 중구 세종대로 110"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="outline" className="w-full gap-2 bg-transparent" onClick={handleCurrentLocation}>
              <Navigation className="h-4 w-4" />
              현재 내 위치로 설정하기
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setLocationModalOpen(false)}>
                취소
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500"
                onClick={() => {
                  if (locationSearch) {
                    setCurrentLocation(locationSearch)
                  }
                  setLocationModalOpen(false)
                }}
              >
                확인
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
