import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, TrendingUp, TrendingDown, Coins } from "lucide-react"

const MILEAGE_HISTORY = [
  {
    id: "1",
    type: "earned",
    amount: 100,
    description: "AI 다이어리 작성",
    date: "2024-01-15T10:30:00",
    balance: 1250,
  },
  {
    id: "2",
    type: "used",
    amount: -50,
    description: "구매 할인 사용",
    date: "2024-01-14T15:20:00",
    balance: 1150,
  },
  {
    id: "3",
    type: "earned",
    amount: 100,
    description: "AI 다이어리 작성",
    date: "2024-01-13T09:15:00",
    balance: 1200,
  },
  {
    id: "4",
    type: "earned",
    amount: 50,
    description: "게시물 공유",
    date: "2024-01-12T18:45:00",
    balance: 1100,
  },
  {
    id: "5",
    type: "earned",
    amount: 100,
    description: "AI 다이어리 작성",
    date: "2024-01-11T14:30:00",
    balance: 1050,
  },
]

export default function MileagePage() {
  const [filter, setFilter] = useState<"all" | "earned" | "used">("all")

  const filteredHistory = MILEAGE_HISTORY.filter((item) => {
    if (filter === "all") return true
    return item.type === filter
  })

  const totalEarned = MILEAGE_HISTORY.filter((item) => item.type === "earned").reduce(
    (sum, item) => sum + item.amount,
    0,
  )

  const totalUsed = Math.abs(
    MILEAGE_HISTORY.filter((item) => item.type === "used").reduce((sum, item) => sum + item.amount, 0),
  )

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
            <p className="text-5xl font-bold md:text-6xl">1,250</p>
            <p className="mt-1 text-sm opacity-75 md:text-base">마일리지 포인트</p>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <Card className="border-pink-100 shadow-md">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-2 text-green-500">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6" />
                <p className="text-sm font-medium md:text-base">적립</p>
              </div>
              <p className="mt-2 text-2xl font-bold text-pink-600 md:text-3xl">+{totalEarned}</p>
            </CardContent>
          </Card>

          <Card className="border-pink-100 shadow-md">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-2 text-red-500">
                <TrendingDown className="h-5 w-5 md:h-6 md:w-6" />
                <p className="text-sm font-medium md:text-base">사용</p>
              </div>
              <p className="mt-2 text-2xl font-bold text-pink-600 md:text-3xl">-{totalUsed}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-all md:text-base ${
              filter === "all"
                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md"
                : "bg-white text-pink-600 hover:bg-pink-100"
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilter("earned")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-all md:text-base ${
              filter === "earned"
                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md"
                : "bg-white text-pink-600 hover:bg-pink-100"
            }`}
          >
            적립
          </button>
          <button
            onClick={() => setFilter("used")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-all md:text-base ${
              filter === "used"
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
            {filteredHistory.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 md:p-5">
                <div className="flex items-center gap-3 md:gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full md:h-12 md:w-12 ${
                      item.type === "earned" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                    }`}
                  >
                    {item.type === "earned" ? (
                      <TrendingUp className="h-5 w-5 md:h-6 md:w-6" />
                    ) : (
                      <TrendingDown className="h-5 w-5 md:h-6 md:w-6" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-pink-600 md:text-lg">{item.description}</p>
                    <p className="text-xs text-muted-foreground md:text-sm">
                      {new Date(item.date).toLocaleDateString("ko-KR")}{" "}
                      {new Date(item.date).toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold md:text-lg ${item.type === "earned" ? "text-green-500" : "text-red-500"}`}>
                    {item.amount > 0 ? "+" : ""}
                    {item.amount}
                  </p>
                  <p className="text-xs text-muted-foreground md:text-sm">{item.balance} 포인트</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
