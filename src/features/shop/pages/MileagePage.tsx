import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

import { Card, CardContent } from "@/shared/ui/card"
import { ChevronLeft, TrendingUp, TrendingDown, Coins } from "lucide-react"
import { useAuth } from "@/features/auth/context/auth-context"
import {
  getCoinLogsApi,
  getCoinAddLogsApi,
  getCoinUseLogsApi,
  getUserCoinApi,
  CreateCoinLogDto
} from "@/features/auth/api/auth-api"

export default function MileagePage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState<"all" | "earned" | "used">("all")
  const [logs, setLogs] = useState<CreateCoinLogDto[]>([])
  const [balance, setBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch Balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (user?.id) {
        try {
          const coinData = await getUserCoinApi(Number(user.id))
          setBalance(coinData.petCoin)
        } catch (error) {
          console.error("Failed to fetch coin balance:", error)
        }
      }
    }
    fetchBalance()
  }, [user?.id])

  // Fetch Logs based on Filter
  useEffect(() => {
    const fetchLogs = async () => {
      if (!user) return
      setIsLoading(true)
      try {
        let response
        if (filter === "all") {
          response = await getCoinLogsApi()
        } else if (filter === "earned") {
          response = await getCoinAddLogsApi()
        } else {
          response = await getCoinUseLogsApi()
        }
        setLogs(response.coins)
      } catch (error) {
        console.error("Failed to fetch coin logs:", error)
        setLogs([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchLogs()
  }, [filter, user]) // Re-fetch when filter changes

  // Stats calculation (based on currently fetched logs - simpler approach as per requirements)
  // For precise total-lifetime stats, backend aggregation is preferred, but here we sum the list.
  const totalEarned = logs
    .filter(item => item.type === 'WRITEDIARY' || item.type === 'WIRTEFEED' || item.type === 'RECAP')
    .reduce((sum, item) => sum + item.amount, 0)

  const totalUsed = logs
    .filter(item => item.type === 'BUY')
    .reduce((sum, item) => sum + item.amount, 0)

  const getDescription = (type: string) => {
    switch (type) {
      case 'WRITEDIARY': return "AI 다이어리 작성"
      case 'WIRTEFEED': return "게시물 공유"
      case 'RECAP': return "AI 리캡 생성"
      case 'BUY': return "구매 할인 사용"
      default: return "기타"
    }
  }

  const isEarned = (type: string) => type === 'WRITEDIARY' || type === 'WIRTEFEED' || type === 'RECAP'

  return (
    <div className="min-h-screen p-4 md:p-8"
      style={{
        backgroundColor: '#FFF0F5',
        backgroundImage: `
          linear-gradient(90deg, rgba(255, 182, 193, 0.3) 50%, transparent 50%),
          linear-gradient(rgba(255, 182, 193, 0.3) 50%, transparent 50%)
        `,
        backgroundSize: '60px 60px'
      }}
    >
      <div className="mx-auto max-w-md space-y-6">
        {/* Header - Transparent & Cute */}
        <header className="flex items-center py-2">
          <Link to="/shop" className="flex items-center gap-2 rounded-full bg-white/90 px-6 py-3 shadow-sm transition-all hover:bg-white hover:scale-105 active:scale-95">
            <ChevronLeft className="h-6 w-6 text-[#FF92A0]" strokeWidth={3} />
            <span className="text-2xl font-black tracking-tight text-[#FF92A0]">
              마일리지
            </span>
          </Link>
        </header>

        {/* Balance Card - Pink Sticky Note Style */}
        <div className="relative overflow-hidden rounded-[2rem] bg-[#FF92A0] p-8 text-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)] transition-transform hover:-translate-y-1">
          {/* Decorative visual element (tape/circle) */}
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/20" />
          <div className="absolute -left-4 -bottom-4 h-16 w-16 rounded-full bg-white/20" />

          <div className="relative z-10 flex items-center gap-2 mb-2">
            <div className="rounded-full bg-white/20 p-2">
              <Coins className="h-6 w-6 text-white" />
            </div>
            <span className="text-lg font-bold">마일리지 포인트</span>
          </div>

          <p className="relative z-10 text-4xl font-black tracking-tight">{balance.toLocaleString()} P</p>

          <div className="relative z-10 my-4 border-t-2 border-dashed border-white/40" />

          <div className="relative z-10 space-y-2">
            <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="font-bold opacity-90">적립</span>
              </div>
              <span className="font-black">+{totalEarned.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-2">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                <span className="font-bold opacity-90">사용</span>
              </div>
              <span className="font-black">-{totalUsed.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Filter & History Section - Notepad Style */}
        <div className="overflow-hidden rounded-[2rem] border-4 border-white bg-[#FFFDF5] shadow-lg">
          {/* Tabs */}
          <div className="flex border-b-4 border-white bg-[#FFF9C4]">
            <button
              onClick={() => setFilter("all")}
              className={`flex-1 py-4 text-center font-bold transition-colors ${filter === "all"
                ? "bg-[#FFFDF5] text-[#FF92A0]"
                : "text-gray-400 hover:bg-white/50"
                }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilter("earned")}
              className={`flex-1 py-4 text-center font-bold transition-colors ${filter === "earned"
                ? "bg-[#FFFDF5] text-[#FF92A0]"
                : "text-gray-400 hover:bg-white/50"
                }`}
            >
              적립
            </button>
            <button
              onClick={() => setFilter("used")}
              className={`flex-1 py-4 text-center font-bold transition-colors ${filter === "used"
                ? "bg-[#FFFDF5] text-[#FF92A0]"
                : "text-gray-400 hover:bg-white/50"
                }`}
            >
              사용
            </button>
          </div>

          {/* List Content */}
          <div className="min-h-[300px] p-2">
            {isLoading ? (
              <div className="py-20 text-center text-gray-400 font-bold">로딩 중...</div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <div className="mb-4 rounded-full bg-gray-100 p-6">
                  <Coins className="h-8 w-8 opacity-20" />
                </div>
                <p className="font-bold">내역이 없어요!</p>
              </div>
            ) : (
              logs.map((item, index) => {
                const earned = isEarned(item.type)
                return (
                  <div key={index} className="mb-2 flex items-center justify-between rounded-2xl border-2 border-transparent bg-white p-4 transition-all hover:border-[#FF92A0]/20 hover:shadow-sm">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${earned ? "bg-[#E6F9F0] text-[#00C896]" : "bg-[#FFE8E8] text-[#FF6B6B]"
                          }`}
                      >
                        {earned ? (
                          <TrendingUp className="h-6 w-6" />
                        ) : (
                          <TrendingDown className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-700">{getDescription(item.type)}</p>
                        <p className="text-xs font-medium text-gray-400">
                          {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                    </div>
                    <p className={`text-xl font-black ${earned ? "text-[#00C896]" : "text-[#FF6B6B]"}`}>
                      {earned ? "+" : "-"}
                      {item.amount.toLocaleString()}
                    </p>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
