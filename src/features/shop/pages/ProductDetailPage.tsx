import { useState } from "react"
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { ChevronLeft, Heart, ShoppingCart, Star, Minus, Plus, Share2 } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/ui/accordion"
import { useCart } from "@/features/shop/context/cart-context"
import { useWishlist } from "@/features/shop/context/wishlist-context"
import { motion } from "framer-motion"

export default function ProductDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const [quantity, setQuantity] = useState(1)
  const [useMileage, setUseMileage] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Mock product data - in a real app this would come from an API based on the ID
  const product = {
    id: id || "1",
    name: "프리미엄 강아지 사료 - 닭고기와 쌀",
    price: 45000,
    mileagePrice: 450,
    rating: 4.8,
    reviews: 1234,
    images: ["/dog-food-bag.jpg", "/dog-food-ingredients.png", "/dog-eating.png"],
    category: "food",
    description:
      "신선한 닭고기와 건강한 쌀로 만든 프리미엄 사료입니다. 반려견의 건강과 활력을 위해 특별히 조제되었습니다. 인공 첨가물이 전혀 들어있지 않아 안심하고 급여하실 수 있습니다.",
    features: [
      "제 1원료: 신선한 닭고기",
      "인공 색소 및 향료 무첨가",
      "오메가 지방산 풍부",
      "소화 흡수율 우수",
      "HACCP 인증 시설 제조",
    ],
  }

  const totalPrice = product.price * quantity
  const mileageDiscount = useMileage ? Math.min(1250, totalPrice * 0.1) : 0
  const finalPrice = totalPrice - mileageDiscount

  const handleAddToCart = () => {
    // Add the item multiple times based on quantity
    // Note: A better implementation in CartContext would be to accept quantity
    // For now, we'll loop to add
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        mileagePrice: product.mileagePrice,
        image: product.images[0],
        category: product.category,
        description: product.description
      })
    }
    navigate('/shop/cart')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white pb-32">
      <header className="sticky top-0 z-40 border-b border-pink-100 bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-pink-50 text-gray-600 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <h1 className="text-lg font-bold text-gray-800 truncate max-w-[200px] md:max-w-none">
            {product.name}
          </h1>

          <div className="flex gap-2">
            <button
              onClick={() => { }}
              className="p-2 rounded-full hover:bg-pink-50 text-gray-600 transition-colors"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={() => toggleWishlist({
                id: product.id,
                name: product.name,
                price: product.price,
                mileagePrice: product.mileagePrice,
                image: product.images[0],
                category: product.category,
                description: product.description
              })}
              className="p-2 rounded-full hover:bg-pink-50 transition-colors"
            >
              <Heart className={`h-6 w-6 ${isInWishlist(product.id) ? "fill-pink-500 text-pink-500" : "text-gray-400"}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl">
        <div className="md:grid md:grid-cols-2 md:gap-8 md:p-6">
          {/* Image Section */}
          <div className="relative aspect-square md:rounded-3xl overflow-hidden bg-white shadow-lg md:border border-pink-100">
            <motion.img
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              src={product.images[currentImageIndex] || "/placeholder.svg"}
              alt={product.name}
              className="h-full w-full object-cover"
            />

            {product.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 bg-black/20 backdrop-blur-sm p-2 rounded-full">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2 rounded-full transition-all ${index === currentImageIndex ? "w-6 bg-white" : "w-2 bg-white/60"
                      }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6 p-4 md:p-0 md:mt-0">
            <div className="bg-white rounded-3xl shadow-sm p-6 border border-pink-100">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-pink-100 text-pink-700 hover:bg-pink-200">
                      베스트셀러
                    </Badge>
                    <Badge variant="outline" className="border-pink-200 text-pink-600">
                      무료배송
                    </Badge>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-3">
                    {product.name}
                  </h2>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-lg text-gray-900">{product.rating}</span>
                    </div>
                    <span className="text-gray-400">|</span>
                    <span className="text-sm text-gray-500">{product.reviews.toLocaleString()}개의 리뷰</span>
                  </div>
                </div>

                <div className="flex items-end gap-3 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl border border-pink-100">
                  <p className="text-3xl font-bold text-pink-600">{product.price.toLocaleString()}원</p>
                  <div className="flex items-center gap-1 text-amber-600 text-sm font-medium mb-1">
                    <span className="bg-amber-100 px-2 py-0.5 rounded-full">
                      +{product.mileagePrice} P 적립
                    </span>
                  </div>
                </div>

                <Accordion type="single" collapsible className="w-full" defaultValue="description">
                  <AccordionItem value="description" className="border-pink-100">
                    <AccordionTrigger className="text-gray-900 font-semibold hover:text-pink-600 hover:no-underline">
                      상품 설명
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-600 leading-relaxed mb-4">{product.description}</p>
                      <ul className="space-y-2 bg-gray-50 p-4 rounded-xl">
                        {product.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-pink-500 mt-1">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="shipping" className="border-pink-100">
                    <AccordionTrigger className="text-gray-900 font-semibold hover:text-pink-600 hover:no-underline">
                      배송/교환/반품 안내
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="text-sm text-gray-600 space-y-2">
                        <p>• 배송비: 3,000원 (50,000원 이상 구매 시 무료)</p>
                        <p>• 배송 기간: 결제 후 2~3일 이내 (주말/공휴일 제외)</p>
                        <p>• 교환/반품은 상품 수령 후 7일 이내 가능합니다.</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>

            {/* Quantity and Options */}
            <div className="bg-white rounded-3xl shadow-sm p-6 border border-pink-100">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">수량 선택</p>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-full p-1 border border-gray-200">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-8 w-8 rounded-full hover:bg-white hover:shadow-sm"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-bold text-gray-900">{quantity}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-8 w-8 rounded-full hover:bg-white hover:shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-amber-50 p-4 border border-amber-100">
                  <div>
                    <p className="text-sm font-bold text-amber-800">마일리지 사용</p>
                    <p className="text-xs text-amber-600/80">보유: 1,250 P</p>
                  </div>
                  <button
                    onClick={() => setUseMileage(!useMileage)}
                    className={`h-6 w-11 rounded-full transition-colors relative ${useMileage ? "bg-amber-500" : "bg-gray-300"}`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${useMileage ? "translate-x-5" : "translate-x-0"
                        }`}
                    />
                  </button>
                </div>

                {useMileage && (
                  <div className="space-y-2 text-sm pt-2 border-t border-dashed border-gray-200">
                    <div className="flex justify-between text-gray-500">
                      <span>상품 금액</span>
                      <span>{totalPrice.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between text-amber-600 font-medium">
                      <span>마일리지 할인</span>
                      <span>-{mileageDiscount.toLocaleString()}원</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-pink-100 bg-white/90 backdrop-blur-lg shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)] z-50">
        <div className="mx-auto flex max-w-4xl items-center gap-4 p-4 md:p-6">
          <div className="hidden md:block flex-1">
            <p className="text-sm text-gray-500">총 결제 금액</p>
            <p className="text-2xl font-bold text-pink-600">
              {finalPrice.toLocaleString()}원
            </p>
          </div>

          <div className="md:hidden flex flex-col">
            <span className="text-xs text-gray-500">총 금액</span>
            <span className="text-lg font-bold text-pink-600">{finalPrice.toLocaleString()}원</span>
          </div>

          <div className="flex-1 flex gap-3 justify-end">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 md:flex-none rounded-xl border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-700 font-bold h-14"
            >
              선물하기
            </Button>
            <Button
              size="lg"
              onClick={handleAddToCart}
              className="flex-[2] md:flex-none md:w-64 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-200 font-bold text-lg h-14"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              장바구니 담기
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
