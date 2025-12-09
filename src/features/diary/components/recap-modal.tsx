import { Badge } from "@/shared/ui/badge"
import { Sparkles } from "lucide-react"
import { Recap } from "@/features/diary/data/recap-data"

interface RecapModalProps {
    recap: Recap
    onClose: () => void
}

export function RecapModal({ recap, onClose }: RecapModalProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 shadow-lg transition-transform hover:scale-110"
                >
                    ×
                </button>

                <div className="relative aspect-video overflow-hidden">
                    <img
                        src={recap.coverImage || "/placeholder.svg"}
                        alt={recap.period}
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                        <Badge className="mb-2 bg-purple-500">
                            <Sparkles className="mr-1 h-3 w-3" />
                            AI 리캡
                        </Badge>
                        <h2 className="text-3xl font-bold">{recap.period}</h2>
                        <p className="mt-2 text-sm text-white/90">
                            {recap.createdAt} 생성 • {recap.totalMoments}개의 순간
                        </p>
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    <div className="prose prose-purple max-w-none">
                        <h3 className="text-2xl font-bold text-purple-600">초코와 함께한 {recap.period}</h3>

                        <p className="mt-4 text-lg leading-relaxed text-foreground">
                            {recap.period}은 초코에게 특별한 시간이었습니다. 추운 겨울을 이겨내며 함께한 따뜻한 순간들,
                            눈 내린 공원에서의 첫 산책, 그리고 집에서 보낸 포근한 시간들까지. AI가 이 기간 동안의
                            {recap.totalMoments}개 순간을 분석하여 가장 의미 있는 이야기로 엮어냈습니다.
                        </p>

                        <div className="my-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-6 border-2 border-green-100">
                            <h4 className="mb-4 text-xl font-bold text-green-700 flex items-center gap-2">💚 건강 리포트</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white rounded-xl p-4 shadow-sm">
                                    <p className="text-sm text-gray-600 mb-1">평균 심박수</p>
                                    <p className="text-2xl font-bold text-green-600">78 bpm</p>
                                    <p className="text-xs text-gray-500 mt-1">정상 범위</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 shadow-sm">
                                    <p className="text-sm text-gray-600 mb-1">평균 활동량</p>
                                    <p className="text-2xl font-bold text-blue-600">3,245 걸음</p>
                                    <p className="text-xs text-gray-500 mt-1">+12% ↑</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 shadow-sm">
                                    <p className="text-sm text-gray-600 mb-1">평균 수면시간</p>
                                    <p className="text-2xl font-bold text-purple-600">12.5 시간</p>
                                    <p className="text-xs text-gray-500 mt-1">적정 수준</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 shadow-sm">
                                    <p className="text-sm text-gray-600 mb-1">평균 체중</p>
                                    <p className="text-2xl font-bold text-orange-600">28.3 kg</p>
                                    <p className="text-xs text-gray-500 mt-1">안정적</p>
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-gray-700">
                                이번 달 초코는 전반적으로 건강한 상태를 유지했습니다. 활동량이 증가하고 수면 패턴도
                                안정적이었어요.
                            </p>
                        </div>

                        <h4 className="mt-6 text-xl font-bold text-purple-600">하이라이트</h4>
                        <ul className="space-y-3">
                            <li className="text-foreground">
                                <strong>첫 눈 산책:</strong> 생애 처음 보는 눈에 신나서 뛰어다니던 초코의 모습
                            </li>
                            <li className="text-foreground">
                                <strong>새 친구 만남:</strong> 공원에서 만난 같은 품종 친구와 금방 친해진 순간
                            </li>
                            <li className="text-foreground">
                                <strong>포근한 겨울:</strong> 난로 앞에서 함께 보낸 따뜻하고 평화로운 오후
                            </li>
                            <li className="text-foreground">
                                <strong>특별한 간식:</strong> 처음 맛본 수제 간식에 행복해하던 표정
                            </li>
                        </ul>

                        <div className="mt-8 rounded-2xl bg-gradient-to-r from-purple-100 to-pink-100 p-6">
                            <p className="text-center text-lg font-semibold text-purple-600">
                                "매 순간이 소중한 추억이 되었습니다 💕"
                            </p>
                        </div>

                        <p className="mt-6 text-foreground">
                            이 기간 동안 초코는 더욱 성장했고, 우리 가족과의 유대감도 깊어졌습니다. 함께 웃고, 뛰놀고, 때로는
                            조용히 곁을 지켜주던 모든 순간들이 이 리캡에 담겨 있습니다. 앞으로도 초코와 함께할 많은 순간들이
                            기대됩니다.
                        </p>
                    </div>

                    <div className="mt-8 rounded-2xl bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 p-6 text-center">
                        <p className="text-3xl font-bold text-purple-600">+500</p>
                        <p className="text-sm text-muted-foreground">펫코인 획득</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
