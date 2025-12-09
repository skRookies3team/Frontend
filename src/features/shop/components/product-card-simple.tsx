"use client"

import type React from "react"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/shared/ui/card"
import { Button } from "@/shared/ui/button"
import { Heart, ShoppingCart, Star } from "lucide-react"

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    mileagePrice: number
    rating: number
    reviews: number
    image: string
    isFavorite: boolean
  }
  onAddToCart: () => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(product.isFavorite)

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsFavorite(!isFavorite)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    onAddToCart()
  }

  return (
    <Link to={`/shop/product/${product.id}`}>
      <Card className="group overflow-hidden border-0 shadow-md transition-all hover:shadow-xl">
        <CardContent className="p-0">
          <div className="relative aspect-square overflow-hidden bg-[#FFFBF5]">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />

            {/* Favorite Button */}
            <button
              onClick={handleFavorite}
              className="absolute right-2 top-2 rounded-full bg-white/90 p-2 shadow-md transition-all hover:scale-110"
            >
              <Heart
                className={`h-4 w-4 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
                  }`}
              />
            </button>

            {/* Mileage Badge */}
            <div className="absolute bottom-2 left-2 rounded-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] px-2 py-1 text-xs font-bold text-white shadow-md">
              {product.mileagePrice} pts
            </div>
          </div>

          <div className="space-y-2 p-3">
            <h3 className="text-pretty text-sm font-semibold leading-tight text-[#8B6F47] line-clamp-2">
              {product.name}
            </h3>

            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-[#FFD700] text-[#FFD700]" />
              <span className="text-xs font-medium text-[#8B6F47]">{product.rating}</span>
              <span className="text-xs text-muted-foreground">({product.reviews})</span>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-lg font-bold text-[#8B6F47]">{product.price.toLocaleString()}원</p>
              </div>

              <Button
                size="icon"
                onClick={handleAddToCart}
                className="h-8 w-8 rounded-full bg-gradient-to-r from-[#8B6F47] to-[#6B5637] hover:from-[#6B5637] hover:to-[#5B4627]"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
