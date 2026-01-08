import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePetMate } from "@/features/petmate/hooks/use-petmate"
import { PetMateCandidate, petMateApi, SearchAddressResult } from "@/features/petmate/api/petmate-api"
import { PetDetailModal } from "@/features/petmate/components/PetDetailModal"
import { MatchingFriendsModal } from "@/features/petmate/components/MatchingFriendsModal"
import { Button } from "@/shared/ui/button"
import {
  Heart,
  MessageCircle,
  Search,
  MapPin,
  Filter,
  RefreshCw,
  SlidersHorizontal,
  Bell
} from "lucide-react"
import { useAuth } from "@/features/auth/context/auth-context"
import { useNavigate } from "react-router-dom"
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Input } from "@/shared/ui/input"
import { toast } from "sonner"

// Types needed for map markers
interface MapMarker extends PetMateCandidate {
  x: number;
  y: number;
  type: 'profile' | 'heart';
}

export default function PetMatePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // --- State ---
  const [matchModalOpen, setMatchModalOpen] = useState(false)
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [locationModalOpen, setLocationModalOpen] = useState(false)
  const [locationSearch, setLocationSearch] = useState("")
  const [distanceFilter, setDistanceFilter] = useState("5")
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">("all")
  const [breedFilter, setBreedFilter] = useState("all")
  const [matchedUser, setMatchedUser] = useState<PetMateCandidate | null>(null)

  // Map Component State
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([])

  // Modal State
  const [selectedCandidate, setSelectedCandidate] = useState<PetMateCandidate | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [chatRoomIdFromMatch, setChatRoomIdFromMatch] = useState<number | null>(null)
  const [requestsModalOpen, setRequestsModalOpen] = useState(false)

  // GPS & Search State
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null)
  const [currentAddress, setCurrentAddress] = useState("위치 찾는 중...")
  const [searchResults, setSearchResults] = useState<SearchAddressResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLocationLoading, setIsLocationLoading] = useState(false)


  // --- Hooks ---
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

  // --- Effects ---

  // 1. Initial Location Load
  useEffect(() => {
    const loadLocation = async () => {
      if (user?.id) {
        try {
          const savedLocation = await petMateApi.getSavedLocation(Number(user.id))
          if (savedLocation && savedLocation.latitude && savedLocation.longitude) {
            setUserCoords({
              latitude: savedLocation.latitude,
              longitude: savedLocation.longitude
            })
            setCurrentAddress(savedLocation.location || '저장된 위치')
            return
          }
        } catch (error) {
          console.log('No saved location, falling back to GPS')
        }
      }

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
                setCurrentAddress(displayLocation)
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
              console.error('Failed to get address', error)
              setCurrentAddress("이촌동")
            }
          },
          (error) => {
            console.error('GPS Error', error)
            setCurrentAddress("이촌동")
            setUserCoords({ latitude: 37.5665, longitude: 126.9780 })
          }
        )
      } else {
        setCurrentAddress("이촌동")
        setUserCoords({ latitude: 37.5665, longitude: 126.9780 })
      }
    }
    loadLocation()
  }, [user?.id])

  // 1.5 Auto-refresh candidates when userCoords is ready (Initial Load)
  useEffect(() => {
    if (userCoords) {
      updateFilter({
        latitude: userCoords.latitude,
        longitude: userCoords.longitude,
        radiusKm: Number.parseFloat(distanceFilter),
        userGender: genderFilter,
        petBreed: breedFilter,
      })
    }
  }, [userCoords?.latitude, userCoords?.longitude])


  // 2. Generate Random Map Markers
  useEffect(() => {
    if (candidates && candidates.length > 0) {
      const newMarkers = candidates.map((candidate) => ({
        ...candidate,
        x: 10 + Math.random() * 80,
        y: 15 + Math.random() * 66,
        type: Math.random() > 0.7 ? 'heart' : 'profile' as 'profile' | 'heart'
      }))
      setMapMarkers(newMarkers)
    } else {
      setMapMarkers([])
    }
  }, [candidates])


  // --- Handlers ---
  const handleMarkerClick = (candidate: PetMateCandidate) => {
    setSelectedCandidate(candidate)
    setIsDetailOpen(true)
  }

  const handleLikeForCandidate = async (candidate: PetMateCandidate) => {
    const result = await toggleLike(candidate.userId)
    if (result?.action === 'matched') {
      setMatchedUser(candidate)
      if (result.matchResult?.chatRoomId) { setChatRoomIdFromMatch(result.matchResult.chatRoomId) }
      setMatchModalOpen(true)
      toast.success(`${candidate.userName}님과 매칭되었어요! 🎉`)
    } else if (result?.action === 'liked') {
      toast.success(`${candidate.petName}에게 하트를 보냈어요! 💖`)
    } else if (result?.action === 'unliked') {
      toast.info('하트를 취소했어요')
    }
  }

  const handleRefresh = async (overrideCoords?: { latitude: number, longitude: number }) => {
    if (isRefreshing) return
    setIsRefreshing(true)

    // Use override coords if provided, otherwise current state
    const lat = overrideCoords?.latitude ?? userCoords?.latitude
    const lng = overrideCoords?.longitude ?? userCoords?.longitude

    await updateFilter({
      latitude: lat,
      longitude: lng,
      radiusKm: Number.parseFloat(distanceFilter),
      userGender: genderFilter,
      petBreed: breedFilter,
    })

    // Visual shuffle
    setMapMarkers(prev => prev.map(m => ({
      ...m,
      x: 10 + Math.random() * 80,
      y: 15 + Math.random() * 66
    })))

    setTimeout(() => {
      setIsRefreshing(false)
      toast.success("친구들을 발견했어요! 🔭")
    }, 800)
  }

  // 주소 검색
  const handleAddressSearch = async () => {
    if (!locationSearch.trim()) return
    setSearchLoading(true)
    try {
      const results = await petMateApi.searchAddress(locationSearch)
      setSearchResults(results)
    } catch { toast.error('주소 검색 실패') }
    finally { setSearchLoading(false) }
  }

  // 검색 결과 선택
  const handleSelectSearchResult = async (result: SearchAddressResult) => {
    const displayLocation = result.buildingName || result.addressName
    const newCoords = { latitude: result.latitude, longitude: result.longitude }

    setCurrentAddress(displayLocation)
    setUserCoords(newCoords)
    setSearchResults([])
    setLocationSearch("")
    setLocationModalOpen(false)
    if (user?.id) {
      await petMateApi.updateLocation(Number(user.id), result.latitude, result.longitude, displayLocation).catch(console.error)
    }
    toast.success(`'${displayLocation}' 주변을 탐색합니다`)
    handleRefresh(newCoords) // Pass new coords to avoid stale state
  }

  // 현재 위치 가져오기
  const handleCurrentLocation = () => {
    setIsLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        const coords = { latitude: p.coords.latitude, longitude: p.coords.longitude }
        setUserCoords(coords)
        try {
          const info = await petMateApi.getAddressFromCoords(coords.longitude, coords.latitude)
          if (info) {
            const displayLocation = info.buildingName || info.fullAddress
            setCurrentAddress(displayLocation)
            if (user?.id) {
              await petMateApi.updateLocation(Number(user.id), coords.latitude, coords.longitude, displayLocation)
            }
          }
        } catch {
          setCurrentAddress("현재 위치")
        } finally {
          setIsLocationLoading(false)
          setLocationModalOpen(false)
          handleRefresh(coords) // Pass new coords
        }
      },
      (err) => {
        console.error(err)
        toast.error("위치 정보를 가져올 수 없습니다")
        setIsLocationLoading(false)
      }
    )
  }

  const handleApplyFilter = async () => {
    setFilterModalOpen(false)
    handleRefresh()
  }

  return (
    <div className="min-h-screen relative font-sans bg-[#FFFBEB] overflow-hidden text-gray-800 w-screen h-screen">

      {/* --------------------------------------------------------------------------------
         1. Background V26: Village Decoration & River
      -------------------------------------------------------------------------------- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#FEF3C7] h-screen w-screen">

        {/* -- Winding River (Center) -- */}
        <svg className="absolute w-full h-full opacity-70" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M-10,48 C 20,38 40,68 60,58 S 90,38 110,48 L 110,68 C 90,58 60,78 40,68 S 20,48 -10,58 Z" fill="#E0F2FE" />
          <path d="M-10,53 C 20,43 40,73 60,63 S 90,43 110,53" stroke="#BAE6FD" strokeWidth="1" fill="none" strokeDasharray="5,5" className="animate-pulse-slow" />
        </svg>

        {/* -- Interactive Patterns -- */}
        <div className="absolute inset-0 w-full h-full mix-blend-overlay opacity-30" style={{ backgroundImage: `radial-gradient(#F59E0B 2px, transparent 2px)`, backgroundSize: '24px 24px' }} />

        {/* -- Village Elements (More Density) -- */}
        {/* North Village */}
        <div className="absolute top-[10%] left-[10%] text-6xl drop-shadow-sm filter contrast-125">🏠</div>
        <div className="absolute top-[15%] left-[25%] text-4xl drop-shadow-sm opacity-90">🌲</div>
        <div className="absolute top-[8%] right-[20%] text-5xl drop-shadow-sm grayscale-[0.2]">⛪</div>
        <div className="absolute top-[20%] right-[10%] text-4xl drop-shadow-sm opacity-80">🌳</div>

        {/* South Village */}
        <div className="absolute bottom-[15%] left-[15%] text-5xl drop-shadow-sm contrast-125">⛺</div>
        <div className="absolute bottom-[20%] left-[5%] text-4xl drop-shadow-sm opacity-90">🌲</div>
        <div className="absolute bottom-[10%] right-[15%] text-6xl drop-shadow-sm grayscale-[0.1]">🎡</div>
        <div className="absolute bottom-[25%] right-[25%] text-4xl drop-shadow-sm opacity-80">🌳</div>

        {/* -- Clouds -- */}
        <motion.div animate={{ x: [-20, 20, -20] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[5%] left-[40%] text-7xl opacity-60 blur-[1px]">☁️</motion.div>
        <motion.div animate={{ x: [20, -20, 20] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[15%] right-[30%] text-6xl opacity-50 blur-[1px]">☁️</motion.div>

        {/* -- Village Labels -- */}
        <div className="absolute top-[30%] left-[5%] bg-white/70 px-3 py-1 rounded-full backdrop-blur-md shadow-sm border border-orange-200 text-orange-600 font-extrabold text-xs -rotate-3">
          행복마을
        </div>
        <div className="absolute bottom-[32%] right-[5%] bg-white/70 px-3 py-1 rounded-full backdrop-blur-md shadow-sm border border-emerald-200 text-emerald-600 font-extrabold text-xs rotate-3">
          멍멍파크
        </div>

        {/* -- 🐕 CENTER JUMPING DOG (Simple Version) -- */}
        {mapMarkers.length > 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-col items-center justify-center">
            <motion.div
              className="text-6xl filter drop-shadow-xl"
              animate={{ y: [0, -30, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: "easeOut", repeatType: "reverse" }}
            >
              🐕
            </motion.div>
            <motion.div
              className="w-10 h-2 bg-black/10 rounded-full blur-sm mt-1"
              animate={{ scale: [1, 0.5, 1], opacity: [0.3, 0.1, 0.3] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: "easeOut", repeatType: "reverse" }}
            />
          </div>
        )}
      </div>

      {/* --------------------------------------------------------------------------------
         2. Map Markers & Empty State
      -------------------------------------------------------------------------------- */}
      <div className="absolute inset-0 z-10 overflow-hidden text-center pointer-events-none">

        {/* -- EMPTY STATE -- */}
        {mapMarkers.length === 0 && !isRefreshing && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-4xl mb-3 opacity-50">🔭</div>
            <p className="font-bold text-gray-500 bg-white/70 px-4 py-2 rounded-full text-sm">이 지역에는 메이트가 없어요</p>
          </div>
        )}

        <AnimatePresence>
          {mapMarkers.map((marker, idx) => (
            <motion.div
              key={`${marker.userId}-${idx}`}
              className="absolute cursor-pointer flex flex-col items-center justify-center transform hover:z-50 pointer-events-auto"
              style={{ top: `${marker.y}%`, left: `${marker.x}%` }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: idx * 0.05, type: "spring", stiffness: 200, damping: 15 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => handleMarkerClick(marker)}
            >
              {/* Simple Marker Design */}
              <div className="relative">
                {/* Avatar Circle */}
                <div className={`w-12 h-12 rounded-full shadow-lg bg-white border-2 ${marker.petGender === 'female' ? 'border-pink-300' : 'border-blue-300'} overflow-hidden`}>
                  <img src={marker.petPhoto || '/placeholder.svg'} alt={marker.petName} className="w-full h-full object-cover" />
                </div>

                {/* Name Tag */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-full shadow-sm text-[10px] font-bold text-gray-600 whitespace-nowrap">
                  {marker.petName}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>


      {/* --------------------------------------------------------------------------------
         3. UI Layer (Reverted to V18 Style Controls)
      -------------------------------------------------------------------------------- */}

      {/* Top Floating Layout (Reverted: Location + Rectangular Matching Button) */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 pt-6 pointer-events-none">
        <div className="max-w-md mx-auto w-full flex flex-col gap-3 pointer-events-auto">

          {/* Row 1: Location Bar */}
          <div className="flex w-full gap-2">
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 h-11 flex items-center px-4 gap-2 cursor-pointer hover:border-gray-300 transition-all"
              onClick={() => setLocationModalOpen(true)}>
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="font-bold text-gray-700 truncate text-sm flex-1">
                {currentAddress}
              </span>
            </div>
          </div>

          {/* Row 2: Matching Mate Button (V23 Heart Theme) */}
          <button
            onClick={() => setRequestsModalOpen(true)}
            className="w-full h-12 bg-rose-50 rounded-xl shadow-[0_4px_0_#FDA4AF] border-2 border-rose-200 flex items-center justify-between px-4 group hover:bg-rose-100 hover:border-rose-300 active:translate-y-[2px] active:shadow-sm transition-all relative overflow-hidden"
          >
            <div className="flex items-center gap-2 relative z-10">
              <div className="text-2xl animate-pulse">
                💘
              </div>
              <span className="font-black text-rose-500 text-base" style={{ fontFamily: '"Jua", sans-serif' }}>
                나의 매칭 메이트
              </span>
            </div>

            <div className="flex items-center gap-2 relative z-10">
              {pendingCount > 0 && (
                <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-bounce shadow-sm">
                  {pendingCount}
                </span>
              )}
              <div className="text-rose-300 group-hover:translate-x-1 transition-transform">→</div>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Floating Controls (Reverted: Separate Buttons) */}
      <div className="absolute bottom-8 left-0 right-0 z-20 px-4 pointer-events-none flex justify-center">
        <div className="flex gap-3 pointer-events-auto items-end">
          {/* Filter Button */}
          <button
            onClick={() => setFilterModalOpen(true)}
            className="w-14 h-14 bg-white rounded-2xl shadow-[0_4px_0_#CBD5E1] border-2 border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-800 hover:border-slate-300 active:translate-y-[4px] active:shadow-none transition-all"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-bold">필터</span>
          </button>

          {/* Refresh Action Button */}
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-60 h-14 bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 rounded-2xl shadow-[0_4px_0_#BE123C] text-white font-bold text-lg flex items-center justify-center gap-2 active:translate-y-[4px] active:shadow-none border-t border-white/20 transition-all"
            style={{ fontFamily: '"Jua", sans-serif' }}
          >
            <RefreshCw className={`w-5 h-5 stroke-[2.5px] ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? '찾는 중...' : '이 주변 친구 찾기'}
          </Button>
        </div>
      </div>


      {/* --- Modals --- */}
      <PetDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        candidate={selectedCandidate}
        isLiked={selectedCandidate ? isUserLiked(selectedCandidate.userId) : false}
        onLike={() => { if (selectedCandidate) handleLikeForCandidate(selectedCandidate) }}
        onChat={() => { setIsDetailOpen(false); navigate('/messages') }}
      />

      {/* Match Modal */}
      <AnimatePresence>
        {matchModalOpen && matchedUser && (
          <motion.div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-white rounded-[2rem] p-8 text-center max-w-sm w-full relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-yellow-50 to-transparent -z-10"></div>
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">매칭 성공!</h2>
              <p className="text-gray-500 mb-8 font-medium text-sm">{matchedUser.userName}님과 친구가 되었어요!</p>
              <div className="flex justify-center -space-x-4 mb-8">
                <img src={user?.pets?.[0]?.photo || "/placeholder.svg"} className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-gray-100 object-cover" />
                <img src={matchedUser.petPhoto || "/placeholder.svg"} className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-gray-100 object-cover" />
              </div>
              <div className="space-y-2">
                <Button onClick={() => { setMatchModalOpen(false); navigate(chatRoomIdFromMatch ? `/messages?roomId=${chatRoomIdFromMatch}` : `/messages`) }} className="w-full h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold">메시지 보내기</Button>
                <Button variant="ghost" onClick={() => setMatchModalOpen(false)} className="w-full text-gray-400">닫기</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={filterModalOpen} onOpenChange={setFilterModalOpen}>
        <DialogContent className="bg-white rounded-[2rem] p-6 max-w-sm"><DialogTitle>필터</DialogTitle>
          <div className="space-y-6 pt-4">
            <div><label className="text-sm font-bold text-gray-500 block mb-2">거리: {distanceFilter}km</label><input type="range" min="1" max="10" value={distanceFilter} onChange={e => setDistanceFilter(e.target.value)} className="w-full accent-orange-500" /></div>
            <div className="flex gap-2"><Button onClick={() => setGenderFilter('all')} variant={genderFilter === 'all' ? 'default' : 'outline'} className="flex-1 rounded-xl">전체</Button><Button onClick={() => setGenderFilter('male')} variant={genderFilter === 'male' ? 'default' : 'outline'} className="flex-1 rounded-xl">남아</Button><Button onClick={() => setGenderFilter('female')} variant={genderFilter === 'female' ? 'default' : 'outline'} className="flex-1 rounded-xl">여아</Button></div>
            <Button onClick={handleApplyFilter} className="w-full h-12 rounded-xl bg-slate-800 text-white font-bold">적용</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={locationModalOpen} onOpenChange={setLocationModalOpen}>
        <DialogContent className="bg-white rounded-[2rem] p-6 max-w-sm"><DialogTitle>위치 설정</DialogTitle>
          <div className="flex gap-2 mt-2"><Input value={locationSearch} onChange={e => setLocationSearch(e.target.value)} placeholder="검색..." className="h-12 rounded-xl bg-gray-50" /><Button onClick={handleAddressSearch} className="h-12 w-12 rounded-xl"><Search className="w-5 h-5" /></Button></div>
          {searchResults.length > 0 ? (
            <div className="max-h-40 overflow-y-auto mt-4 space-y-1">{searchResults.map((r, i) => <div key={i} onClick={() => handleSelectSearchResult(r)} className="p-3 bg-gray-50 rounded-xl font-bold text-sm cursor-pointer">{r.buildingName || r.addressName}</div>)}</div>
          ) : <Button variant="ghost" onClick={handleCurrentLocation} className="mt-4 w-full h-12 border-dashed border-2 text-gray-400">📍 현재 위치 사용</Button>}
        </DialogContent>
      </Dialog>

      <MatchingFriendsModal isOpen={requestsModalOpen} onClose={() => setRequestsModalOpen(false)} matches={matches} pendingRequests={pendingRequests} sentRequests={sentRequests} onAccept={acceptRequest} onReject={rejectRequest} onUnfriend={unfriend} onCancelRequest={cancelRequest} onMatchSuccess={() => { }} />
    </div >
  )
}
