import type React from "react"

import { useState } from "react"
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Card, CardContent } from "@/shared/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { PawPrint, Upload, X, Sparkles, Dog, Cat, Rabbit, Bird, Fish, ChevronLeft } from 'lucide-react'
import { useAuth } from "@/features/auth/context/auth-context"

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
  "골든 리트리버",
  "그레이트 데인",
  "그레이하운드",
  "달마티안",
  "도베르만 핀셔",
  "래브라도 리트리버",
  "로데시안 리지백",
  "로트와일러",
  "말티즈",
  "말티푸",
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
  "노르웨이 숲", "데본 렉스", "랙돌", "러시안 블루", "먼치킨", "메인 쿤", "뱅갈",
  "버만", "브리티시 숏헤어", "샤미즈 (샴)", "스코티시 폴드", "스핑크스", "아비시니안",
  "아메리칸 숏헤어", "오리엔탈 숏헤어", "코니시 렉스", "코리안 숏헤어", "터키시 앙고라",
  "터키시 반", "페르시안", "히말라얀", "엑조틱 숏헤어", "기타"
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
    vaccinated: "",
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
    console.log("PetInfoPage: handleSubmit called", { user, returnTo, formData });

    // 이미 로그인된 사용자인 경우 (returnTo가 있으면 기존 사용자)
    if (user && returnTo) {
      console.log("PetInfoPage: processing as existing user");
      const createPetDto = {
        petName: formData.name,
        breed: formData.breed,
        genderType: formData.gender === "female" ? "FEMALE" : formData.gender === "male" ? "MALE" : "NONE",
        birth: formData.birthday,
        species: formData.species === "강아지" ? "DOG" : "CAT",
        neutered: formData.neutered === "yes",
        vaccinated: formData.vaccinated === "yes"
      }
      const fileInput = document.getElementById("photo") as HTMLInputElement;
      const petFile = fileInput?.files?.[0] || null;

      try {
        await addPet(createPetDto, petFile);
        navigate(returnTo)
      } catch (error) {
        console.error("Failed to add pet:", error);
      }
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

    // CreateUserDto
    const createUserDto = {
      email: userInfo.email,
      password: userInfo.password,
      username: userInfo.name,
      social: userInfo.username, // Mapped from frontend username field
      birth: userInfo.birthday,
      genderType: userInfo.gender === "female" ? "FEMALE" : userInfo.gender === "male" ? "MALE" : "NONE"
    }

    // CreatePetDto
    const createPetDto = {
      petName: formData.name,
      breed: formData.breed,
      genderType: formData.gender === "female" ? "FEMALE" : formData.gender === "male" ? "MALE" : "NONE",
      birth: formData.birthday, // LocalDate string format "YYYY-MM-DD" expected
      species: formData.species === "강아지" ? "DOG" : "CAT", // Simple mapping
      neutered: formData.neutered === "yes",
      vaccinated: formData.vaccinated === "yes"
    }

    // Pet Photo File
    const fileInput = document.getElementById("photo") as HTMLInputElement;
    const petFile = fileInput?.files?.[0] || null;

    // Call signup
    try {
      // console.log("petinfo page: signup start")
      // console.log(createUserDto);
      // console.log(createPetDto);
      // console.log(petFile);
      await signup(createUserDto, createPetDto, petFile);
      // Clean up sessionStorage
      sessionStorage.removeItem("signup_user_info")
      sessionStorage.removeItem("signup_credentials")
    } catch (e) {
      console.error(e)
      // Handle error (alert/toast)
    }
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

    // CreateUserDto for skip case
    const createUserDto = {
      email: userInfo.email,
      password: userInfo.password,
      username: userInfo.name,
      social: userInfo.username,
      birth: userInfo.birthday,
      genderType: userInfo.gender === "female" ? "FEMALE" : userInfo.gender === "male" ? "MALE" : "NONE"
    }

    // Complete signup without pet (pass null for petDto and petFile)
    try {
      await signup(createUserDto, null, null)

      // Clean up sessionStorage
      sessionStorage.removeItem("signup_user_info")
      sessionStorage.removeItem("signup_credentials")

      // Navigate to dashboard
      navigate("/dashboard")
    } catch (e) {
      console.error(e)
    }
  }

  const getBreedOptions = () => {
    if (formData.species === "강아지") return DOG_BREEDS
    if (formData.species === "고양이") return CAT_BREEDS
    return ["직접 입력"]
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-rose-50 px-6 py-12 pt-24">
      <div className="mx-auto max-w-md">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate(returnTo || "/profile")}
          className="mb-4 flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>뒤로가기</span>
        </button>

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
                    <SelectContent className="max-h-[300px] overflow-y-auto">
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

              <div className="space-y-2">
                <Label htmlFor="birthday">생일</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => {
                    const birthday = e.target.value
                    let calculatedAge = ""
                    if (birthday) {
                      const birthDate = new Date(birthday)
                      const today = new Date()
                      let years = today.getFullYear() - birthDate.getFullYear()
                      let months = today.getMonth() - birthDate.getMonth()

                      if (today.getDate() < birthDate.getDate()) {
                        months--
                      }
                      if (months < 0) {
                        years--
                        months += 12
                      }

                      if (years < 1) {
                        const totalMonths = years * 12 + months
                        calculatedAge = `${Math.max(0, totalMonths)}개월`
                      } else {
                        calculatedAge = years.toString()
                      }
                    }
                    setFormData({ ...formData, birthday, age: calculatedAge })
                  }}
                  className="rounded-xl border-pink-200"
                />
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

              <div className="space-y-3">
                <Label>예방접종 여부</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, vaccinated: "yes" })}
                    className={`rounded-xl border-2 p-3 text-sm font-medium transition-all ${formData.vaccinated === "yes"
                      ? "border-pink-500 bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                      : "border-pink-200 hover:border-pink-500"
                      }`}
                  >
                    했어요
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, vaccinated: "no" })}
                    className={`rounded-xl border-2 p-3 text-sm font-medium transition-all ${formData.vaccinated === "no"
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
