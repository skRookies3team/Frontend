import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePetMate } from "@/features/petmate/hooks/use-petmate"
import { PetMateCandidate, petMateApi, SearchAddressResult } from "@/features/petmate/api/petmate-api"
import { SmoothScrollList } from "@/features/petmate/components/SmoothScrollList"
import { MatchingFriendsModal } from "@/features/petmate/components/MatchingFriendsModal"
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
  RefreshCw,
  X,
  Navigation,
  Search,
  Users,
} from "lucide-react"
import { useAuth } from "@/features/auth/context/auth-context"
import { useNavigate, Link } from "react-router-dom"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Badge } from "@/shared/ui/badge"
import { Input } from "@/shared/ui/input"
import { toast } from "sonner"

export default function PetMatePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // 기본 상태
  const [matchModalOpen, setMatchModalOpen] = useState(false)
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [locationModalOpen, setLocationModalOpen] = useState(false)
  const [locationSearch, setLocationSearch] = useState("")
  const [currentLocation, setCurrentLocation] = useState("서울 강남구")
  const [distanceFilter, setDistanceFilter] = useState("5")
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">("all")
  const [breedFilter, setBreedFilter] = useState("all")
  const [matchedUser, setMatchedUser] = useState<PetMateCandidate | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  // GPS 좌표 상태
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null)

  // 주소 검색 상태
  const [searchResults, setSearchResults] = useState<SearchAddressResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  // 새로고침 로딩 상태
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 위치 로딩 상태
  const [isLocationLoading, setIsLocationLoading] = useState(false)

  // 상세 모달 상태
  const [selectedCandidate, setSelectedCandidate] = useState<PetMateCandidate | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // 채팅방 ID 상태 (매칭 성공 시 사용)
  const [chatRoomIdFromMatch, setChatRoomIdFromMatch] = useState<number | null>(null)
  const [requestsModalOpen, setRequestsModalOpen] = useState(false)

  // Use the PetMate hook - 실제 API 사용
  const {
    candidates,
    toggleLike,
    isUserLiked,
    updateFilter,
    matches,
    pendingRequests,
    pendingCount,
    sentRequests,
    acceptRequest,
    rejectRequest,
    updateOnlineStatus,
    unfriend,
    cancelRequest,
  } = usePetMate({
    userId: user?.id ? Number(user.id) : 1,
    initialFilter: userCoords ? {
      latitude: userCoords.latitude,
      longitude: userCoords.longitude,
      radiusKm: Number.parseFloat(distanceFilter),
      userGender: genderFilter,
      petBreed: breedFilter,
    } : undefined
  })

  const hasNoCandidates = candidates.length === 0

  // 초기 위치 가져오기 (저장된 위치 우선, 없으면 GPS)
  useEffect(() => {
    const loadLocation = async () => {
      // 1. 먼저 DB에서 저장된 위치 확인
      if (user?.id) {
        try {
          const savedLocation = await petMateApi.getSavedLocation(Number(user.id))
          if (savedLocation && savedLocation.latitude && savedLocation.longitude) {
            setUserCoords({
              latitude: savedLocation.latitude,
              longitude: savedLocation.longitude
            })
            setCurrentLocation(savedLocation.location || '저장된 위치')
            return // 저장된 위치가 있으면 GPS 호출 안 함
          }
        } catch (error) {
          console.log('저장된 위치 없음, GPS로 대체')
        }
      }

      // 2. 저장된 위치가 없으면 GPS로 현재 위치 가져오기
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const coords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
            setUserCoords(coords)

            try {
              const addressInfo = await petMateApi.getAddressFromCoords(coords.longitude, coords.latitude)
              if (addressInfo) {
                const displayLocation = addressInfo.buildingName || addressInfo.fullAddress
                setCurrentLocation(displayLocation)
                // 위치 정보를 DB에 저장 (기본 위치로 설정)
                if (user?.id) {
                  await petMateApi.updateLocation(
                    Number(user.id),
                    coords.latitude,
                    coords.longitude,
                    displayLocation
                  )
                }
              }
            } catch (error) {
              console.error('Failed to get address:', error)
            }
          },
          (error) => {
            console.error('Geolocation error:', error)
            setUserCoords({ latitude: 37.5007, longitude: 127.0365 })
          }
        )
      }
    }

    loadLocation()
  }, [user?.id])

  // 좋아요 핸들러
  const handleLikeForCandidate = async (candidate: PetMateCandidate) => {
    const result = await toggleLike(candidate.userId)
    if (result?.action === 'matched') {
      setMatchedUser(candidate)
      // [중요] 매칭 결과에 채팅방 ID가 있으면 설정
      if (result.matchResult?.chatRoomId) {
        setChatRoomIdFromMatch(result.matchResult.chatRoomId)
      }
      setMatchModalOpen(true)
      toast.success(`${candidate.userName}님과 매칭되었어요! 🎉`)
    } else if (result?.action === 'liked') {
      toast.success(`${candidate.petName}에게 하트를 보냈어요! 💖`)
    } else if (result?.action === 'unliked') {
      toast.info('하트를 취소했어요')
    }
  }

  // 현재 위치 가져오기
  const handleCurrentLocation = () => {
    setIsLocationLoading(true)

    if (!navigator.geolocation) {
      setIsLocationLoading(false)
      toast.error('이 브라우저에서는 위치 서비스를 지원하지 않습니다.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
        setUserCoords(coords)

        try {
          const addressInfo = await petMateApi.getAddressFromCoords(coords.longitude, coords.latitude)
          if (addressInfo) {
            const displayLocation = addressInfo.buildingName || addressInfo.fullAddress
            setCurrentLocation(displayLocation)
            // 위치 정보를 DB에 저장
            if (user?.id) {
              await petMateApi.updateLocation(
                Number(user.id),
                coords.latitude,
                coords.longitude,
                displayLocation
              )
            }
            toast.success('현재 위치로 설정되었습니다')
            setLocationModalOpen(false)
          }
        } catch (error) {
          console.error('Failed to get address:', error)
          toast.error('주소를 가져오는데 실패했습니다')
        } finally {
          setIsLocationLoading(false)
        }
      },
      (error) => {
        setIsLocationLoading(false)
        console.error('Geolocation error:', error)
        toast.error('위치를 찾을 수 없습니다.')
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0
      }
    )
  }

  // 주소 검색
  const handleAddressSearch = async () => {
    if (!locationSearch.trim()) return

    setSearchLoading(true)
    try {
      const results = await petMateApi.searchAddress(locationSearch)
      setSearchResults(results)
    } catch (error) {
      console.error('Address search failed:', error)
      toast.error('주소 검색에 실패했습니다')
    } finally {
      setSearchLoading(false)
    }
  }

  // 검색 결과 선택
  const handleSelectSearchResult = async (result: SearchAddressResult) => {
    const displayLocation = result.buildingName || result.addressName
    setCurrentLocation(displayLocation)
    setUserCoords({ latitude: result.latitude, longitude: result.longitude })
    setSearchResults([])
    setLocationSearch("")
    setLocationModalOpen(false)

    // 위치 정보를 DB에 저장
    if (user?.id) {
      try {
        await petMateApi.updateLocation(
          Number(user.id),
          result.latitude,
          result.longitude,
          displayLocation
        )
      } catch (error) {
        console.error('Failed to save location:', error)
      }
    }

    toast.success('위치가 설정되었습니다')
  }

  // 새로고침 핸들러
  const handleRefresh = async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    await updateFilter({
      latitude: userCoords?.latitude,
      longitude: userCoords?.longitude,
      radiusKm: Number.parseFloat(distanceFilter),
      userGender: genderFilter,
      petBreed: breedFilter,
    })
    setTimeout(() => {
      setIsRefreshing(false)
    }, 500)
  }

  // 필터 적용
  const handleApplyFilter = async () => {
    if (userCoords) {
      await updateFilter({
        latitude: userCoords.latitude,
        longitude: userCoords.longitude,
        radiusKm: Number.parseFloat(distanceFilter),
        userGender: genderFilter,
        petBreed: breedFilter,
      })
    }
    setFilterModalOpen(false)
    toast.success('필터가 적용되었습니다')
  }

  // 매칭 상태 토글 핸들러
  const handleOnlineToggle = async () => {
    const newStatus = !isOnline
    setIsOnline(newStatus)
    await updateOnlineStatus(newStatus)
    if (newStatus) {
      toast.success('온라인 상태로 전환되었습니다')
      handleRefresh()
    } else {
      toast.info('오프라인 상태로 전환되었습니다')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 pt-8 pb-12">
      {/* 제목 */}
      <div className="text-center mb-6 px-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-orange-600 bg-clip-text text-transparent mb-3">
          펫메이트 찾기
        </h1>
        <p className="text-gray-600 text-xl">우리 동네 반려동물 친구를 만나보세요 🐾</p>
      </div>

      {/* 모바일용 사이드바 */}
      <div className="lg:hidden px-4 mb-6">
        <div className="space-y-4">
          <Card
            className={`p-4 cursor-pointer transition-all hover:shadow-lg ${isOnline
              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300"
              : "bg-white border-2 border-gray-200"
              }`}
            onClick={handleOnlineToggle}
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

          <Card
            className={`p-4 bg-white border-2 border-pink-200 cursor-pointer transition-all hover:shadow-lg hover:border-pink-400 ${isRefreshing ? 'opacity-50' : ''}`}
            onClick={handleRefresh}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-pink-500">
                <RefreshCw className={`h-5 w-5 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">다른 사용자 보기</p>
                <p className="text-xs text-gray-500">클릭하여 새로고침</p>
              </div>
            </div>
          </Card>

          <Card
            className="p-4 bg-white border-2 border-orange-200 cursor-pointer transition-all hover:shadow-lg hover:border-orange-400 relative"
            onClick={() => setRequestsModalOpen(true)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">매칭 친구</p>
                <p className="text-xs text-gray-500">클릭하여 확인</p>
              </div>
              {pendingCount > 0 && (
                <div className="absolute -top-2 -right-2 h-6 w-6 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                  {pendingCount}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* 메인 레이아웃 */}
      <div className="relative max-w-7xl mx-auto px-4">
        {/* 데스크탑 사이드바 */}
        <div className="hidden lg:block lg:absolute lg:right-[calc(50%+400px)] lg:top-0 lg:w-72">
          <div className="lg:sticky lg:top-24 space-y-4">
            <Card
              className={`p-4 cursor-pointer transition-all hover:shadow-lg ${isOnline
                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300"
                : "bg-white border-2 border-gray-200"
                }`}
              onClick={handleOnlineToggle}
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

            <Card
              className={`p-4 bg-white border-2 border-pink-200 cursor-pointer transition-all hover:shadow-lg hover:border-pink-400 ${isRefreshing ? 'opacity-50' : ''}`}
              onClick={handleRefresh}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-pink-500">
                  <RefreshCw className={`h-5 w-5 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">다른 사용자 보기</p>
                  <p className="text-xs text-gray-500">클릭하여 새로고침</p>
                </div>
              </div>
            </Card>

            <Card
              className="p-4 bg-white border-2 border-orange-200 cursor-pointer transition-all hover:shadow-lg hover:border-orange-400 relative"
              onClick={() => setRequestsModalOpen(true)}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">매칭 친구</p>
                  <p className="text-xs text-gray-500">클릭하여 확인</p>
                </div>
                {pendingCount > 0 && (
                  <div className="absolute -top-2 -right-2 h-6 w-6 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                    {pendingCount}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="w-full max-w-2xl mx-auto">
          {!isOnline ? (
            <Card className="p-12 text-center shadow-2xl border-2 border-gray-200 bg-gray-50 h-full flex flex-col items-center justify-center min-h-[600px]">
              <div className="mb-6 mx-auto w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center shadow-lg">
                <Power className="h-12 w-12 text-gray-400" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-gray-600">
                현재 오프라인 상태입니다
              </h2>
              <p className="mb-8 text-gray-500 text-lg leading-relaxed">
                새로운 펫메이트를 만나려면<br />온라인으로 상태를 변경해주세요!
              </p>
              <Button
                size="lg"
                onClick={handleOnlineToggle}
                className="h-12 px-8 text-base font-bold bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-all hover:scale-105"
              >
                <Power className="mr-2 h-5 w-5" />
                온라인으로 전환하기
              </Button>
            </Card>
          ) : hasNoCandidates ? (
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
              <Button
                size="lg"
                variant="outline"
                onClick={() => setFilterModalOpen(true)}
                className="h-12 px-6 text-base font-semibold border-2 border-pink-300"
              >
                <Settings2 className="mr-2 h-5 w-5" />
                필터 변경하기
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card className="p-4 bg-white border-2 border-pink-200 shadow-lg">
                <div className="flex items-center justify-center gap-3">
                  <Sparkles className="h-5 w-5 text-pink-500" />
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-900">AI 스마트 매칭 | {candidates.length}명 발견</p>
                  </div>
                </div>
              </Card>

              <SmoothScrollList
                candidates={candidates}
                isUserLiked={isUserLiked}
                onLike={handleLikeForCandidate}
                onSelect={(candidate) => {
                  setSelectedCandidate(candidate)
                  setIsDetailOpen(true)
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* 상세 모달 */}
      <AnimatePresence>
        {isDetailOpen && selectedCandidate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setIsDetailOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 이미지 영역 */}
              <div className="relative h-[300px]">
                <img
                  src={selectedCandidate.petPhoto || "/placeholder.svg"}
                  alt={selectedCandidate.petName}
                  className="h-full w-full object-cover rounded-t-3xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-t-3xl" />

                {/* 닫기 버튼 */}
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg"
                >
                  <X className="h-5 w-5 text-gray-700" />
                </button>

                <div className="absolute right-4 bottom-4 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 px-4 py-2 shadow-xl">
                  <Star className="h-5 w-5 fill-white text-white" />
                  <span className="text-lg font-bold text-white">{selectedCandidate.matchScore}%</span>
                </div>

                <div className="absolute left-4 bottom-4 flex items-center gap-2 rounded-2xl bg-white px-4 py-2 shadow-xl">
                  <MapPin className="h-4 w-4 text-pink-600" />
                  <span className="text-sm font-bold text-gray-900">{selectedCandidate.distance}km</span>
                </div>

                <div className="absolute left-4 bottom-16">
                  <h2 className="text-3xl font-bold text-white drop-shadow-lg">{selectedCandidate.petName}</h2>
                  <p className="text-lg text-white/90">
                    {selectedCandidate.petBreed} • {selectedCandidate.petAge}살 • {selectedCandidate.petGender}
                  </p>
                </div>
              </div>

              {/* 상세 정보 */}
              <div className="p-6 space-y-5">
                <Link
                  to={`/user/${selectedCandidate.userId}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-pink-50 hover:bg-pink-100 transition-colors"
                  onClick={() => setIsDetailOpen(false)}
                >
                  <img
                    src={selectedCandidate.userAvatar || "/placeholder.svg"}
                    alt={selectedCandidate.userName}
                    className="h-14 w-14 rounded-full ring-2 ring-pink-300 object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">{selectedCandidate.userName}</p>
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <Badge className="bg-pink-100 text-pink-700 border border-pink-200">
                      {selectedCandidate.userGender}
                    </Badge>
                  </div>
                </Link>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    {selectedCandidate.bioIcon && (
                      <img src={selectedCandidate.bioIcon} alt="" className="w-6 h-6 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="text-gray-700">{selectedCandidate.bio}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">활동성</span>
                    <span className="font-bold text-pink-600">{selectedCandidate.activityLevel}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500"
                      style={{ width: `${selectedCandidate.activityLevel}%` }}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">공통 관심사</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.commonInterests.map((interest) => (
                      <Badge
                        key={interest}
                        className="rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-700 border border-pink-200"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    className={`flex-1 h-12 rounded-xl font-semibold ${isUserLiked(selectedCandidate.userId)
                      ? "bg-pink-500 hover:bg-pink-600 text-white"
                      : "bg-pink-100 hover:bg-pink-200 text-pink-700"
                      }`}
                    onClick={() => handleLikeForCandidate(selectedCandidate)}
                  >
                    <Heart className={`mr-2 h-5 w-5 ${isUserLiked(selectedCandidate.userId) ? "fill-white" : ""}`} />
                    {isUserLiked(selectedCandidate.userId) ? "하트 취소" : "하트 보내기"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-12 rounded-xl font-semibold border-2 border-pink-300"
                    onClick={() => {
                      setIsDetailOpen(false)
                      // [수정] 채팅방 경로 /messages로 이동 (ID가 아직 없으므로 그냥 이동하거나 UserID로 조회)
                      // 여기선 단순히 채팅 페이지로 이동. 만약 방을 즉시 생성하고 싶다면 별도 API 호출 필요.
                      // 일단 목록 페이지로 이동합니다.
                      navigate(`/messages`) 
                    }}
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    채팅하기
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 매칭 성공 모달 */}
      <Dialog open={matchModalOpen} onOpenChange={setMatchModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-center text-4xl mb-2">🎉 매칭 성공!</DialogTitle>
            <DialogDescription className="text-center text-lg">
              {matchedUser?.userName}님과 매칭되었어요!
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-8 py-8">
            <div className="relative flex items-center justify-center gap-6">
              <img
                src={user?.pets?.[0]?.photo || "/placeholder.svg"}
                alt="My Pet"
                className="h-32 w-32 rounded-full object-cover ring-4 ring-pink-300 shadow-2xl"
              />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 p-4 shadow-xl">
                <Heart className="h-8 w-8 fill-white text-white" />
              </div>
              <img
                src={matchedUser?.petPhoto || "/placeholder.svg"}
                alt={matchedUser?.petName}
                className="h-32 w-32 rounded-full object-cover ring-4 ring-pink-300 shadow-2xl"
              />
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {user?.pets?.[0]?.name || "내 반려동물"} 💕 {matchedUser?.petName}
              </p>
              <p className="text-gray-600">{matchedUser?.location}</p>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setMatchModalOpen(false)
                  // [수정] 올바른 경로 (/messages?roomId=...)로 이동
                  navigate(chatRoomIdFromMatch
                    ? `/messages?roomId=${chatRoomIdFromMatch}`
                    : `/messages`) 
                }}
                className="h-14 px-8 text-lg font-bold bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                <MessageCircle className="mr-3 h-6 w-6" />
                채팅 시작하기
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setMatchModalOpen(false)
                  navigate(`/user/${matchedUser?.userId}`)
                }}
                className="h-14 px-8 text-lg font-semibold border-2"
              >
                프로필 보기
              </Button>
            </div>
          </div>
          <Button variant="ghost" onClick={() => setMatchModalOpen(false)} className="w-full">
            닫기
          </Button>
        </DialogContent>
      </Dialog>

      {/* 필터 모달 */}
      <Dialog open={filterModalOpen} onOpenChange={setFilterModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>필터 설정</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">성별</label>
              <Select value={genderFilter} onValueChange={(v: "all" | "male" | "female") => setGenderFilter(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="male">남성</SelectItem>
                  <SelectItem value="female">여성</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">품종</label>
              <Select value={breedFilter} onValueChange={setBreedFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 품종</SelectItem>
                  <SelectItem value="포메라니안">포메라니안</SelectItem>
                  <SelectItem value="골든 리트리버">골든 리트리버</SelectItem>
                  <SelectItem value="시바견">시바견</SelectItem>
                  <SelectItem value="비글">비글</SelectItem>
                  <SelectItem value="말티즈">말티즈</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">거리</label>
              <Select value={distanceFilter} onValueChange={setDistanceFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1km 이내</SelectItem>
                  <SelectItem value="3">3km 이내</SelectItem>
                  <SelectItem value="5">5km 이내</SelectItem>
                  <SelectItem value="10">10km 이내</SelectItem>
                  <SelectItem value="20">20km 이내</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleApplyFilter} className="w-full bg-pink-500 hover:bg-pink-600">
            적용하기
          </Button>
        </DialogContent>
      </Dialog>

      {/* 위치 모달 */}
      <Dialog open={locationModalOpen} onOpenChange={setLocationModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>위치 설정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Input
                placeholder="주소 검색..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
              />
              <Button onClick={handleAddressSearch} disabled={searchLoading || !locationSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {searchLoading && <p className="text-center text-gray-500">검색 중...</p>}

            {searchResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-2">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectSearchResult(result)}
                    className="w-full text-left p-3 rounded-lg hover:bg-pink-50 transition-colors"
                  >
                    <p className="font-medium text-gray-900">
                      {result.buildingName || result.addressName}
                    </p>
                    {result.buildingName && (
                      <p className="text-sm text-gray-500 mt-1">{result.addressName}</p>
                    )}
                  </button>
                ))}
              </div>
            )}

            <Button
              variant="outline"
              onClick={handleCurrentLocation}
              disabled={isLocationLoading}
              className="w-full"
            >
              <Navigation className={`mr-2 h-4 w-4 ${isLocationLoading ? 'animate-spin' : ''}`} />
              {isLocationLoading ? '위치 찾는 중...' : '현재 위치 사용'}
            </Button>
          </div>
          <Button
            onClick={() => {
              setSearchResults([])
              setLocationSearch("")
              setLocationModalOpen(false)
            }}
            className="w-full"
          >
            닫기
          </Button>
        </DialogContent>
      </Dialog>

      {/* 매칭친구(요청) 모달 */}
      <MatchingFriendsModal
        isOpen={requestsModalOpen}
        onClose={() => setRequestsModalOpen(false)}
        matches={matches}
        pendingRequests={pendingRequests}
        sentRequests={sentRequests}
        onAccept={acceptRequest}
        onReject={rejectRequest}
        onUnfriend={unfriend}
        onCancelRequest={cancelRequest}
        onMatchSuccess={(result, request) => {
          setMatchedUser({
            id: request.matchId,
            userId: request.fromUserId,
            userName: request.fromUserName,
            userAvatar: request.fromUserAvatar,
            userGender: '',
            petName: request.petName,
            petBreed: request.petBreed,
            petAge: request.petAge || 0,
            petGender: '',
            petPhoto: request.petPhoto,
            bio: '',
            activityLevel: 0,
            distance: 0,
            location: request.location || '',
            commonInterests: [],
            matchScore: 0,
            isOnline: true,
          });
          if (result.chatRoomId) {
            setChatRoomIdFromMatch(result.chatRoomId);
          }
          setRequestsModalOpen(false);
          setMatchModalOpen(true);
          toast.success(`${request.fromUserName}님과 매칭되었어요! 🎉`);
        }}
      />
    </div>
  )
}