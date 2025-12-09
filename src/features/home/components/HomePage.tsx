import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { Sparkles, MessageCircle, Activity, Users, Calendar, ArrowRight, Heart, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/features/auth/context/auth-context";


export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirect to dashboard if user is logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);


  if (!isMounted) return null;

  return (
    <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-white text-slate-900 scroll-smooth">

      {/* Section 1: Hero */}
      <section className="snap-start h-screen w-full relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-rose-50 via-white to-pink-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-rose-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-md border border-pink-100 shadow-sm text-pink-600 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>반려동물 슈퍼앱 PetLog</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900">
              모든 순간을 <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
                특별하게 기록하세요
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
              AI가 써주는 우리 아이의 일기부터 건강관리, 쇼핑까지.<br />
              반려동물과 함께하는 더 행복한 일상을 선물합니다.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/login">
                <Button size="lg" className="rounded-full px-8 h-14 text-lg bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl transition-all">
                  지금 시작하기
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-lg border-slate-200 hover:bg-slate-50 text-slate-600">
                  더 알아보기
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 2: Features Showcase */}
      <section className="snap-start h-screen w-full relative flex items-center justify-center bg-white overflow-hidden">
        <div className="container mx-auto px-6 h-full flex flex-col justify-center pb-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 mt-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">실제로 체험해보세요</h2>
            <p className="text-slate-500 text-lg">PetLog의 핵심 기능들을 미리 확인해보세요</p>
          </motion.div>

          <div className="relative max-w-5xl mx-auto w-full">
            {/* Navigation Buttons */}
            <button
              onClick={() => setActiveFeature((prev) => (prev - 1 + 4) % 4)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 p-3 rounded-full bg-white shadow-lg text-slate-400 hover:text-slate-900 transition-colors hidden md:block"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setActiveFeature((prev) => (prev + 1) % 4)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 p-3 rounded-full bg-white shadow-lg text-slate-400 hover:text-slate-900 transition-colors hidden md:block"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Main Card */}
            <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border-2 border-slate-100 relative h-[600px] flex flex-col">
              {/* Dynamic Border Color */}
              <motion.div
                className={`absolute inset-0 border-[3px] rounded-[2rem] pointer-events-none z-20`}
                animate={{
                  borderColor: [
                    "rgba(236, 72, 153, 0.5)", // Pink (Diary)
                    "rgba(168, 85, 247, 0.5)", // Purple (Chatbot)
                    "rgba(244, 63, 94, 0.5)",  // Rose (Social)
                    "rgba(16, 185, 129, 0.5)"  // Emerald (Health)
                  ][activeFeature]
                }}
                transition={{ duration: 0.5 }}
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex flex-col p-8 md:p-12"
                >
                  {/* Header */}
                  <div className="flex items-start gap-6 mb-8">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${["bg-pink-100 text-pink-600", "bg-purple-100 text-purple-600", "bg-rose-100 text-rose-600", "bg-emerald-100 text-emerald-600"][activeFeature]
                      }`}>
                      {(() => {
                        const Icon = [Calendar, MessageCircle, Users, Activity][activeFeature];
                        return <Icon className="w-8 h-8" />;
                      })()}
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                        {["AI 다이어리", "펫 챗봇", "소셜 피드", "헬스케어"][activeFeature]}
                      </h3>
                      <p className="text-slate-500 text-lg">
                        {[
                          "사진만 올리면 완성되는 감성 가득한 육아일기",
                          "우리 아이 마음을 읽어주는 똑똑한 AI 상담소",
                          "비슷한 친구들과 나누는 즐거운 일상 공유",
                          "반려동물의 건강을 실시간으로 모니터링하고 관리해요"
                        ][activeFeature]}
                      </p>
                    </div>
                  </div>

                  {/* Mockup Content Area */}
                  <div className="flex-1 bg-slate-50 rounded-3xl p-6 md:p-8 border border-slate-100">
                    {activeFeature === 0 && ( // Diary Mockup
                      <div className="flex flex-col md:flex-row gap-6 h-full">
                        <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                              <Sparkles className="w-5 h-5 text-pink-500" />
                            </div>
                            <div className="font-bold text-slate-700">오늘의 기분</div>
                          </div>
                          <div className="text-4xl mb-2">🥰</div>
                          <div className="text-slate-500 text-sm">행복함, 편안함</div>
                        </div>
                        <div className="flex-[2] bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-center">
                          <div className="text-sm text-slate-400 mb-2">2025년 12월 3일</div>
                          <div className="text-slate-700 leading-relaxed">
                            "오늘은 공원에서 새로운 친구를 만났어요! 처음엔 낯설어하더니 금방 꼬리를 흔들며 장난을 치더라고요. 돌아오는 길엔 뻗어서 잠들었답니다."
                          </div>
                          <div className="mt-4 flex gap-2">
                            <span className="px-3 py-1 bg-pink-50 text-pink-600 text-xs rounded-full font-medium">#산책</span>
                            <span className="px-3 py-1 bg-pink-50 text-pink-600 text-xs rounded-full font-medium">#새친구</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeFeature === 1 && ( // Chatbot Mockup
                      <div className="flex flex-col md:flex-row gap-6 h-full">
                        <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                          <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mb-4 relative">
                            <MessageCircle className="w-10 h-10 text-purple-600" />
                            <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
                          </div>
                          <h4 className="font-bold text-lg text-slate-900">AI 수의사</h4>
                          <p className="text-sm text-slate-500 mb-4">언제든 물어보세요!</p>
                          <div className="w-full bg-purple-50 rounded-xl p-3 text-xs text-purple-700 font-medium">
                            응답시간: 즉시
                          </div>
                        </div>
                        <div className="flex-[2] bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-center gap-4">
                          <div className="flex gap-4 items-end">
                            <div className="bg-slate-50 p-4 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 max-w-[90%]">
                              <p className="text-slate-700 text-sm md:text-base">우리 강아지가 요즘 사료를 잘 안 먹는데 왜 그럴까?</p>
                            </div>
                          </div>
                          <div className="flex gap-4 items-end flex-row-reverse">
                            <div className="bg-purple-50 p-4 rounded-2xl rounded-br-none shadow-sm text-slate-700 max-w-[90%]">
                              <p className="text-sm md:text-base leading-relaxed">
                                <span className="font-bold text-purple-700">답변:</span> 스트레스나 소화 불량일 수 있어요. 가벼운 산책으로 입맛을 돋워주세요! 🐕
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeFeature === 2 && ( // Social Mockup
                      <div className="flex flex-col md:flex-row gap-6 h-full">
                        <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                          <div className="w-20 h-20 rounded-full bg-slate-100 mb-4 overflow-hidden">
                            <img src="/placeholder.svg?height=80&width=80" alt="Profile" className="w-full h-full object-cover opacity-50" />
                          </div>
                          <h4 className="font-bold text-lg text-slate-900">초코맘</h4>
                          <div className="flex gap-4 mt-4 w-full justify-center">
                            <div className="text-center">
                              <div className="font-bold text-slate-900">1.2k</div>
                              <div className="text-xs text-slate-500">팔로워</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-slate-900">450</div>
                              <div className="text-xs text-slate-500">팔로잉</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-[2] bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden flex items-center justify-center">
                          <div className="absolute inset-0 grid grid-cols-2 gap-4 p-4 opacity-50">
                            <div className="bg-slate-50 rounded-xl shadow-sm h-32"></div>
                            <div className="bg-slate-50 rounded-xl shadow-sm h-40"></div>
                            <div className="bg-slate-50 rounded-xl shadow-sm h-40"></div>
                            <div className="bg-slate-50 rounded-xl shadow-sm h-32"></div>
                          </div>
                          <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 w-48 rotate-[-6deg] z-10 transform transition-transform hover:scale-105">
                            <div className="aspect-square bg-rose-100 rounded-xl mb-3 flex items-center justify-center">
                              <Heart className="w-10 h-10 text-rose-400" fill="currentColor" />
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-700">산책 중!</span>
                              <Heart className="w-4 h-4 text-rose-500" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeFeature === 3 && ( // Health Mockup
                      <div className="flex flex-col md:flex-row gap-6 h-full">
                        <div className="flex-1 flex flex-col gap-4">
                          <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
                            <div className="text-emerald-600 font-bold mb-2 text-sm flex items-center gap-2">
                              <Activity className="w-4 h-4" /> 심박수
                            </div>
                            <div>
                              <span className="text-4xl font-bold text-slate-900">85</span>
                              <span className="text-slate-500 text-sm ml-1">bpm</span>
                            </div>
                          </div>
                          <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
                            <div className="text-blue-600 font-bold mb-2 text-sm flex items-center gap-2">
                              <Activity className="w-4 h-4" /> 호흡수
                            </div>
                            <div>
                              <span className="text-4xl font-bold text-slate-900">24</span>
                              <span className="text-slate-500 text-sm ml-1">회/분</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex-[2] bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
                          <div className="flex items-center gap-2 mb-6 text-emerald-600 font-bold text-lg">
                            <Activity className="w-6 h-6" />
                            <span>AI 건강 진단 리포트</span>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center gap-4 p-3 bg-emerald-50 rounded-xl">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                <Check className="w-4 h-4 text-emerald-600" />
                              </div>
                              <span className="text-slate-700 font-medium">전반적인 활동량 정상</span>
                            </div>
                            <div className="flex items-center gap-4 p-3 bg-emerald-50 rounded-xl">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                <Check className="w-4 h-4 text-emerald-600" />
                              </div>
                              <span className="text-slate-700 font-medium">수면 패턴 양호 (8시간)</span>
                            </div>
                            <div className="flex items-center gap-4 p-3 bg-emerald-50 rounded-xl">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                <Check className="w-4 h-4 text-emerald-600" />
                              </div>
                              <span className="text-slate-700 font-medium">식욕 및 배변 점수 우수</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-3 mt-8">
              {[0, 1, 2, 3].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveFeature(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${activeFeature === idx
                    ? "w-8 bg-slate-900"
                    : "w-2 bg-slate-300 hover:bg-slate-400"
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Vision & Stats */}
      <section className="snap-start h-screen w-full relative flex items-center justify-center bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                12,000명의 보호자가<br />
                선택한 이유
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                PetLog는 단순한 기록 도구가 아닙니다.<br />
                반려동물과의 교감을 돕고, 더 나은 삶을 제안하는<br />
                당신의 든든한 파트너입니다.
              </p>

              <div className="grid grid-cols-2 gap-8 pt-4">
                <div>
                  <div className="text-4xl font-bold text-pink-600 mb-2">98%</div>
                  <div className="text-slate-500">사용자 만족도</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-pink-600 mb-2">50K+</div>
                  <div className="text-slate-500">생성된 AI 일기</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-square rounded-[2rem] bg-white p-8 shadow-2xl relative z-10 flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-100 rounded-full blur-3xl -mr-16 -mt-16 opacity-50" />

                <div className="space-y-6 relative">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-pink-500" fill="currentColor" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">오늘의 기록</div>
                      <div className="text-sm text-slate-500">2025. 11. 24</div>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 text-slate-600 italic">
                    "오늘 산책에서는 나비가 처음으로 친구를 만났어요. 꼬리를 살랑이며 다가가는 모습이 너무 사랑스러웠답니다..."
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-pink-600 font-medium">
                  <Sparkles className="w-4 h-4" />
                  AI가 작성한 일기입니다
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -z-10 top-10 -right-10 w-full h-full rounded-[2rem] bg-pink-200/50" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 4: CTA & Footer */}
      <section className="snap-start h-screen w-full relative flex flex-col">
        <div className="flex-1 flex items-center justify-center bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-5" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-pink-600/20 rounded-full blur-[100px]" />
          </div>

          <div className="container mx-auto px-6 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h2 className="text-4xl md:text-6xl font-bold">
                지금 바로 시작해보세요
              </h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                3분이면 충분합니다. 우리 아이와의 특별한 이야기를<br />
                PetLog에서 만들어가세요.
              </p>
              <div className="pt-8">
                <Link to="/login">
                  <Button size="lg" className="rounded-full px-10 h-16 text-xl bg-white text-slate-900 hover:bg-pink-50 hover:scale-105 transition-all duration-300">
                    무료로 시작하기
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-sm">
                © 2025 PetLog. All rights reserved.
              </div>
              <div className="flex gap-8 text-sm">
                <Link to="#" className="hover:text-white transition-colors">이용약관</Link>
                <Link to="#" className="hover:text-white transition-colors">개인정보처리방침</Link>
                <Link to="#" className="hover:text-white transition-colors">문의하기</Link>
              </div>
            </div>
          </div>
        </footer>
      </section>

    </div>
  );
}
