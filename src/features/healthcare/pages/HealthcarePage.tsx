import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { motion, AnimatePresence } from "framer-motion"
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
  Download,
  TrendingUp
} from "lucide-react"
import React, { useState, useEffect } from "react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs"
import { InlineVeterinarianChat } from "../components/InlineVeterinarianChat"
import AiDiagnosis from "../components/AiDiagnosis"
import HealthReport from "../components/HealthReport"
import { Button } from "@/shared/ui/button"
import { syncWithaPetDataApi, WithaPetHealthData } from "../api/healthcareApi"
import { DailyHealthLog } from "../components/DailyHealthLog"

// 펫별 건강 데이터 생성 함수 (동적 Mock)
// WHY: 실제 pet ID는 "1", "2" 등 다양한 형식이므로 동적으로 생성
const generateMockHealthData = (petId: string) => {
  // petId를 기반으로 일관된 랜덤값 생성 (같은 펫은 같은 데이터)
  const seed = petId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseHeart = 70 + (seed % 30);
  const baseResp = 20 + (seed % 15);
  const baseWeight = 5 + (seed % 10);
  
  return {
    healthData: {
      heartRate: { current: baseHeart, min: baseHeart - 15, max: baseHeart + 20, status: "normal", trend: "stable", change: 2, lastUpdate: "5분 전" },
      respiratoryRate: { current: baseResp, min: baseResp - 5, max: baseResp + 10, status: "normal", trend: "stable", lastUpdate: "5분 전" },
      weight: { current: baseWeight, previous: baseWeight - 0.2, status: "normal", trend: "up", change: 0.2, lastUpdate: "오늘 오전 8:00" },
      aiDiagnosis: { status: "healthy", confidence: 90 + (seed % 10), summary: "전반적으로 건강한 상태입니다", recommendations: ["규칙적인 산책 유지", "수분 섭취량 모니터링"], lastUpdate: "1시간 전" },
    },
    heartRateHistory: [
      { time: "00:00", value: baseHeart - 5 },
      { time: "04:00", value: baseHeart - 8 },
      { time: "08:00", value: baseHeart },
      { time: "12:00", value: baseHeart + 10 },
      { time: "16:00", value: baseHeart + 5 },
      { time: "20:00", value: baseHeart - 2 },
      { time: "24:00", value: baseHeart - 6 },
    ],
    respiratoryHistory: [
      { time: "00:00", value: baseResp - 2 },
      { time: "04:00", value: baseResp - 4 },
      { time: "08:00", value: baseResp + 2 },
      { time: "12:00", value: baseResp + 5 },
      { time: "16:00", value: baseResp + 1 },
      { time: "20:00", value: baseResp },
      { time: "24:00", value: baseResp - 3 },
    ],
  };
};

// 기본 데이터 (펫이 없을 때)
// 기본 데이터 (빈 상태)
const defaultHealthData = {
  heartRate: { current: 0, min: 0, max: 0, status: "-", trend: "-", change: 0, lastUpdate: "-" },
  respiratoryRate: { current: 0, min: 0, max: 0, status: "-", trend: "-", lastUpdate: "-" },
  weight: { current: 0, previous: 0, status: "-", trend: "-", change: 0, lastUpdate: "-" },
  aiDiagnosis: { status: "unknown", confidence: 0, summary: "WithaPet 기기와 연동하여 데이터를 불러오세요.", recommendations: [], lastUpdate: "-" },
}

// 기본 히스토리 (빈 배열 대신 기본값 제공)
// 기본 히스토리 (빈 배열)
const defaultHistory = [
  { time: "00:00", value: 0 },
  { time: "04:00", value: 0 },
  { time: "08:00", value: 0 },
  { time: "12:00", value: 0 },
  { time: "16:00", value: 0 },
  { time: "20:00", value: 0 },
  { time: "24:00", value: 0 },
]

export default function HealthcarePage() {
  const { user } = useAuth();
  const token = localStorage.getItem('accessToken');
  const [pets, setPets] = useState(user?.pets || []);
  const [selectedPetId, setSelectedPetId] = useState<string>(user?.pets?.[0]?.id?.toString() || "");
  const selectedPet = user?.pets?.find(p => p.id.toString() === selectedPetId);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [isScraping, setIsScraping] = useState(false);
  
  // State for manual health entry
  const [manualHealthData, setManualHealthData] = useState<any>(null);

  const handleManualSave = (data: any) => {
      setManualHealthData({
          weight: data.weight,
          steps: data.steps,
          condition: data.condition,
          notes: data.notes
      });
  };

  // WithaPet 및 AI 진단 결과 상태
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [currentHealthData, setCurrentHealthData] = useState<any>(null);
  const [selectedChart, setSelectedChart] = useState("heart");
  const [showReport, setShowReport] = useState(false);
  
  // 펫 선택 초기화
  useEffect(() => {
    if (user?.pets?.length && !selectedPetId) {
      setSelectedPetId(user.pets[0].id.toString())
    }
  }, [user?.pets, selectedPetId])

  // 펫 변경 시 데이터 초기화 (자동 로딩 제거)
  useEffect(() => {
    if (selectedPetId) {
       // 펫이 변경되면 기존 데이터만 비워줌 (로딩 X)
       setCurrentHealthData(null);
    }
  }, [selectedPetId]);

  const { healthData, heartRateHistory, respiratoryHistory } = currentHealthData || { 
    healthData: defaultHealthData, 
    heartRateHistory: defaultHistory, 
    respiratoryHistory: defaultHistory 
  };

  // WithaPet 데이터 동기화 (실제 백엔드 API 호출)
  const syncWithaPetData = async () => {
    if (!selectedPetId) return;
    
    setIsScraping(true);
    
    try {
      // 선택된 펫 정보 가져오기
      const selectedPet = pets.find(p => p.id.toString() === selectedPetId);
      const petName = selectedPet?.name || '반려동물';
      const petType = selectedPet?.species === 'cat' ? 'Cat' : 'Dog';
      
      // 실제 API 호출 (최소 4초 대기 - 사용자 UX 경험을 위해 추가)
      const [response] = await Promise.all([
        syncWithaPetDataApi(
          petName,
          petType,
          user?.id?.toString() || '0',
          selectedPetId,
          token
        ),
        new Promise(resolve => setTimeout(resolve, 4000))
      ]);
      
      if (response.success && response.data) {
        const data = response.data;
        
        // 상태 업데이트
        // 상태 업데이트
        setCurrentHealthData((prev: any) => {
           const baseData = prev?.healthData || defaultHealthData;
           return {
              healthData: {
                ...baseData,
                heartRate: { ...baseData.heartRate, current: data.vitalData.avgHeartRate, lastUpdate: data.vitalData.lastUpdate },
                respiratoryRate: { ...baseData.respiratoryRate, current: data.vitalData.avgRespiratoryRate, lastUpdate: data.vitalData.lastUpdate },
                weight: { ...baseData.weight, current: parseFloat(data.vitalData.weight.toFixed(1)), lastUpdate: data.vitalData.lastUpdate },
                aiDiagnosis: {
                    status: "healthy",
                    confidence: data.healthScore,
                    summary: data.aiAnalysis.analysisResult,
                    recommendations: data.aiAnalysis.recommendations,
                    lastUpdate: data.vitalData.lastUpdate
                }
              },
              heartRateHistory: data.heartRateTrend || [],
              respiratoryHistory: data.respiratoryRateTrend || []
           };
        });
        
        console.log('[WithaPet] 동기화 성공:', response.message);
      }
    } catch (error) {
      console.error('[WithaPet] 동기화 실패:', error);
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf9f7] p-6 lg:p-8 relative">
      
      {/* ⭐ WithaPet 데이터 로딩 오버레이 */}
      <AnimatePresence>
        {isScraping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white/95 backdrop-blur-xl rounded-3xl p-10 shadow-2xl flex flex-col items-center gap-6 max-w-sm mx-4"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center animate-pulse">
                  <Stethoscope className="w-10 h-10 text-white" />
                </div>
                <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-blue-500/30 animate-ping" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">WithaPet 데이터 수신 중</h3>
                <p className="text-gray-500 text-sm">스마트 청진기에서 건강 데이터를 가져오고 있습니다...</p>
              </div>
              <div className="flex gap-1">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-3 h-3 rounded-full bg-blue-500" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-3 h-3 rounded-full bg-indigo-500" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-3 h-3 rounded-full bg-purple-500" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
                onClick={() => setSelectedPetId(pet.id.toString())}
                className={`relative group flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 ${
                  selectedPetId === pet.id.toString()
                    ? "bg-gray-900 text-white shadow-md scale-100" 
                    : "hover:bg-gray-50 text-gray-600 scale-95"
                }`}
              >
                <div className={`w-8 h-8 rounded-full overflow-hidden border-2 ${selectedPetId === pet.id.toString() ? "border-white/30" : "border-transparent"}`}>
                   {pet.photo ? (
                     <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs">🐕</div>
                   )}
                </div>
                <span className={`text-sm font-semibold ${selectedPetId === pet.id.toString() ? "text-white" : "text-gray-600"}`}>
                  {pet.name}
                </span>
                {selectedPetId === pet.id.toString() && (
                   <motion.div 
                     layoutId="active-pet-indicator"
                     className="absolute inset-0 border-2 border-gray-900 rounded-xl"
                     initial={false}
                     transition={{ type: "spring", stiffness: 500, damping: 30 }}
                   />
                )}
              </button>
            ))}

          </div>
        </div>

        {/* TABS HEADER */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
               className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-gray-900 rounded-none px-0 pb-3 text-gray-500 data-[state=active]:text-gray-900 font-semibold text-base transition-all"
             >
               건강 기록
             </TabsTrigger>
             <TabsTrigger 
               value="3dmodel" 
               className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-gray-900 rounded-none px-0 pb-3 text-gray-500 data-[state=active]:text-gray-900 font-semibold text-base transition-all"
             >
               🎮 3D 펫 모델
             </TabsTrigger>
             <TabsTrigger 
               value="insurance" 
               className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-gray-900 rounded-none px-0 pb-3 text-gray-500 data-[state=active]:text-gray-900 font-semibold text-base transition-all"
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
                      onClick={syncWithaPetData}
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
                   <ManualHealthEntry onSave={handleManualSave} petName={selectedPet?.name} petId={selectedPetId} />
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

                   {/* 2. Vital Signs Grid (Modern Glass Style) */}
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Heart Rate */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Card className="group relative overflow-hidden rounded-2xl border-0 shadow-lg bg-gradient-to-br from-red-500 to-rose-600 text-white hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl" />
                          <CardContent className="p-5 relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Activity className="w-5 h-5" />
                              </div>
                              <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">심박수</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <motion.span 
                                key={healthData?.heartRate?.current}
                                initial={{ scale: 1.2, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-4xl font-bold tracking-tight"
                              >
                                {healthData?.heartRate?.current || '-'}
                              </motion.span>
                              <span className="text-sm text-white/70">BPM</span>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                              <span className="text-xs text-white/80">정상 범위</span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Respiratory */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Card className="group relative overflow-hidden rounded-2xl border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-600 text-white hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl" />
                          <CardContent className="p-5 relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Wind className="w-5 h-5" />
                              </div>
                              <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">호흡수</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <motion.span 
                                key={healthData?.respiratoryRate?.current}
                                initial={{ scale: 1.2, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-4xl font-bold tracking-tight"
                              >
                                {healthData?.respiratoryRate?.current || '-'}
                              </motion.span>
                              <span className="text-sm text-white/70">RPM</span>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                              <span className="text-xs text-white/80">안정적</span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Weight */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Card className="group relative overflow-hidden rounded-2xl border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl" />
                          <CardContent className="p-5 relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Scale className="w-5 h-5" />
                              </div>
                              <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">몸무게</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <motion.span 
                                key={healthData?.weight?.current}
                                initial={{ scale: 1.2, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-4xl font-bold tracking-tight"
                              >
                                {healthData?.weight?.current || '-'}
                              </motion.span>
                              <span className="text-sm text-white/70">kg</span>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-white/70" />
                              <span className="text-xs text-white/80">유지 중</span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>

                    {/* Daily Health Log Section */}
                    <div className="mt-6">
                        <DailyHealthLog healthData={manualHealthData} />
                    </div>

                      {/* Condition Score */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Card className="group relative overflow-hidden rounded-2xl border-0 shadow-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl" />
                          <CardContent className="p-5 relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Sparkles className="w-5 h-5" />
                              </div>
                              <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">컨디션</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-4xl font-bold tracking-tight">98</span>
                              <span className="text-sm text-white/70">/100</span>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse" />
                              <span className="text-xs text-white/80">최상</span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

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
                   <InlineVeterinarianChat petId={selectedPetId} />

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
              <HealthReport onClose={() => setActiveTab("dashboard")} />
          </TabsContent>

          {/* 3D MODEL TAB - 이제 펫과 대화하기 페이지로 이동됨 */}
          <TabsContent value="3dmodel" className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="max-w-md mx-auto text-center py-16">
              <div className="text-6xl mb-4">🐕</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">3D 펫 모델이 이동했어요!</h2>
              <p className="text-gray-500 mb-6">
                3D 펫 모델 생성은 이제 <strong>"펫과 대화하기"</strong> 페이지에서<br />
                더욱 풍부한 경험으로 만나보실 수 있어요.
              </p>
              <a 
                href="/chatbot" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-full hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg"
              >
                펫과 대화하기로 이동 →
              </a>
            </div>
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
