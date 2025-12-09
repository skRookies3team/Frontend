import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Card, CardContent } from "@/shared/ui/card"
import { User } from "lucide-react"
import { useAuth } from "@/features/auth/context/auth-context"

export default function UserInfoPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    nickname: "",
    age: "",
    gender: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (user) {
      const updatedUser = {
        ...user,
        name: formData.nickname,
      }
      localStorage.setItem("petlog_user", JSON.stringify(updatedUser))
    }

    navigate("/pet-info")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-rose-50 px-6 py-12 pt-24">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500">
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-balance text-3xl font-bold text-pink-600">당신을 소개해주세요</h1>
          <p className="mt-2 text-muted-foreground">프로필 정보를 입력해주세요</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-pink-100 shadow-lg">
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label htmlFor="nickname">닉네임 *</Label>
                <Input
                  id="nickname"
                  placeholder="사용할 닉네임을 입력하세요"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="rounded-xl border-pink-200 focus-visible:ring-pink-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">나이 *</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="예: 25"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="rounded-xl border-pink-200 focus-visible:ring-pink-500"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>성별 *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: "male" })}
                    className={`rounded-xl border-2 p-4 font-medium transition-all ${
                      formData.gender === "male"
                        ? "border-pink-500 bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                        : "border-pink-200 hover:border-pink-500"
                    }`}
                  >
                    남성
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: "female" })}
                    className={`rounded-xl border-2 p-4 font-medium transition-all ${
                      formData.gender === "female"
                        ? "border-pink-500 bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                        : "border-pink-200 hover:border-pink-500"
                    }`}
                  >
                    여성
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            size="lg"
            className="mt-8 w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-base font-semibold shadow-lg hover:from-pink-600 hover:to-rose-600"
          >
            다음
          </Button>
        </form>
      </div>
    </div>
  )
}
