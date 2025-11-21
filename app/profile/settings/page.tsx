"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Moon, Sun, Bell, Lock, Globe, Palette, ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [publicProfile, setPublicProfile] = useState(true)

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.push("/login")
      return
    }

    const savedDarkMode = localStorage.getItem("darkMode") === "true"
    setDarkMode(savedDarkMode)
    if (savedDarkMode) {
      document.documentElement.classList.add("dark")
    }
  }, [user, isLoading, router])

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked)
    localStorage.setItem("darkMode", checked.toString())
    if (checked) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  if (isLoading || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] dark:bg-gray-900 pt-24 pb-12 transition-colors">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <Link href="/profile">
            <Button variant="ghost" className="mb-4 gap-2">
              <ChevronLeft className="h-4 w-4" />
              뒤로 가기
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">설정</h1>
          <p className="text-gray-600 dark:text-gray-400">앱 환경을 원하는 대로 조정하세요</p>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 p-3">
                  {darkMode ? (
                    <Moon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <Sun className="h-6 w-6 text-amber-600" />
                  )}
                </div>
                <div>
                  <Label htmlFor="dark-mode" className="text-lg font-semibold text-gray-900 dark:text-white">
                    다크 모드
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">배경을 어두운 색으로 변경합니다</p>
                </div>
              </div>
              <Switch id="dark-mode" checked={darkMode} onCheckedChange={handleDarkModeToggle} />
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 p-3">
                  <Bell className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <Label htmlFor="notifications" className="text-lg font-semibold text-gray-900 dark:text-white">
                    알림
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">새로운 활동에 대한 알림을 받습니다</p>
                </div>
              </div>
              <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 p-3">
                  <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <Label htmlFor="public-profile" className="text-lg font-semibold text-gray-900 dark:text-white">
                    공개 프로필
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">다른 사용자가 내 프로필을 볼 수 있습니다</p>
                </div>
              </div>
              <Switch id="public-profile" checked={publicProfile} onCheckedChange={setPublicProfile} />
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900 dark:to-pink-900 p-3">
                <Lock className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">개인정보 및 보안</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">비밀번호 변경 및 계정 관리</p>
              </div>
              <Button variant="outline" className="dark:border-gray-600 dark:text-white bg-transparent">
                관리하기
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900 dark:to-amber-900 p-3">
                <Palette className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">테마 설정</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">앱의 색상과 레이아웃을 커스터마이징</p>
              </div>
              <Button variant="outline" className="dark:border-gray-600 dark:text-white bg-transparent">
                변경하기
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
