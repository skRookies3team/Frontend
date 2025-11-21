"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import {
  Activity,
  Heart,
  Wind,
  Scale,
  TrendingUp,
  TrendingDown,
  Minus,
  Bell,
  Clock,
  LinkIcon,
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
} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, LineChart, Line } from "recharts"

const healthData = {
  heartRate: {
    current: 95,
    min: 75,
    max: 110,
    status: "normal",
    trend: "up",
    change: 5,
    lastUpdate: "5분 전",
  },
  respiratoryRate: {
    current: 28,
    min: 20,
    max: 35,
    status: "normal",
    trend: "stable",
    lastUpdate: "5분 전",
  },
  weight: {
    current: 12.5,
    previous: 12.3,
    status: "normal",
    trend: "up",
    change: 0.2,
    lastUpdate: "오늘 오전 8:00",
  },
  aiDiagnosis: {
    status: "healthy",
    confidence: 94,
    summary: "전반적으로 건강한 상태입니다",
    recommendations: ["규칙적인 산책 유지", "수분 섭취량 모니터링", "다음 주 건강검진 예약 권장"],
    lastUpdate: "1시간 전",
  },
}

const heartRateHistory = [
  { time: "00:00", value: 88 },
  { time: "04:00", value: 82 },
  { time: "08:00", value: 95 },
  { time: "12:00", value: 102 },
  { time: "16:00", value: 97 },
  { time: "20:00", value: 90 },
  { time: "24:00", value: 85 },
]

const respiratoryHistory = [
  { time: "00:00", value: 24 },
  { time: "04:00", value: 22 },
  { time: "08:00", value: 28 },
  { time: "12:00", value: 30 },
  { time: "16:00", value: 26 },
  { time: "20:00", value: 25 },
  { time: "24:00", value: 23 },
]

const weightHistory = [
  { date: "1주전", value: 12.0 },
  { date: "6일전", value: 12.1 },
  { date: "5일전", value: 12.2 },
  { date: "4일전", value: 12.2 },
  { date: "3일전", value: 12.3 },
  { date: "2일전", value: 12.4 },
  { date: "오늘", value: 12.5 },
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
  const router = useRouter()
  const [selectedChart, setSelectedChart] = useState<"heart" | "respiratory">("heart")
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month" | "6months">("today")
  const [showAIChat, setShowAIChat] = useState(false)
  const [aiChatMessage, setAiChatMessage] = useState("")
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [currentLogIndex, setCurrentLogIndex] = useState(0)

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-rose-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-green-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "normal":
      case "healthy":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            정상 ✅
          </Badge>
        )
      case "warning":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
            주의 ⚠️
          </Badge>
        )
      case "danger":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700">
            위험 🚨
          </Badge>
        )
      default:
        return null
    }
  }

  const handleConnectWithapet = () => {
    connectWithapet()
    setShowConnectModal(false)
  }

  const detectAnomaly = (current: number, baseline: number, stdDev: number) => {
    const zScore = Math.abs((current - baseline) / stdDev)
    if (zScore >= 2) return "danger"
    if (zScore >= 1.5) return "warning"
    return "normal"
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
      router.push("/")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  if (!user.withapetConnected) {
    return (
      <div className="min-h-screen bg-[#faf9f7]">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#f0ede6] flex items-center justify-center">
                <span className="text-5xl">🐕</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">Pet Healthcare Dashboard</h1>
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
      </div>
    )
  }

  const currentLog = healthDataHistory.dailyLogs[currentLogIndex]

  return (
    <div className="min-h-screen bg-[#faf9f7] pb-20">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#f0ede6] flex items-center justify-center text-3xl">🐕</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.pets[0].name} Health Dashboard</h1>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  실시간 모니터링 중
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 bg-white hover:bg-gray-50"
                onClick={() => setShowReportModal(true)}
              >
                <FileText className="h-4 w-4 mr-2" />
                월간 리포트
              </Button>
              <Button variant="outline" size="sm" className="border-gray-300 bg-white hover:bg-gray-50">
                <Bell className="h-4 w-4 mr-2" />
                알림
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            {["today", "week", "month", "6months"].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPeriod(period as any)}
                className={
                  selectedPeriod === period
                    ? "bg-gray-900 text-white hover:bg-gray-800"
                    : "text-gray-700 hover:bg-gray-100"
                }
              >
                {period === "today" && "오늘"}
                {period === "week" && "주간"}
                {period === "month" && "월간"}
                {period === "6months" && "6개월"}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border border-gray-200 shadow-sm bg-white">
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

              <Card className="border border-gray-200 shadow-sm bg-white">
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

            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#f0ede6] flex items-center justify-center">
                      <Activity className="h-6 w-6 text-gray-900" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-gray-900">AI 진단 결과</CardTitle>
                      <p className="text-xs text-gray-600 mt-0.5">30일 기준선 대비 분석</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#dcfce7] text-[#166534] border-0">건강</Badge>
                    <Badge className="bg-[#f0ede6] text-gray-900 border-0 font-semibold">
                      신뢰도 {healthData.aiDiagnosis.confidence}%
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-[#faf9f7] rounded-lg p-6">
                  <p className="text-2xl font-bold text-gray-900 mb-2">{healthData.aiDiagnosis.summary}</p>
                  <p className="text-sm text-gray-600">{user.pets[0].name}는 현재 건강한 상태를 유지하고 있어요</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-5">
                  <h4 className="font-semibold text-sm text-gray-900 mb-3">AI 권장사항</h4>
                  <ul className="space-y-2">
                    {healthData.aiDiagnosis.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-gray-400 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {healthData.aiDiagnosis.lastUpdate}
                  </div>
                  <Button
                    size="sm"
                    className="bg-gray-900 hover:bg-gray-800 text-white"
                    onClick={() => setShowAIChat(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    AI에게 질문하기
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
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: "11px" }} />
                      <YAxis stroke="#9ca3af" style={{ fontSize: "11px" }} domain={[11.5, 13]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          fontSize: "12px",
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
                  <CardTitle className="text-lg text-gray-900">24시간 기록</CardTitle>
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
                      <Heart className="h-4 w-4 mr-1" />
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
                      <Wind className="h-4 w-4 mr-1" />
                      호흡
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={selectedChart === "heart" ? heartRateHistory : respiratoryHistory}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: "12px" }} />
                      <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={selectedChart === "heart" ? "#dc2626" : "#2563eb"}
                        strokeWidth={2}
                        dot={{ fill: selectedChart === "heart" ? "#dc2626" : "#2563eb", r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
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

          <aside className="space-y-6">
            <Card className="border border-[#fca5a5] shadow-sm bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                  <div className="w-8 h-8 rounded-full bg-[#fee2e2] flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-[#dc2626]" />
                  </div>
                  <span>건강 알림</span>
                  <Badge className="bg-[#dc2626] text-white ml-auto border-0">{healthDataHistory.alerts.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {healthDataHistory.alerts.map((alert) => (
                  <div key={alert.id} className="border border-gray-200 rounded-lg bg-[#fef2f2] p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <AlertCircle className="h-5 w-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">{alert.title}</h4>
                        <p className="text-sm text-gray-700 mb-1">{alert.description}</p>
                        <p className="text-xs text-gray-600">지속 시간: {alert.duration}</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-900 mb-1">권장 조치:</p>
                      <p className="text-xs text-gray-700">{alert.recommendation}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-600">{alert.timestamp}</p>
                      <Button size="sm" className="h-7 text-xs bg-[#dc2626] hover:bg-[#b91c1c] text-white">
                        수의사 상담
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                  <MapPin className="h-5 w-5 text-gray-700" />
                  주요 이벤트
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {healthDataHistory.events.map((event, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f0ede6] flex items-center justify-center flex-shrink-0">
                      {event.icon === "syringe" && <Syringe className="h-5 w-5 text-gray-700" />}
                      {event.icon === "pill" && <Pill className="h-5 w-5 text-gray-700" />}
                      {event.icon === "stethoscope" && <Stethoscope className="h-5 w-5 text-gray-700" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{event.description}</p>
                      <p className="text-xs text-gray-600 mt-1">{event.date}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-base text-gray-900">사용 팁</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <p>건강 데이터는 5분마다 자동 업데이트됩니다</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <p>이상 징후는 30일 평균 기준선 대비 ±2σ 벗어날 때 감지됩니다</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <p>AI 챗봇에게 최근 건강 데이터 기반 맞춤 조언을 받을 수 있습니다</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <p>매월 1일 자동으로 월간 건강 리포트가 생성됩니다</p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {showAIChat && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-200 shadow-lg bg-white">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                  <BrainCircuit className="h-5 w-5 text-purple-600" />
                  AI 건강 상담
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
                    <li>• 심박수가 높아졌는데 병원 가야 할까요?</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm text-muted-foreground">
                    AI가 최근 3일간의 건강 데이터와 일기를 분석하여 맞춤 조언을 제공합니다.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <textarea
                  value={aiChatMessage}
                  onChange={(e) => setAiChatMessage(e.target.value)}
                  placeholder="건강 관련 질문을 입력하세요..."
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
                  <Button onClick={handleAIChat} className="bg-purple-600 hover:bg-purple-700">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    질문하기
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
              <div className="space-y-6">
                <div className="rounded-lg bg-[#f0ede6] p-4">
                  <h3 className="font-semibold text-sm text-gray-900 mb-2">리포트에 포함되는 내용:</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• 기간별 건강 지표 그래프 (심박수, 활동량, 수면, 체중)</li>
                    <li>• 주요 이벤트 타임라인 (병원 방문, 약 복용 등)</li>
                    <li>• AI 분석 요약 코멘트</li>
                    <li>• 관찰 필요 사항 및 권장사항</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-900">배포 방식을 선택하세요:</h4>
                  <div className="grid gap-3">
                    <Button
                      variant="outline"
                      className="justify-start h-auto py-4 bg-white border-gray-300"
                      onClick={() => generateMonthlyReport("pdf")}
                    >
                      <Download className="h-5 w-5 mr-3 text-blue-600" />
                      <div className="text-left">
                        <p className="font-semibold text-sm">PDF 다운로드</p>
                        <p className="text-xs text-gray-600">기기에 저장하여 보관</p>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="justify-start h-auto py-4 bg-white border-gray-300"
                      onClick={() => generateMonthlyReport("email")}
                    >
                      <Mail className="h-5 w-5 mr-3 text-green-600" />
                      <div className="text-left">
                        <p className="font-semibold text-sm">이메일 전송</p>
                        <p className="text-xs text-gray-600">등록된 이메일로 발송</p>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="justify-start h-auto py-4 bg-white border-gray-300"
                      onClick={() => generateMonthlyReport("vet")}
                    >
                      <Send className="h-5 w-5 mr-3 text-purple-600" />
                      <div className="text-left">
                        <p className="font-semibold text-sm">동물병원 직접 전송</p>
                        <p className="text-xs text-gray-600">등록된 동물병원으로 전송 (파트너십 병원만)</p>
                      </div>
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-gray-500 text-center pt-4 border-t">
                  매월 1일 자동으로 전월 리포트가 생성됩니다
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
