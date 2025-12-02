"use client"

import { motion } from "framer-motion"

interface Category {
    id: string
    label: string
}

interface CategoryFilterProps {
    categories: Category[]
    activeCategory: string
    onSelectCategory: (id: string) => void
}

export function CategoryFilter({ categories, activeCategory, onSelectCategory }: CategoryFilterProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
                <button
                    key={category.id}
                    onClick={() => onSelectCategory(category.id)}
                    className="relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 outline-none focus:outline-none"
                >
                    {activeCategory === category.id && (
                        <motion.div
                            layoutId="activeCategory"
                            className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-lg"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <span className={`relative z-10 ${activeCategory === category.id ? 'text-white' : 'text-gray-600 hover:text-pink-600'}`}>
                        {category.label}
                    </span>
                </button>
            ))}
        </div>
    )
}
