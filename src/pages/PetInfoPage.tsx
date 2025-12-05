import type React from "react"

import { useState } from "react"
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PawPrint, Upload, X, Sparkles, Dog, Cat, Rabbit, Bird, Fish } from 'lucide-react'
import { useAuth } from "@/lib/auth-context"

const ANIMAL_TYPES = [
  { id: "dog", label: "강아지", icon: Dog },
  { id: "cat", label: "고양이", icon: Cat },
  { id: "rabbit", label: "토끼", icon: Rabbit },
  { id: "hamster", label: "햄스터", icon: PawPrint },
  { id: "guinea-pig", label: "기니피그", icon: PawPrint },
  { id: "bird", label: "새", icon: Bird },
  { id: "fish", label: "물고기", icon: Fish },
  { id: "reptile", label: "파충류", icon: PawPrint },
  { id: "other", label: "기타", icon: PawPrint },
]

const DOG_BREEDS = [
  "골든 리트리버", "푸들", "웰시코기", "포메라니안", "치와와", "말티즈", "시바견",
  "비글", "불독", "요크셔테리어", "닥스훈트", "시츄", "기타"
]

const CAT_BREEDS = [
  "코리안 숏헤어", "페르시안", "러시안 블루", "브리티시 숏헤어", "샴", "스코티시 폴드",
  "뱅갈", "메인쿤", "아메리칸 숏헤어", "노르웨이 숲", "기타"
]

export default function PetInfoPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo')
  const { user, signup, addPet } = useAuth()
  const [photoPreview, setPhotoPreview] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiAnalysisComplete, setAiAnalysisComplete] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    gender: "",
    neutered: "",
    birthday: "",
  })

  const analyzePhoto = async (_file: File) => {
    setIsAnalyzing(true)

    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock AI results - in production, this would call an actual AI service
    const mockAnalysis = {
      species: "강아지",
      breed: "골든 리트리버",
      confidence: 0.92
    }

    setFormData(prev => ({
      ...prev,
      species: mockAnalysis.species,
      breed: mockAnalysis.breed
    }))

    setIsAnalyzing(false)
    setAiAnalysisComplete(true)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setPhotoPreview(reader.result as string)
        analyzePhoto(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prepare pet data
    const petData = {
      id: `pet-${Date.now()}`,
      name: formData.name,
      species: formData.species,
      breed: formData.breed,
      age: Number(formData.age),
      photo: photoPreview || "/placeholder.svg",
      gender: formData.gender,
      neutered: formData.neutered === "yes",
      birthday: formData.birthday,
    }

    // 이미 로그인된 사용자인 경우 (returnTo가 있으면 기존 사용자)
    if (user && returnTo) {
      addPet(petData)
      navigate(returnTo)
      return
    }

    // 회원가입 플로우인 경우
    const userInfoStr = sessionStorage.getItem("signup_user_info")
    if (!userInfoStr) {
      console.error("No user info found in session")
      navigate("/signup/info")
      return
    }

    const userInfo = JSON.parse(userInfoStr)

    // Complete signup with user info and pet data
    await signup({
      ...userInfo,
      pets: [petData],
    })

    // Clean up sessionStorage
    sessionStorage.removeItem("signup_user_info")
    sessionStorage.removeItem("signup_credentials")

    // Navigate to dashboard
    navigate("/dashboard")
  }

  const handleSkip = async () => {
    // 이미 로그인된 사용자인 경우
    if (user && returnTo) {
      navigate(returnTo)
      return
    }

    // 회원가입 플로우인 경우
    const userInfoStr = sessionStorage.getItem("signup_user_info")
    if (!userInfoStr) {
      console.error("No user info found in session")
      navigate("/signup/info")
      return
    }

    const userInfo = JSON.parse(userInfoStr)

    // Complete signup without pet
    await signup(userInfo)

    // Clean up sessionStorage
    sessionStorage.removeItem("signup_user_info")
    sessionStorage.removeItem("signup_credentials")

    // Navigate to dashboard
    navigate("/dashboard")
  }

  const getBreedOptions = () => {
    if (formData.species === "강아지") return DOG_BREEDS
    if (formData.species === "고양이") return CAT_BREEDS
    return ["직접 입력"]
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-rose-50 px-6 py-12 pt-24">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500">
            <PawPrint className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-balance text-3xl font-bold text-pink-600">반려동물을 소개해주세요</h1>
          <p className="mt-2 text-muted-foreground">사진을 업로드하면 AI가 자동으로 분석해드려요</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-pink-100 shadow-lg">
            <CardContent className="space-y-4 p-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold">반려동물 사진</Label>
                <div className="flex flex-col items-center gap-4">
                  {photoPreview ? (
                    <div className="relative">
                      <div className="h-40 w-40 overflow-hidden rounded-full border-4 border-pink-200">
                        <img
                          src={photoPreview || "/placeholder.svg"}
                          alt="Pet preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoPreview("")
                          setAiAnalysisComplete(false)
                          setFormData(prev => ({ ...prev, species: "", breed: "" }))
                        }}
                        className="absolute -top-2 -right-2 rounded-full bg-red-500 p-2 text-white shadow-lg hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {isAnalyzing && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                          <Sparkles className="h-8 w-8 animate-pulse text-white" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <label htmlFor="photo" className="cursor-pointer">
                      <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full border-4 border-dashed border-pink-300 bg-pink-50 transition-colors hover:border-pink-500 hover:bg-pink-100">
                        <Upload className="h-10 w-10 text-pink-400" />
                        <span className="mt-2 text-sm font-medium text-pink-600">사진 업로드</span>
                      </div>
                    </label>
                  )}
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                {isAnalyzing && (
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-pink-50 p-3 text-sm text-pink-700">
                    <Sparkles className="h-4 w-4 animate-spin" />
                    <span>AI가 사진을 분석하고 있어요...</span>
                  </div>
                )}

                {aiAnalysisComplete && (
                  <div className="flex items-start gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                    <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>AI 분석이 완료되었어요! 결과가 정확하지 않다면 아래에서 직접 수정할 수 있어요.</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="species" className="flex items-center gap-2">
                  종류
                  {aiAnalysisComplete && <span className="text-xs text-green-600">(AI 분석 완료)</span>}
                </Label>
                <Select
                  value={formData.species}
                  onValueChange={(value) => setFormData({ ...formData, species: value, breed: "" })}
                >
                  <SelectTrigger className="rounded-xl border-pink-200">
                    <SelectValue placeholder="종류를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {ANIMAL_TYPES.map((animal) => (
                      <SelectItem key={animal.id} value={animal.label}>
                        {animal.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="breed" className="flex items-center gap-2">
                  품종
                  {aiAnalysisComplete && <span className="text-xs text-green-600">(AI 분석 완료)</span>}
                </Label>
                {formData.species && (formData.species === "강아지" || formData.species === "고양이") ? (
                  <Select
                    value={formData.breed}
                    onValueChange={(value) => setFormData({ ...formData, breed: value })}
                  >
                    <SelectTrigger className="rounded-xl border-pink-200">
                      <SelectValue placeholder="품종을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {getBreedOptions().map((breed) => (
                        <SelectItem key={breed} value={breed}>
                          {breed}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="breed"
                    placeholder="품종을 입력하세요"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    className="rounded-xl border-pink-200"
                    required
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  placeholder="몽치"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="rounded-xl border-pink-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="age">나이</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="3"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="rounded-xl border-pink-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthday">생일</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    className="rounded-xl border-pink-200"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>성별</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: "male" })}
                    className={`rounded-xl border-2 p-3 text-sm font-medium transition-all ${formData.gender === "male"
                      ? "border-pink-500 bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                      : "border-pink-200 hover:border-pink-500"
                      }`}
                  >
                    수컷
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: "female" })}
                    className={`rounded-xl border-2 p-3 text-sm font-medium transition-all ${formData.gender === "female"
                      ? "border-pink-500 bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                      : "border-pink-200 hover:border-pink-500"
                      }`}
                  >
                    암컷
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <Label>중성화 여부</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, neutered: "yes" })}
                    className={`rounded-xl border-2 p-3 text-sm font-medium transition-all ${formData.neutered === "yes"
                      ? "border-pink-500 bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                      : "border-pink-200 hover:border-pink-500"
                      }`}
                  >
                    했어요
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, neutered: "no" })}
                    className={`rounded-xl border-2 p-3 text-sm font-medium transition-all ${formData.neutered === "no"
                      ? "border-pink-500 bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                      : "border-pink-200 hover:border-pink-500"
                      }`}
                  >
                    안 했어요
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleSkip}
              className="flex-1 rounded-full border-2 border-pink-500 bg-transparent text-pink-600 hover:bg-pink-50"
            >
              나중에 추가할게요
            </Button>
            <Button
              type="submit"
              size="lg"
              className="flex-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-base font-semibold shadow-lg hover:from-pink-600 hover:to-rose-600"
            >
              완료
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
