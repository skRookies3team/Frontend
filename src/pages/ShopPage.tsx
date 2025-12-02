import { useState } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { TabNavigation } from "@/components/tab-navigation"
import { ProductCard } from "@/components/shop/product-card"
import { CategoryFilter } from "@/components/shop/category-filter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingCart, ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from "@/components/shop/cart-context"

const CATEGORIES = [
  { id: "all", label: "전체" },
  { id: "toys", label: "장난감" },
  { id: "food", label: "사료/간식" },
  { id: "accessories", label: "용품" },
  { id: "health", label: "건강" },
]

const SHOP_BANNERS = [
  {
    id: 1,
    title: "신학기 특가",
    subtitle: "반려동물 필수템 최대 40% 할인",
    description: "프리미엄 사료부터 장난감까지",
    image: "/golden-retriever-playing-park.jpg",
    gradient: "from-blue-400/70 to-cyan-400/50",
    badge: "오늘출발",
    badgeColor: "bg-white text-blue-600"
  },
  {
    id: 2,
    title: "봄맞이 건강 케어",
    subtitle: "사랑하는 반려동물의 건강을 위해",
    description: "덴탈케어 & 영양제 특가전",
    image: "/tabby-cat-sunbeam.png",
    gradient: "from-emerald-400/70 to-teal-400/50",
    badge: "건강",
    badgeColor: "bg-white text-emerald-600"
  },
  {
    id: 3,
    title: "펫 패션 위크",
    subtitle: "스타일리시한 외출 아이템",
    description: "목줄, 옷, 캐리어 신상품 입고",
    image: "/dog-collar-leash.jpg",
    gradient: "from-violet-400/70 to-purple-400/50",
    badge: "신상품",
    badgeColor: "bg-white text-violet-600"
  },
  {
    id: 4,
    title: "플레이 타임",
    subtitle: "우리 아이 즐거운 놀이 시간",
    description: "인터랙티브 장난감 컬렉션",
    image: "/dog-puzzle-toy.jpg",
    gradient: "from-rose-400/70 to-pink-400/50",
    badge: "베스트",
    badgeColor: "bg-white text-rose-600"
  }
]

const PRODUCTS = [
  {
    id: "1",
    name: "프리미엄 강아지 사료 - 닭고기와 쌀",
    price: 45000,
    mileagePrice: 450,
    rating: 4.8,
    reviews: 1234,
    image: "/dog-food-bag.jpg",
    category: "food",
    isFavorite: false,
  },
  {
    id: "2",
    name: "인터랙티브 퍼즐 장난감",
    price: 28000,
    mileagePrice: 280,
    rating: 4.6,
    reviews: 892,
    image: "/dog-puzzle-toy.jpg",
    category: "toys",
    isFavorite: true,
  },
  {
    id: "3",
    name: "편안한 펫 침대 - 라지",
    price: 65000,
    mileagePrice: 650,
    rating: 4.9,
    reviews: 2156,
    image: "/cozy-dog-bed.png",
    category: "accessories",
    isFavorite: false,
  },
  {
    id: "4",
    name: "덴탈 케어 츄 (30개입)",
    price: 32000,
    mileagePrice: 320,
    rating: 4.7,
    reviews: 1567,
    image: "/dog-dental-chews.png",
    category: "health",
    isFavorite: false,
  },
  {
    id: "5",
    name: "페치 볼 세트 (3개)",
    price: 18000,
    mileagePrice: 180,
    rating: 4.5,
    reviews: 643,
    image: "/dog-ball-toys.jpg",
    category: "toys",
    isFavorite: false,
  },
  {
    id: "6",
    name: "스타일리시 목줄 & 리드줄 세트",
    price: 35000,
    mileagePrice: 350,
    rating: 4.8,
    reviews: 987,
    image: "/dog-collar-leash.jpg",
    category: "accessories",
    isFavorite: true,
  },
]

export default function ShopPage() {
  const location = useLocation()
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentBanner, setCurrentBanner] = useState(0)
  const { cartCount } = useCart()

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory = activeCategory === "all" || product.category === activeCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % SHOP_BANNERS.length)
  }

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + SHOP_BANNERS.length) % SHOP_BANNERS.length)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white pb-20 md:pb-0">
      {location.pathname === "/shop" ? (
        <>
          {/* Hero Section */}
          <div className="relative h-[300px] md:h-[400px] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBanner}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <div className="absolute inset-0">
                  <img
                    src={SHOP_BANNERS[currentBanner].image || "/placeholder.svg"}
                    alt={SHOP_BANNERS[currentBanner].title}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-r ${SHOP_BANNERS[currentBanner].gradient}`} />
                </div>
                <div className="relative container mx-auto max-w-6xl h-full flex items-center px-4">
                  <div className="text-white max-w-2xl">
                    <Badge className={`${SHOP_BANNERS[currentBanner].badgeColor} hover:${SHOP_BANNERS[currentBanner].badgeColor} mb-4`}>
                      {SHOP_BANNERS[currentBanner].badge}
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                      {SHOP_BANNERS[currentBanner].title}
                    </h1>
                    <p className="text-xl md:text-2xl font-semibold opacity-95 mb-2">
                      {SHOP_BANNERS[currentBanner].subtitle}
                    </p>
                    <p className="text-base md:text-lg opacity-90">
                      {SHOP_BANNERS[currentBanner].description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <button
              onClick={prevBanner}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-sm hover:bg-white/50 rounded-full p-2 md:p-3 transition-all shadow-lg"
            >
              <ChevronLeft className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </button>
            <button
              onClick={nextBanner}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-sm hover:bg-white/50 rounded-full p-2 md:p-3 transition-all shadow-lg"
            >
              <ChevronRight className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {SHOP_BANNERS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBanner(index)}
                  className={`h-2 rounded-full transition-all ${index === currentBanner ? 'w-8 bg-white' : 'w-2 bg-white/50'
                    }`}
                />
              ))}
            </div>
          </div>

          <div className="container mx-auto max-w-6xl px-4 -mt-8 relative z-10">
            {/* Search and Cart Header */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 md:p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  펫 쇼핑
                </h2>
                <div className="flex items-center gap-2">
                  <Link to="/shop/wishlist" className="relative">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-pink-100">
                      <Heart className="h-6 w-6 text-pink-600" />
                    </Button>
                  </Link>
                  <Link to="/shop/cart" className="relative">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-pink-100">
                      <ShoppingCart className="h-6 w-6 text-pink-600" />
                    </Button>
                    {cartCount > 0 && (
                      <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 p-0 text-xs flex items-center justify-center text-white border-2 border-white">
                        {cartCount}
                      </Badge>
                    )}
                  </Link>
                </div>
              </div>

              <div className="relative max-w-2xl mb-6">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="어떤 상품을 찾으시나요?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-full border-pink-200 pl-10 focus-visible:ring-pink-500 bg-white h-12 text-base"
                />
              </div>

              <CategoryFilter
                categories={CATEGORIES}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
              />
            </div>

            {/* Mileage Banner */}
            <div className="mb-8 rounded-2xl bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 p-6 shadow-lg border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-pink-600 md:text-base mb-1">내 마일리지</p>
                  <p className="text-2xl font-bold text-pink-600 md:text-3xl">1,250 P</p>
                </div>
                <Link to="/profile/mileage">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-pink-500 bg-transparent text-pink-600 hover:bg-pink-500 hover:text-white transition-colors"
                  >
                    내역 보기
                  </Button>
                </Link>
              </div>
            </div>

            {/* Products Grid */}
            <main className="pb-6">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="py-20 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 md:text-lg font-medium">검색 결과가 없어요</p>
                  <p className="text-gray-400 text-sm mt-1">다른 키워드로 검색해보세요</p>
                </div>
              )}
            </main>
          </div>
        </>
      ) : (
        <Outlet />
      )}
      <TabNavigation />
    </div>
  )
}
