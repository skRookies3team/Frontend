import { useState } from "react"
import { Link } from "react-router-dom"
import { TabNavigation } from "@/components/tab-navigation"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Sparkles, TrendingUp, Heart, MessageCircle } from "lucide-react"

// Mock data for AI recommendations
const RECOMMENDATIONS = [
    {
        id: 1,
        image: "/golden-retriever-playing-park.jpg",
        category: "건강 팁",
        title: "강아지 여름 건강 관리법",
        likes: 1240,
        comments: 89,
        size: "large",
    },
    {
        id: 2,
        image: "/cat-in-box.jpg",
        category: "재미있는 순간",
        title: "고양이가 좋아하는 박스 놀이",
        likes: 856,
        comments: 45,
        size: "medium",
    },
    {
        id: 3,
        image: "/pomeranian.jpg",
        category: "미용 & 스타일",
        title: "포메라니안 곰돌이 컷",
        likes: 2103,
        comments: 156,
        size: "medium",
    },
    {
        id: 4,
        image: "/corgi.jpg",
        category: "훈련 가이드",
        title: "코기 기본 훈련 5가지",
        likes: 674,
        comments: 34,
        size: "small",
    },
    {
        id: 5,
        image: "/dog-running-grass.jpg",
        category: "운동 & 활동",
        title: "반려견과 함께하는 야외 활동",
        likes: 945,
        comments: 67,
        size: "large",
    },
    {
        id: 6,
        image: "/tabby-cat-sunbeam.png",
        category: "일상 케어",
        title: "고양이 스트레스 해소법",
        likes: 1567,
        comments: 123,
        size: "medium",
    },
    {
        id: 7,
        image: "/golden-retriever.png",
        category: "영양 & 식단",
        title: "강아지 영양 균형 맞추기",
        likes: 823,
        comments: 56,
        size: "small",
    },
    {
        id: 8,
        image: "/diverse-woman-avatar.png",
        category: "반려생활",
        title: "반려동물과 함께하는 일상",
        likes: 1891,
        comments: 201,
        size: "medium",
    },
    {
        id: 9,
        image: "/golden-retriever-playing-park.jpg",
        category: "여행 & 외출",
        title: "반려견 동반 여행 필수품",
        likes: 1234,
        comments: 98,
        size: "large",
    },
]

const CATEGORY_COLORS: Record<string, string> = {
    "건강 팁": "bg-gradient-to-br from-emerald-300 to-green-400",
    "재미있는 순간": "bg-gradient-to-br from-amber-300 to-yellow-400",
    "미용 & 스타일": "bg-gradient-to-br from-pink-300 to-rose-400",
    "훈련 가이드": "bg-gradient-to-br from-blue-300 to-cyan-400",
    "운동 & 활동": "bg-gradient-to-br from-purple-300 to-pink-400",
    "일상 케어": "bg-gradient-to-br from-rose-300 to-pink-400",
    "영양 & 식단": "bg-gradient-to-br from-green-300 to-emerald-400",
    "반려생활": "bg-gradient-to-br from-indigo-300 to-purple-400",
    "여행 & 외출": "bg-gradient-to-br from-cyan-300 to-blue-400",
}

export default function AIRecommendPage() {
    const [hoveredCard, setHoveredCard] = useState<number | null>(null)

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-40 border-0 bg-white/80 backdrop-blur-md shadow-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Link to="/feed" className="text-muted-foreground hover:text-foreground">
                            <ChevronLeft className="h-6 w-6" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-pink-500" />
                            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">AI 추천</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="gap-1 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 border-0">
                            <TrendingUp className="h-3 w-3" />
                            인기 콘텐츠
                        </Badge>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-2 py-4 md:px-4">
                {/* Masonry Grid */}
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 md:gap-3">
                    {RECOMMENDATIONS.map((item) => {
                        const isHovered = hoveredCard === item.id
                        const categoryColor = CATEGORY_COLORS[item.category] || "bg-gray-500"

                        // Different heights for masonry effect
                        const heightClass = {
                            small: "aspect-square",
                            medium: "aspect-[3/4]",
                            large: "aspect-[9/16]",
                        }[item.size]

                        return (
                            <Link
                                key={item.id}
                                to={`/feed/post/${item.id}`}
                                className={`group relative overflow-hidden rounded-2xl ${heightClass} cursor-pointer transition-all hover:scale-[1.05] hover:shadow-xl`}
                                onMouseEnter={() => setHoveredCard(item.id)}
                                onMouseLeave={() => setHoveredCard(null)}
                            >
                                {/* Image */}
                                <img
                                    src={item.image || "/placeholder.svg"}
                                    alt={item.title}
                                    className="h-full w-full object-cover"
                                />

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />

                                {/* Category Badge */}
                                <div className="absolute left-2 top-2">
                                    <Badge className={`${categoryColor} border-0 text-xs text-white shadow-lg font-bold rounded-full`}>
                                        {item.category}
                                    </Badge>
                                </div>

                                {/* Title and Stats */}
                                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                    <h3 className="mb-2 text-sm font-bold leading-tight md:text-base">
                                        {item.title}
                                    </h3>

                                    {/* Stats */}
                                    <div className={`flex items-center gap-3 text-xs transition-opacity ${isHovered ? 'opacity-100' : 'opacity-100 md:opacity-0'} md:group-hover:opacity-100`}>
                                        <div className="flex items-center gap-1">
                                            <Heart className="h-3.5 w-3.5" />
                                            <span>{item.likes.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MessageCircle className="h-3.5 w-3.5" />
                                            <span>{item.comments}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Hover Effect */}
                                <div className={`absolute inset-0 border-3 border-pink-400 opacity-0 transition-opacity ${isHovered ? 'opacity-100' : ''} pointer-events-none rounded-2xl shadow-lg shadow-pink-400/50`} />
                            </Link>
                        )
                    })}
                </div>

                {/* Load More */}
                <div className="mt-8 flex justify-center">
                    <button className="rounded-full bg-gradient-to-r from-pink-100 to-purple-100 px-8 py-3 text-sm font-bold text-pink-600 transition-all hover:scale-110 hover:shadow-lg">
                        더 많은 추천 보기
                    </button>
                </div>
            </main>

            <TabNavigation />
        </div>
    )
}
