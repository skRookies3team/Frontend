import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Card, CardContent } from "@/shared/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { PawPrint, Upload, X, Sparkles, Dog, Cat, Rabbit, Bird, Fish, ChevronLeft } from 'lucide-react'
import { useAuth } from "@/features/auth/context/auth-context"
import { getPetApi, updatePetApi } from "@/features/healthcare/api/pet-api"
import { analyzeAnimalApi } from "@/features/auth/api/auth-api"

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
    "골든 리트리버", "그레이트 데인", "그레이하운드", "달마티안", "도베르만 핀셔", "래브라도 리트리버", "로데시안 리지백", "로트와일러", "말티즈", "미니어처 닥스훈트", "미니어처 슈나우저", "바센지", "바셋 하운드", "벨지안 셰퍼드 독", "보더 콜리", "보르조이", "보스턴 테리어", "복서", "불 마스티프", "불 테리어", "브리타니 스파니엘", "비글", "비숑 프리제", "사모예드", "살루키", "셔틀랜드 쉽독", "스코티시 테리어", "스탠더드 닥스훈트", "스탠더드 슈나우저", "시바견", "시베리안 허스키", "시추", "아메리칸 스태퍼드셔 테리어", "아이리시 워터 스패니얼", "아이리시 울프하운드", "아키타견", "아프간 하운드", "알래스칸 말라뮤트", "에어데일 테리어", "오스트레일리안 캐틀 독", "올드 잉글리시 쉽독", "와이마라너", "요크셔 테리어", "웨스트 하이랜드 화이트 테리어", "잉글리시 세터", "잉글리시 스프링어 스패니얼", "자이언트 슈나우저", "잭 러셀 테리어", "저먼 셰퍼드 독", "저먼 쇼트헤어드 포인터", "저먼 핀셔", "진돗개", "차우차우", "체서피크 베이 리트리버", "치와와", "카디건 웰시 코기", "카발리에 킹 찰스 스패니얼", "캐닌헨 닥스훈트", "코커 스패니얼", "퍼그", "펨브로크 웰시 코기", "포메라니안", "프렌치 불도그", "푸들", "파피용", "블러드하운드", "휘펫", "기타"
]


const CAT_BREEDS = [
    "노르웨이 숲", "데본 렉스", "랙돌", "러시안 블루", "먼치킨", "메인 쿤", "뱅갈", "버만", "브리티시 숏헤어", "샤미즈", "스코티시 폴드", "스핑크스", "아비시니안", "아메리칸 숏헤어", "오리엔탈 숏헤어", "코니시 렉스", "코리안 숏헤어", "터키시 앙고라", "터키시 반", "페르시안", "히말라얀", "엑조틱 숏헤어", "기타"
]

const RABBIT_BREEDS = [
    "네덜란드 드워프", "미니 렉스", "렉스", "홀랜드 롭", "미니 롭", "프렌치 롭", "잉글리시 롭", "라이언헤드", "저지 울리", "앵고라", "저먼 앵고라", "프렌치 앵고라", "사틴 앵고라", "미니 사틴", "사틴", "하바나", "캘리포니안", "뉴질랜드 화이트", "플레미시 자이언트", "체커드 자이언트", "실버 마틴", "친칠라", "잉글리시 스팟", "더치", "히말라얀", "폴리시", "아메리칸 퍼지 롭", "기타"
]

const HAMSTER_BREEDS = [
    "골든 햄스터", "테디베어 햄스터", "블랙 햄스터", "판다 햄스터", "드워프 햄스터", "정글리안 햄스터", "캠벨 햄스터", "로보로브스키 햄스터", "차이니즈 햄스터", "기타"
]

const BIRD_BREEDS = [
    "앵무새", "잉꼬", "모란앵무", "코뉴어", "왕관앵무", "사랑앵무", "퀘이커앵무", "카이큐", "아마존앵무", "회색앵무", "마코앵무", "사랑새", "문조", "자바참새", "카나리아", "핀치", "금화조", "십자매", "벵갈리즈 핀치", "비둘기", "집비둘기", "공작비둘기", "메추리", "닭", "기타"
]

const GUINEAPIG_BREEDS = [
    "아메리칸", "아비시니안", "페루비안", "셀프 실키", "코로넷", "텍셀", "메리노", "루키아", "화이트 크레스티드", "크레스티드", "테디", "렉스", "발드윈", "스키니", "기타"
]

const REPTILE_BREEDS = [
    "레오파드게코", "크레스티드게코", "토케이게코", "리프테일게코", "비어디드래곤", "블루텅 스킨크", "그린 아놀", "유로메스틱스", "카멜레온", "볼파이톤", "콘스네이크", "킹스네이크", "밀크스네이크", "호그노즈스네이크", "가터스네이크", "러시안 토터스", "레오파드육지거북", "설카타육지거북", "레드이어슬라이더", "머스크터틀", "맵터틀", "기타"
]

const FISH_BREEDS = [
    "금붕어", "구피", "플래티", "몰리", "소드테일", "베타", "제브라 다니오", "화이트 클라우드 마운틴 미노우", "네온테트라", "카디널 테트라", "블랙테트라", "엠버테트라", "라스보라", "하렘테트라", "엔젤피시", "디스커스", "구라미", "시클리드", "코리도라스", "플레코", "오토싱클루스", "로치", "니모", "블루탱", "옐로우탱", "만다린피시", "라이언피시", "엔젤피시", "버터플라이피시", "복어", "나이프피시", "아처피시", "바이칼 엔젤", "스팅레이", "기타"
]

// Helper for Species Mapping
const SPECIES_MAP: Record<string, string> = {
    "DOG": "강아지",
    "CAT": "고양이",
    "RABBIT": "토끼",
    "HAMSTER": "햄스터",
    "BIRD": "새",
    "GUINEAPIG": "기니피그",
    "REPTILE": "파충류",
    "FISH": "물고기",
    "ETC": "기타"
}

// Reverse mapping helper
const REVERSE_SPECIES_MAP: Record<string, string> = Object.entries(SPECIES_MAP).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
}, {} as Record<string, string>);

const ETC_BREEDS = [
    "기타"
]



export default function PetEditPage() {
    const navigate = useNavigate()
    const params = useParams()
    const [searchParams] = useSearchParams()
    const returnTo = searchParams.get('returnTo') || '/profile'
    const { user, updatePet } = useAuth()
    const petId = params.id as string

    const [photoPreview, setPhotoPreview] = useState<string>("")
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [aiAnalysisComplete, setAiAnalysisComplete] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
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

    useEffect(() => {
        const fetchPetData = async () => {
            console.log("PetEditPage: Fetching data for petId:", petId)
            if (!petId) return

            // 2. Fallback to API
            try {
                setIsLoading(true)
                const apiPet = await getPetApi(Number(petId))
                console.log(apiPet.species)
                const speciesKey = String(apiPet.species).toUpperCase().trim()
                const speciesLabel = SPECIES_MAP[speciesKey] || "기타"
                setFormData({
                    name: apiPet.petName,
                    species: speciesLabel,
                    breed: apiPet.breed,
                    age: String(apiPet.age),
                    gender: apiPet.genderType === "MALE" ? "male" : "female",
                    neutered: apiPet.neutered ? "yes" : "no",
                    birthday: apiPet.birth || "",
                    vaccinated: apiPet.vaccinated ? "yes" : "no",
                })
                setPhotoPreview(apiPet.profileImage)
            } catch (error) {
                console.error("Failed to fetch pet:", error)
                // navigate("/profile")
            } finally {
                setIsLoading(false)
            }
        }

        fetchPetData()
    }, [user, petId, navigate])

    const analyzePhoto = async (file: File) => {
        setIsAnalyzing(true)
        try {
            const result = await analyzeAnimalApi(file)

            // Map API species to frontend label
            // Map API species to frontend label
            const speciesLabel = SPECIES_MAP[result.species] || "기타"

            setFormData(prev => ({
                ...prev,
                species: speciesLabel,
                breed: result.breed
            }))
            setAiAnalysisComplete(true)
        } catch (error) {
            console.error("Failed to analyze pet photo:", error)
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
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

        try {
            setIsLoading(true)
            await updatePetApi(Number(petId), {
                petName: formData.name,
                breed: formData.breed,
                genderType: formData.gender === "male" ? "MALE" : "FEMALE",
                age: Number(formData.age),
                birth: formData.birthday,
                species: (REVERSE_SPECIES_MAP[formData.species] || "ETC") as any,
                neutered: formData.neutered === "yes",
                vaccinated: formData.vaccinated === "yes"
            }, selectedFile)

            // Local state update fallback (optional, if context acts as cache)
            updatePet(petId, {
                name: formData.name,
                species: formData.species,
                breed: formData.breed,
                age: formData.age,
                photo: photoPreview || "/placeholder.svg",
                gender: formData.gender === "male" ? "남아" : "여아",
                neutered: formData.neutered === "yes",
                birthday: formData.birthday,
                healthStatus: {
                    lastCheckup: user?.pets.find(p => p.id === petId)?.healthStatus?.lastCheckup || "-",
                    weight: user?.pets.find(p => p.id === petId)?.healthStatus?.weight || "정상",
                    vaccination: formData.vaccinated === "yes" ? "접종 완료" : "미접종"
                }
            })

            navigate(`/profile/pet/${petId}?returnTo=${encodeURIComponent(returnTo)}`)
        } catch (error) {
            console.error("Failed to update pet:", error)
            alert("정보 수정에 실패했습니다.")
        } finally {
            setIsLoading(false)
        }
    }

    const getBreedOptions = () => {
        let options: string[] = []
        if (formData.species === "강아지") options = DOG_BREEDS
        else if (formData.species === "고양이") options = CAT_BREEDS
        else if (formData.species === "토끼") options = RABBIT_BREEDS
        else if (formData.species === "햄스터") options = HAMSTER_BREEDS
        else if (formData.species === "새") options = BIRD_BREEDS
        else if (formData.species === "기니피그") options = GUINEAPIG_BREEDS
        else if (formData.species === "파충류") options = REPTILE_BREEDS
        else if (formData.species === "물고기") options = FISH_BREEDS
        else if (formData.species === "기타") options = ETC_BREEDS
        else options = ["직접 입력"]

        // If current breed is not in the options (e.g. from AI or legacy/custom data), add it
        if (formData.breed && !options.includes(formData.breed) && formData.breed !== "직접 입력") {
            return [formData.breed, ...options]
        }
        return options
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <Sparkles className="h-8 w-8 animate-spin text-pink-500" />
                    <p className="text-pink-600 font-medium">반려동물 정보를 불러오는 중...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-rose-50 px-6 py-12 pt-24">
            <div className="mx-auto max-w-md">
                <div className="mb-8 text-center relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-0 top-0 -translate-y-1/2"
                        onClick={() => navigate(`/profile/pet/${petId}?returnTo=${encodeURIComponent(returnTo)}`)}
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500">
                        <PawPrint className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-balance text-3xl font-bold text-pink-600">반려동물 정보 수정</h1>
                    <p className="mt-2 text-muted-foreground">반려동물의 정보를 최신으로 유지해주세요</p>
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
                                {formData.species && (
                                    formData.species === "강아지" ||
                                    formData.species === "고양이" ||
                                    formData.species === "토끼" ||
                                    formData.species === "햄스터" ||
                                    formData.species === "새" ||
                                    formData.species === "기니피그" ||
                                    formData.species === "파충류" ||
                                    formData.species === "물고기" ||
                                    formData.species === "기타"
                                ) ? (
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
                            onClick={() => navigate(-1)}
                            className="flex-1 rounded-full border-2 border-pink-500 bg-transparent text-pink-600 hover:bg-pink-50"
                        >
                            취소
                        </Button>
                        <Button
                            type="submit"
                            size="lg"
                            className="flex-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-base font-semibold shadow-lg hover:from-pink-600 hover:to-rose-600"
                        >
                            저장하기
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
