import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Button } from "@/shared/ui/button"
import { useAuth } from "@/features/auth/context/auth-context"
import { getUserApi, GetPetDto, getUserCoinApi } from "@/features/auth/api/auth-api"
import {
  AlertCircle,
  MapPin,
  Clock,
  Phone,
  PlusCircle,
  ChevronLeft,
  CheckCircle2,
  Circle,
  X,
  Plus,
  ChevronRight,
  Award,
  Cat,
} from "lucide-react"
import { Link } from "react-router-dom"
import { Badge } from "@/shared/ui/badge"
import { Progress } from "@/shared/ui/progress"
import { useState, useEffect } from "react"
import { DiaryCarousel3D } from "@/features/diary/components/diary-carousel-3d"
import { EventBannerCarousel } from "@/shared/components/event-banner-carousel"
import { Input } from "@/shared/ui/input"
import { getAiDiariesApi } from "@/features/diary/api/diary-api"
import { DiaryResponse } from "@/features/diary/types/diary"

type TodoItem = {
    id: string
    text: string
    completed: boolean
}

const initialTodos: TodoItem[] = [
    { id: "1", text: "저녁 산책하기", completed: false },
    { id: "2", text: "사료 급여", completed: true },
    { id: "3", text: "약 먹이기", completed: false },
    { id: "4", text: "양치질하기", completed: false },
]

const initialMissingPets = [
    {
        id: "1",
        name: "바둑이",
        breed: "믹스견",
        age: 5,
        lastSeen: "서울시 강남구 역삼동",
        photo: "/lost-brown-dog.jpg",
        date: "2025-01-10",
        contact: "010-1234-5678",
        description: "갈색 털에 왼쪽 귀에 흰 점이 있습니다",
    },
    {
        id: "2",
        name: "초코",
        breed: "푸들",
        age: 3,
        lastSeen: "서울시 송파구 잠실동",
        photo: "/lost-poodle-dog.jpg",
        date: "2025-01-09",
        contact: "010-9876-5432",
        description: "검은색 푸들, 목에 빨간 리본 착용",
    },
    {
        id: "3",
        name: "해피",
        breed: "시바견",
        age: 4,
        lastSeen: "서울시 마포구 합정동",
        photo: "/lost-shiba-dog.jpg",
        date: "2025-01-08",
        contact: "010-5555-1234",
        description: "갈색 시바견, 매우 겁이 많습니다",
    },
]



export default function DashboardPage() {
    const { user } = useAuth()
    const [missingPets, setMissingPets] = useState(initialMissingPets)
    const [currentPage, setCurrentPage] = useState(0)
    const [isMissingPetsExpanded, setIsMissingPetsExpanded] = useState(true)
    const [todos, setTodos] = useState<TodoItem[]>(initialTodos)
    const [newTodoText, setNewTodoText] = useState("")
    const [isAddingTodo, setIsAddingTodo] = useState(false)
    const [aiDiaries, setAiDiaries] = useState<DiaryResponse[]>([])
    const [isDiariesLoading, setIsDiariesLoading] = useState(true)
    const [myPets, setMyPets] = useState<GetPetDto[]>([])
    const [petCoin, setPetCoin] = useState<number>(0)
    const petsPerPage = 4

    useEffect(() => {
        const storedPets = localStorage.getItem("missingPets")
        if (storedPets) {
            const parsed = JSON.parse(storedPets)
            setMissingPets([...initialMissingPets, ...parsed])
        }

        const storedTodos = localStorage.getItem("petTodos")
        if (storedTodos) {
            setTodos(JSON.parse(storedTodos))
        }
    }, [])

    useEffect(() => {
        localStorage.setItem("petTodos", JSON.stringify(todos))
    }, [todos])

    // AI 다이어리 보관함 데이터 페칭
    useEffect(() => {
        const fetchAiDiaries = async () => {
            if (!user?.id) return
            setIsDiariesLoading(true)
            try {
                const data = await getAiDiariesApi(Number(user.id))
                console.log('[Dashboard] AI 다이어리 데이터:', data)
                // 최근 13개만 저장 (3D 캐러셀 오버랩 방지)
                setAiDiaries(data.slice(0, 11))
            } catch (error) {
                console.error('[Dashboard] AI 다이어리 조회 실패:', error)
                setAiDiaries([]) // 실패 시 빈 배열
            } finally {
                setIsDiariesLoading(false)
            }
        }
        fetchAiDiaries()
    }, [user?.id])

    // 내 펫 정보 가져오기
    useEffect(() => {
        const fetchMyPets = async () => {
            if (!user?.id) return
            try {
                const userData = await getUserApi(Number(user.id))
                setMyPets(userData.pets)
            } catch (error) {
                console.error("Failed to fetch user pets:", error)
            }
        }
        fetchMyPets()
    }, [user?.id])

    // 펫 코인 가져오기
    useEffect(() => {
        const fetchPetCoin = async () => {
            if (!user?.id) return
            try {
                const coinData = await getUserCoinApi(Number(user.id))
                setPetCoin(coinData.petCoin)
            } catch (error) {
                console.error("Failed to fetch pet coin:", error)
            }
        }
        fetchPetCoin()
    }, [user?.id])

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-pink-50/50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">로딩 중...</p>
                </div>
            </div>
        )
    }

    const totalPages = Math.ceil(missingPets.length / petsPerPage)
    const displayedPets = missingPets.slice(currentPage * petsPerPage, (currentPage + 1) * petsPerPage)

    const handlePrevPage = () => {
        setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1))
    }

    const handleNextPage = () => {
        setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0))
    }

    const hasPets = myPets && myPets.length > 0



    const toggleTodo = (id: string) => {
        setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
    }

    const addTodo = () => {
        if (newTodoText.trim()) {
            const newTodo: TodoItem = {
                id: Date.now().toString(),
                text: newTodoText.trim(),
                completed: false,
            }
            setTodos([...todos, newTodo])
            setNewTodoText("")
            setIsAddingTodo(false)
        }
    }

    const deleteTodo = (id: string) => {
        setTodos(todos.filter((todo) => todo.id !== id))
    }

    const completedCount = todos.filter((t) => t.completed).length

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50/50 to-white">
            <div className="container mx-auto px-4 py-6 lg:py-8">
                <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                    <aside className="hidden lg:block space-y-6">
                        <Card className="border-pink-200 bg-gradient-to-br from-pink-50/50 to-white">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-lg text-pink-700">
                                        <CheckCircle2 className="h-5 w-5" />
                                        오늘의 할 일
                                    </CardTitle>
                                    <Badge variant="secondary" className="text-xs">
                                        {completedCount}/{todos.length}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                    {todos.map((todo) => (
                                        <div
                                            key={todo.id}
                                            className="group flex items-center gap-2 p-2 rounded-lg border border-pink-100 bg-white hover:border-pink-200 transition-all"
                                        >
                                            <button onClick={() => toggleTodo(todo.id)} className="flex-shrink-0 transition-colors">
                                                {todo.completed ? (
                                                    <CheckCircle2 className="h-5 w-5 text-pink-600" />
                                                ) : (
                                                    <Circle className="h-5 w-5 text-gray-300 hover:text-pink-400" />
                                                )}
                                            </button>
                                            <span
                                                className={`flex-1 text-sm ${todo.completed ? "line-through text-muted-foreground" : "text-foreground"
                                                    }`}
                                            >
                                                {todo.text}
                                            </span>
                                            <button
                                                onClick={() => deleteTodo(todo.id)}
                                                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-4 w-4 text-gray-400 hover:text-rose-500" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {isAddingTodo ? (
                                    <div className="flex items-center gap-2 p-2 rounded-lg border border-pink-200 bg-pink-50">
                                        <Input
                                            value={newTodoText}
                                            onChange={(e) => setNewTodoText(e.target.value)}
                                            onKeyPress={(e) => e.key === "Enter" && addTodo()}
                                            placeholder="할 일 입력..."
                                            className="flex-1 h-8 text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                                            autoFocus
                                        />
                                        <Button size="sm" onClick={addTodo} className="h-7 px-2 bg-gradient-to-r from-pink-500 to-rose-500">
                                            추가
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                setIsAddingTodo(false)
                                                setNewTodoText("")
                                            }}
                                            className="h-7 px-2"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsAddingTodo(true)}
                                        className="w-full bg-white hover:bg-pink-50 border-pink-200 text-pink-700"
                                    >
                                        <Plus className="h-4 w-4 mr-1" />할 일 추가
                                    </Button>
                                )}

                                <div className="pt-2 border-t border-pink-100">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                        <span>진행률</span>
                                        <span className="font-medium text-pink-600">
                                            {todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={todos.length > 0 ? (completedCount / todos.length) * 100 : 0}
                                        className="h-2 bg-pink-100"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-rose-200 bg-rose-50/50">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-lg text-rose-700">
                                        <AlertCircle className="h-5 w-5" />
                                        실종견 찾기
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Link to="/missing-pet/register">
                                            <Button
                                                size="sm"
                                                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 h-8 text-xs"
                                            >
                                                <PlusCircle className="h-3 w-3 mr-1" />
                                                등록
                                            </Button>
                                        </Link>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0"
                                            onClick={() => setIsMissingPetsExpanded(!isMissingPetsExpanded)}
                                        >
                                            <ChevronRight
                                                className={`h-4 w-4 transition-transform duration-200 ${isMissingPetsExpanded ? "rotate-90" : ""
                                                    }`}
                                            />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            {isMissingPetsExpanded && (
                                <CardContent className="space-y-4">
                                    {displayedPets.map((pet) => (
                                        <div
                                            key={pet.id}
                                            className="rounded-xl border border-rose-200 bg-white p-3 shadow-sm transition-all hover:shadow-md cursor-pointer"
                                        >
                                            <div className="mb-2 flex items-start gap-3">
                                                <img
                                                    src={pet.photo || "/placeholder.svg"}
                                                    alt={pet.name}
                                                    className="h-16 w-16 rounded-lg object-cover"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-sm text-foreground truncate">{pet.name}</h4>
                                                    <p className="text-xs text-muted-foreground">
                                                        {pet.breed} · {String(pet.age).includes('개월') ? pet.age : `${pet.age}세`}
                                                    </p>
                                                    <Badge variant="destructive" className="mt-1 text-xs">
                                                        실종
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="space-y-1 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3 flex-shrink-0" />
                                                    <span className="truncate">{pet.lastSeen}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3 flex-shrink-0" />
                                                    <span>{pet.date}</span>
                                                </div>
                                            </div>
                                            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{pet.description}</p>
                                            <div className="mt-2 flex items-center gap-1 text-xs font-medium text-primary">
                                                <Phone className="h-3 w-3" />
                                                {pet.contact}
                                            </div>
                                        </div>
                                    ))}

                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-between pt-2">
                                            <Button variant="ghost" size="sm" onClick={handlePrevPage} className="h-8 w-8 p-0">
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <span className="text-xs text-muted-foreground">
                                                {currentPage + 1} / {totalPages}
                                            </span>
                                            <Button variant="ghost" size="sm" onClick={handleNextPage} className="h-8 w-8 p-0">
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            )}
                        </Card>
                    </aside>

                    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                        <main className="space-y-6">
                            {/* AI 다이어리 3D 캐러셀 */}
                            <DiaryCarousel3D diaries={aiDiaries} isLoading={isDiariesLoading} />

              <EventBannerCarousel />
            </main>

                        <aside className="hidden lg:block space-y-6">
                            {hasPets ? (
                                <Card className="border-pink-200 bg-gradient-to-br from-pink-50/50 to-white">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center gap-2 text-lg text-pink-700">
                                            <Cat className="h-5 w-5" />
                                            나의 반려동물
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {myPets.map((pet) => (
                                            <div
                                                key={pet.petId}
                                                className="flex items-center justify-between rounded-xl border border-pink-100 bg-white p-4 transition-all hover:shadow-md hover:border-pink-200"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={pet.profileImage || "/placeholder.svg"}
                                                        alt={pet.petName}
                                                        className="h-16 w-16 rounded-full object-cover"
                                                    />
                                                    <div>
                                                        <h3 className="font-semibold text-foreground">{pet.petName}</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {pet.breed} · {(() => {
                                                                if (pet.birth) {
                                                                    const today = new Date()
                                                                    const [year, month, day] = pet.birth.split('-').map(Number)
                                                                    const birthDate = new Date(year, month - 1, day)
                                                                    let months = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth())
                                                                    if (today.getDate() < birthDate.getDate()) {
                                                                        months--
                                                                    }
                                                                    if (months < 12) {
                                                                        return `${Math.max(0, months)}개월`
                                                                    }
                                                                }
                                                                return !pet.age && pet.age !== 0 ? '나이 미등록' : `${pet.age}세`
                                                            })()} · {pet.genderType === 'FEMALE' ? '여아' : '남아'}
                                                        </p>
                                                        {pet.birth && <p className="text-xs text-muted-foreground mt-1">생일: {pet.birth}</p>}
                                                    </div>
                                                </div>
                                                <Link to={`/profile/pet/${pet.petId}?returnTo=/dashboard`}>
                                                    <Button variant="outline" size="sm">
                                                        프로필
                                                    </Button>
                                                </Link>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="border-pink-200">
                                    <CardContent className="py-12 text-center">
                                        <div className="mx-auto w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-4">
                                            <PlusCircle className="h-8 w-8 text-pink-600" />
                                        </div>
                                        <h3 className="font-semibold text-lg mb-2">반려동물을 등록해주세요</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            반려동물 정보를 등록하면 더 많은 기능을 사용할 수 있어요
                                        </p>
                                        <Link to="/pet-info?returnTo=/dashboard">
                                            <Button className="bg-gradient-to-r from-pink-600 to-rose-600">
                                                <PlusCircle className="h-4 w-4 mr-2" />
                                                지금 등록하기
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            )}

                            <Card className="border-fuchsia-200 bg-gradient-to-br from-fuchsia-50/50 to-white">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Award className="h-5 w-5 text-fuchsia-600" />
                                        펫코인
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-fuchsia-600 mb-1">{petCoin.toLocaleString()}</div>
                                        <p className="text-xs text-muted-foreground">사용 가능한 코인</p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                                            <span>다음 등급까지</span>
                                            <span className="font-medium">{Math.max(0, 500 - petCoin)} 코인</span>
                                        </div>
                                        <Progress value={Math.min(100, (petCoin / 500) * 100)} className="h-2" />
                                    </div>
                                    <div className="space-y-2 pt-2 border-t">
                                        <h4 className="text-sm font-medium">코인 적립 방법</h4>
                                        <div className="space-y-1 text-xs text-muted-foreground">
                                            <div className="flex items-center justify-between">
                                                <span>• AI 일기 작성</span>
                                                <span className="text-fuchsia-600 font-medium">+15</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span>• 피드 공유</span>
                                                <span className="text-fuchsia-600 font-medium">+10</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Link to="/shop">
                                        <Button variant="outline" className="w-full bg-transparent" size="sm">
                                            쇼핑몰에서 사용하기
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </aside>
                    </div>
                </div>
            </div>


        </div>
    )
}
