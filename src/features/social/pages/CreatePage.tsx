import { Link } from "react-router-dom"
import { Card, CardContent } from "@/shared/ui/card"
import { TabNavigation } from "@/shared/components/tab-navigation"
import { X, Sparkles, Camera } from "lucide-react"

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pb-20">
      <header className="sticky top-0 z-40 border-0 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
          <Link to="/feed" className="text-pink-600 hover:scale-110 transition-transform">
            <X className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">✨ 새로 만들기</h1>
          <div className="w-6" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="mx-auto max-w-lg p-4">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">🐾 어떤 이야기를 공유할까요?</h2>

          {/* Creation Options */}
          <div className="grid grid-cols-1 gap-4">
            <Link to="/ai-diary">
              <Card className="cursor-pointer overflow-hidden border-0 bg-gradient-to-br from-pink-400 via-purple-400 to-pink-500 transition-all hover:scale-[1.05] hover:shadow-2xl hover:rotate-1">
                <CardContent className="flex items-center gap-4 p-6 text-white">
                  <div className="rounded-full bg-white/30 p-4 backdrop-blur-sm">
                    <Sparkles className="h-10 w-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">✨ AI 다이어리</h3>
                    <p className="text-pink-50">오늘의 특별한 순간을 AI와 함께 기록해요</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/feed/create">
              <Card className="cursor-pointer overflow-hidden border-0 bg-white/70 backdrop-blur-sm transition-all hover:scale-[1.05] hover:shadow-2xl hover:-rotate-1 hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-50">
                <CardContent className="flex items-center gap-4 p-6 text-pink-600">
                  <div className="rounded-full bg-gradient-to-br from-pink-100 to-purple-100 p-4">
                    <Camera className="h-10 w-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">📸 일반 게시물</h3>
                    <p className="text-gray-600">사진과 함께 일상을 공유해요</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>

      <TabNavigation />
    </div>
  )
}
