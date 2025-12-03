import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle, ShoppingBag, Users, Calendar, ArrowRight, Heart } from 'lucide-react';
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";


export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

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

      {/* Section 2: Features */}
      <section className="snap-start h-screen w-full relative flex items-center justify-center bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">하나의 앱으로 완성하는 반려생활</h2>
            <p className="text-slate-500 text-lg">PetLog의 핵심 기능을 만나보세요</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "AI 다이어리",
                desc: "사진만 올리면 완성되는\n감성 가득한 육아일기",
                icon: Calendar,
                color: "bg-pink-50 text-pink-600",
                href: "/ai-studio/diary"
              },
              {
                title: "펫 챗봇",
                desc: "우리 아이 마음을 읽어주는\n똑똑한 AI 상담소",
                icon: MessageCircle,
                color: "bg-purple-50 text-purple-600",
                href: "/chatbot"
              },
              {
                title: "소셜 피드",
                desc: "비슷한 친구들과 나누는\n즐거운 일상 공유",
                icon: Users,
                color: "bg-rose-50 text-rose-600",
                href: "/feed"
              },
              {
                title: "펫 쇼핑",
                desc: "엄선된 프리미엄 용품을\n특별한 혜택으로",
                icon: ShoppingBag,
                color: "bg-orange-50 text-orange-600",
                href: "/shop"
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
              >
                <Link to={feature.href} className="block h-full group">
                  <div className="h-full p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                    <div className={`w - 14 h - 14 rounded - 2xl ${feature.color} flex items - center justify - center mb - 6 group - hover: scale - 110 transition - transform`}>
                      <feature.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
                    <p className="text-slate-500 whitespace-pre-line leading-relaxed">{feature.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
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
