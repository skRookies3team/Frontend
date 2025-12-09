import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom"
import { motion } from "framer-motion"
import { ChevronLeft, CreditCard, Building2, Coins, Package, MapPin, Phone, User, Home } from 'lucide-react'
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Badge } from "@/shared/ui/badge"
import { useCart } from "@/features/shop/context/cart-context"
import "@/shared/assets/styles/CheckoutPage.css"

type PaymentMethod = "card" | "transfer" | "mileage" | "mixed"

export default function CheckoutPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { items, cartTotal, cartCount } = useCart()
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card")
    const [mileageToUse, setMileageToUse] = useState(0)
    const [agreedToTerms, setAgreedToTerms] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false) // 애니메이션 상태 관리

    // User's available mileage
    const availableMileage = 1250

    // Shipping cost calculation
    const shippingCost = cartTotal > 50000 ? 0 : 3000

    // Calculate mileage discount
    const mileageDiscount = paymentMethod === "mileage" || paymentMethod === "mixed" ? Math.min(mileageToUse, availableMileage, cartTotal + shippingCost) : 0

    // Final payment amount
    const finalAmount = cartTotal + shippingCost - mileageDiscount

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        zipcode: "",
        address: "",
        addressDetail: "",
        message: ""
    })

    // Redirect if cart is empty
    useEffect(() => {
        // Don't redirect if we're on the completion page
        if (location.pathname.includes("/complete")) return

        if (items.length === 0) {
            navigate("/shop/cart")
        }
    }, [items, navigate, location.pathname])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 0
        setMileageToUse(Math.min(value, availableMileage, cartTotal + shippingCost))
    }

    const useAllMileage = () => {
        setMileageToUse(Math.min(availableMileage, cartTotal + shippingCost))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (isAnimating) return; // 이미 진행 중이면 중복 실행 방지

        // Validation
        if (!formData.name || !formData.phone || !formData.address) {
            alert("필수 정보를 모두 입력해주세요.")
            return
        }

        if (!agreedToTerms) {
            alert("개인정보 수집 및 이용에 동의해주세요.")
            return
        }

        // Start Animation
        setIsAnimating(true)

        // Generate order number
        const orderNumber = `ORD${Date.now()}`

        // Navigate after animation completes (approx 4 seconds)
        setTimeout(() => {
            navigate(`/shop/checkout/complete?orderNumber=${orderNumber}&amount=${finalAmount}`)
        }, 4000)
    }

    if (items.length === 0 && !location.pathname.includes("/complete")) {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white pb-20 md:pb-10">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto max-w-4xl px-4 h-14 flex items-center">
                    <Link to="/shop/cart" className="mr-4">
                        <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </Link>
                    <h1 className="text-lg font-bold">주문/결제</h1>
                </div>
            </div>

            {location.pathname === "/shop/checkout" ? (
                <div className="container mx-auto max-w-4xl px-4 py-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Order Summary */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Package className="w-5 h-5 text-pink-600" />
                                <h2 className="font-bold text-lg">주문 상품</h2>
                                <Badge className="ml-auto bg-pink-100 text-pink-600 hover:bg-pink-100">
                                    {cartCount}개
                                </Badge>
                            </div>

                            <div className="space-y-3">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-3 pb-3 border-b last:border-b-0">
                                        <img
                                            src={item.image || "/placeholder.svg"}
                                            alt={item.name}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{item.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">수량: {item.quantity}개</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm">
                                                {(item.price * item.quantity).toLocaleString()}원
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Shipping Information */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin className="w-5 h-5 text-pink-600" />
                                <h2 className="font-bold text-lg">배송 정보</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700">
                                        <User className="w-4 h-4" />
                                        받는 사람 <span className="text-pink-600">*</span>
                                    </label>
                                    <Input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="이름을 입력하세요"
                                        required
                                        className="h-12"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700">
                                        <Phone className="w-4 h-4" />
                                        전화번호 <span className="text-pink-600">*</span>
                                    </label>
                                    <Input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="010-0000-0000"
                                        required
                                        className="h-12"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700">
                                        <Home className="w-4 h-4" />
                                        우편번호
                                    </label>
                                    <div className="flex gap-2">
                                        <Input
                                            name="zipcode"
                                            value={formData.zipcode}
                                            onChange={handleInputChange}
                                            placeholder="12345"
                                            className="h-12"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-12 px-6 whitespace-nowrap"
                                        >
                                            우편번호 찾기
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 text-gray-700 block">
                                        주소 <span className="text-pink-600">*</span>
                                    </label>
                                    <Input
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="기본 주소"
                                        required
                                        className="h-12 mb-2"
                                    />
                                    <Input
                                        name="addressDetail"
                                        value={formData.addressDetail}
                                        onChange={handleInputChange}
                                        placeholder="상세 주소"
                                        className="h-12"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 text-gray-700 block">
                                        배송 요청사항
                                    </label>
                                    <Input
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        placeholder="배송시 요청사항을 입력하세요"
                                        className="h-12"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Payment Method */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <CreditCard className="w-5 h-5 text-pink-600" />
                                <h2 className="font-bold text-lg">결제 수단</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("card")}
                                    className={`p-4 rounded-xl border-2 transition-all ${paymentMethod === "card"
                                        ? "border-pink-500 bg-pink-50"
                                        : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    <CreditCard className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === "card" ? "text-pink-600" : "text-gray-400"
                                        }`} />
                                    <p className={`text-sm font-medium ${paymentMethod === "card" ? "text-pink-600" : "text-gray-600"
                                        }`}>
                                        신용/체크카드
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("transfer")}
                                    className={`p-4 rounded-xl border-2 transition-all ${paymentMethod === "transfer"
                                        ? "border-pink-500 bg-pink-50"
                                        : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    <Building2 className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === "transfer" ? "text-pink-600" : "text-gray-400"
                                        }`} />
                                    <p className={`text-sm font-medium ${paymentMethod === "transfer" ? "text-pink-600" : "text-gray-600"
                                        }`}>
                                        계좌이체
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("mileage")}
                                    className={`p-4 rounded-xl border-2 transition-all ${paymentMethod === "mileage"
                                        ? "border-pink-500 bg-pink-50"
                                        : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    <Coins className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === "mileage" ? "text-pink-600" : "text-gray-400"
                                        }`} />
                                    <p className={`text-sm font-medium ${paymentMethod === "mileage" ? "text-pink-600" : "text-gray-600"
                                        }`}>
                                        마일리지 결제
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("mixed")}
                                    className={`p-4 rounded-xl border-2 transition-all ${paymentMethod === "mixed"
                                        ? "border-pink-500 bg-pink-50"
                                        : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    <div className="flex items-center justify-center gap-1 mb-2">
                                        <Coins className={`w-5 h-5 ${paymentMethod === "mixed" ? "text-pink-600" : "text-gray-400"
                                            }`} />
                                        <span className="text-xs">+</span>
                                        <CreditCard className={`w-5 h-5 ${paymentMethod === "mixed" ? "text-pink-600" : "text-gray-400"
                                            }`} />
                                    </div>
                                    <p className={`text-sm font-medium ${paymentMethod === "mixed" ? "text-pink-600" : "text-gray-600"
                                        }`}>
                                        혼합 결제
                                    </p>
                                </button>
                            </div>

                            {/* Mileage Usage */}
                            {(paymentMethod === "mileage" || paymentMethod === "mixed") && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200"
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm font-medium text-gray-700">보유 마일리지</span>
                                        <span className="font-bold text-pink-600">{availableMileage.toLocaleString()} P</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            value={mileageToUse || ""}
                                            onChange={handleMileageChange}
                                            placeholder="사용할 마일리지"
                                            min="0"
                                            max={Math.min(availableMileage, cartTotal + shippingCost)}
                                            className="h-10"
                                        />
                                        <Button
                                            type="button"
                                            onClick={useAllMileage}
                                            variant="outline"
                                            className="h-10 px-4 whitespace-nowrap border-pink-500 text-pink-600 hover:bg-pink-50"
                                        >
                                            전액 사용
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        * 최대 {Math.min(availableMileage, cartTotal + shippingCost).toLocaleString()}P까지 사용 가능합니다
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Payment Summary */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                        >
                            <h2 className="font-bold text-lg mb-4">최종 결제 금액</h2>

                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>총 상품금액</span>
                                    <span>{cartTotal.toLocaleString()}원</span>
                                </div>

                                <div className="flex justify-between text-gray-600">
                                    <span>배송비</span>
                                    <span>{shippingCost === 0 ? '무료' : `${shippingCost.toLocaleString()}원`}</span>
                                </div>

                                {mileageDiscount > 0 && (
                                    <div className="flex justify-between text-pink-600">
                                        <span>마일리지 할인</span>
                                        <span>-{mileageDiscount.toLocaleString()}원</span>
                                    </div>
                                )}

                                <div className="h-px bg-gray-200 my-4" />

                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-lg">총 결제금액</span>
                                    <span className="font-bold text-2xl text-pink-600">
                                        {finalAmount.toLocaleString()}원
                                    </span>
                                </div>

                                {cartTotal < 50000 && (
                                    <p className="text-xs text-gray-500 text-center pt-2">
                                        💡 {(50000 - cartTotal).toLocaleString()}원 더 구매하시면 무료배송!
                                    </p>
                                )}
                            </div>
                        </motion.div>

                        {/* Terms Agreement */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                        >
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="mt-1 w-4 h-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                                />
                                <div className="text-sm">
                                    <span className="font-medium text-gray-900">개인정보 수집 및 이용 동의</span>
                                    <span className="text-pink-600"> (필수)</span>
                                    <p className="text-gray-500 mt-1">
                                        주문 및 배송을 위해 개인정보를 수집하며, 구매 완료 후 관련 법령에 따라 일정 기간 보관됩니다.
                                    </p>
                                </div>
                            </label>
                        </motion.div>

                        {/* Animated Submit Button (Truck) */}
                        <button
                            type="submit"
                            className={`order-btn shadow-lg shadow-pink-200 ${isAnimating ? 'animating' : ''} ${!agreedToTerms && !isAnimating ? 'disabled' : ''}`}
                            disabled={!agreedToTerms || isAnimating}
                        >
                            {/* Default Text */}
                            <span className="default">
                                {finalAmount.toLocaleString()}원 결제하기
                            </span>

                            {/* Success Text */}
                            <span className="success">
                                결제 완료
                                <svg viewBox="0 0 12 10">
                                    <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
                                </svg>
                            </span>

                            {/* Truck Animation Container */}
                            <div className="truck">
                                <svg viewBox="0 0 60 41">
                                    <path d="M55,18 L55,10 C55,8.89543 54.1046,8 53,8 L46,8 L46,5 C46,2.23858 43.7614,0 41,0 L5,0 C2.23858,0 0,2.23858 0,5 L0,28 C0,30.7614 2.23858,33 5,33 L8.09,33 C8.53,35.84 10.98,38 14,38 C17.02,38 19.47,35.84 19.91,33 L39.09,33 C39.53,35.84 41.98,38 45,38 C48.02,38 50.47,35.84 50.91,33 L55,33 C57.7614,33 60,30.7614 60,28 L60,24 L56,24 C55.4477,24 55,23.5523 55,23 L55,18 Z M14,35 C12.3431,35 11,33.6569 11,32 C11,30.3431 12.3431,29 14,29 C15.6569,29 17,30.3431 17,32 C17,33.6569 15.6569,35 14,35 Z M45,35 C43.3431,35 42,33.6569 42,32 C42,30.3431 43.3431,29 45,29 C46.6569,29 48,30.3431 48,32 C48,33.6569 46.6569,35 45,35 Z M55,18 L51,18 L51,12 L55,12 L55,18 Z" fill="white" />
                                    <path d="M46,8 L53,8 L53,10 L46,10 L46,8 Z" fill="#2B3044" />
                                </svg>
                                <div className="box"></div>
                                <div className="light"></div>
                            </div>
                        </button>
                    </form>
                </div>
            ) : (
                <Outlet />
            )}
        </div>
    )
}

