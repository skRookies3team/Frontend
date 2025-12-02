import { useEffect, useState, useRef } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { CheckCircle2, Package, Home, FileText, ShoppingBag } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/shop/cart-context"

export default function CheckoutCompletePage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { clearCart } = useCart()
    const [orderNumber, setOrderNumber] = useState("")
    const [amount, setAmount] = useState("")
    const hasCleared = useRef(false)

    useEffect(() => {
        // Get order info from URL params
        const order = searchParams.get("orderNumber") || `ORD${Date.now()}`
        const total = searchParams.get("amount") || "0"

        setOrderNumber(order)
        setAmount(total)

        // Clear cart only once after successful order
        if (!hasCleared.current) {
            clearCart()
            hasCleared.current = true
        }
    }, [searchParams, clearCart])

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
            <div className="container mx-auto max-w-2xl px-4 py-12">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="flex justify-center mb-8"
                >
                    <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-xl">
                        <CheckCircle2 className="w-14 h-14 text-white" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                        주문이 완료되었습니다!
                    </h1>
                    <p className="text-gray-600">
                        소중한 주문 감사합니다. 빠르게 준비하여 배송해드리겠습니다.
                    </p>
                </motion.div>

                {/* Order Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Package className="w-5 h-5 text-pink-600" />
                        <h2 className="font-bold text-lg">주문 정보</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b">
                            <span className="text-gray-600">주문번호</span>
                            <span className="font-mono font-bold text-gray-900">{orderNumber}</span>
                        </div>

                        <div className="flex justify-between items-center pb-4 border-b">
                            <span className="text-gray-600">결제금액</span>
                            <span className="font-bold text-2xl text-pink-600">
                                {parseInt(amount).toLocaleString()}원
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">주문일시</span>
                            <span className="font-medium text-gray-900">
                                {new Date().toLocaleDateString("ko-KR", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                })}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Delivery Notice */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 mb-6"
                >
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        배송 안내
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>주문하신 상품은 결제 완료 후 2-3일 이내 배송됩니다.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>배송 현황은 마이페이지에서 확인하실 수 있습니다.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>배송 관련 문의사항은 고객센터로 연락주세요.</span>
                        </li>
                    </ul>
                </motion.div>

                {/* Mileage Earned Notice */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100 mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-gray-900 mb-1">🎁 마일리지 적립</h3>
                            <p className="text-sm text-gray-600">
                                구매 확정 후 <span className="font-bold text-amber-600">{Math.floor(parseInt(amount) * 0.01).toLocaleString()}P</span> 적립 예정
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-3"
                >
                    <Button
                        onClick={() => navigate('/profile')}
                        className="w-full h-14 text-base font-bold bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl shadow-lg shadow-pink-200"
                    >
                        <FileText className="w-5 h-5 mr-2" />
                        주문 내역 보기
                    </Button>

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            onClick={() => navigate('/shop')}
                            variant="outline"
                            className="w-full h-12 text-base font-medium border-gray-200 hover:bg-gray-50"
                        >
                            <ShoppingBag className="w-5 h-5 mr-2" />
                            쇼핑 계속하기
                        </Button>

                        <Button
                            onClick={() => navigate('/dashboard')}
                            variant="outline"
                            className="w-full h-12 text-base font-medium border-gray-200 hover:bg-gray-50"
                        >
                            <Home className="w-5 h-5 mr-2" />
                            홈으로
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
