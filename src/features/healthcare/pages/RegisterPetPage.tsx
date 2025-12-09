import type React from "react"

import { useState } from "react"
import { useNavigate } from 'react-router-dom'
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Card, CardContent } from "@/shared/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { ChevronLeft, Upload, X, Sparkles } from 'lucide-react'
import { useAuth } from "@/features/auth/context/auth-context"

const ANIMAL_TYPES = [
  { id: "dog", label: "강아지" },
  { id: "cat", label: "고양이" },
  { id: "rabbit", label: "토끼" },
  { id: "hamster", label: "햄스터" },
  { id: "guinea-pig", label: "기니피그" },
  { id: "bird", label: "새" },
  { id: "fish", label: "물고기" },
  { id: "reptile", label: "파충류" },
  { id: "other", label: "기타" },
]

const DOG_BREEDS = [
  "골든 리트리버",
  "그레이트 데인",
  "그레이하운드",
  "달마티안",
  "도베르만 핀셔",
  "래브라도 리트리버",
  "로데시안 리지백",
  "로트와일러",
  "말티즈",
  "미니어처 닥스훈트",
  "미니어처 슈나우저",
  "바센지",
  "바셋 하운드",
  "벨지안 셰퍼드 독",
  "보더 콜리",
  "보르조이",
  "보스턴 테리어",
  "복서",
  "불 마스티프",
  "불 테리어",
  "브리타니 스파니엘",
  "비글",
  "비숑 프리제",
  "사모예드",
  "살루키",
  "셔틀랜드 쉽독",
  "스코티시 테리어",
  "스탠더드 닥스훈트",
  "스탠더드 슈나우저",
  "시바견",
  "시베리안 허스키",
  "시추",
  "아메리칸 스태퍼드셔 테리어",
  "아이리시 워터 스패니얼",
  "아이리시 울프하운드",
  "아키타견",
  "아프간 하운드",
  "알래스칸 말라뮤트",
  "에어데일 테리어",
  "오스트레일리안 캐틀 독",
  "올드 잉글리시 쉽독",
  "와이마라너",
  "요크셔 테리어",
  "웨스트 하이랜드 화이트 테리어",
  "잉글리시 세터",
  "잉글리시 스프링어 스패니얼",
  "자이언트 슈나우저",
  "잭 러셀 테리어",
  "저먼 셰퍼드 독",
  "저먼 쇼트헤어드 포인터",
  "저먼 핀셔",
  "진돗개",
  "차우차우",
  "체서피크 베이 리트리버",
  "치와와",
  "카디건 웰시 코기",
  "카발리에 킹 찰스 스패니얼",
  "캐닌헨 닥스훈트",
  "코커 스패니얼",
  "퍼그",
  "펨브로크 웰시 코기",
  "포메라니안",
  "프렌치 불도그",
  "푸들",
  "파피용",
  "블러드하운드",
  "휘펫",
  "기타"
]

const CAT_BREEDS = [
  "코리안 숏헤어", "페르시안", "러시안 블루", "브리티시 숏헤어", "샴", "스코티시 폴드",
  "뱅갈", "메인쿤", "아메리칸 숏헤어", "노르웨이 숲", "기타"
]

export default function RegisterPetPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [step, setStep] = useState(1)
  const [photoPreview, setPhotoPreview] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiAnalysisComplete, setAiAnalysisComplete] = useState(false)
  const [petData, setPetData] = useState({
    name: "",
    species: "",
    breed: "",
    birthday: "",
    age: "",
    gender: "male",
    neutered: "no",
    photo: "",
  })

  const analyzePhoto = async (_file: File) => {
    setIsAnalyzing(true)

    await new Promise(resolve => setTimeout(resolve, 2000))

    const mockAnalysis = {
      species: "강아지",
      breed: "골든 리트리버",
      confidence: 0.92
    }

    setPetData(prev => ({
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
        const result = reader.result as string
        setPhotoPreview(result)
        setPetData(prev => ({ ...prev, photo: result }))
        analyzePhoto(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const getBreedOptions = () => {
    if (petData.species === "강아지") return DOG_BREEDS
    if (petData.species === "고양이") return CAT_BREEDS
    return ["직접 입력"]
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 3) {
      setStep(step + 1)
    } else {
      login("user@example.com", "password123")
      navigate("/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-rose-50 px-6 py-8">
      <div className="mx-auto max-w-md">
        <div className="mb-8 flex items-center justify-between">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="flex items-center text-pink-600 hover:text-pink-700">
              <ChevronLeft className="h-5 w-5" />
              <span className="ml-1 font-medium">이전</span>
            </button>
          )}
          <div className="ml-auto text-sm text-muted-foreground">Step {step} / 3</div>
        </div>

        <div className="mb-8 h-2 overflow-hidden rounded-full bg-pink-100">
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-balance text-3xl font-bold text-pink-600">반려동물 사진을 업로드하세요</h1>
                <p className="mt-2 text-muted-foreground">AI가 자동으로 종류와 품종을 분석해드려요</p>
              </div>

              <Card className="border-pink-100 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center gap-4">
                    {photoPreview ? (
                      <div className="relative">
                        <div className="h-48 w-48 overflow-hidden rounded-full border-4 border-pink-200">
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
                            setPetData(prev => ({ ...prev, photo: "", species: "", breed: "" }))
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
                        <div className="flex h-48 w-48 flex-col items-center justify-center rounded-full border-4 border-dashed border-pink-300 bg-pink-50 transition-colors hover:border-pink-500 hover:bg-pink-100">
                          <Upload className="h-12 w-12 text-pink-400" />
                          <span className="mt-3 text-base font-medium text-pink-600">사진 업로드</span>
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

                    {isAnalyzing && (
                      <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-pink-50 p-3 text-sm text-pink-700">
                        <Sparkles className="h-4 w-4 animate-spin" />
                        <span>AI가 사진을 분석하고 있어요...</span>
                      </div>
                    )}

                    {aiAnalysisComplete && (
                      <div className="flex w-full items-start gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                        <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span>AI 분석 완료! 다음 단계에서 종류와 품종을 확인하고 수정할 수 있어요.</span>
                      </div>
                    )}

                    <p className="text-center text-sm text-muted-foreground">
                      나중에 추가하거나 변경할 수 있어요
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-balance text-3xl font-bold text-pink-600">종류와 품종을 확인하세요</h1>
                <p className="mt-2 text-muted-foreground">
                  {aiAnalysisComplete ? "AI 분석 결과입니다. 수정이 필요하면 변경할 수 있어요" : "반려동물 정보를 입력해주세요"}
                </p>
              </div>

              <Card className="border-pink-100 shadow-lg">
                <CardContent className="space-y-4 p-6">
                  <div className="space-y-2">
                    <Label htmlFor="species" className="flex items-center gap-2">
                      종류
                      {aiAnalysisComplete && <span className="text-xs text-green-600">(AI 분석)</span>}
                    </Label>
                    <Select
                      value={petData.species}
                      onValueChange={(value) => setPetData({ ...petData, species: value, breed: "" })}
                    >
                      <SelectTrigger className="rounded-xl border-pink-200 focus-visible:ring-pink-500">
                        <SelectValue placeholder="종류를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
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
                      {aiAnalysisComplete && <span className="text-xs text-green-600">(AI 분석)</span>}
                    </Label>
                    {petData.species && (petData.species === "강아지" || petData.species === "고양이") ? (
                      <Select
                        value={petData.breed}
                        onValueChange={(value) => setPetData({ ...petData, breed: value })}
                      >
                        <SelectTrigger className="rounded-xl border-pink-200 focus-visible:ring-pink-500">
                          <SelectValue placeholder="품종을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent className="bg-white max-h-[300px] overflow-y-auto">
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
                        value={petData.breed}
                        onChange={(e) => setPetData({ ...petData, breed: e.target.value })}
                        className="rounded-xl border-pink-200 focus-visible:ring-pink-500"
                        required
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <Input
                      id="name"
                      placeholder="예: 초코"
                      value={petData.name}
                      onChange={(e) => setPetData({ ...petData, name: e.target.value })}
                      className="rounded-xl border-pink-200 focus-visible:ring-pink-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthday">생일</Label>
                    <Input
                      id="birthday"
                      type="date"
                      value={petData.birthday}
                      onChange={(e) => setPetData({ ...petData, birthday: e.target.value })}
                      className="rounded-xl border-pink-200 focus-visible:ring-pink-500"
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Gender & Neutered Status */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-balance text-3xl font-bold text-pink-600">
                  {petData.name || "반려동물"}에 대해 조금 더 알려주세요
                </h1>
                <p className="mt-2 text-muted-foreground">맞춤형 경험을 제공하기 위해 필요해요</p>
              </div>

              <Card className="border-pink-100 shadow-lg">
                <CardContent className="space-y-6 p-6">
                  <div className="space-y-3">
                    <Label>성별</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPetData({ ...petData, gender: "male" })}
                        className={`rounded-xl border-2 p-4 font-medium transition-all ${petData.gender === "male"
                          ? "border-pink-500 bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                          : "border-pink-200 hover:border-pink-500"
                          }`}
                      >
                        수컷
                      </button>
                      <button
                        type="button"
                        onClick={() => setPetData({ ...petData, gender: "female" })}
                        className={`rounded-xl border-2 p-4 font-medium transition-all ${petData.gender === "female"
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
                        onClick={() => setPetData({ ...petData, neutered: "yes" })}
                        className={`rounded-xl border-2 p-4 font-medium transition-all ${petData.neutered === "yes"
                          ? "border-pink-500 bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                          : "border-pink-200 hover:border-pink-500"
                          }`}
                      >
                        했어요
                      </button>
                      <button
                        type="button"
                        onClick={() => setPetData({ ...petData, neutered: "no" })}
                        className={`rounded-xl border-2 p-4 font-medium transition-all ${petData.neutered === "no"
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
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="mt-8 w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-base font-semibold shadow-lg hover:from-pink-600 hover:to-rose-600"
          >
            {step < 3 ? "계속" : "등록 완료"}
          </Button>
        </form>

        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => navigate("/dashboard")}
          className="mt-3 w-full rounded-full text-base font-medium text-muted-foreground hover:text-pink-600"
        >
          나중에 등록하기
        </Button>
      </div>
    </div>
  )
}
