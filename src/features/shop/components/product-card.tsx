"use client"

import { motion } from "framer-motion"
import { ShoppingCart, Star, Heart } from 'lucide-react'
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { useCart, type Product } from "../context/cart-context"
import { useWishlist } from "../context/wishlist-context"
import { useState } from "react"
import { Link } from "react-router-dom"

interface ProductCardProps {
    product: Product & {
        rating: number
        reviews: number
        isFavorite: boolean
    }
}

export function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useCart()
    const { toggleWishlist, isInWishlist } = useWishlist()
    const [isHovered, setIsHovered] = useState(false)
    const isFavorite = isInWishlist(product.id)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
            className="group relative bg-white rounded-2xl overflow-hidden border border-pink-100 shadow-sm hover:shadow-xl transition-all duration-300"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link to={`/shop/product/${product.id}`} className="block">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Overlay Actions */}
                    <div className={`absolute inset-0 bg-black/5 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            toggleWishlist(product)
                        }}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-pink-500 transition-all shadow-sm z-10"
                    >
                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-pink-500 text-pink-500' : 'text-gray-400'}`} />
                    </button>

                    {product.mileagePrice > 0 && (
                        <Badge className="absolute top-3 left-3 bg-pink-500/90 backdrop-blur-sm text-white border-none">
                            {product.mileagePrice} P 적립
                        </Badge>
                    )}

                    {/* Quick Add Button - Visible on Hover */}
                    <div className={`absolute bottom-4 left-0 right-0 px-4 transition-all duration-300 transform ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                        <Button
                            className="w-full bg-white/90 backdrop-blur-sm hover:bg-pink-500 text-pink-600 hover:text-white border-none shadow-lg transition-all duration-300"
                            onClick={(e) => {
                                e.preventDefault()
                                addToCart(product)
                            }}
                        >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            장바구니 담기
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-700">{product.rating}</span>
                        <span className="text-xs text-gray-400">({product.reviews})</span>
                    </div>

                    <h3 className="font-bold text-gray-800 mb-1 line-clamp-1 group-hover:text-pink-600 transition-colors">
                        {product.name}
                    </h3>

                    <div className="flex items-center justify-between mt-2">
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-gray-900">
                                {product.price.toLocaleString()}원
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}
