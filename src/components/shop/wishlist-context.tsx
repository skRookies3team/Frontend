"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { type Product } from "./cart-context"

type WishlistContextType = {
    items: Product[]
    addToWishlist: (product: Product) => void
    removeFromWishlist: (productId: string) => void
    isInWishlist: (productId: string) => boolean
    toggleWishlist: (product: Product) => void
    wishlistCount: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<Product[]>([])

    // Load wishlist from local storage on mount
    useEffect(() => {
        const savedWishlist = localStorage.getItem("wishlist")
        if (savedWishlist) {
            try {
                setItems(JSON.parse(savedWishlist))
            } catch (error) {
                console.error("Failed to parse wishlist from local storage", error)
            }
        }
    }, [])

    // Save wishlist to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem("wishlist", JSON.stringify(items))
    }, [items])

    const addToWishlist = (product: Product) => {
        setItems((prev) => {
            if (prev.some((item) => item.id === product.id)) return prev
            return [...prev, product]
        })
    }

    const removeFromWishlist = (productId: string) => {
        setItems((prev) => prev.filter((item) => item.id !== productId))
    }

    const isInWishlist = (productId: string) => {
        return items.some((item) => item.id === productId)
    }

    const toggleWishlist = (product: Product) => {
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id)
        } else {
            addToWishlist(product)
        }
    }

    const wishlistCount = items.length

    return (
        <WishlistContext.Provider
            value={{
                items,
                addToWishlist,
                removeFromWishlist,
                isInWishlist,
                toggleWishlist,
                wishlistCount,
            }}
        >
            {children}
        </WishlistContext.Provider>
    )
}

export function useWishlist() {
    const context = useContext(WishlistContext)
    if (context === undefined) {
        throw new Error("useWishlist must be used within a WishlistProvider")
    }
    return context
}
