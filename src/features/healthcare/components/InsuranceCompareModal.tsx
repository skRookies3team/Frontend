import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  Shield,
  Heart,
  Star,
  ChevronDown,
  ChevronUp,
  Building2,
  Stethoscope,
  Bone,
  Eye,
  Scissors,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

// 보험사 데이터
const INSURANCE_COMPANIES = [
  {
    id: "samsung",
    name: "삼성화재",
    logo: "🔷",
    color: "bg-blue-500",
    rating: 4.5,
    plans: [
      {
        id: "samsung-basic",
        name: "실속형",
        monthlyPremium: 15900,
        coverageRatio: 50,
        yearlyLimit: 500,
        dailyLimit: 10,
        deductible: 10000,
        features: {
          outpatient: true,
          hospitalization: true,
          surgery: true,
          liability: 1000,
          patella: false,
          skin: false,
          dental: false,
          mri: false,
        },
      },
      {
        id: "samsung-standard",
        name: "표준형",
        monthlyPremium: 35000,
        coverageRatio: 70,
        yearlyLimit: 1000,
        dailyLimit: 15,
        deductible: 10000,
        features: {
          outpatient: true,
          hospitalization: true,
          surgery: true,
          liability: 3000,
          patella: true,
          skin: true,
          dental: false,
          mri: false,
        },
        recommended: true,
      },
      {
        id: "samsung-premium",
        name: "고급형",
        monthlyPremium: 55000,
        coverageRatio: 90,
        yearlyLimit: 2000,
        dailyLimit: 20,
        deductible: 10000,
        features: {
          outpatient: true,
          hospitalization: true,
          surgery: true,
          liability: 5000,
          patella: true,
          skin: true,
          dental: true,
          mri: true,
        },
      },
    ],
  },
  {
    id: "kb",
    name: "KB손해보험",
    logo: "🟡",
    color: "bg-yellow-500",
    rating: 4.3,
    plans: [
      {
        id: "kb-safe",
        name: "안심플랜",
        monthlyPremium: 19900,
        coverageRatio: 60,
        yearlyLimit: 700,
        dailyLimit: 12,
        deductible: 15000,
        features: {
          outpatient: true,
          hospitalization: true,
          surgery: true,
          liability: 2000,
          patella: false,
          skin: true,
          dental: false,
          mri: false,
        },
      },
      {
        id: "kb-plus",
        name: "프리미엄",
        monthlyPremium: 45000,
        coverageRatio: 80,
        yearlyLimit: 1500,
        dailyLimit: 18,
        deductible: 10000,
        features: {
          outpatient: true,
          hospitalization: true,
          surgery: true,
          liability: 5000,
          patella: true,
          skin: true,
          dental: true,
          mri: true,
        },
        recommended: true,
      },
    ],
  },
  {
    id: "db",
    name: "DB손해보험",
    logo: "🟢",
    color: "bg-green-500",
    rating: 4.2,
    plans: [
      {
        id: "db-basic",
        name: "베이직",
        monthlyPremium: 12900,
        coverageRatio: 50,
        yearlyLimit: 500,
        dailyLimit: 10,
        deductible: 20000,
        features: {
          outpatient: true,
          hospitalization: true,
          surgery: true,
          liability: 1000,
          patella: false,
          skin: false,
          dental: false,
          mri: false,
        },
      },
      {
        id: "db-standard",
        name: "표준형",
        monthlyPremium: 29900,
        coverageRatio: 70,
        yearlyLimit: 1000,
        dailyLimit: 15,
        deductible: 15000,
        features: {
          outpatient: true,
          hospitalization: true,
          surgery: true,
          liability: 3000,
          patella: true,
          skin: true,
          dental: false,
          mri: false,
        },
        recommended: true,
      },
    ],
  },
  {
    id: "hyundai",
    name: "현대해상",
    logo: "🔵",
    color: "bg-sky-500",
    rating: 4.4,
    plans: [
      {
        id: "hyundai-care",
        name: "마이펫케어",
        monthlyPremium: 25000,
        coverageRatio: 60,
        yearlyLimit: 800,
        dailyLimit: 12,
        deductible: 10000,
        features: {
          outpatient: true,
          hospitalization: true,
          surgery: true,
          liability: 2000,
          patella: false,
          skin: true,
          dental: false,
          mri: false,
        },
      },
      {
        id: "hyundai-premium",
        name: "프리미엄",
        monthlyPremium: 49000,
        coverageRatio: 80,
        yearlyLimit: 1500,
        dailyLimit: 20,
        deductible: 10000,
        features: {
          outpatient: true,
          hospitalization: true,
          surgery: true,
          liability: 5000,
          patella: true,
          skin: true,
          dental: true,
          mri: true,
        },
        recommended: true,
      },
    ],
  },
  {
    id: "meritz",
    name: "메리츠화재",
    logo: "🟠",
    color: "bg-orange-500",
    rating: 4.1,
    plans: [
      {
        id: "meritz-basic",
        name: "기본형",
        monthlyPremium: 14900,
        coverageRatio: 50,
        yearlyLimit: 500,
        dailyLimit: 10,
        deductible: 15000,
        features: {
          outpatient: true,
          hospitalization: true,
          surgery: true,
          liability: 1000,
          patella: false,
          skin: false,
          dental: false,
          mri: false,
        },
      },
      {
        id: "meritz-plus",
        name: "플러스형",
        monthlyPremium: 32000,
        coverageRatio: 70,
        yearlyLimit: 1000,
        dailyLimit: 15,
        deductible: 10000,
        features: {
          outpatient: true,
          hospitalization: true,
          surgery: true,
          liability: 3000,
          patella: true,
          skin: true,
          dental: false,
          mri: false,
        },
        recommended: true,
      },
    ],
  },
];

// 보장 항목 정의
const COVERAGE_ITEMS = [
  { key: "outpatient", label: "통원 의료비", icon: Stethoscope },
  { key: "hospitalization", label: "입원 의료비", icon: Building2 },
  { key: "surgery", label: "수술비", icon: Scissors },
  { key: "liability", label: "배상책임", icon: Shield, unit: "만원" },
  { key: "patella", label: "슬개골 탈구", icon: Bone },
  { key: "skin", label: "피부질환", icon: Heart },
  { key: "dental", label: "치과 치료", icon: Sparkles },
  { key: "mri", label: "MRI/CT", icon: Eye },
];

interface InsuranceCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InsuranceCompareModal({
  isOpen,
  onClose,
}: InsuranceCompareModalProps) {
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([
    "samsung",
    "kb",
  ]);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);

  const toggleCompany = (companyId: string) => {
    setSelectedCompanies((prev) => {
      if (prev.includes(companyId)) {
        return prev.filter((id) => id !== companyId);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), companyId];
      }
      return [...prev, companyId];
    });
  };

  const selectedData = INSURANCE_COMPANIES.filter((c) =>
    selectedCompanies.includes(c.id)
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#004e92] to-[#000428] p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">보험사별 상세 비교</h2>
                <p className="text-white/70 text-sm mt-1">
                  최대 3개 보험사를 선택하여 비교해보세요
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Company Selection */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex flex-wrap gap-2">
              {INSURANCE_COMPANIES.map((company) => (
                <button
                  key={company.id}
                  onClick={() => toggleCompany(company.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                    selectedCompanies.includes(company.id)
                      ? "border-[#004e92] bg-[#004e92]/10 text-[#004e92] font-semibold"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span className="text-lg">{company.logo}</span>
                  <span>{company.name}</span>
                  {selectedCompanies.includes(company.id) && (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              선택됨: {selectedCompanies.length}/3
            </p>
          </div>

          {/* Comparison Content */}
          <div className="flex-1 overflow-auto p-6">
            {selectedData.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>비교할 보험사를 선택해주세요</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Company Cards */}
                <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${selectedData.length}, 1fr)` }}>
                  {selectedData.map((company) => (
                    <Card key={company.id} className="border-2 hover:border-[#004e92]/30 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${company.color} flex items-center justify-center text-white text-xl`}>
                              {company.logo}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{company.name}</CardTitle>
                              <div className="flex items-center gap-1 text-sm text-yellow-500">
                                <Star className="w-4 h-4 fill-current" />
                                <span>{company.rating}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {company.plans.map((plan) => (
                          <div
                            key={plan.id}
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                              plan.recommended
                                ? "border-[#004e92] bg-[#004e92]/5"
                                : "border-gray-100 hover:border-gray-200"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="font-semibold text-gray-900">{plan.name}</span>
                                {plan.recommended && (
                                  <Badge className="ml-2 bg-[#004e92] text-white text-xs">추천</Badge>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold text-[#004e92]">
                                  {plan.monthlyPremium.toLocaleString()}
                                  <span className="text-sm font-normal text-gray-500">원/월</span>
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">보장비율</span>
                                <span className="font-semibold">{plan.coverageRatio}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">연간한도</span>
                                <span className="font-semibold">{plan.yearlyLimit}만원</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">1일한도</span>
                                <span className="font-semibold">{plan.dailyLimit}만원</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">자기부담</span>
                                <span className="font-semibold">{(plan.deductible / 10000).toFixed(0)}만원</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Detailed Comparison Table */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#004e92]" />
                    보장 항목 상세 비교
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">보장 항목</th>
                          {selectedData.map((company) => (
                            <th key={company.id} className="text-center py-3 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <span>{company.logo}</span>
                                <span className="font-semibold text-gray-900">{company.name}</span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {COVERAGE_ITEMS.map((item, index) => (
                          <tr key={item.key} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <item.icon className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-gray-700">{item.label}</span>
                              </div>
                            </td>
                            {selectedData.map((company) => {
                              // Get the recommended plan's features
                              const plan = company.plans.find((p) => p.recommended) || company.plans[0];
                              const value = plan.features[item.key as keyof typeof plan.features];
                              return (
                                <td key={company.id} className="py-3 px-4 text-center">
                                  {typeof value === "boolean" ? (
                                    value ? (
                                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                                        <Check className="w-5 h-5 text-green-600" />
                                      </div>
                                    ) : (
                                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                                        <X className="w-5 h-5 text-gray-400" />
                                      </div>
                                    )
                                  ) : (
                                    <span className="font-semibold text-[#004e92]">
                                      {value.toLocaleString()}{item.unit}
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Price Comparison Summary */}
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                    월 보험료 비교
                  </h3>
                  <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedData.length}, 1fr)` }}>
                    {selectedData.map((company) => {
                      const recommendedPlan = company.plans.find((p) => p.recommended) || company.plans[0];
                      const minPrice = Math.min(...company.plans.map((p) => p.monthlyPremium));
                      const maxPrice = Math.max(...company.plans.map((p) => p.monthlyPremium));
                      return (
                        <div key={company.id} className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl">{company.logo}</span>
                            <span className="font-semibold">{company.name}</span>
                          </div>
                          <p className="text-3xl font-bold text-[#004e92]">
                            {minPrice.toLocaleString()}
                            <span className="text-sm font-normal text-gray-500">원~</span>
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            최대 {maxPrice.toLocaleString()}원/월
                          </p>
                          <Button className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white">
                            가입 상담
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Notice */}
                <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">주의사항</p>
                    <ul className="list-disc list-inside space-y-1 text-yellow-700">
                      <li>실제 보험료는 반려동물의 나이, 품종, 건강상태에 따라 달라질 수 있습니다.</li>
                      <li>상세 보장 내용은 각 보험사 약관을 확인해주세요.</li>
                      <li>슬개골 탈구는 가입 후 면책기간(1년)이 적용될 수 있습니다.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-4 bg-gray-50 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              닫기
            </Button>
            <Button className="bg-[#004e92] hover:bg-[#003b70] text-white">
              선택 보험사로 상담 신청
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
