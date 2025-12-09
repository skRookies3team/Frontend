import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ChevronLeft, ShoppingBag, ArrowRight } from 'lucide-react'
import { Button } from "@/shared/ui/button"
import { useCart } from "@/features/shop/context/cart-context"
import { CartItem } from "@/features/shop/components/cart-item"

export default function CartPage() {
    const { items, cartTotal, cartCount } = useCart()
    const shippingCost = cartTotal > 50000 ? 0 : 3000

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-10">
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto max-w-2xl px-4 h-14 flex items-center">
                    <Link to="/shop" className="mr-4">
                        <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </Link>
                    <h1 className="text-lg font-bold">장바구니</h1>
                </div>
            </div>

            <div className="container mx-auto max-w-2xl px-4 py-6">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                            <ShoppingBag className="w-10 h-10 text-pink-300" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">장바구니가 비어있어요</h2>
                        <p className="text-gray-500 mb-8">반려동물을 위한 특별한 선물을 담아보세요!</p>
                        <Link to="/shop">
                            <Button className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-8">
                                쇼핑하러 가기
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            {items.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                >
                                    <CartItem item={item} />
                                </motion.div>
                            ))}
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                            <h3 className="font-bold text-lg mb-4">결제 금액</h3>

                            <div className="flex justify-between text-gray-600">
                                <span>총 상품금액</span>
                                <span>{cartTotal.toLocaleString()}원</span>
                            </div>

                            <div className="flex justify-between text-gray-600">
                                <span>배송비</span>
                                <span>{shippingCost === 0 ? '무료' : `${shippingCost.toLocaleString()}원`}</span>
                            </div>

                            <div className="h-px bg-gray-100 my-4" />

                            <div className="flex justify-between items-center">
                                <span className="font-bold text-lg">총 결제금액</span>
                                <span className="font-bold text-2xl text-pink-600">
                                    {(cartTotal + shippingCost).toLocaleString()}원
                                </span>
                            </div>
                        </div>

                        <Link to="/shop/checkout" className="block">
                            <Button className="w-full h-14 text-lg font-bold bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl shadow-lg shadow-pink-200">
                                {cartCount}개 상품 구매하기
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
