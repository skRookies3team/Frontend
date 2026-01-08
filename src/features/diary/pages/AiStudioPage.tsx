import { Link } from "react-router-dom"
import { Button } from "@/shared/ui/button"
import { Sparkles, BookOpen, ArrowRight, Sun, Cloud, Star, Heart, Music, Sticker } from "lucide-react"

export default function AiStudioPage() {
  return (
    <div className="min-h-screen pb-20 md:pb-0 overflow-hidden relative font-sans"
      style={{
        backgroundColor: '#ffeef2',
        backgroundImage: `
          linear-gradient(90deg, rgba(255,255,255,0.6) 50%, transparent 50%),
          linear-gradient(rgba(255,255,255,0.6) 50%, transparent 50%)
        `,
        backgroundSize: '80px 80px'
      }}
    >
      {/* Decorative BGs - Floating Icons */}
      <div className="absolute top-10 left-10 text-pink-300 animate-bounce-slow"><Cloud className="w-16 h-16 fill-pink-100" /></div>
      <div className="absolute top-20 right-20 text-yellow-300 animate-pulse-slow"><Sun className="w-20 h-20 fill-yellow-100" /></div>
      <div className="absolute bottom-20 left-20 text-purple-300 animate-spin-slow" style={{ animationDuration: '10s' }}><Star className="w-12 h-12 fill-purple-100" /></div>

      <main className="container mx-auto max-w-5xl p-4 pt-12 md:p-8 md:pt-16 relative z-10">

        {/* Header - Hand-drawn style title */}
        <div className="mb-12 text-center relative">
          <div className="inline-block relative">
            <div className="absolute -top-6 -right-8 transform rotate-12">
              <Sparkles className="w-8 h-8 text-yellow-400 fill-yellow-200" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-pink-500 tracking-tight drop-shadow-sm" style={{ fontFamily: '"Jua", sans-serif' }}>
              AI Studio
            </h1>
            <div className="w-full h-4 bg-yellow-200/60 absolute bottom-1 left-0 -z-10 -rotate-1 rounded-full blur-[1px]"></div>
          </div>
          <p className="mt-4 text-gray-500 font-medium md:text-xl bg-white/60 inline-block px-4 py-1 rounded-full backdrop-blur-sm">
            반려동물의 특별한 순간을 AI와 함께 기록해요 
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 items-start">
          {/* AI 다이어리 - Yellow Sticky Note Style */}
          <Link to="/ai-studio/diary/calendar" className="group block transform transition-all hover:-translate-y-2 hover:rotate-1 duration-300">
            <div className="relative bg-[#fff9c4] rounded-[2rem] p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.05)] border-2 border-white/50 h-full">
              {/* Tape Decoration */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-white/40 rotate-1 backdrop-blur-sm shadow-sm z-10"></div>

              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-inner border border-yellow-100">
                  <Sparkles className="h-8 w-8 text-yellow-500 fill-yellow-200" />
                </div>
                <div className="bg-white/80 px-3 py-1 rounded-full text-xs font-bold text-yellow-600 border border-yellow-100">
                  BEST
                </div>
              </div>

              <h2 className="mb-3 text-3xl font-bold text-gray-800" style={{ fontFamily: '"Jua", sans-serif' }}>AI 다이어리</h2>
              <p className="mb-6 text-gray-600 font-medium leading-relaxed">
                오늘 찍은 사진만 올려주세요!<br />
                AI가 귀염뽀짝한 그림일기를 그려드려요 🐕
              </p>

              <div className="space-y-3 bg-white/50 p-4 rounded-xl mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <Heart className="w-4 h-4 text-pink-400 fill-pink-400" /> <span>사진 1-6장 선택</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <Music className="w-4 h-4 text-blue-400 fill-blue-400" /> <span>AI가 자동으로 일기 생성</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <Sticker className="w-4 h-4 text-yellow-500 fill-yellow-500" /> <span>15 펫코인 획득</span>
                </div>
              </div>

              <Button className="w-full rounded-xl bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all h-14 text-lg shadow-sm">
                다이어리 쓰러가기 <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              {/* Sticker Decor */}
              <div className="absolute -bottom-4 -right-2 transform rotate-12 opacity-80 group-hover:scale-110 transition-transform">
                <img src="https://cdn-icons-png.flaticon.com/512/3063/3063823.png" alt="dog" className="w-16 h-16 drop-shadow-md" />
              </div>
            </div>
          </Link>

          {/* AI 리캡 - Pink Sticky Note Style */}
          <Link to="/ai-studio/recap" className="group block transform transition-all hover:-translate-y-2 hover:-rotate-1 duration-300 md:mt-12">
            <div className="relative bg-[#ffdde1] rounded-[2rem] p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.05)] border-2 border-white/50 h-full">
              {/* Tape Decoration */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-white/40 -rotate-2 backdrop-blur-sm shadow-sm z-10"></div>

              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-inner border border-pink-100">
                  <BookOpen className="h-8 w-8 text-pink-500 fill-pink-200" />
                </div>
                <div className="bg-white/80 px-3 py-1 rounded-full text-xs font-bold text-pink-600 border border-pink-100">
                  Special
                </div>
              </div>

              <h2 className="mb-3 text-3xl font-bold text-gray-800" style={{ fontFamily: '"Jua", sans-serif' }}>AI 월간 리캡</h2>
              <p className="mb-6 text-gray-600 font-medium leading-relaxed">
                한 달 동안의 추억을 모아모아!<br />
                우리 아이만의 매거진을 만들어드려요 📚
              </p>

              <div className="space-y-3 bg-white/50 p-4 rounded-xl mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> <span>월간 하이라이트</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <Sparkles className="w-4 h-4 text-purple-400 fill-purple-400" /> <span>자동 생성 및 기간 선택</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <Sticker className="w-4 h-4 text-purple-400 fill-purple-400" /> <span>30 펫코인 선물</span>
                </div>
              </div>

              <Button className="w-full rounded-xl bg-pink-400 hover:bg-pink-500 text-white font-bold border-b-4 border-pink-600 active:border-b-0 active:translate-y-1 transition-all h-14 text-lg shadow-sm">
                리캡 보러가기 <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              {/* Sticker Decor */}
              <div className="absolute -top-6 -right-4 transform -rotate-6 opacity-80 group-hover:scale-110 transition-transform">
                <div className="bg-white rounded-full p-2 border-2 border-gray-100 shadow-md">
                  <Heart className="w-8 h-8 text-red-400 fill-red-400" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Floating Bottom Tip */}
        <div className="mt-12 md:mt-24 transform rotate-1 max-w-2xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-[4px_4px_0px_rgba(0,0,0,0.05)] border-2 border-dashed border-gray-300 relative flex items-center gap-4">
            <div className="absolute -left-2 -top-2 bg-blue-100 rounded-full p-2 border-2 border-white shadow-sm">
              <Sun className="w-6 h-6 text-blue-500" />
            </div>
            <div className="pl-4">
              <h3 className="font-bold text-gray-700 text-lg mb-1" style={{ fontFamily: '"Jua", sans-serif' }}>나만의 꾸미기 팁!</h3>
              <p className="text-gray-500 font-medium text-sm">
                다이어리 작성 후에는 스티커와 테이프로 더 예쁘게 꾸밀 수 있어요. <br className="hidden md:block" />
                AI가 만들어준 초안을 자유롭게 수정해보세요! 🎨
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
