import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { motion } from "framer-motion"
import { useAuth } from "@/features/auth/context/auth-context"
import { Badge } from "@/shared/ui/badge"
import PetInsurance from "../components/PetInsurance"
import { ManualHealthEntry } from "../components/ManualHealthEntry"
import {
  Wind,
  Scale,
  Stethoscope,
  Sparkles,
  Activity,
  FileText,
  RefreshCw,
  Download
} from "lucide-react"
import { useState, useEffect } from "react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs"
import { InlineVeterinarianChat } from "../components/InlineVeterinarianChat"
import AiDiagnosis from "../components/AiDiagnosis"
import HealthReport from "../components/HealthReport"
import { Button } from "@/shared/ui/button"

// 펫별 건강 데이터 (Mock)
const petHealthDataMap: Record<string, any> = {
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
  },
}

// 기본 데이터
const defaultHealthData = {
  heartRate: { current: 0, min: 0, max: 0, status: "nodata", trend: "stable", change: 0, lastUpdate: "-" },
  respiratoryRate: { current: 0, min: 0, max: 0, status: "nodata", trend: "stable", lastUpdate: "-" },
  weight: { current: 0, previous: 0, status: "nodata", trend: "stable", change: 0, lastUpdate: "-" },
  aiDiagnosis: { status: "unknown", confidence: 0, summary: "데이터가 부족합니다", recommendations: [], lastUpdate: "-" },
}

const defaultHistory: any[] = []

export default function HealthcarePage() {
  const { user } = useAuth()
  const [selectedPetId, setSelectedPetId] = useState<string>("")
  const [selectedChart, setSelectedChart] = useState<"heart" | "respiratory">("heart")
  const [showReport, setShowReport] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  
  // 상태로 데이터 관리 (업데이트 가능하도록)
  const [currentHealthData, setCurrentHealthData] = useState<any>(null);
  const [isScraping, setIsScraping] = useState(false);

  // 펫 선택 초기화
  useEffect(() => {
    if (user?.pets?.length && !selectedPetId) {
      setSelectedPetId(user.pets[0].id)
    }
  }, [user?.pets, selectedPetId])

  // 펫 변경 시 데이터 초기화
  useEffect(() => {
    if (selectedPetId) {
      setCurrentHealthData(petHealthDataMap[selectedPetId] || {
        healthData: defaultHealthData,
        heartRateHistory: defaultHistory,
        respiratoryHistory: defaultHistory,
      });
    }
  }, [selectedPetId]);

  const { healthData, heartRateHistory, respiratoryHistory } = currentHealthData || { 
    healthData: defaultHealthData, 
    heartRateHistory: defaultHistory, 
    respiratoryHistory: defaultHistory 
  };

  // WithaPet 데이터 스크래핑 시뮬레이션
  const simulateDataScraping = () => {
    setIsScraping(true);
    // 1.5초 로딩 시뮬레이션
    setTimeout(() => {
      if (!currentHealthData) return;
      
      const randomHeart = 60 + Math.floor(Math.random() * 60); // 60-120
      const randomResp = 15 + Math.floor(Math.random() * 25);  // 15-40
      const randomWeight = 5 + Math.random() * 10;            // 5-15 (float)
      
      setCurrentHealthData((prev: any) => ({
        ...prev,
        healthData: {
          ...prev.healthData,
          heartRate: { ...prev.healthData.heartRate, current: randomHeart, lastUpdate: "방금 전" },
          respiratoryRate: { ...prev.healthData.respiratoryRate, current: randomResp, lastUpdate: "방금 전" },
          weight: { ...prev.healthData.weight, current: parseFloat(randomWeight.toFixed(1)), lastUpdate: "방금 전" }
        },
        heartRateHistory: prev.heartRateHistory.map((h: any) => ({ ...h, value: 60 + Math.floor(Math.random() * 60) })),
        respiratoryHistory: prev.respiratoryHistory.map((r: any) => ({ ...r, value: 15 + Math.floor(Math.random() * 25) }))
      }));
      
      setIsScraping(false);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-[#faf9f7] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Stethoscope className="h-8 w-8 text-blue-600" />
              AI Veterinary Center
            </h1>
            <p className="text-gray-500 mt-1 ml-10">
              AI 기반 반려동물 정밀 진단 및 건강 모니터링
            </p>
          </div>
          
          {/* Pet Selector */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
            {user?.pets?.map((pet) => (
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
            ))}
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
               value="diagnosis" 
               className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-gray-900 rounded-none px-0 pb-3 text-gray-500 data-[state=active]:text-gray-900 font-semibold text-base transition-all"
             >
               AI 피부/질병 진단
             </TabsTrigger>
             <TabsTrigger
              value="records"
              className="rounded-full px-6 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              건강 기록
            </TabsTrigger>
            <TabsTrigger
              value="insurance"
              className="rounded-full px-6 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              펫 보험
            </TabsTrigger>
          </TabsList>

          {/* DASHBOARD TAB (Modern Medical Design - Korean) */}
          <TabsContent value="dashboard" className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
             
             <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-4">
                <div>
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">CLINICAL OVERVIEW</h2>
                  <h1 className="text-2xl font-bold text-gray-900 font-serif">건강 현황 모니터링</h1>
                </div>
                <div className="flex gap-2">
                   <Button 
                      onClick={simulateDataScraping}
                      disabled={isScraping}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg border-0 animate-in fade-in zoom-in duration-300"
                   >
                     {isScraping ? (
                        <>
                           <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                           WithaPet 동기화 중...
                        </>
                     ) : (
                        <>
                           <Download className="mr-2 h-4 w-4" />
                           WithaPet 데이터 불러오기
                        </>
                     )}
                   </Button>
                   <ManualHealthEntry />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* LEFT COL: Health Score, Vitals & Charts (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                   
                   {/* 1. Health Score Card (Restored) */}
                   <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white overflow-hidden relative">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
                     <CardContent className="p-8 flex items-center justify-between relative z-10">
                        <div>
                           <h2 className="text-2xl font-bold mb-1">오늘의 건강 점수</h2>
                           <p className="text-indigo-100 mb-6 font-light">최근 7일간의 생체 데이터를 분석했습니다.</p>
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

                   {/* 2. Vital Signs Grid (Medical Style) */}
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Heart Rate */}
                      <Card className="rounded-none border-t-4 border-t-red-500 border-x border-b border-gray-100 shadow-sm bg-white hover:bg-gray-50 transition-colors">
                         <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                               <Activity className="w-4 h-4 text-red-500" />
                               <span className="text-xs font-bold text-gray-500 uppercase">평균 심박수</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                               <span className="text-3xl font-bold text-gray-900 font-mono tracking-tight">{healthData?.heartRate?.current || '-'}</span>
                               <span className="text-xs text-gray-400">BPM</span>
                            </div>
                            <div className="mt-2 text-[10px] text-green-600 font-medium bg-green-50 inline-block px-1.5 py-0.5 rounded">
                               정상 범위
                            </div>
                         </CardContent>
                      </Card>

                      {/* Respiratory */}
                      <Card className="rounded-none border-t-4 border-t-blue-500 border-x border-b border-gray-100 shadow-sm bg-white hover:bg-gray-50 transition-colors">
                         <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                               <Wind className="w-4 h-4 text-blue-500" />
                               <span className="text-xs font-bold text-gray-500 uppercase">분당 호흡수</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                               <span className="text-3xl font-bold text-gray-900 font-mono tracking-tight">{healthData?.respiratoryRate?.current || '-'}</span>
                               <span className="text-xs text-gray-400">RPM</span>
                            </div>
                            <div className="mt-2 text-[10px] text-green-600 font-medium bg-green-50 inline-block px-1.5 py-0.5 rounded">
                               안정적
                            </div>
                         </CardContent>
                      </Card>

                      {/* Weight */}
                      <Card className="rounded-none border-t-4 border-t-emerald-500 border-x border-b border-gray-100 shadow-sm bg-white hover:bg-gray-50 transition-colors">
                         <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                               <Scale className="w-4 h-4 text-emerald-500" />
                               <span className="text-xs font-bold text-gray-500 uppercase">몸무게</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                               <span className="text-3xl font-bold text-gray-900 font-mono tracking-tight">{healthData?.weight?.current || '-'}</span>
                               <span className="text-xs text-gray-400">kg</span>
                            </div>
                            <div className="mt-2 text-[10px] text-gray-400 font-medium px-1.5 py-0.5">
                               변화 없음
                            </div>
                         </CardContent>
                      </Card>

                      {/* Condition Score */}
                      <Card className="rounded-none border-t-4 border-t-indigo-500 border-x border-b border-gray-100 shadow-sm bg-white hover:bg-gray-50 transition-colors">
                         <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                               <Sparkles className="w-4 h-4 text-indigo-500" />
                               <span className="text-xs font-bold text-gray-500 uppercase">컨디션 지수</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                               <span className="text-3xl font-bold text-gray-900 font-mono tracking-tight">98</span>
                               <span className="text-xs text-gray-400">/100</span>
                            </div>
                            <div className="mt-2 text-[10px] text-indigo-600 font-medium bg-indigo-50 inline-block px-1.5 py-0.5 rounded">
                               최상
                            </div>
                         </CardContent>
                      </Card>
                   </div>

                   {/* 3. Main Chart Section */}
                   <Card className="rounded-none border border-gray-200 shadow-sm bg-white">
                      <CardHeader className="border-b border-gray-100 pb-3">
                         <div className="flex items-center justify-between">
                            <div>
                               <CardTitle className="text-sm font-bold text-gray-900 uppercase tracking-wide">바이탈 트렌드 분석</CardTitle>
                               <p className="text-xs text-gray-400 mt-1">24시간 연속 모니터링 데이터</p>
                            </div>
                            <div className="flex border border-gray-200 rounded">
                               <button 
                                 onClick={() => setSelectedChart("heart")}
                                 className={`px-3 py-1.5 text-xs font-medium transition-all ${selectedChart === "heart" ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                               >
                                 심박수
                               </button>
                               <div className="w-[1px] bg-gray-200"></div>
                               <button 
                                 onClick={() => setSelectedChart("respiratory")}
                                 className={`px-3 py-1.5 text-xs font-medium transition-all ${selectedChart === "respiratory" ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                               >
                                 호흡수
                               </button>
                            </div>
                         </div>
                      </CardHeader>
                      <CardContent className="p-6">
                         <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                               <AreaChart data={selectedChart === "heart" ? heartRateHistory : respiratoryHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                  <defs>
                                     <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={selectedChart === "heart" ? "#ef4444" : "#3b82f6"} stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor={selectedChart === "heart" ? "#ef4444" : "#3b82f6"} stopOpacity={0}/>
                                     </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                  <XAxis dataKey="time" stroke="#9ca3af" tick={{fontSize: 10, fontFamily: 'monospace'}} axisLine={false} tickLine={false} dy={10} />
                                  <YAxis stroke="#9ca3af" tick={{fontSize: 10, fontFamily: 'monospace'}} axisLine={false} tickLine={false} />
                                  <Tooltip 
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                  />
                                  <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke={selectedChart === "heart" ? "#ef4444" : "#3b82f6"} 
                                    strokeWidth={2}
                                    fill="url(#colorValue)" 
                                    activeDot={{ r: 4, strokeWidth: 0 }}
                                  />
                               </AreaChart>
                            </ResponsiveContainer>
                         </div>
                      </CardContent>
                   </Card>
                </div>

                {/* RIGHT COL: Logs & Chat (1/3) */}
                <div className="lg:col-span-1 space-y-6">
                   
                   {/* Inline Chat (Original Style) */}
                   <InlineVeterinarianChat />

                   {/* Daily Tip */}
                   <div className="bg-[#fffbeb] border border-[#fcd34d] p-4 relative shadow-sm">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#f59e0b]"></div>
                      <h4 className="text-xs font-bold text-[#b45309] uppercase tracking-wide mb-2 flex items-center gap-2">
                         <FileText className="w-3 h-3" />
                         TODAY'S MEDICAL NOTE
                      </h4>
                      <p className="text-sm text-[#92400e] font-serif leading-relaxed italic">
                         "환절기 알레르기 증상에 유의하세요. 과도한 그루밍이나 긁음 증상이 있다면 습도 조절(50-60%)이 필요합니다."
                      </p>
                   </div>

                </div>

             </div>
          </TabsContent>

          {/* DIAGNOSIS TAB */}
          <TabsContent value="diagnosis" className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <AiDiagnosis />
          </TabsContent>

          {/* RECORDS TAB */}
          <TabsContent value="records" className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <HealthReport onClose={() => {}} />
          </TabsContent>

          <TabsContent value="insurance">
            <PetInsurance />
          </TabsContent>
        </Tabs>

        {showReport && (
          <HealthReport
            onClose={() => setShowReport(false)}
            analysisResult={analysisResult}
          />
        )}
      </div>
    </main>
  )
}
