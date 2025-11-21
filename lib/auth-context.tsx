"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  avatar: string
  petCoin: number
  withapetConnected: boolean
  profileCompleted: boolean
  pets: {
    id: string
    name: string
    species: string
    breed: string
    age: number
    photo: string
    gender: string
    neutered: boolean
    birthday?: string
  }[]
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  connectWithapet: () => void
  addPetCoin: (amount: number) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const mockUser: User = {
  id: "1",
  name: "김민지",
  email: "user@petlog.com",
  avatar: "/diverse-woman-avatar.png",
  petCoin: 1250,
  withapetConnected: false,
  profileCompleted: true,
  pets: [
    {
      id: "1",
      name: "몽치",
      species: "강아지",
      breed: "골든 리트리버",
      age: 3,
      photo: "/golden-retriever.png",
      gender: "남아",
      neutered: true,
      birthday: "2022-03-15",
    },
    {
      id: "2",
      name: "코코",
      species: "고양이",
      breed: "스코티시 폴드",
      age: 2,
      photo: "/cat-portrait.png",
      gender: "여아",
      neutered: true,
      birthday: "2023-05-20",
    },
  ],
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const storedUser = localStorage.getItem("petlog_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    const publicRoutes = [
      "/",
      "/login",
      "/onboarding",
      "/register-pet",
      "/welcome",
      "/signup",
      "/user-info",
      "/pet-info",
    ]
    const isPublicRoute = publicRoutes.includes(pathname)

    if (!isLoading && !user && !isPublicRoute) {
      router.push("/login")
    }

    if (!isLoading && user && !user.profileCompleted && pathname !== "/user-info" && pathname !== "/pet-info") {
      if (!user.name) {
        router.push("/user-info")
      }
    }
  }, [user, pathname, isLoading, router])

  const login = async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newUser = { ...mockUser, profileCompleted: true }
    setUser(newUser)
    localStorage.setItem("petlog_user", JSON.stringify(newUser))
    router.push("/dashboard")
  }

  const connectWithapet = () => {
    if (user) {
      const updatedUser = { ...user, withapetConnected: true, petCoin: user.petCoin + 100 }
      setUser(updatedUser)
      localStorage.setItem("petlog_user", JSON.stringify(updatedUser))
    }
  }

  const addPetCoin = (amount: number) => {
    if (user) {
      const updatedUser = { ...user, petCoin: user.petCoin + amount }
      setUser(updatedUser)
      localStorage.setItem("petlog_user", JSON.stringify(updatedUser))
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("petlog_user")
    router.push("/")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, connectWithapet, addPetCoin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
