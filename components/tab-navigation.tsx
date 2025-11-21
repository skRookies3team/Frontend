"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Compass, PlusCircle, ShoppingBag, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function TabNavigation() {
  const pathname = usePathname()

  const tabs = [
    { href: "/feed", label: "홈", icon: Home },
    { href: "/explore", label: "탐색", icon: Compass },
    { href: "/create", label: "작성", icon: PlusCircle, special: true },
    { href: "/shop", label: "쇼핑", icon: ShoppingBag },
    { href: "/profile", label: "마이", icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white/95 backdrop-blur-sm md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around px-4 py-3">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = pathname === tab.href

          if (tab.special) {
            return (
              <Link key={tab.href} href={tab.href} className="flex flex-col items-center gap-1">
                <div className="rounded-full bg-gradient-to-br from-pink-500 to-rose-500 p-2 shadow-lg transition-transform hover:scale-105">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-medium text-primary">{tab.label}</span>
              </Link>
            )
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary",
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
