"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, User } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function SignupPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nickname: "",
    age: "",
    gender: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 2) {
      setStep(2)
    } else {
      router.push("/register-pet")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-rose-50 px-6 py-8 pt-24">
      <div className="mx-auto max-w-md">
        <div className="mb-8 flex items-center justify-between">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="flex items-center text-pink-600 hover:text-pink-700">
              <ChevronLeft className="h-5 w-5" />
              <span className="ml-1 font-medium">이전</span>
            </button>
          )}
          <div className="ml-auto text-sm text-muted-foreground">Step {step} / 2</div>
        </div>

        <div className="mb-8 h-2 overflow-hidden rounded-full bg-pink-100">
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Account Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500">
                  <User className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-balance text-3xl font-bold text-pink-600">환영합니다!</h1>
                <p className="mt-2 text-muted-foreground">계정을 만들어 시작해보세요</p>
              </div>

              <Card className="border-pink-100 shadow-lg">
                <CardContent className="space-y-4 p-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="rounded-xl border-pink-200 focus-visible:ring-pink-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">비밀번호</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="8자 이상 입력"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="rounded-xl border-pink-200 focus-visible:ring-pink-500"
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: User Info */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-balance text-3xl font-bold text-pink-600">당신을 소개해주세요</h1>
                <p className="mt-2 text-muted-foreground">프로필 정보를 입력해주세요</p>
              </div>

              <Card className="border-pink-100 shadow-lg">
                <CardContent className="space-y-4 p-6">
                  <div className="space-y-2">
                    <Label htmlFor="nickname">닉네임</Label>
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
                    <Label htmlFor="age">나이</Label>
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
                    <Label>성별</Label>
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
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="mt-8 w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-base font-semibold shadow-lg hover:from-pink-600 hover:to-rose-600"
          >
            {step < 2 ? "계속" : "다음 단계"}
          </Button>

          {step === 1 && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              이미 계정이 있나요?{" "}
              <Link href="/login" className="font-medium text-pink-600 hover:underline">
                로그인
              </Link>
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
