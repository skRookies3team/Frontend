import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/shared/ui/button"
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
    .filter(item => item.type === 'WRITEDIARY' || item.type === 'WRITEFEED' || item.type === 'WRITERECAP')
    .reduce((sum, item) => sum + item.amount, 0)

  const totalUsed = logs
    .filter(item => item.type === 'BUY')
    .reduce((sum, item) => sum + item.amount, 0)

  const getDescription = (type: string) => {
    switch (type) {
      case 'WRITEDIARY': return "AI 다이어리 작성"
      case 'WRITEFEED': return "게시물 공유"
      case 'WRITERECAP': return "AI 리캡 생성"
      case 'BUY': return "구매 할인 사용"
      default: return "기타"
    }
  }

  const isEarned = (type: string) => type === 'WRITEDIARY' || type === 'WRITEFEED' || type === 'WRITERECAP'

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50">
      <header className="sticky top-0 z-40 border-b border-pink-100 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex max-w-4xl items-center gap-4 px-4 py-4">
          <Link to="/profile">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="h-6 w-6 text-pink-600" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-pink-600 md:text-2xl">마일리지</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl space-y-6 p-4 md:p-6">
        {/* Balance Card */}
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-pink-500 to-rose-500 shadow-xl">
          <CardContent className="p-6 text-white md:p-8">
            <div className="mb-2 flex items-center gap-2">
              <Coins className="h-6 w-6 md:h-7 md:w-7" />
              <p className="text-sm font-medium opacity-90 md:text-base">내 잔액</p>
            </div>
            <p className="text-5xl font-bold md:text-6xl">{balance.toLocaleString()}</p>
            <p className="mt-1 text-sm opacity-75 md:text-base">마일리지 포인트</p>
          </CardContent>
        </Card>

        {/* Stats - Shows stats for the CURRENT VIEW (Filtered) */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <Card className="border-pink-100 shadow-md">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-2 text-green-500">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6" />
                <p className="text-sm font-medium md:text-base">목록 내 적립</p>
              </div>
              <p className="mt-2 text-2xl font-bold text-pink-600 md:text-3xl">+{totalEarned.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="border-pink-100 shadow-md">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-2 text-red-500">
                <TrendingDown className="h-5 w-5 md:h-6 md:w-6" />
                <p className="text-sm font-medium md:text-base">목록 내 사용</p>
              </div>
              <p className="mt-2 text-2xl font-bold text-pink-600 md:text-3xl">-{totalUsed.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-all md:text-base ${filter === "all"
                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md"
                : "bg-white text-pink-600 hover:bg-pink-100"
              }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilter("earned")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-all md:text-base ${filter === "earned"
                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md"
                : "bg-white text-pink-600 hover:bg-pink-100"
              }`}
          >
            적립
          </button>
          <button
            onClick={() => setFilter("used")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-all md:text-base ${filter === "used"
                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md"
                : "bg-white text-pink-600 hover:bg-pink-100"
              }`}
          >
            사용
          </button>
        </div>

        {/* History */}
        <Card className="border-pink-100 shadow-lg">
          <CardContent className="divide-y divide-pink-100 p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">로딩 중...</div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">내역이 없습니다.</div>
            ) : (
              logs.map((item, index) => {
                const earned = isEarned(item.type)
                return (
                  <div key={index} className="flex items-center justify-between p-4 md:p-5">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full md:h-12 md:w-12 ${earned ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                          }`}
                      >
                        {earned ? (
                          <TrendingUp className="h-5 w-5 md:h-6 md:w-6" />
                        ) : (
                          <TrendingDown className="h-5 w-5 md:h-6 md:w-6" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-pink-600 md:text-lg">{getDescription(item.type)}</p>
                        <p className="text-xs text-muted-foreground md:text-sm">
                          {new Date(item.createdAt).toLocaleDateString("ko-KR")}{" "}
                          {new Date(item.createdAt).toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold md:text-lg ${earned ? "text-green-500" : "text-red-500"}`}>
                        {earned ? "+" : "-"}
                        {item.amount.toLocaleString()}
                      </p>
                      {/* Balance per transaction not available in this API, hiding it */}
                      {/* <p className="text-xs text-muted-foreground md:text-sm">{item.balance} 포인트</p> */}
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
