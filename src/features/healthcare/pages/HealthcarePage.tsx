import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { motion } from "framer-motion"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { useAuth } from "@/features/auth/context/auth-context"
import {
  Activity,
  Heart,
  Wind,
  Scale,
  TrendingUp,
  Minus,
  Bell,
  Clock,
  Link as LinkIcon,
  Award,
  AlertCircle,
  Calendar,
  Download,
  Mail,
  Send,
  MessageSquare,
  FileText,
  MapPin,
  Pill,
  Syringe,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
  Sparkles,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, LineChart, Line } from "recharts"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs"
import PetInsurance from "../components/PetInsurance"
import { InlineVeterinarianChat } from "../components/InlineVeterinarianChat"
import { Check } from "lucide-react"

// 펫별 건강 데이터
const petHealthDataMap: Record<string, {
  healthData: typeof defaultHealthData,
  heartRateHistory: typeof defaultHeartRateHistory,
  respiratoryHistory: typeof defaultRespiratoryHistory,
  weightHistory: typeof defaultWeightHistory
}> = {
  "pet-1": {
    healthData: {
      heartRate: { current: 95, min: 75, max: 110, status: "normal", trend: "up", change: 5, lastUpdate: "5분 전" },
      respiratoryRate: { current: 28, min: 20, max: 35, status: "normal", trend: "stable", lastUpdate: "5분 전" },
      weight: { current: 12.5, previous: 12.3, status: "normal", trend: "up", change: 0.2, lastUpdate: "오늘 오전 8:00" },
      aiDiagnosis: { status: "healthy", confidence: 94, summary: "전반적으로 건강한 상태입니다", recommendations: ["규칙적인 산책 유지", "수분 섭취량 모니터링", "다음 주 건강검진 예약 권장"], lastUpdate: "1시간 전" },
    },
    heartRateHistory: [
      { time: "00:00", value: 88 }, { time: "04:00", value: 82 }, { time: "08:00", value: 95 },
      { time: "12:00", value: 102 }, { time: "16:00", value: 97 }, { time: "20:00", value: 90 }, { time: "24:00", value: 85 },
    ],
    respiratoryHistory: [
      { time: "00:00", value: 24 }, { time: "04:00", value: 22 }, { time: "08:00", value: 28 },
      { time: "12:00", value: 30 }, { time: "16:00", value: 26 }, { time: "20:00", value: 25 }, { time: "24:00", value: 23 },
    ],
    weightHistory: [
      { date: "1주전", value: 12.0 }, { date: "6일전", value: 12.1 }, { date: "5일전", value: 12.2 },
      { date: "4일전", value: 12.2 }, { date: "3일전", value: 12.3 }, { date: "2일전", value: 12.4 }, { date: "오늘", value: 12.5 },
    ],
  },
  "pet-2": {
    healthData: {
      heartRate: { current: 78, min: 60, max: 100, status: "normal", trend: "stable", change: 0, lastUpdate: "3분 전" },
      respiratoryRate: { current: 22, min: 15, max: 30, status: "normal", trend: "down", lastUpdate: "3분 전" },
      weight: { current: 8.2, previous: 8.0, status: "normal", trend: "up", change: 0.2, lastUpdate: "오늘 오전 9:00" },
      aiDiagnosis: { status: "healthy", confidence: 98, summary: "매우 건강한 상태입니다", recommendations: ["현재 식단 유지", "주 3회 산책 권장"], lastUpdate: "30분 전" },
    },
    heartRateHistory: [
      { time: "00:00", value: 72 }, { time: "04:00", value: 70 }, { time: "08:00", value: 78 },
      { time: "12:00", value: 85 }, { time: "16:00", value: 80 }, { time: "20:00", value: 75 }, { time: "24:00", value: 72 },
    ],
    respiratoryHistory: [
      { time: "00:00", value: 20 }, { time: "04:00", value: 18 }, { time: "08:00", value: 22 },
      { time: "12:00", value: 25 }, { time: "16:00", value: 23 }, { time: "20:00", value: 21 }, { time: "24:00", value: 19 },
    ],
    weightHistory: [
      { date: "1주전", value: 7.8 }, { date: "6일전", value: 7.9 }, { date: "5일전", value: 8.0 },
      { date: "4일전", value: 8.0 }, { date: "3일전", value: 8.1 }, { date: "2일전", value: 8.1 }, { date: "오늘", value: 8.2 },
    ],
  },
}

// 기본 데이터 (선택된 펫이 없을 때)
const defaultHealthData = {
  heartRate: { current: 95, min: 75, max: 110, status: "normal", trend: "up", change: 5, lastUpdate: "5분 전" },
  respiratoryRate: { current: 28, min: 20, max: 35, status: "normal", trend: "stable", lastUpdate: "5분 전" },
  weight: { current: 12.5, previous: 12.3, status: "normal", trend: "up", change: 0.2, lastUpdate: "오늘 오전 8:00" },
  aiDiagnosis: { status: "healthy", confidence: 94, summary: "전반적으로 건강한 상태입니다", recommendations: ["규칙적인 산책 유지", "수분 섭취량 모니터링", "다음 주 건강검진 예약 권장"], lastUpdate: "1시간 전" },
}

const defaultHeartRateHistory = [
  { time: "00:00", value: 88 }, { time: "04:00", value: 82 }, { time: "08:00", value: 95 },
  { time: "12:00", value: 102 }, { time: "16:00", value: 97 }, { time: "20:00", value: 90 }, { time: "24:00", value: 85 },
]

const defaultRespiratoryHistory = [
  { time: "00:00", value: 24 }, { time: "04:00", value: 22 }, { time: "08:00", value: 28 },
  { time: "12:00", value: 30 }, { time: "16:00", value: 26 }, { time: "20:00", value: 25 }, { time: "24:00", value: 23 },
]

const defaultWeightHistory = [
  { date: "1주전", value: 12.0 }, { date: "6일전", value: 12.1 }, { date: "5일전", value: 12.2 },
  { date: "4일전", value: 12.2 }, { date: "3일전", value: 12.3 }, { date: "2일전", value: 12.4 }, { date: "오늘", value: 12.5 },
]

const healthDataHistory = {
  dailyLogs: [
    {
      date: "11/14",
      activity: 3542,
      activityStatus: "normal",
      sleep: "12시간 5분",
      heartRate: 85,
      heartRateStatus: "normal",
      meals: 1,
      events: [],
    },
    {
      date: "11/13",
      activity: 2163,
      activityStatus: "low",
      sleep: "14시간 20분",
      heartRate: 118,
      heartRateStatus: "high",
      meals: 1,
      events: ["호흡병원 예방접종"],
    },
    // ... more historical data
  ],
  alerts: [
    {
      id: 1,
      type: "warning",
      title: "중요: 초코의 심박수가 평소보다 30% 높습니다",
      description: "현재: 118 bpm (평균: 85 bpm)",
      duration: "45분",
      recommendation: "물을 충분히 제공하고, 안정을 취하게 해주세요. 1시간 후에도 지속되면 수의사 상담을 권장합니다.",
      timestamp: "45분 전",
      date: "11/13",
    },
  ],
  events: [
    { date: "11/13", type: "vet", description: "호흡병원 예방접종", icon: "syringe" },
    { date: "11/10", type: "medication", description: "심장약 복용", icon: "pill" },
    { date: "11/05", type: "checkup", description: "정기 건강검진", icon: "stethoscope" },
  ],
}

export default function HealthcarePage() {
  const { user, connectWithapet } = useAuth()
  const navigate = useNavigate()
  const [selectedChart, setSelectedChart] = useState<"heart" | "respiratory">("heart")
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month" | "6months">("today")
  const [showAIChat, setShowAIChat] = useState(false)
  const [aiChatMessage, setAiChatMessage] = useState("")
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedPetId, setSelectedPetId] = useState<string>("")
  const [currentLogIndex, setCurrentLogIndex] = useState(0)

  // 선택된 펫 찾기
  const selectedPet = user?.pets?.find(pet => pet.id === selectedPetId) || user?.pets?.[0]

  // 펫 목록이 있으면 첫 번째 펫 선택
  useEffect(() => {
    if (user?.pets?.length && !selectedPetId) {
      setSelectedPetId(user.pets[0].id)
    }
  }, [user?.pets, selectedPetId])

  // 선택된 펫의 건강 데이터 가져오기
  const petData = petHealthDataMap[selectedPetId] || {
    healthData: defaultHealthData,
    heartRateHistory: defaultHeartRateHistory,
    respiratoryHistory: defaultRespiratoryHistory,
    weightHistory: defaultWeightHistory,
  }
  const { healthData, heartRateHistory, respiratoryHistory, weightHistory } = petData

  const handleConnectWithapet = () => {
    connectWithapet()
    setShowConnectModal(false)
  }

  const handleAIChat = () => {
    // Simulate AI response
    const response = `초코의 최근 3일 데이터를 확인했습니다.
- 오늘 활동량: 1,203걸음 (평균 3,500 대비 66% 감소)
- 수면 시간: 현재까지 10시간 (평소와 비슷)
- 심박수: 정상 범위

활동량이 평소보다 현저히 낮고 식욕도 떨어졌다면, 다음을 확인해보세요:
1. 날씨 변화나 스트레스 요인이 있는지
2. 배변 활동은 정상인지
3. 기력은 있는지 (꼬리를 흔드는지, 반응하는지)

내일까지 증상이 지속되거나 구토/설사가 동반되면 수의사 진료를 권장드립니다.

참고: 지난주에도 비슷한 패턴이 있었는데, 날씨가 추워지면서 1-2일간 활동량이 줄었다가 정상으로 돌아온 기록이 있습니다.`

    alert(response)
    setAiChatMessage("")
  }

  const generateMonthlyReport = (format: "pdf" | "email" | "vet") => {
    const message =
      format === "pdf"
        ? "월간 건강 리포트 PDF를 다운로드합니다..."
        : format === "email"
          ? "월간 건강 리포트를 이메일로 전송했습니다."
          : "동물병원에 건강 리포트를 전송했습니다."

    alert(message)
    setShowReportModal(false)
  }

  useEffect(() => {
    if (!user) {
      navigate("/")
    }
  }, [user, navigate])

  if (!user) {
    return null
  }

  const currentLog = healthDataHistory.dailyLogs[currentLogIndex]

  return (
    <div className="min-h-screen bg-[#faf9f7] pb-20">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <div>
               <h1 className="text-2xl font-bold text-gray-900 mb-1">헬스케어</h1>
               <p className="text-gray-500 text-sm">
                 <span className="font-semibold text-gray-900">{selectedPet?.name}</span>의 건강 상태를 관리하세요
               </p>
            </div>

            {/* Modern Pet Switcher */}
            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
              {user.pets && user.pets.length > 0 ? (
                user.pets.map((pet) => (
                  <button
                    key={pet.id}
                    onClick={() => setSelectedPetId(pet.id)}
                    className={`relative group flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 ${
                      selectedPetId === pet.id 
                        ? "bg-gray-900 text-white shadow-md scale-100" 
                        : "hover:bg-gray-50 text-gray-600 scale-95"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full overflow-hidden border-2 ${selectedPetId === pet.id ? "border-white/30" : "border-transparent"}`}>
                       {pet.photo ? (
                         <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs">🐕</div>
                       )}
                    </div>
                    <span className={`text-sm font-semibold ${selectedPetId === pet.id ? "text-white" : "text-gray-600"}`}>
                      {pet.name}
                    </span>
                    {selectedPetId === pet.id && (
                       <motion.div 
                         layoutId="active-pet-indicator"
                         className="absolute inset-0 border-2 border-gray-900 rounded-xl"
                         initial={false}
                         transition={{ type: "spring", stiffness: 500, damping: 30 }}
                       />
                    )}
                  </button>
                ))
              ) : (
                 <div className="px-4 py-2 text-sm text-gray-500">등록된 펫이 없습니다</div>
              )}
              
              <button className="w-10 h-10 flex items-center justify-center rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-colors">
                <span className="text-xl">+</span>
              </button>
            </div>
          </div>

          {/* TABS HEADER */}
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="w-full justify-start h-12 bg-transparent p-0 border-b border-gray-100 rounded-none space-x-6">
               <TabsTrigger 
                 value="dashboard" 
                 className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-gray-900 rounded-none px-0 pb-3 text-gray-500 data-[state=active]:text-gray-900 font-semibold text-base transition-all"
               >
                 건강 대시보드
               </TabsTrigger>
               <TabsTrigger 
                 value="insurance" 
                 className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-gray-900 rounded-none px-0 pb-3 text-gray-500 data-[state=active]:text-gray-900 font-semibold text-base transition-all"
               >
                 펫 보험
               </TabsTrigger>
            </TabsList>

            {/* DASHBOARD TAB */}
            <TabsContent value="dashboard" className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {!user.withapetConnected ? (
                  <div className="max-w-3xl mx-auto py-12">
                     <div className="text-center mb-12">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#f0ede6] flex items-center justify-center">
                        <span className="text-5xl">🐕</span>
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-3">Pet Healthcare Dashboard</h2>
                      <p className="text-lg text-gray-600">반려동물의 건강을 체계적으로 관리하세요</p>
                    </div>

                    <Card className="border border-gray-200 shadow-sm bg-white mb-6">
                      <CardContent className="p-8">
                        <div className="grid md:grid-cols-3 gap-8 mb-8">
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f0ede6] flex items-center justify-center">
                              <Heart className="h-8 w-8 text-gray-700" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">실시간 모니터링</h3>
                            <p className="text-sm text-gray-600">심박수, 호흡, 활동량</p>
                          </div>
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f0ede6] flex items-center justify-center">
                              <Activity className="h-8 w-8 text-gray-700" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">AI 분석</h3>
                            <p className="text-sm text-gray-600">건강 이상 징후 감지</p>
                          </div>
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f0ede6] flex items-center justify-center">
                              <FileText className="h-8 w-8 text-gray-700" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">건강 리포트</h3>
                            <p className="text-sm text-gray-600">월간 종합 리포트 생성</p>
                          </div>
                        </div>

                        <div className="bg-[#fef7e6] border border-[#f4d882] rounded-lg p-6 text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Award className="h-6 w-6 text-gray-900" />
                            <span className="text-2xl font-bold text-gray-900">+100 펫코인</span>
                          </div>
                          <p className="text-sm text-gray-700">연동 완료 보너스</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Button
                      size="lg"
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white h-14 text-base font-medium"
                      onClick={() => setShowConnectModal(true)}
                    >
                      <LinkIcon className="mr-2 h-5 w-5" />
                      withapet 연동하기
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Health Metrics (2/3 width) */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* 1. Health Score Card */}
                       <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white overflow-hidden relative">
                         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
                         <CardContent className="p-8 flex items-center justify-between relative z-10">
                            <div>
                               <h2 className="text-2xl font-bold mb-1">오늘의 건강 점수</h2>
                               <p className="text-indigo-100 mb-6">최근 7일간의 생체 데이터를 분석했습니다.</p>
                               <div className="flex gap-3">
                                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 px-3 py-1 backdrop-blur-md">
                                     심박수 정상
                                  </Badge>
                                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 px-3 py-1 backdrop-blur-md">
                                     활동량 우수
                                  </Badge>
                               </div>
                            </div>
                            <div className="text-center">
                               <div className="relative inline-flex items-center justify-center">
                                  <svg className="w-32 h-32 transform -rotate-90">
                                     <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-indigo-800/30" />
                                     <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={351.86} strokeDashoffset={351.86 - (351.86 * 98) / 100} className="text-white" strokeLinecap="round" />
                                  </svg>
                                  <span className="absolute text-4xl font-bold">98</span>
                               </div>
                               <p className="text-sm font-medium mt-2 text-indigo-100">매우 좋음</p>
                            </div>
                         </CardContent>
                       </Card>

                      {/* 2. Vital Signs Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all">
                          <CardHeader className="pb-2">
                             <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-red-50 rounded-xl">
                                   <Heart className="h-5 w-5 text-red-500" />
                                </div>
                                <span className="font-semibold text-gray-700">평균 심박수</span>
                             </div>
                          </CardHeader>
                          <CardContent>
                             <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-gray-900">{healthData.heartRate.current}</span>
                                <span className="text-sm text-gray-500">bpm</span>
                             </div>
                             <p className="text-xs text-green-600 mt-1 flex items-center">
                                <TrendingUp className="h-3 w-3 mr-1" /> 정상 범위 내
                             </p>
                          </CardContent>
                        </Card>

                        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all">
                          <CardHeader className="pb-2">
                             <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-50 rounded-xl">
                                   <Wind className="h-5 w-5 text-blue-500" />
                                </div>
                                <span className="font-semibold text-gray-700">호흡수</span>
                             </div>
                          </CardHeader>
                          <CardContent>
                             <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-gray-900">{healthData.respiratoryRate.current}</span>
                                <span className="text-sm text-gray-500">rpm</span>
                             </div>
                             <p className="text-xs text-green-600 mt-1 flex items-center">
                                <Check className="h-3 w-3 mr-1" /> 안정적
                             </p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* 3. Detailed Charts (Existing) */}
                      <Card className="border border-gray-200 shadow-sm bg-white">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg text-gray-900">24시간 바이탈 변화</CardTitle>
                            <div className="flex gap-2">
                              <Button
                                variant={selectedChart === "heart" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedChart("heart")}
                                className={
                                  selectedChart === "heart"
                                    ? "bg-gray-900 text-white hover:bg-gray-800"
                                    : "border-gray-300 bg-white hover:bg-gray-50"
                                }
                              >
                                심장
                              </Button>
                              <Button
                                variant={selectedChart === "respiratory" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedChart("respiratory")}
                                className={
                                  selectedChart === "respiratory"
                                    ? "bg-gray-900 text-white hover:bg-gray-800"
                                    : "border-gray-300 bg-white hover:bg-gray-50"
                                }
                              >
                                호흡
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={selectedChart === "heart" ? heartRateHistory : respiratoryHistory}
                                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                <XAxis dataKey="time" stroke="#9ca3af" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "white",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                                  }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="value"
                                  stroke={selectedChart === "heart" ? "#dc2626" : "#2563eb"}
                                  strokeWidth={2}
                                  dot={{ fill: selectedChart === "heart" ? "#dc2626" : "#2563eb", r: 3 }}
                                  activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Period Selection */}
                      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                        {["today", "week", "month", "6months"].map((period) => (
                          <Button
                            key={period}
                            variant={selectedPeriod === period ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setSelectedPeriod(period as any)}
                            className={
                              selectedPeriod === period
                                ? "bg-gray-900 text-white hover:bg-gray-800 rounded-full px-4"
                                : "text-gray-600 hover:bg-gray-100 rounded-full px-4"
                            }
                          >
                            {period === "today" && "오늘"}
                            {period === "week" && "주간"}
                            {period === "month" && "월간"}
                            {period === "6months" && "6개월"}
                          </Button>
                        ))}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Card className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#fee2e2] flex items-center justify-center">
                                  <Heart className="h-5 w-5 text-[#dc2626]" />
                                </div>
                                <CardTitle className="text-base font-semibold text-gray-900">분당 심박수</CardTitle>
                              </div>
                              <Badge className="bg-[#dcfce7] text-[#166534] border-0">정상</Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-baseline gap-2 mb-4">
                              <span className="text-5xl font-bold text-gray-900">{healthData.heartRate.current}</span>
                              <span className="text-xl text-gray-600">bpm</span>
                              <div className="ml-auto flex items-center gap-1">
                                <TrendingUp className="h-4 w-4 text-[#dc2626]" />
                                <span className="text-sm font-medium text-[#dc2626]">+{healthData.heartRate.change}%</span>
                              </div>
                            </div>
                            <div className="bg-[#faf9f7] rounded-lg p-3 space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">정상 범위</span>
                                <span className="font-medium text-gray-900">
                                  {healthData.heartRate.min}-{healthData.heartRate.max} bpm
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {healthData.heartRate.lastUpdate}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#dbeafe] flex items-center justify-center">
                                  <Wind className="h-5 w-5 text-[#2563eb]" />
                                </div>
                                <CardTitle className="text-base font-semibold text-gray-900">호흡수 (분당)</CardTitle>
                              </div>
                              <Badge className="bg-[#dcfce7] text-[#166534] border-0">정상</Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-baseline gap-2 mb-4">
                              <span className="text-5xl font-bold text-gray-900">{healthData.respiratoryRate.current}</span>
                              <span className="text-xl text-gray-600">rpm</span>
                              <div className="ml-auto">
                                <Minus className="h-4 w-4 text-gray-400" />
                              </div>
                            </div>
                            <div className="bg-[#faf9f7] rounded-lg p-3 space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">정상 범위</span>
                                <span className="font-medium text-gray-900">
                                  {healthData.respiratoryRate.min}-{healthData.respiratoryRate.max} rpm
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {healthData.respiratoryRate.lastUpdate}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <Card className="border border-gray-200 shadow-sm bg-white overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-[#f0ede6] flex items-center justify-center shadow-inner">
                                <Activity className="h-6 w-6 text-gray-900" />
                              </div>
                              <div>
                                <CardTitle className="text-lg text-gray-900">AI 정밀 진단</CardTitle>
                                <p className="text-xs text-gray-600 mt-0.5">30일 기준선 대비 분석 결과</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-[#dcfce7] text-[#166534] border-0 px-3 py-1">건강 양호</Badge>
                              <Badge className="bg-[#f0ede6] text-gray-900 border-0 font-semibold px-3 py-1">
                                신뢰도 {healthData.aiDiagnosis.confidence}%
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                          <div className="bg-[#faf9f7] rounded-xl p-6 border border-gray-100">
                            <div className="flex items-start gap-4">
                                <BrainCircuit className="h-8 w-8 text-purple-600 flex-shrink-0" />
                                <div>
                                    <p className="text-xl font-bold text-gray-900 mb-2 leading-relaxed">{healthData.aiDiagnosis.summary}</p>
                                    <p className="text-sm text-gray-600">{user.pets[0].name}는 현재 건강한 상태를 유지하고 있어요</p>
                                </div>
                            </div>
                          </div>
                          <div className="border border-gray-200 rounded-xl p-5 bg-white">
                            <h4 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-yellow-500" />
                                AI 권장사항
                            </h4>
                            <ul className="space-y-2">
                              {healthData.aiDiagnosis.recommendations.map((rec, idx) => (
                                <li key={idx} className="text-sm text-gray-700 flex items-start gap-3 bg-gray-50 p-2 rounded-lg">
                                  <span className="text-purple-500 mt-0.5 font-bold">✓</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              최근 업데이트: {healthData.aiDiagnosis.lastUpdate}
                            </div>
                            <Button
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all"
                              onClick={() => setShowAIChat(true)}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              AI 수의사에게 질문하기
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-gray-200 shadow-sm bg-white">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#e0f2fe] flex items-center justify-center">
                                <Scale className="h-5 w-5 text-[#0284c7]" />
                              </div>
                              <CardTitle className="text-base font-semibold text-gray-900">몸무게</CardTitle>
                            </div>
                            <Badge className="bg-[#dcfce7] text-[#166534] border-0">정상</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">현재 체중</p>
                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-gray-900">{healthData.weight.current}</span>
                                <span className="text-lg text-gray-600">kg</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">변화량</p>
                              <div className="flex items-baseline gap-2">
                                <TrendingUp className="h-4 w-4 text-[#22c55e] mt-1" />
                                <span className="text-2xl font-bold text-[#22c55e]">+{healthData.weight.change}</span>
                                <span className="text-sm text-gray-600">kg</span>
                              </div>
                            </div>
                          </div>
                          <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={weightHistory}>
                                <defs>
                                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} domain={[11.5, 13]} axisLine={false} tickLine={false} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "white",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                                  }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} fill="url(#colorWeight)" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-gray-200 shadow-sm bg-white">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                              <Calendar className="h-5 w-5" />
                              일별 건강 기록
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 border-gray-300 bg-transparent"
                                onClick={() => setCurrentLogIndex(Math.max(0, currentLogIndex - 1))}
                                disabled={currentLogIndex === 0}
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 border-gray-300 bg-transparent"
                                onClick={() =>
                                  setCurrentLogIndex(Math.min(healthDataHistory.dailyLogs.length - 1, currentLogIndex + 1))
                                }
                                disabled={currentLogIndex === healthDataHistory.dailyLogs.length - 1}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold text-gray-900">{currentLog.date} (목)</h3>
                              <Badge
                                className={
                                  currentLog.activityStatus === "normal"
                                    ? "bg-[#dcfce7] text-[#166534] border-0"
                                    : "bg-[#fef3c7] text-[#92400e] border-0"
                                }
                              >
                                {currentLog.activityStatus === "normal" ? "목표 달성" : "목표 미달"}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-[#faf9f7] rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">활동량</p>
                                <p className="text-2xl font-bold text-gray-900">{currentLog.activity.toLocaleString()}</p>
                                <p className="text-xs text-gray-600">걸음</p>
                              </div>
                              <div className="bg-[#faf9f7] rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">수면</p>
                                <p className="text-2xl font-bold text-gray-900">{currentLog.sleep}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-[#faf9f7] rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-2">심박수</p>
                                <p className="text-2xl font-bold text-gray-900 mb-2">{currentLog.heartRate} bpm</p>
                                <Badge
                                  className={
                                    currentLog.heartRateStatus === "normal"
                                      ? "bg-[#dcfce7] text-[#166534] border-0"
                                      : "bg-[#fee2e2] text-[#991b1b] border-0"
                                  }
                                >
                                  {currentLog.heartRateStatus === "normal" ? "정상" : "높음"}
                                </Badge>
                              </div>
                              <div className="bg-[#faf9f7] rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">매끼</p>
                                <p className="text-lg font-semibold text-gray-900">정상 섭취</p>
                                <p className="text-sm text-gray-600">{currentLog.meals}시간</p>
                              </div>
                            </div>

                            {currentLog.events.length > 0 && (
                              <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold text-sm text-gray-900 mb-2">이벤트</h4>
                                <ul className="space-y-1">
                                  {currentLog.events.map((event, idx) => (
                                    <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                                      <Syringe className="h-4 w-4 text-gray-500" />
                                      {event}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Right Column: Inline Chatbot (1/3 width, Sticky) */}
                    <div className="lg:col-span-1">
                       <div className="sticky top-24 space-y-6">
                          <InlineVeterinarianChat />
                          
                          {/* Quick Actions / Tips */}
                          <Card className="bg-[#f0f9ff] border-blue-100 shadow-sm">
                             <CardContent className="p-4">
                                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                   <Sparkles className="h-4 w-4 text-blue-500" />
                                   오늘의 건강 팁
                                </h4>
                                <p className="text-sm text-blue-800 leading-relaxed">
                                   환절기에는 호흡기 질환에 주의하세요. 실내 습도를 50-60%로 유지하는 것이 좋습니다.
                                </p>
                             </CardContent>
                          </Card>
                       </div>
                    </div>
                  </div>
                )}
            </TabsContent>

            {/* INSURANCE TAB */}
            <TabsContent value="insurance" className="mt-6">
                <div className="container mx-auto">
                    <PetInsurance />
                </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {showConnectModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full border border-gray-200 shadow-lg bg-white">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl text-gray-900">연동 프로세스</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0 font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">withapet 앱 설치</h4>
                    <p className="text-sm text-gray-600">앱 스토어에서 다운로드</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0 font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">웨어러블 기기 페어링</h4>
                    <p className="text-sm text-gray-600">블루투스 연결</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0 font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">데이터 연동 승인</h4>
                    <p className="text-sm text-gray-600">PetConnect 권한 허용</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-300 bg-transparent"
                  onClick={() => setShowConnectModal(false)}
                >
                  나중에
                </Button>
                <Button className="flex-1 bg-gray-900 hover:bg-gray-800 text-white" onClick={handleConnectWithapet}>
                  연동 완료
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AIChat Modal (kept for legacy internal AI Chat button, though FloatingChatbot covers it) */}
      {showAIChat && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-200 shadow-lg bg-white">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                  <BrainCircuit className="h-5 w-5 text-purple-600" />
                  AI 건강 상담 (간편 진단)
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowAIChat(false)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4 mb-6">
                <div className="rounded-lg bg-[#f0ede6] p-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">예시 질문:</p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• 우리 강아지 오늘 잘 안 먹는데 괜찮을까요?</li>
                    <li>• 최근 활동량이 줄어든 이유가 뭘까요?</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <textarea
                  value={aiChatMessage}
                  onChange={(e) => setAiChatMessage(e.target.value)}
                  placeholder="증상을 입력하세요..."
                  className="w-full min-h-[100px] p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    className="border-gray-300 bg-transparent"
                    onClick={() => setShowAIChat(false)}
                  >
                    취소
                  </Button>
                  <Button onClick={handleAIChat} className="bg-purple-600 hover:bg-purple-700 text-white">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    진단받기
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full border border-gray-200 shadow-lg bg-white">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                  <FileText className="h-5 w-5 text-purple-600" />
                  월간 건강 리포트 생성
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowReportModal(false)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
               {/* Modal Content... omitted for brevity but logic works same as before */}
               <div className="space-y-6">
                 <div className="space-y-3">
                   <h4 className="font-semibold text-sm text-gray-900">배포 방식:</h4>
                   <Button variant="outline" className="w-full justify-start h-auto py-3" onClick={() => generateMonthlyReport("pdf")}>
                     <Download className="h-5 w-5 mr-3 text-blue-600" /> PDF 다운로드
                   </Button>
                   <Button variant="outline" className="w-full justify-start h-auto py-3" onClick={() => generateMonthlyReport("email")}>
                     <Mail className="h-5 w-5 mr-3 text-green-600" /> 이메일 전송
                   </Button>
                   <Button variant="outline" className="w-full justify-start h-auto py-3" onClick={() => generateMonthlyReport("vet")}>
                     <Send className="h-5 w-5 mr-3 text-purple-600" /> 동물병원 전송
                   </Button>
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
