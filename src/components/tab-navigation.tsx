import { Link, useLocation } from "react-router-dom"
import { Home, Compass, Plus, ShoppingBag, User, LayoutGrid, Map, Sparkles, ShoppingCart, Smile } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

export function TabNavigation() {
  const location = useLocation();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)

  const tabs = [
    { href: "/feed", label: "홈", icon: Home, hoverIcon: LayoutGrid },
    { href: "/explore", label: "탐색", icon: Compass, hoverIcon: Map },
    { href: "/create", label: "작성", icon: Plus, hoverIcon: Sparkles, special: true },
    { href: "/shop", label: "쇼핑", icon: ShoppingBag, hoverIcon: ShoppingCart },
    { href: "/profile", label: "마이", icon: User, hoverIcon: Smile },
  ]

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none md:hidden">
      <nav className="flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 p-2 pointer-events-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const HoverIcon = tab.hoverIcon
          const isActive = location.pathname.startsWith(tab.href)
          const isHovered = hoveredTab === tab.href

          if (tab.special) {
            return (
              <Link
                key={tab.href}
                to={tab.href}
                className="mx-2"
                onMouseEnter={() => setHoveredTab(tab.href)}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-200 transition-transform hover:scale-105 active:scale-95">
                  <AnimatePresence mode="wait">
                    {isHovered ? (
                      <motion.div
                        key="hover"
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <HoverIcon className="h-6 w-6" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="normal"
                        initial={{ scale: 0, rotate: 90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: -90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Icon className="h-6 w-6" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={cn(
                "relative flex h-12 w-12 flex-col items-center justify-center rounded-full transition-all",
                isActive ? "text-pink-600" : "text-gray-400 hover:text-gray-600"
              )}
              onMouseEnter={() => setHoveredTab(tab.href)}
              onMouseLeave={() => setHoveredTab(null)}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-full bg-pink-50"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              <div className="relative z-10">
                <AnimatePresence mode="wait">
                  {isHovered ? (
                    <motion.div
                      key="hover"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <HoverIcon className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="normal"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}