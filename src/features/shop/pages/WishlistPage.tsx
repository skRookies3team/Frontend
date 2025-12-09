import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ChevronLeft, Heart } from 'lucide-react'
import { Button } from "@/shared/ui/button"
import { useWishlist } from "@/features/shop/context/wishlist-context"
import { ProductCard } from "@/features/shop/components/product-card"

export default function WishlistPage() {
    const { items } = useWishlist()

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white pb-20 md:pb-10">
            <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-10">
                <div className="container mx-auto max-w-6xl px-4 h-14 flex items-center">
                    <Link to="/shop" className="mr-4">
                        <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </Link>
                    <h1 className="text-lg font-bold">찜한 상품</h1>
                </div>
            </div>

            <div className="container mx-auto max-w-6xl px-4 py-6">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                            <Heart className="w-10 h-10 text-pink-300 fill-pink-300" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">찜한 상품이 없어요</h2>
                        <p className="text-gray-500 mb-8">마음에 드는 상품을 찜해보세요!</p>
                        <Link to="/shop">
                            <Button className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-8">
                                쇼핑하러 가기
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
                        {items.map((product) => (
                            <motion.div
                                key={product.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                            >
                                {/* We need to pass isFavorite=true explicitly or let the card handle it via context */}
                                {/* Since ProductCard uses context now (we will update it), we just pass product */}
                                <ProductCard product={{ ...product, isFavorite: true, rating: 0, reviews: 0 }} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
