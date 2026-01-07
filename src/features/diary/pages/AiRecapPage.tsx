import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { ArrowLeft, BookOpen, Calendar, Loader2, Plus, X, Star, Moon, Wand2, Sparkles, PawPrint, Heart, Dog, Cat } from "lucide-react"
import { RecapSimpleResponse } from "@/features/diary/types/recap"
import { getUserRecapsApi, scheduleAutoRecapApi, generateManualRecapApi } from "@/features/diary/api/diary-api"
import { cn } from "@/shared/lib/utils"
import { Calendar as CalendarComponent } from "@/shared/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"
import { format } from "date-fns"

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

  // Get userId from petlog_user object
  const getUserId = () => {
    const userStr = localStorage.getItem('petlog_user')
    return userStr ? parseInt(JSON.parse(userStr).id) : 1
  }
  const userId = getUserId()
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

  // Auto-refresh when WAITING recaps exist
  useEffect(() => {
    const hasWaitingRecap = recaps.some(recap => recap.status === 'WAITING')

    if (!hasWaitingRecap) {
      return
    }

    console.log('[Polling] WAITING 리캡 감지 - 30초마다 자동 새로고침 시작')
    const interval = setInterval(() => {
      console.log('[Polling] 리캡 목록 새로고침...')
      fetchRecaps()
    }, 30000) // 30초마다

    return () => {
      console.log('[Polling] 폴링 중지')
      clearInterval(interval)
    }
  }, [recaps])

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
        const response = await scheduleAutoRecapApi({
          petId: selectedPetId,
          userId: userId,
        })
        console.log('Recap scheduled:', response)
      } else {
        await generateManualRecapApi({
          petId: selectedPetId,
          userId: userId,
          periodStart: periodStart,
          periodEnd: periodEnd,
        })
      }

      await fetchRecaps()
      setShowGenerateDialog(false)
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

  const formatDate = (dateStr: string) => dateStr.replace(/-/g, '.')

  const formatPeriod = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)

    const startYear = startDate.getFullYear()
    const endYear = endDate.getFullYear()
    const startMonth = startDate.getMonth() + 1
    const endMonth = endDate.getMonth() + 1

    if (startYear === endYear && startMonth === endMonth) {
      return `${startYear}년 ${startMonth}월`
    }
    if (startYear === endYear) {
      return `${startYear}년 ${startMonth}월 ~ ${endMonth}월`
    }
    return `${startYear}년 ${startMonth}월 ~ ${endYear}년 ${endMonth}월`
  }

  const formatRecapTitle = (title: string) => {
    const match = title.match(/(\d+)-(\d+)월 리캡/);
    if (match) {
      const month1 = parseInt(match[1]);
      const month2 = parseInt(match[2]);
      if (month1 === month2) {
        return `${month2}월 리캡`;
      } else {
        return `${month1}월~${month2}월 리캡`;
      }
    }
    return title;
  }

  const BackgroundMosaic = () => {
    // Colors from the reference image
    const colors = [
      'bg-[#2dd4bf]', // Teal
      'bg-[#fb923c]', // Orange
      'bg-[#ffedd5]', // Peach
      'bg-[#a5f3fc]', // Light Cyan
      'bg-white',
    ]

    const textColors = {
      'bg-[#2dd4bf]': 'text-white',
      'bg-[#fb923c]': 'text-white',
      'bg-[#ffedd5]': 'text-orange-400',
      'bg-[#a5f3fc]': 'text-teal-600',
      'bg-white': 'text-orange-300',
    }

    // Shapes: tailored borders for geometric feel
    const shapes = [
      'rounded-none', // Square
      'rounded-full', // Circle
      'rounded-tl-[2rem]', // Quarter Circle 1
      'rounded-tr-[2rem]', // Quarter Circle 2
      'rounded-bl-[2rem]', // Quarter Circle 3
      'rounded-br-[2rem]', // Quarter Circle 4
    ]

    return (
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-30 bg-orange-50">
        <div className="flex flex-wrap rotate-12 scale-110 -ml-10 -mt-10 content-start">
          {Array.from({ length: 150 }).map((_, i) => {
            const bg = colors[i % colors.length]
            const shape = shapes[(i * 7) % shapes.length] // pseudo-random shape
            const showIcon = i % 3 === 0 // 1/3 chance of icon

            let Icon = null
            if (showIcon) {
              const iconIdx = i % 4
              if (iconIdx === 0) Icon = PawPrint
              else if (iconIdx === 1) Icon = Heart
              else if (iconIdx === 2) Icon = Dog
              else Icon = Cat
            }

            // Determine text color based on background
            const txtColor = textColors[bg as keyof typeof textColors] || 'text-gray-400'

            return (
              <div
                key={i}
                className={`w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 p-4 flex items-center justify-center ${bg} ${shape}`}
              >
                {Icon && <Icon className={`w-1/2 h-1/2 ${txtColor}`} fill="currentColor" />}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 font-sans text-gray-800 relative bg-[#FFFBE8]">
      <BackgroundMosaic />
      {/* Original Content Wrapper */}
      <div className="relative z-10">
        <header className="sticky top-0 z-40 border-b-2 border-dashed border-yellow-200 bg-white/90 backdrop-blur-md shadow-[0_4px_20px_rgba(255,220,100,0.1)]">
          <div className="container mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
            <Link to="/ai-studio" className="text-amber-400 hover:text-amber-600 transition-colors p-2 hover:bg-yellow-50 rounded-full">
              <ArrowLeft className="h-7 w-7" />
            </Link>
            <h1 className="text-2xl font-bold text-amber-500 font-['Jua'] flex items-center gap-2 drop-shadow-sm">
              <BookOpen className="h-6 w-6" />
              AI 리캡
            </h1>
            <div className="w-10" />
          </div>
        </header>

        <main className="container mx-auto max-w-6xl p-4 md:p-8">
          <div className="mb-10 text-center relative">
            {/* Decor Icons */}
            <div className="absolute top-0 right-10 animate-bounce-slow text-orange-400 hidden md:block"><Star className="w-8 h-8 fill-orange-200" /></div>
            <div className="absolute top-10 left-10 animate-pulse-slow text-yellow-300 hidden md:block"><Moon className="w-8 h-8 fill-yellow-100" /></div>

            <h2 className="text-3xl md:text-4xl font-bold text-amber-600 font-['Jua'] drop-shadow-sm mb-3">반려동물과의 특별한 순간들</h2>
            <div className="inline-block bg-white/60 backdrop-blur-sm px-6 py-2 rounded-full border border-yellow-100 shadow-sm transform -rotate-1">
              <p className="text-amber-500 font-medium md:text-lg">
                1달마다 자동으로 생성되는 감동적인 리캡을 확인하세요 📼
              </p>
            </div>
          </div>

          {/* Generate Button Area - Sticky Note Style */}
          <div className="mb-10 relative bg-[#FFF9C4]/40 p-8 rounded-[2.5rem] shadow-[8px_8px_0px_rgba(255,200,100,0.2)] border-4 border-amber-300 max-w-2xl mx-auto transform rotate-1 transition-transform hover:rotate-0 hover:scale-[1.01] duration-300 group">
            {/* Tape */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-white/80 -rotate-2 backdrop-blur-sm shadow-sm z-10 border border-orange-200"></div>

            <div className="flex items-center justify-between gap-6 relative z-10">
              <div className="flex items-start gap-4 flex-1">
                <div className="bg-white p-3 rounded-2xl shadow-sm text-orange-500 group-hover:scale-110 transition-transform border border-orange-100">
                  <Calendar className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="mb-1 font-bold text-xl text-orange-800 font-['Jua']">리캡 생성하기</h3>
                  <p className="text-sm font-medium text-orange-700/80 leading-relaxed text-pretty">
                    지난달 리캡을 자동으로 생성하거나<br />원하는 기간을 선택해서 만들어보세요!
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowGenerateDialog(true)}
                className="bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg rounded-2xl h-14 px-6 font-bold text-lg active:scale-95 transition-all border-2 border-white/30"
              >
                <Plus className="h-5 w-5 mr-2" />
                생성하기
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="bg-white/50 p-6 rounded-full shadow-sm animate-spin">
                <Loader2 className="h-10 w-10 text-orange-400" />
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-[2rem] p-8 text-center text-red-500 font-bold">
              {error}
            </div>
          ) : recaps.length === 0 ? (
            <div className="bg-white/60 border-4 border-dashed border-orange-300/70 rounded-[2.5rem] p-12 text-center max-w-xl mx-auto backdrop-blur-sm">
              <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-orange-200">
                <BookOpen className="h-10 w-10 text-orange-400" />
              </div>
              <p className="text-orange-600 font-bold text-xl mb-2 font-['Jua']">아직 리캡이 없어요!</p>
              <p className="text-sm text-orange-500 font-medium">
                위의 '생성하기' 버튼을 눌러<br />첫 번째 추억을 만들어보세요 ✨
              </p>
            </div>
          ) : (
            <div className="max-h-[1200px] overflow-y-auto pr-2 pb-10 scrollbar-hide">
              <div className="grid gap-6 md:grid-cols-3">
                {recaps.map((recap) =>
                  recap.status === "WAITING" ? (
                    <div key={recap.recapId} className="relative bg-white/40 border-4 border-dashed border-yellow-200/50 rounded-[2rem] p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
                      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 animate-pulse">
                        <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-amber-600 font-['Jua']">
                        {formatPeriod(recap.periodStart, recap.periodEnd)}
                      </h3>
                      <p className="mb-4 text-amber-400 font-medium">
                        {formatDate(recap.createdAt.split('T')[0])}에 생성 예정
                      </p>
                      <Badge variant="secondary" className="bg-yellow-100 text-amber-600 px-4 py-1 rounded-full">
                        열심히 만드는 중... 🔨
                      </Badge>
                    </div>
                  ) : (
                    <div
                      key={recap.recapId}
                      onClick={() => handleRecapClick(recap.recapId)}
                      className="group cursor-pointer relative bg-white rounded-[2rem] overflow-hidden shadow-[4px_4px_16px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-2 hover:shadow-xl border-4 border-white transform hover:rotate-1"
                    >
                      <div className="relative aspect-video overflow-hidden rounded-t-[1.5rem]">
                        <img
                          src={recap.mainImageUrl || "/placeholder.svg"}
                          alt={recap.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-amber-900/60 via-transparent to-transparent opactiy-60" />
                        <Badge className="absolute right-4 top-4 bg-amber-500/80 backdrop-blur-md text-white border-none shadow-sm px-3 py-1">
                          <Sparkles className="mr-1 h-3 w-3" />
                          AI 리캡
                        </Badge>
                        <div className="absolute bottom-4 left-6 text-white">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold font-['Jua'] drop-shadow-md">{formatRecapTitle(recap.title)}</h3>
                          </div>
                          <p className="text-xs text-amber-100 font-medium bg-amber-900/40 px-3 py-1 rounded-full backdrop-blur-sm inline-block">
                            {formatPeriod(recap.periodStart, recap.periodEnd)}
                          </p>
                        </div>
                      </div>
                      <div className="p-5 bg-white relative">
                        {/* Decorative tape on bottom */}
                        {/* <div className="absolute top-0 right-10 w-8 h-12 bg-purple-100/50 -mt-6 rounded-b"></div> */}

                        <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-amber-300" />
                            <span>{formatDate(recap.createdAt.split('T')[0])}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3 h-3 text-amber-300" />
                            <span>{recap.momentCount}개의 순간</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-yellow-50 flex justify-center">
                          <span className="text-amber-500 font-bold group-hover:text-amber-600 transition-colors flex items-center gap-2 text-sm">
                            추억 보러가기 <ArrowLeft className="w-3 h-3 rotate-180" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          {/* Recap Generation Dialog - Popover Style */}
          {showGenerateDialog && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-amber-900/40 backdrop-blur-sm p-4 animate-fade-in"
              onClick={() => setShowGenerateDialog(false)}
            >
              <div
                className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8 relative animate-scale-up border-4 border-yellow-100"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Decoration */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-orange-400"></div>

                <div className="mb-8 flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-amber-600 font-['Jua'] flex items-center gap-2">
                    <Wand2 className="w-6 h-6 text-yellow-400 fill-yellow-200" />
                    리캡 생성하기
                  </h3>
                  <button
                    onClick={() => setShowGenerateDialog(false)}
                    className="rounded-full p-2 hover:bg-yellow-50 text-amber-300 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Mode Selection */}
                <div className="mb-8">
                  <label className="mb-3 block text-sm font-bold text-gray-600">어떤 리캡을 만들까요?</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setGenerationMode('auto')}
                      className={`relative overflow-hidden rounded-2xl border-2 p-5 text-left transition-all group ${generationMode === 'auto'
                        ? 'border-amber-500 bg-yellow-50 ring-2 ring-yellow-200 ring-offset-1'
                        : 'border-gray-100 hover:border-yellow-200 hover:bg-gray-50'
                        }`}
                    >
                      <div className={`p-2 rounded-xl w-fit mb-3 ${generationMode === 'auto' ? 'bg-white text-amber-600' : 'bg-gray-100 text-gray-400 group-hover:bg-white group-hover:text-amber-400'}`}>
                        <Wand2 className="h-6 w-6" />
                      </div>
                      <p className="font-bold text-lg text-gray-800">자동 생성</p>
                      <p className="text-xs text-gray-500 mt-1 font-medium">지난달의 기록을<br />자동으로 모아요</p>
                    </button>

                    <button
                      onClick={() => setGenerationMode('manual')}
                      className={`relative overflow-hidden rounded-2xl border-2 p-5 text-left transition-all group ${generationMode === 'manual'
                        ? 'border-amber-500 bg-yellow-50 ring-2 ring-yellow-200 ring-offset-1'
                        : 'border-gray-100 hover:border-yellow-200 hover:bg-gray-50'
                        }`}
                    >
                      <div className={`p-2 rounded-xl w-fit mb-3 ${generationMode === 'manual' ? 'bg-white text-amber-600' : 'bg-gray-100 text-gray-400 group-hover:bg-white group-hover:text-amber-400'}`}>
                        <Calendar className="h-6 w-6" />
                      </div>
                      <p className="font-bold text-lg text-gray-800">기간 선택</p>
                      <p className="text-xs text-gray-500 mt-1 font-medium">원하는 날짜를<br />직접 골라요</p>
                    </button>
                  </div>
                </div>

                {/* Manual Mode: Date Range Picker */}
                {generationMode === 'manual' && (
                  <div className="mb-8 space-y-5 bg-yellow-50/50 p-6 rounded-[1.5rem] border-2 border-dashed border-yellow-200/60 animate-fade-in-down">

                    {/* Start Date */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-bold text-amber-600 pl-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div> START DATE
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full h-14 justify-start text-left font-bold text-lg rounded-2xl border-2 border-yellow-100 bg-white hover:bg-yellow-50 hover:border-yellow-300 focus:ring-2 focus:ring-yellow-200 text-gray-600 shadow-sm transition-all",
                              !periodStart && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-5 w-5 text-amber-400" />
                            {periodStart ? format(new Date(periodStart), "yyyy년 MM월 dd일") : <span>날짜를 선택해주세요</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-2xl border-2 border-yellow-200 bg-white shadow-xl" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={periodStart ? new Date(periodStart) : undefined}
                            onSelect={(date) => date && setPeriodStart(format(date, "yyyy-MM-dd"))}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                            className="p-4 bg-white rounded-2xl [&_.day-selected]:bg-amber-500 [&_.day-selected]:text-white [&_.day-today]:text-amber-600 [&_.day-today]:font-bold"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* End Date */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-bold text-amber-600 pl-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div> END DATE
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full h-14 justify-start text-left font-bold text-lg rounded-2xl border-2 border-yellow-100 bg-white hover:bg-yellow-50 hover:border-yellow-300 focus:ring-2 focus:ring-yellow-200 text-gray-600 shadow-sm transition-all",
                              !periodEnd && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-5 w-5 text-amber-400" />
                            {periodEnd ? format(new Date(periodEnd), "yyyy년 MM월 dd일") : <span>날짜를 선택해주세요</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-2xl border-2 border-yellow-200 bg-white shadow-xl" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={periodEnd ? new Date(periodEnd) : undefined}
                            onSelect={(date) => date && setPeriodEnd(format(date, "yyyy-MM-dd"))}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                            className="p-4 bg-white rounded-2xl [&_.day-selected]:bg-amber-500 [&_.day-selected]:text-white [&_.day-today]:text-amber-600 [&_.day-today]:font-bold"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {generationError && (
                  <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-500 flex items-center gap-2">
                    <X className="w-4 h-4" /> {generationError}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => setShowGenerateDialog(false)}
                    className="flex-1 rounded-xl h-12 text-gray-500 font-bold hover:bg-gray-100 hover:text-gray-700"
                    disabled={generating}
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleGenerateRecap}
                    className="flex-[2] bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-12 font-bold shadow-lg shadow-yellow-200"
                    disabled={generating}
                  >
                    {generating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        추억 모으는 중...
                      </>
                    ) : (
                      '리캡 만들기'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
