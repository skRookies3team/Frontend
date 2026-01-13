import React from "react";
import { Activity, Apple, Utensils, Weight, Smile } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";

interface DailyHealthLogProps {
  healthData?: {
    weight?: number;
    steps?: number;
    condition?: string;
    notes?: string;
  } | null;
}

export function DailyHealthLog({ healthData }: DailyHealthLogProps) {
  const steps = healthData?.steps || 0;
  const weight = healthData?.weight || 0;
  const condition = healthData?.condition || "기록 없음";
  const stepGoal = 10000;
  const stepProgress = Math.min((steps / stepGoal) * 100, 100);

  // Condition Emoji mapping
  const getConditionEmoji = (cond: string) => {
    switch (cond) {
      case '최고': return '😄';
      case '좋음': return '🙂';
      case '보통': return '😐';
      case '나쁨': return '😞';
      default: return '❓';
    }
  };

  return (
    <div className="space-y-4 py-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Activity className="w-5 h-5 text-purple-600" />
        일일 건강 기록
      </h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 식단 (Mock) */}
        <Card className="bg-white border-purple-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex justify-between">
              식단
              <Utensils className="w-4 h-4 text-purple-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">1,250 <span className="text-sm font-normal text-gray-500">kcal</span></div>
            <div className="mt-2 text-xs text-purple-600 font-medium">권장 섭취량 달성!</div>
            <Progress value={80} className="h-2 mt-2 bg-purple-100" indicatorClassName="bg-purple-500" />
          </CardContent>
        </Card>

        {/* 영양제 (Mock) */}
        <Card className="bg-white border-purple-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex justify-between">
              영양제
              <Apple className="w-4 h-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">75% <span className="text-sm font-normal text-gray-500">완료</span></div>
            <div className="mt-2 text-xs text-blue-600 font-medium">2개 남았어요 💊</div>
            <Progress value={75} className="h-2 mt-2 bg-blue-100" indicatorClassName="bg-blue-500" />
          </CardContent>
        </Card>

        {/* 걸음수 */}
        <Card className="bg-white border-purple-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex justify-between">
              걸음수
              <Activity className="w-4 h-4 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{steps.toLocaleString()} <span className="text-sm font-normal text-gray-500">걸음</span></div>
            <div className="mt-2 text-xs text-green-600 font-medium">
               {steps >= stepGoal ? "목표 달성! 🎉" : `${(stepGoal - steps).toLocaleString()} 걸음 남음`}
            </div>
            <Progress value={stepProgress} className="h-2 mt-2 bg-green-100" indicatorClassName="bg-green-500" />
          </CardContent>
        </Card>

        {/* 컨디션 & 체중 */}
        <Card className="bg-white border-purple-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex justify-between">
              컨디션 & 체중
              <Smile className="w-4 h-4 text-orange-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
                <div>
                    <div className="text-sm text-gray-500 mb-1">오늘 기분</div>
                    <div className="text-2xl">{getConditionEmoji(condition)} <span className="text-lg font-medium text-gray-700">{condition}</span></div>
                </div>
                <div className="text-right">
                     <div className="text-sm text-gray-500 mb-1">체중</div>
                     <div className="text-xl font-bold text-gray-900">{weight} <span className="text-sm font-normal text-gray-500">kg</span></div>
                </div>
            </div>
            {healthData?.notes && (
                <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded-md truncate">
                    📝 {healthData.notes}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
