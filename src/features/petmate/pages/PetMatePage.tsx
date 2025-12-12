import { useState, useEffect } from "react"
import { usePetMate } from "@/features/petmate/hooks/use-petmate"
import { PetMateCandidate, getAddressFromGPS, petMateApi, SearchAddressResult } from "@/features/petmate/api/petmate-api"
import { Button } from "@/shared/ui/button"
import { Card } from "@/shared/ui/card"
import {
  Heart,
  MapPin,
  Star,
  MessageCircle,
  Sparkles,
  Settings2,
  Power,
  User,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Search,
} from "lucide-react"
import { useAuth } from "@/features/auth/context/auth-context"
import { useNavigate, Link } from "react-router-dom"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Badge } from "@/shared/ui/badge"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { toast } from "sonner"


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
  const [matchedUser, setMatchedUser] = useState<PetMateCandidate | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  // GPS 좌표 상태
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null)

  // 주소 검색 상태
  const [searchResults, setSearchResults] = useState<SearchAddressResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  // Use the PetMate hook with real API (set useMockData to true for testing without backend)
  const {
    candidates: allCandidates,
    toggleLike,
    isUserLiked,
    updateFilter,
  } = usePetMate({
    userId: user?.id ? Number(user.id) : 1,
    useMockData: true,  // Using mock data for testing - set to false when backend is running
    initialFilter: userCoords ? {
      latitude: userCoords.latitude,
      longitude: userCoords.longitude,
      radiusKm: Number.parseFloat(distanceFilter),
      userGender: genderFilter,
      petBreed: breedFilter,
    } : undefined
  })

  const [chatRoomIdFromMatch, setChatRoomIdFromMatch] = useState<number | null>(null)


  // Filter candidates based on current filters (for mock data, backend handles this for real data)
  const candidates = allCandidates.filter((candidate) => {
    if (candidate.distance && candidate.distance > Number.parseFloat(distanceFilter)) return false
    if (genderFilter !== "all") {
      if (genderFilter === "male" && candidate.userGender !== "남성" && candidate.userGender !== "Male") return false
      if (genderFilter === "female" && candidate.userGender !== "여성" && candidate.userGender !== "Female") return false
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

  const handleLike = async () => {
    if (!currentCandidate) return

    const result = await toggleLike(currentCandidate.userId)

    if (result?.action === 'liked') {
      toast.success('요청을 보냈습니다!', {
        description: `${currentCandidate.userName}님에게 좋아요를 보냈습니다.`,
        duration: 3000,
      })
    } else if (result?.action === 'unliked') {
      toast.info('요청을 취소했습니다.', {
        description: `${currentCandidate.userName}님에게 보낸 좋아요가 취소되었습니다.`,
        duration: 3000,
      })
    } else if (result?.action === 'matched') {
      setMatchedUser(currentCandidate)
      setChatRoomIdFromMatch(result.matchResult?.chatRoomId || null)
      setMatchModalOpen(true)
      toast.success('🎉 매칭 성공!', {
        description: `${currentCandidate.userName}님과 매칭되었습니다! 채팅방이 생성되었습니다.`,
        duration: 5000,
      })
    }
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

  const handleCurrentLocation = async () => {
    if (navigator.geolocation) {
      try {
        // 먼저 위치 정보 가져오기
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject)
        })

        const { latitude, longitude } = position.coords
        setCurrentLocation(`위치 확인 중...`)

        // GPS 좌표 저장 및 필터 업데이트
        setUserCoords({ latitude, longitude })
        updateFilter({
          latitude,
          longitude,
          radiusKm: Number.parseFloat(distanceFilter),
          userGender: genderFilter,
          petBreed: breedFilter,
        })

        try {
          // Kakao API로 주소 변환
          const addressInfo = await getAddressFromGPS()
          const displayAddress = addressInfo.roadAddress || addressInfo.fullAddress || `${addressInfo.region1} ${addressInfo.region2} ${addressInfo.region3}`
          setCurrentLocation(displayAddress)
        } catch (apiError) {
          // API 실패 시 좌표 표시
          console.error("주소 변환 실패:", apiError)
          setCurrentLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        }

        setLocationModalOpen(false)
      } catch (error) {
        console.error("위치 정보를 가져올 수 없습니다:", error)
        alert("위치 정보를 가져올 수 없습니다. 브라우저 설정을 확인해주세요.")
      }
    } else {
      alert("이 브라우저는 위치 정보를 지원하지 않습니다.")
    }
  }

  // 주소 검색 함수
  const handleAddressSearch = async () => {
    if (!locationSearch.trim()) return

    setSearchLoading(true)
    setSearchResults([])

    try {
      const results = await petMateApi.searchAddress(locationSearch)
      setSearchResults(results)
    } catch (error) {
      console.error("주소 검색 실패:", error)
      alert("주소 검색에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setSearchLoading(false)
    }
  }

  // 검색 결과 선택 함수
  const handleSelectSearchResult = (result: SearchAddressResult) => {
    setUserCoords({ latitude: result.latitude, longitude: result.longitude })
    setCurrentLocation(result.addressName)
    updateFilter({
      latitude: result.latitude,
      longitude: result.longitude,
      radiusKm: Number.parseFloat(distanceFilter),
      userGender: genderFilter,
      petBreed: breedFilter,
    })
    setSearchResults([])
    setLocationSearch("")
    setLocationModalOpen(false)
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

  const hasNoCandidates = !currentCandidate || candidates.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 pt-24 pb-12">
      {/* 제목 - 항상 중앙 */}
      <div className="text-center mb-8 px-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-orange-600 bg-clip-text text-transparent mb-3">
          펫메이트 찾기
        </h1>
        <p className="text-gray-600 text-xl">우리 동네 반려동물 친구를 만나보세요 🐾</p>
      </div>

      {/* 사이드바 - 데스크탑: 왼쪽 고정, 모바일: 일반 흐름 */}
      <div className="lg:fixed lg:left-56 lg:top-72 lg:w-72 lg:z-10 px-4 lg:px-0 mb-6 lg:mb-0">
        <div className="space-y-4">
          {/* 매칭 상태 */}
          <Card
            className={`p-4 cursor-pointer transition-all hover:shadow-lg ${isOnline
              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300"
              : "bg-white border-2 border-gray-200"
              }`}
            onClick={() => setIsOnline(!isOnline)}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-300"}`}>
                <Power className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{isOnline ? "온라인" : "오프라인"}</p>
                <p className="text-xs text-gray-500">클릭하여 전환</p>
              </div>
              {isOnline && <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />}
            </div>
          </Card>

          {/* 위치 설정 */}
          <Card
            className="p-4 bg-white border-2 border-blue-200 cursor-pointer transition-all hover:shadow-lg hover:border-blue-400"
            onClick={() => setLocationModalOpen(true)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{currentLocation}</p>
                <p className="text-xs text-gray-500">클릭하여 변경</p>
              </div>
            </div>
          </Card>

          {/* 필터 설정 */}
          <Card
            className="p-4 bg-white border-2 border-purple-200 cursor-pointer transition-all hover:shadow-lg hover:border-purple-400"
            onClick={() => setFilterModalOpen(true)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-500">
                <Settings2 className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{distanceFilter}km 이내</p>
                <p className="text-xs text-gray-500">
                  {genderFilter === "all" ? "전체" : genderFilter === "male" ? "남성" : "여성"} • {breedFilter === "all" ? "전체 품종" : breedFilter}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 메인 콘텐츠 - 항상 페이지 중앙 */}
      <div className="flex justify-center px-4">
        <div className="w-full max-w-3xl">
          {hasNoCandidates ? (
            /* 조건에 맞는 펫메이트가 없을 때 */
            <Card className="p-12 text-center shadow-2xl border-2 border-pink-200 bg-white h-full flex flex-col items-center justify-center min-h-[600px]">
              <div className="mb-6 mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-pink-100 via-rose-100 to-orange-100 flex items-center justify-center shadow-lg">
                <Sparkles className="h-12 w-12 text-pink-500" />
              </div>
              <h2 className="mb-4 text-3xl font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-orange-600 bg-clip-text text-transparent">
                조건에 맞는 펫메이트가 없어요
              </h2>
              <p className="mb-8 text-gray-600 text-lg leading-relaxed">
                필터 조건을 조정하거나<br />잠시 후 다시 확인해보세요!
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setFilterModalOpen(true)}
                  className="h-12 px-6 text-base font-semibold border-2 border-pink-300"
                >
                  <Settings2 className="mr-2 h-5 w-5" />
                  필터 변경하기
                </Button>
              </div>
            </Card>
          ) : (
            /* 펫메이트 카드 */
            <>
              <Card className="overflow-hidden shadow-2xl border-4 border-pink-200 bg-white">
                <div className="relative h-[500px]">
                  <img
                    src={currentCandidate?.petPhoto || "/placeholder.svg"}
                    alt={currentCandidate?.petName}
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
                      {/* 매치 요청 버튼 */}
                      <Button
                        size="lg"
                        className={`h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform ${currentCandidate && isUserLiked(currentCandidate.userId)
                          ? "bg-pink-500 hover:bg-pink-600"
                          : "bg-white hover:bg-gray-100 border-2 border-pink-200"
                          }`}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleLike()
                        }}
                      >
                        <Heart
                          className={`h-7 w-7 ${currentCandidate && isUserLiked(currentCandidate.userId)
                            ? "fill-white text-white"
                            : "text-pink-500"
                            }`}
                        />
                      </Button>
                    </div>
                  </Link>

                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-5 border-2 border-pink-100">
                    <div className="flex items-start gap-3">
                      {currentCandidate.bioIcon && (
                        <img
                          src={currentCandidate.bioIcon}
                          alt=""
                          className="w-8 h-8 flex-shrink-0 mt-0.5"
                        />
                      )}
                      <p className="leading-relaxed text-gray-700 text-lg font-medium">{currentCandidate.bio}</p>
                    </div>
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
            </>
          )}
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
                  navigate(chatRoomIdFromMatch
                    ? `/messages?room=${chatRoomIdFromMatch}`
                    : `/messages?user=${matchedUser?.userId}`)
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
                // 좌표가 있으면 backend API도 업데이트
                if (userCoords) {
                  updateFilter({
                    latitude: userCoords.latitude,
                    longitude: userCoords.longitude,
                    radiusKm: Number.parseFloat(distanceFilter),
                    userGender: genderFilter,
                    petBreed: breedFilter,
                  })
                }
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
            <div className="flex gap-2">
              <Input
                placeholder="서울 강남구 역삼동"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
                className="flex-1"
              />
              <Button
                onClick={handleAddressSearch}
                disabled={searchLoading || !locationSearch.trim()}
                className="bg-gradient-to-r from-blue-500 to-cyan-500"
              >
                {searchLoading ? "검색중..." : <Search className="h-4 w-4" />}
              </Button>
            </div>

            {/* 검색 결과 목록 */}
            {searchResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    className="w-full p-3 text-left hover:bg-blue-50 transition-colors"
                    onClick={() => handleSelectSearchResult(result)}
                  >
                    <p className="text-sm font-medium text-gray-900">{result.addressName}</p>
                    {result.roadAddress && (
                      <p className="text-xs text-gray-500 mt-1">{result.roadAddress}</p>
                    )}
                  </button>
                ))}
              </div>
            )}

            <Button variant="outline" className="w-full gap-2 bg-transparent" onClick={handleCurrentLocation}>
              <Navigation className="h-4 w-4" />
              현재 내 위치로 설정하기
            </Button>

            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => {
                setSearchResults([])
                setLocationSearch("")
                setLocationModalOpen(false)
              }}
            >
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
