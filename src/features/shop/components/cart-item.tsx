"use client"

import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from "@/shared/ui/button"
import { useCart, type CartItem as CartItemType } from "../context/cart-context"

interface CartItemProps {
    item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
    const { updateQuantity, removeFromCart } = useCart()

    return (
        <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-pink-100 shadow-sm hover:shadow-md transition-all">
            {/* Image */}
            <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-800 truncate pr-4">{item.name}</h3>
                    <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                <p className="text-sm text-gray-500 mb-3">{item.category}</p>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-md hover:bg-white hover:shadow-sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                        >
                            <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-md hover:bg-white hover:shadow-sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>

                    <div className="text-right">
                        <p className="font-bold text-lg text-pink-600">
                            {(item.price * item.quantity).toLocaleString()}원
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
