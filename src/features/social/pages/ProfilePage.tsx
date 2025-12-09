import { TabNavigation } from "@/shared/components/tab-navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Button } from "@/shared/ui/button"
import { Card, CardContent } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { Badge } from "@/shared/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/ui/dialog"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import {
  PawPrint,
  Heart,
  Settings,
  ChevronRight,
  Edit,
  MessageCircle,
  X,
  Download,
  Share2,
  ImageIcon,
  BookOpen,
  Sparkles,
  ChevronLeft,
  CalendarIcon,
  Plus,
  LogOut,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { useAuth } from "@/features/auth/context/auth-context"
import { AI_DIARIES } from "@/features/healthcare/data/pet-data"
import { RECAPS, Recap } from "@/features/diary/data/recap-data"
import { RecapModal } from "@/features/diary/components/recap-modal"
import { Link, useNavigate, Outlet } from "react-router-dom"
import { useState, useRef, type ChangeEvent, useEffect } from "react"



const ALL_PHOTOS = [
  {
    id: "1",
    url: "/golden-retriever-playing-park.jpg",
    category: "산책",
    date: "2024.01.15",
    likes: 124,
    comments: 18,
  },
  {
    id: "2",
    url: "/dog-running-grass.jpg",
    category: "놀이",
    date: "2024.01.14",
    likes: 98,
    comments: 12,
  },
  {
    id: "3",
    url: "/cat-in-box.jpg",
    category: "일상",
    date: "2024.01.13",
    likes: 145,
    comments: 24,
  },
  {
    id: "4",
    url: "/tabby-cat-sunbeam.png",
    category: "휴식",
    date: "2024.01.12",
    likes: 167,
    comments: 31,
  },
  {
    id: "5",
    url: "/corgi.jpg",
    category: "훈련",
    date: "2024.01.11",
    likes: 89,
    comments: 15,
  },
  {
    id: "6",
    url: "/golden-retriever.png",
    category: "식사",
    date: "2024.01.10",
    likes: 112,
    comments: 19,
  },
]



export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout, updateUser, addPet, updatePet, deletePet } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  useEffect(() => {
    if (selectedPhoto) {
      console.log("Selected photo:", selectedPhoto)
    }
  }, [selectedPhoto])

  const [selectedCategory] = useState("전체")
  const [selectedRecap, setSelectedRecap] = useState<Recap | null>(null)

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDiary, setSelectedDiary] = useState<(typeof AI_DIARIES)[0] | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [dialogDate, setDialogDate] = useState<string>("")

  // Pet Management State
  // Pet Management State
  // const [pets, setPets] = useState<Pet[]>(MY_PETS) // Removed local state
  const pets = user?.pets || []
  const [showAddPetDialog, setShowAddPetDialog] = useState(false)
  const [showManagePetsDialog, setShowManagePetsDialog] = useState(false)
  const [editingPetId, setEditingPetId] = useState<string | null>(null)

  // Edit Profile State
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false)
  const [editName, setEditName] = useState("")
  const [editBio, setEditBio] = useState("")
  const [editAvatar, setEditAvatar] = useState<string | null>(null)

  // Initialize edit state when dialog opens
  const handleOpenEditProfile = () => {
    setEditName(user?.name || "")
    setEditBio(user?.bio || "")
    setEditAvatar(user?.avatar || null)
    setShowEditProfileDialog(true)
  }

  const handleUpdateProfile = () => {
    updateUser({
      name: editName,
      bio: editBio,
      ...(editAvatar && { avatar: editAvatar })
    })
    setShowEditProfileDialog(false)
  }

  // New Pet Form State
  const [newPetName, setNewPetName] = useState("")
  const [newPetBreed, setNewPetBreed] = useState("")
  const [newPetAge, setNewPetAge] = useState("")
  const [newPetGender] = useState("남아")

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSavePet = () => {
    if (!newPetName || !newPetBreed) return

    if (editingPetId) {
      updatePet(editingPetId, {
        name: newPetName,
        breed: newPetBreed,
        age: parseInt(newPetAge) || 0,
      })
    } else {
      const newPet = {
        id: Date.now().toString(),
        name: newPetName,
        species: "강아지", // Default value
        breed: newPetBreed,
        age: parseInt(newPetAge) || 0,
        gender: newPetGender as "남아" | "여아",
        photo: "/placeholder.svg",
        neutered: false, // Default value
        birthday: new Date().toISOString().split('T')[0],
        personality: "활발함", // Default value
        healthStatus: {
          lastCheckup: "-",
          vaccination: "미접종",
          weight: "정상"
        },
        stats: {
          walks: 0,
          friends: 0,
          photos: 0
        }
      }
      addPet(newPet)
    }

    setShowAddPetDialog(false)
    setEditingPetId(null)
    setNewPetName("")
    setNewPetBreed("")
    setNewPetAge("")
  }

  const handleEditPet = (pet: any) => {
    setEditingPetId(pet.id)
    setNewPetName(pet.name)
    setNewPetBreed(pet.breed)
    setNewPetAge(pet.age.toString())
    setShowManagePetsDialog(false)
    setShowAddPetDialog(true)
  }

  const handleDeletePet = (id: string) => {
    deletePet(id)
  }

  const filteredPhotos =
    selectedCategory === "전체" ? ALL_PHOTOS : ALL_PHOTOS.filter((photo) => photo.category === selectedCategory)

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    return { firstDay, daysInMonth, year, month }
  }

  const { firstDay, daysInMonth, year, month } = getDaysInMonth(currentMonth)

  const getDiaryForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return AI_DIARIES.find((diary) => diary.date === dateStr)
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const handleDateClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const diary = getDiaryForDate(day)
    if (diary) {
      setSelectedDiary(diary)
    } else {
      setDialogDate(dateStr)
      setShowCreateDialog(true)
    }
  }

  const handleCreateDiary = () => {
    navigate(`/ai-studio/diary?date=${dialogDate}`)
    setShowCreateDialog(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-5xl pb-20 md:pb-8 md:px-6 md:py-6">
        <div className="space-y-6 p-4 md:p-0">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-border md:h-32 md:w-32">
                    <AvatarImage src={user?.avatar || "/placeholder-user.jpg"} alt={user?.name || "User"} />
                    <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <button
                    className="absolute -bottom-2 -right-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 p-2 text-white shadow-md hover:opacity-90"
                    onClick={handleOpenEditProfile}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="mb-4 flex items-center justify-center gap-3 md:justify-between">
                    <h2 className="text-2xl font-bold text-foreground md:text-3xl">{user?.name || "김서연"}</h2>
                    <div className="flex gap-2">
                      <Link to="/settings">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 hover:bg-red-50 "
                        >
                          <Settings className="h-3.5 w-3.5" />
                          {/* 설정 */}
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={logout}
                        className="h-8 text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="mr-1 h-4 w-4" />
                        {/* 로그아웃 */}
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">@{user?.email?.split('@')[0] || "sarahkim"}</p>
                  {user?.bio && (
                    <p className="mt-2 text-sm text-foreground">{user.bio}</p>
                  )}

                  <div className="flex justify-center gap-8 md:justify-start mt-4">
                    <div>
                      <p className="text-xl font-bold text-foreground md:text-2xl">1</p>
                      <p className="text-sm text-muted-foreground">게시물</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-foreground md:text-2xl">9548M</p>
                      <p className="text-sm text-muted-foreground">팔로워</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-foreground md:text-2xl">1</p>
                      <p className="text-sm text-muted-foreground">팔로잉</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* My Pets */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">마이 펫</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => setShowManagePetsDialog(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2">
                {pets.map((pet) => (
                  <Link key={pet.id} to={`/profile/pet/${pet.id}`} className="flex flex-col items-center gap-2 min-w-[80px]">
                    <div className="relative">
                      <Avatar className={cn(
                        "h-16 w-16 border-2 border-primary/20 transition-transform hover:scale-105",
                        pet.isMemorial && "grayscale opacity-70"
                      )}>
                        <AvatarImage src={pet.photo} alt={pet.name} />
                        <AvatarFallback>{pet.name[0]}</AvatarFallback>
                      </Avatar>
                      <Badge className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary p-0 text-[10px] text-white">
                        <PawPrint className="h-3 w-3" />
                      </Badge>
                    </div>
                    <span className="text-sm font-medium">{pet.name}</span>
                  </Link>
                ))}

                <button
                  className="flex flex-col items-center gap-2 min-w-[80px]"
                  onClick={() => {
                    setEditingPetId(null)
                    setNewPetName("")
                    setNewPetBreed("")
                    setNewPetAge("")
                    setShowAddPetDialog(true)
                  }}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted/30 transition-colors hover:bg-muted/50">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">추가</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Menu Items */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-0 shadow-md transition-all hover:shadow-lg">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Heart className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">좋아요한 글</p>
                  <p className="text-xs text-muted-foreground">128개</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md transition-all hover:shadow-lg">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">내 댓글</p>
                  <p className="text-xs text-muted-foreground">45개</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="calendar" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="calendar"
                className="rounded-none border-b-2 border-transparent px-2 py-3 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <CalendarIcon className="mr-1 h-4 w-4" />
                AI 다이어리
              </TabsTrigger>
              <TabsTrigger
                value="recap"
                className="rounded-none border-b-2 border-transparent px-2 py-3 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <BookOpen className="mr-1 h-4 w-4" />
                AI 리캡
              </TabsTrigger>
              <TabsTrigger
                value="gallery"
                className="rounded-none border-b-2 border-transparent px-2 py-3 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <ImageIcon className="mr-1 h-4 w-4" />
                사진 보관함
              </TabsTrigger>
            </TabsList>

            {/* AI 다이어리 캘린더 탭 */}
            <TabsContent value="calendar" className="mt-6">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-4 md:p-6">
                  {/* 캘린더 헤더 */}
                  <div className="mb-6 flex items-center justify-between">
                    <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="rounded-full">
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h3 className="text-lg font-bold text-foreground">
                      {year}년 {month + 1}월
                    </h3>
                    <Button variant="ghost" size="icon" onClick={handleNextMonth} className="rounded-full">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* 요일 헤더 */}
                  <div className="mb-2 grid grid-cols-7 gap-1">
                    {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                      <div key={day} className="py-2 text-center text-sm font-semibold text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* 캘린더 그리드 */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* 빈 칸 */}
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {/* 날짜 */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1
                      let diary = getDiaryForDate(day)

                      // Added example diary for Nov 20, 2025
                      if (year === 2025 && month === 10 && day === 20) {
                        diary = {
                          id: "example-diary",
                          date: "2025-11-20",
                          image: "/golden-retriever-playing-park.jpg",
                          title: "행복한 하루",
                          content: "오늘은 초코와 함께 공원에서 즐거운 시간을 보냈어요.",
                          weather: "맑음",
                          mood: "행복",
                        }
                      }

                      const isToday =
                        new Date().getDate() === day &&
                        new Date().getMonth() === month &&
                        new Date().getFullYear() === year

                      return (
                        <button
                          key={day}
                          onClick={() => handleDateClick(day)}
                          className={cn(
                            "relative aspect-square overflow-hidden rounded-lg border-2 p-1 transition-all hover:scale-105",
                            isToday
                              ? "border-primary bg-primary/10 font-bold"
                              : diary
                                ? "border-primary/50 bg-primary/5"
                                : "border-muted hover:border-primary/30 hover:bg-muted"
                          )}
                        >
                          {diary && (
                            <div
                              className="absolute inset-0 bg-cover bg-center transition-transform hover:scale-110"
                              style={{ backgroundImage: `url(${diary.image})` }}
                            >
                              <div className="absolute inset-0 bg-black/20" />
                            </div>
                          )}
                          <div className="relative z-10 flex h-full flex-col items-center justify-center">
                            <span className={cn(
                              "text-sm",
                              diary && "font-bold text-white drop-shadow-md"
                            )}>{day}</span>
                            {diary && (
                              <Badge className="mt-1 flex h-4 items-center gap-0.5 rounded-full bg-primary/80 backdrop-blur-sm px-1 text-[8px] text-white shadow-sm">
                                <Sparkles className="h-2.5 w-2.5" />
                              </Badge>
                            )}
                          </div>
                          {isToday && (
                            <Sparkles className="absolute right-1 top-1 h-3 w-3 text-primary z-20" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI 리캡 탭 */}
            <TabsContent value="recap" className="mt-6">
              <Link to="/ai-studio/recap">
                <Button
                  variant="outline"
                  className="group mb-6 w-full border-primary bg-white text-primary transition-all duration-300 hover:bg-primary/5"
                >
                  <span className="flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                    AI 리캡 스튜디오로 이동
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </Button>
              </Link>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {RECAPS.map((recap) => (
                  <Card
                    key={recap.id}
                    className="group cursor-pointer overflow-hidden border-0 shadow-md transition-all hover:scale-105 hover:shadow-xl"
                    onClick={() => setSelectedRecap(recap)}
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={recap.coverImage}
                        alt={recap.period}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/10" />
                      <Badge className="absolute right-2 top-2 bg-black/50 text-white backdrop-blur-sm">
                        {recap.year}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="mb-1 text-lg font-bold">{recap.period} 리캡</h3>
                      <p className="text-sm text-muted-foreground">
                        {recap.totalMoments}개의 소중한 순간들
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* 사진 보관함 탭 */}
            <TabsContent value="gallery" className="mt-6">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary">
                    전체 <Badge className="ml-1.5 bg-muted text-muted-foreground">{ALL_PHOTOS.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="post" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary">
                    내 게시물
                  </TabsTrigger>
                  <TabsTrigger value="diary" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary">
                    다이어리 <Badge className="ml-1.5 bg-muted text-muted-foreground">{AI_DIARIES.length}</Badge>
                  </TabsTrigger>
                </TabsList>

                {/* 전체 탭 */}
                <TabsContent value="all">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {ALL_PHOTOS.map((photo) => (
                      <div
                        key={photo.id}
                        className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg"
                        onClick={() => setSelectedPhoto(photo.url)}
                      >
                        <img
                          src={photo.url}
                          alt={`Photo ${photo.id}`}
                          className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="absolute bottom-2 left-2 right-2 text-white">
                            <div className="flex items-center justify-between text-xs">
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {photo.likes}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {photo.comments}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge className="absolute right-1 top-1 text-[10px]">{photo.category}</Badge>
                        <span className="absolute bottom-1 left-1 text-[10px] font-semibold text-white drop-shadow-md">
                          {photo.date}
                        </span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* 내 게시물 탭 */}
                <TabsContent value="post">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {filteredPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg"
                        onClick={() => setSelectedPhoto(photo.url)}
                      >
                        <img
                          src={photo.url}
                          alt={`Photo ${photo.id}`}
                          className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="absolute bottom-2 left-2 right-2 text-white">
                            <div className="flex items-center justify-between text-xs">
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {photo.likes}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {photo.comments}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* 다이어리 탭 */}
                <TabsContent value="diary">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {AI_DIARIES.map((diary) => (
                      <div
                        key={diary.id}
                        className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg"
                        onClick={() => setSelectedDiary(diary)}
                      >
                        <img
                          src={diary.image}
                          alt={diary.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="absolute bottom-2 left-2 right-2 text-white">
                            <h3 className="text-sm font-bold truncate">{diary.title}</h3>
                            <p className="text-xs opacity-90">{diary.date}</p>
                          </div>
                        </div>
                        <Badge className="absolute right-1 top-1 flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-[10px] text-white px-1.5 py-0.5">
                          <Sparkles className="h-2 w-2" />
                          AI
                        </Badge>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>
      </main >

      {/* Edit Profile Dialog */}
      < Dialog open={showEditProfileDialog} onOpenChange={setShowEditProfileDialog} >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>프로필 수정</DialogTitle>
            <DialogDescription>
              프로필 정보를 수정하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-2 border-border">
                  <AvatarImage src={editAvatar || user?.avatar || "/placeholder-user.jpg"} alt={editName || "User"} />
                  <AvatarFallback>{editName?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <button
                  className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5 text-white shadow-sm hover:opacity-90"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-3 w-3" />
                </button>
              </div>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                사진 변경
              </Button>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                이름
              </Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-bio" className="text-right">
                소개
              </Label>
              <Input
                id="edit-bio"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="col-span-3"
                placeholder="자기소개를 입력하세요"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateProfile}>저장하기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      {/* Add/Edit Pet Dialog */}
      < Dialog open={showAddPetDialog} onOpenChange={setShowAddPetDialog} >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPetId ? "반려동물 정보 수정" : "반려동물 추가"}</DialogTitle>
            <DialogDescription>
              {editingPetId ? "반려동물 정보를 수정합니다." : "새로운 반려동물 정보를 입력해주세요."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">이름</Label>
              <Input id="name" value={newPetName} onChange={(e) => setNewPetName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="breed" className="text-right">품종</Label>
              <Input id="breed" value={newPetBreed} onChange={(e) => setNewPetBreed(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="age" className="text-right">나이</Label>
              <Input id="age" value={newPetAge} onChange={(e) => setNewPetAge(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSavePet}>{editingPetId ? "수정하기" : "추가하기"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      {/* Manage Pets Dialog */}
      < Dialog open={showManagePetsDialog} onOpenChange={setShowManagePetsDialog} >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>반려동물 관리</DialogTitle>
            <DialogDescription>등록된 반려동물을 관리합니다.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {pets.map(pet => (
              <div key={pet.id} className="flex items-center justify-between py-2">
                <span>{pet.name}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditPet(pet)}>수정</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeletePet(pet.id)}>삭제</Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog >

      {/* Diary Modal */}
      {
        selectedDiary && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm p-4"
            onClick={() => setSelectedDiary(null)}
          >
            <div
              className="relative w-full max-w-2xl overflow-hidden rounded-lg bg-background shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 text-gray-700 hover:bg-white"
                onClick={() => setSelectedDiary(null)}
              >
                <X className="h-5 w-5" />
              </button>
              <div className="relative h-64 overflow-hidden">
                <img src={selectedDiary.image} alt={selectedDiary.title} className="h-full w-full object-cover" />
                <Badge className="absolute left-4 top-4 flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <Sparkles className="h-3 w-3" />
                  AI 다이어리
                </Badge>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                  <h2 className="mb-2 text-2xl font-bold">{selectedDiary.title}</h2>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {selectedDiary.weather}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {selectedDiary.mood}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="mb-6 text-muted-foreground leading-relaxed">{selectedDiary.content}</p>
                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    다운로드
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="mr-2 h-4 w-4" />
                    공유하기
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Recap Modal */}
      {
        selectedRecap && (
          <RecapModal recap={selectedRecap} onClose={() => setSelectedRecap(null)} />
        )
      }

      {/* Create Diary Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>AI 다이어리 생성</DialogTitle>
            <DialogDescription>이 날짜에 새로운 AI 다이어리를 생성하시겠습니까?</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Button variant="outline" className="w-full" onClick={() => setShowCreateDialog(false)}>
              취소
            </Button>
            <Button className="mt-2 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white" onClick={handleCreateDiary}>
              <Sparkles className="mr-2 h-4 w-4" />
              다이어리 생성하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Outlet />
      <TabNavigation />
    </div >
  )
}