import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/shared/ui/button"
import { Card, CardContent } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { ArrowLeft, BookOpen, Sparkles, Calendar, Loader2, Plus, X } from "lucide-react"
import { RecapSimpleResponse } from "@/features/diary/types/recap"
import { getUserRecapsApi, generateAutoRecapApi, generateManualRecapApi } from "@/features/diary/api/diary-api"

export default function AiRecapPage() {
  const navigate = useNavigate()
  const [recaps, setRecaps] = useState<RecapSimpleResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Recap generation dialog state
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [generationMode, setGenerationMode] = useState<'auto' | 'manual'>('auto')
  const [generating, setGenerating] = useState(false)
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null)
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [generationError, setGenerationError] = useState<string | null>(null)

  // Get userId and petId from localStorage
  const userId = parseInt(localStorage.getItem('userId') || '1')
  const defaultPetId = parseInt(localStorage.getItem('petId') || '1')

  useEffect(() => {
    setSelectedPetId(defaultPetId)
  }, [defaultPetId])

  useEffect(() => {
    fetchRecaps()
  }, [userId])

  const fetchRecaps = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getUserRecapsApi(userId)
      setRecaps(data)
    } catch (err) {
      console.error('Failed to fetch recaps:', err)
      setError('리캡 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleRecapClick = (recapId: number) => {
    navigate(`/recap/${recapId}`)
  }

  const handleGenerateRecap = async () => {
    if (!selectedPetId) {
      setGenerationError('펫을 선택해주세요.')
      return
    }

    if (generationMode === 'manual' && (!periodStart || !periodEnd)) {
      setGenerationError('기간을 선택해주세요.')
      return
    }

    try {
      setGenerating(true)
      setGenerationError(null)

      if (generationMode === 'auto') {
        await generateAutoRecapApi({
          petId: selectedPetId,
          userId: userId,
        })
      } else {
        await generateManualRecapApi({
          petId: selectedPetId,
          userId: userId,
          periodStart: periodStart,
          periodEnd: periodEnd,
        })
      }

      // Refresh recap list
      await fetchRecaps()

      // Close dialog
      setShowGenerateDialog(false)

      // Reset form
      setGenerationMode('auto')
      setPeriodStart('')
      setPeriodEnd('')
      setGenerationError(null)
    } catch (err: any) {
      console.error('Failed to generate recap:', err)
      setGenerationError(err.message || '리캡 생성에 실패했습니다.')
    } finally {
      setGenerating(false)
    }
  }

  // Format date display (yyyy-MM-dd -> yyyy.MM.dd)
  const formatDate = (dateStr: string) => dateStr.replace(/-/g, '.')

  // Format period display
  const formatPeriod = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)

    const startYear = startDate.getFullYear()
    const endYear = endDate.getFullYear()
    const startMonth = startDate.getMonth() + 1
    const endMonth = endDate.getMonth() + 1

    // 같은 년도, 같은 월
    if (startYear === endYear && startMonth === endMonth) {
      return `${startYear}년 ${startMonth}월`
    }

    // 같은 년도, 다른 월
    if (startYear === endYear) {
      return `${startYear}년 ${startMonth}월 ~ ${endMonth}월`
    }

    // 다른 년도
    return `${startYear}년 ${startMonth}월 ~ ${endYear}년 ${endMonth}월`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-purple-100 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link to="/ai-studio" className="text-purple-600">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-bold text-purple-600 md:text-xl">AI 리캡</h1>
          <div className="w-6" />
        </div>
      </header>

      <main className="container mx-auto max-w-4xl p-4 md:p-6">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 md:h-24 md:w-24">
            <BookOpen className="h-10 w-10 text-white md:h-12 md:w-12" />
          </div>
          <h2 className="text-balance text-2xl font-bold text-purple-600 md:text-3xl">반려동물과의 특별한 순간들</h2>
          <p className="mt-2 text-pretty text-muted-foreground md:text-lg">
            1달마다 자동으로 생성되는 감동적인 리캡을 확인하세요
          </p>
        </div>

        <Card className="mb-6 border-purple-100 bg-purple-50">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <Calendar className="mt-1 h-5 w-5 text-purple-600" />
                <div>
                  <h3 className="mb-1 font-semibold text-purple-600">리캡 생성하기</h3>
                  <p className="text-sm text-muted-foreground">
                    지난달 리캡을 자동으로 생성하거나 원하는 기간을 선택해서 리캡을 만들 수 있습니다.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowGenerateDialog(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                생성하기
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        ) : recaps.length === 0 ? (
          <Card className="border-purple-200 bg-white">
            <CardContent className="p-8 text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-purple-300" />
              <p className="text-muted-foreground">아직 생성된 리캡이 없습니다.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                위의 '생성하기' 버튼을 눌러 첫 리캡을 만들어보세요!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {recaps.map((recap) =>
              recap.status === "WAITING" ? (
                <Card key={recap.recapId} className="border-2 border-dashed border-purple-200 bg-purple-50/50 shadow-none">
                  <CardContent className="flex min-h-[280px] flex-col items-center justify-center p-6 text-center md:p-8">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                      <Calendar className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-purple-600">
                      {formatPeriod(recap.periodStart, recap.periodEnd)}
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {formatDate(recap.createdAt.split('T')[0])}에 생성 예정
                    </p>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-600">
                      생성 대기 중
                    </Badge>
                  </CardContent>
                </Card>
              ) : (
                <div
                  key={recap.recapId}
                  onClick={() => handleRecapClick(recap.recapId)}
                  className="group cursor-pointer overflow-hidden rounded-2xl border-2 border-transparent bg-white shadow-lg transition-all hover:border-purple-500 hover:shadow-xl"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={recap.mainImageUrl || "/placeholder.svg"}
                      alt={recap.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge className="absolute right-3 top-3 bg-purple-500 text-white">
                      <Sparkles className="mr-1 h-3 w-3" />
                      AI 리캡
                    </Badge>
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-lg font-bold">{recap.title}</h3>
                      <p className="mt-1 text-sm text-white/80">
                        {formatPeriod(recap.periodStart, recap.periodEnd)}
                      </p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{formatDate(recap.createdAt.split('T')[0])} 생성</span>
                      <span>{recap.momentCount}개의 순간</span>
                    </div>
                    <div className="mt-3 text-center text-sm font-medium text-purple-600">
                      리캡 보기 →
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        )}

        {/* Recap Generation Dialog */}
        {showGenerateDialog && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setShowGenerateDialog(false)}
          >
            <Card
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <CardContent className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-purple-600">리캡 생성하기</h3>
                  <button
                    onClick={() => setShowGenerateDialog(false)}
                    className="rounded-full p-1 hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Mode Selection */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-700">생성 방식</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setGenerationMode('auto')}
                      className={`rounded-lg border-2 p-4 text-left transition-all ${generationMode === 'auto'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                        }`}
                    >
                      <Sparkles className="mb-2 h-5 w-5 text-purple-600" />
                      <p className="font-semibold">자동 생성</p>
                      <p className="text-xs text-gray-500">지난달 기록</p>
                    </button>
                    <button
                      onClick={() => setGenerationMode('manual')}
                      className={`rounded-lg border-2 p-4 text-left transition-all ${generationMode === 'manual'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                        }`}
                    >
                      <Calendar className="mb-2 h-5 w-5 text-purple-600" />
                      <p className="font-semibold">기간 선택</p>
                      <p className="text-xs text-gray-500">원하는 날짜</p>
                    </button>
                  </div>
                </div>

                {/* Manual Mode: Date Range Picker */}
                {generationMode === 'manual' && (
                  <div className="mb-6 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">시작일</label>
                      <input
                        type="date"
                        value={periodStart}
                        onChange={(e) => setPeriodStart(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">종료일</label>
                      <input
                        type="date"
                        value={periodEnd}
                        onChange={(e) => setPeriodEnd(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-600 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {generationError && (
                  <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {generationError}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowGenerateDialog(false)}
                    className="flex-1"
                    disabled={generating}
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleGenerateRecap}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    disabled={generating}
                  >
                    {generating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        생성 중...
                      </>
                    ) : (
                      '생성하기'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
