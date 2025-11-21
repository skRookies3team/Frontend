"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Heart, ShoppingCart, Star, Minus, Plus } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function ProductDetailPage() {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [useMileage, setUseMileage] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const product = {
    id: "1",
    name: "Premium Dog Food - Chicken & Rice",
    price: 45000,
    mileagePrice: 450,
    rating: 4.8,
    reviews: 1234,
    images: ["/dog-food-bag.jpg", "/dog-food-ingredients.png", "/dog-eating.png"],
    description:
      "Premium quality dog food made with real chicken and wholesome rice. Specially formulated for adult dogs to maintain optimal health and energy levels.",
    features: [
      "Real chicken as the first ingredient",
      "No artificial colors or flavors",
      "Rich in omega fatty acids",
      "Supports healthy digestion",
      "Made in Korea",
    ],
  }

  const totalPrice = product.price * quantity
  const mileageDiscount = useMileage ? Math.min(1250, totalPrice * 0.1) : 0
  const finalPrice = totalPrice - mileageDiscount

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white pb-24">
      <header className="sticky top-0 z-40 border-b border-pink-100 bg-white/95 backdrop-blur-lg shadow-sm">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="text-[#8B6F47]">
            <ChevronLeft className="h-6 w-6" />
          </button>

          <h1 className="text-lg font-bold text-[#8B6F47]">Product Details</h1>

          <button onClick={() => setIsFavorite(!isFavorite)}>
            <Heart className={`h-6 w-6 ${isFavorite ? "fill-pink-500 text-pink-500" : "text-gray-400"}`} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl">
        <div className="relative aspect-[4/3] md:aspect-[16/9] overflow-hidden bg-white shadow-lg">
          <img
            src={product.images[currentImageIndex] || "/placeholder.svg"}
            alt={product.name}
            className="h-full w-full object-cover"
          />

          {product.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentImageIndex ? "w-6 bg-white" : "w-2 bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 p-4 md:p-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-pink-100">
            <div className="space-y-4">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-balance text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                    {product.name}
                  </h2>
                  <button onClick={() => setIsFavorite(!isFavorite)}>
                    <Heart className={`h-6 w-6 ${isFavorite ? "fill-pink-500 text-pink-500" : "text-gray-400"}`} />
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-[#FFD700] text-[#FFD700]" />
                    <span className="font-medium text-[#8B6F47]">{product.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
                </div>
              </div>

              <div className="flex items-baseline gap-3 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl">
                <p className="text-3xl md:text-4xl font-bold text-pink-600">{product.price.toLocaleString()}원</p>
                <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md">
                  {product.mileagePrice} pts
                </Badge>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="description">
                  <AccordionTrigger className="text-[#8B6F47]">Description</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-pretty text-muted-foreground">{product.description}</p>
                    <ul className="mt-4 space-y-2">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-[#8B6F47]">•</span>
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-pink-100">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-[#8B6F47]">Quantity</p>
                <div className="flex items-center gap-3">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-8 w-8 rounded-full border-[#E5D5C3]"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-semibold">{quantity}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-8 w-8 rounded-full border-[#E5D5C3]"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#FFFBF5] p-4">
                <div>
                  <p className="text-sm font-medium text-[#8B6F47]">Use Mileage</p>
                  <p className="text-xs text-muted-foreground">Available: 1,250 points</p>
                </div>
                <button
                  onClick={() => setUseMileage(!useMileage)}
                  className={`h-6 w-11 rounded-full transition-colors ${useMileage ? "bg-[#8B6F47]" : "bg-[#E5D5C3]"}`}
                >
                  <div
                    className={`h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                      useMileage ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {useMileage && (
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{totalPrice.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-[#8B6F47]">
                    <span>Mileage Discount</span>
                    <span className="font-medium">-{mileageDiscount.toLocaleString()}원</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t border-pink-100 bg-white/95 backdrop-blur-lg shadow-2xl">
        <div className="mx-auto flex max-w-4xl items-center gap-4 p-4 md:p-6">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              {finalPrice.toLocaleString()}원
            </p>
          </div>

          <Button
            size="lg"
            className="flex-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-base md:text-lg font-semibold hover:from-pink-600 hover:to-rose-600 shadow-lg h-14"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  )
}
