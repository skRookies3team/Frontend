import { useState } from "react";
import { motion } from "framer-motion";
import InsuranceCompareModal from "./InsuranceCompareModal";
import {
  Check,
  Shield,
  ArrowRight,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Umbrella,
  Heart,
  DollarSign,
  Calculator,
  Gift,
  Stethoscope,
  Dog,
  Cat,
  Calendar,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

// Mock Data
const INSURANCE_PLANS = [
  {
    id: "basic",
    name: "실속형",
    price: 15900,
    coverage: "50%",
    limit: "500만원",
    features: ["통원/입원 의료비 보장", "배상책임 1천만원", "장례비 지원"],
    color: "bg-gray-50 border-gray-200",
    recommend: false,
  },
  {
    id: "standard",
    name: "표준형",
    price: 35000,
    coverage: "70%",
    limit: "1,000만원",
    features: [
      "통원/입원 의료비 보장",
      "배상책임 3천만원",
      "장례비 지원",
      "슬개골 탈구 보장",
    ],
    color: "bg-blue-50 border-blue-200",
    recommend: true,
  },
  {
    id: "premium",
    name: "고급형",
    price: 55000,
    coverage: "90%",
    limit: "2,000만원",
    features: [
      "통원/입원 의료비 보장",
      "배상책임 5천만원",
      "장례비 지원",
      "슬개골/치과 보장",
      "MRI/CT 촬영",
    ],
    color: "bg-purple-50 border-purple-200",
    recommend: false,
  },
];

const CLAIMS_HISTORY = [
  {
    id: 1,
    date: "2025.12.10",
    hospital: "행복한 동물병원",
    amount: 150000,
    status: "지급완료",
    type: "통원",
  },
  {
    id: 2,
    date: "2025.11.05",
    hospital: "서울 24시 센터",
    amount: 450000,
    status: "심사중",
    type: "입원",
  },
];

const BENEFITS = [
  { icon: Shield, title: "보장되지 않는 질병", desc: "보험료 할인", color: "text-blue-600 bg-blue-50" },
  { icon: Zap, title: "라이브 청구", desc: "실시간 청구와 지급", color: "text-yellow-600 bg-yellow-50" },
  { icon: Gift, title: "웰컴 프로그램", desc: "5% 할인", color: "text-pink-600 bg-pink-50" },
  { icon: Heart, title: "다가족일수록", desc: "최대 6% 할인", color: "text-red-600 bg-red-50" },
  { icon: Umbrella, title: "무지개별 여행비", desc: "위로금 지급", color: "text-purple-600 bg-purple-50" },
  { icon: FileText, title: "동물 등록번호", desc: "2% 할인", color: "text-green-600 bg-green-50" },
];

export default function PetInsurance() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>("standard");
  const [petType, setPetType] = useState<"dog" | "cat">("dog");
  const [breed, setBreed] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [showCompareModal, setShowCompareModal] = useState(false);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-500 pb-12">
      {/* 1. New Hero & Calculator Section */}
      <section className="bg-[#e9f4f4] rounded-3xl p-8 md:p-12 overflow-hidden relative">
        <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6">
            <Badge className="bg-orange-500 text-white border-0 hover:bg-orange-600 px-3 py-1 text-sm">
              수의사가 직접 개발한 보험
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              강아지만 생각하는
              <br />
              <span className="text-[#004e92]">강아지 보험</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              횟수 제한 없는 수술비 보장부터
              <br />
              11종의 특정 고액 치료비까지 든든하게.
            </p>
            <ul className="space-y-3 pt-4">
              <li className="flex items-center gap-3 text-gray-700 font-medium">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-green-600">
                   <Zap className="w-5 h-5" />
                </div>
                파트너 병원에서 실시간 보험금 청구
              </li>
              <li className="flex items-center gap-3 text-gray-700 font-medium">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-600">
                   <Check className="w-5 h-5" />
                </div>
                특정 질병이 걸렸던 아이도 가입 가능
              </li>
            </ul>
          </div>

          {/* Calculator Card */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-orange-500"></div>
             <CardHeader className="pb-4">
               <CardTitle className="text-xl text-gray-900">
                 우리아이 보험료는 <span className="text-orange-500">얼마일까요?</span>
               </CardTitle>
               <CardDescription>
                 생후 61일 ~ 만 10세까지 가입 가능합니다
               </CardDescription>
             </CardHeader>
             <CardContent className="space-y-5">
               <div className="space-y-3">
                 <Label className="text-gray-700 font-semibold">우리아이를 선택해주세요</Label>
                 <div className="grid grid-cols-2 gap-3">
                   <button
                     onClick={() => setPetType("dog")}
                     className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${petType === "dog" ? "border-orange-500 bg-orange-50 text-orange-700 font-bold" : "border-gray-200 hover:bg-gray-50 text-gray-600"}`}
                   >
                     <Dog className="w-5 h-5" /> 강아지
                   </button>
                   <button
                     onClick={() => setPetType("cat")}
                     className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${petType === "cat" ? "border-orange-500 bg-orange-50 text-orange-700 font-bold" : "border-gray-200 hover:bg-gray-50 text-gray-600"}`}
                   >
                     <Cat className="w-5 h-5" /> 고양이
                   </button>
                 </div>
               </div>
               
               <div className="space-y-2">
                 <Label className="text-gray-700 font-semibold">품종을 알려주세요</Label>
                 <Input 
                    placeholder="예) 말티즈, 푸들" 
                    value={breed} 
                    onChange={(e) => setBreed(e.target.value)}
                    className="h-12 bg-gray-50 border-gray-200 focus:border-orange-500 focus:ring-orange-500" 
                 />
               </div>

               <div className="space-y-2">
                 <Label className="text-gray-700 font-semibold">생년월일</Label>
                 <Input 
                    placeholder="예) 20230101" 
                    value={birthDate} 
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="h-12 bg-gray-50 border-gray-200 focus:border-orange-500 focus:ring-orange-500" 
                 />
               </div>
               
               <Button className="w-full h-12 text-lg font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200 mt-2">
                 보험료 바로 확인하기
                 <ChevronDown className="ml-2 h-5 w-5 -rotate-90" />
               </Button>
             </CardContent>
          </Card>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-yellow-200 rounded-full blur-3xl opacity-20 -z-10"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-20 -z-10"></div>
      </section>

      {/* 2. Benefits Grid */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            우리아이 보험료<br/>
            <span className="text-[#004e92]">얼마나 저렴한지 볼까요?</span>
          </h2>
          <Button className="rounded-full bg-orange-500 hover:bg-orange-600 text-white px-8 font-bold">
            보험료 계산하기 <ChevronDown className="-rotate-90 ml-1 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {BENEFITS.map((benefit, index) => (
            <Card key={index} className="border border-gray-200 shadow-sm hover:shadow-md transition-all text-center h-full">
              <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center h-full gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-1 ${benefit.color}`}>
                  <benefit.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{benefit.title}</h3>
                  <p className="text-xs text-gray-500">{benefit.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Existing My Insurance Status */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              가입 중인 보험
            </CardTitle>
            <CardDescription>현재 적용 중인 보험 혜택입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative w-full md:w-80 h-48 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl p-6 text-white overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="flex justify-between items-start">
                  <span className="font-bold text-lg tracking-wider">
                    PetLog Care
                  </span>
                  <Heart className="h-6 w-6 text-pink-500 fill-pink-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">POLICY NUMBER</p>
                  <p className="font-mono text-lg tracking-widest">
                    **** **** 9281
                  </p>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">PET NAME</p>
                    <p className="font-semibold">초코</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-1">EXPIRES</p>
                    <p className="font-semibold">12/26</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4 w-full">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">연간 보상 한도</span>
                  <span className="font-bold text-gray-900">
                    750만원 / 1,000만원
                  </span>
                </div>
                <Progress value={75} className="h-2 bg-gray-100" />
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-500 mb-1">자기부담금</p>
                    <p className="font-bold text-gray-900">1만원</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-500 mb-1">보상비율</p>
                    <p className="font-bold text-gray-900">70%</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              청구 현황
            </CardTitle>
            <CardDescription>최근 3개월 내역</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {CLAIMS_HISTORY.map((claim) => (
                <div
                  key={claim.id}
                  className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {claim.hospital}
                    </p>
                    <p className="text-xs text-gray-500">
                      {claim.date} • {claim.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {claim.amount.toLocaleString()}원
                    </p>
                    <Badge
                      variant={
                        claim.status === "지급완료" ? "default" : "outline"
                      }
                      className={
                        claim.status === "지급완료"
                          ? "bg-green-100 text-green-700 hover:bg-green-200 border-0"
                          : "text-orange-600 border-orange-200"
                      }
                    >
                      {claim.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline">
              청구하기
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* 4. Insurance Plans */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            맞춤형 플랜 비교
          </h2>
          <p className="text-gray-600 mb-6">
            아이의 나이와 건강 상태에 딱 맞는 플랜을 선택하세요
          </p>
          <Button 
            onClick={() => setShowCompareModal(true)}
            className="bg-[#004e92] hover:bg-[#003b70] text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-blue-200"
          >
            🏢 보험사별 상세 비교하기 <ArrowRight className="ml-2 h-4 w-4 inline" />
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {INSURANCE_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl bg-white ${
                selectedPlan === plan.id
                  ? "border-[#004e92] shadow-lg ring-2 ring-[#004e92]/20"
                  : "border-transparent shadow-md hover:border-gray-200"
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.recommend && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#004e92] text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6 pt-2">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-[#004e92]">
                    {plan.price.toLocaleString()}
                  </span>
                  <span className="text-gray-500">원/월</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">보장 비율</span>
                  <span className="font-bold text-gray-900">
                    {plan.coverage}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">1일 한도</span>
                  <span className="font-bold text-gray-900">15만원</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">연간 한도</span>
                  <span className="font-bold text-gray-900">{plan.limit}</span>
                </div>

                <ul className="space-y-3 pt-2">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-sm text-gray-700"
                    >
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                className={`w-full h-12 text-lg font-medium transition-colors ${
                  selectedPlan === plan.id
                    ? "bg-[#004e92] hover:bg-[#003b70] text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                }`}
              >
                {selectedPlan === plan.id ? "신청하기" : "선택하기"}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FAQ / Info */}
      <section className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <AlertCircle className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">알아두세요</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600 text-sm">
              <li>
                슬개골 탈구는 가입 후 1년 이후부터 보장됩니다. (표준형 이상)
              </li>
              <li>만 8세 이상의 반려동물은 가입이 제한될 수 있습니다.</li>
              <li>기왕증(이미 앓고 있는 질병)은 보장 대상에서 제외됩니다.</li>
              <li>
                보험금 청구는 모바일 앱을 통해 간편하게 진행하실 수 있습니다.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Insurance Compare Modal */}
      <InsuranceCompareModal 
        isOpen={showCompareModal} 
        onClose={() => setShowCompareModal(false)} 
      />
    </div>
  );
}
