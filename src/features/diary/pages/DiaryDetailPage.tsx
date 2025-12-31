import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import {
    Sparkles,
    Download,
    Share2,
    Trash2,
    ArrowLeft,
    Palette,
    Facebook,
    Instagram,
    Link as LinkIcon,
    X,
    FileText,
    Image as ImageIcon
} from "lucide-react"

import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { getDiary, deleteDiary, getMyStyleApi } from "@/features/diary/api/diary-api"
import { useAuth } from "@/features/auth/context/auth-context"
import DiaryPreview from "@/features/diary/components/DiaryPreview"

export default function DiaryDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [diary, setDiary] = useState<any | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showShareModal, setShowShareModal] = useState(false)
    const [showDownloadModal, setShowDownloadModal] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)

    // Style settings
    const [styleSettings, setStyleSettings] = useState<any>(null)

    useEffect(() => {
        const fetchDiaryDetail = async () => {
            if (!id) return

            try {
                setIsLoading(true)
                console.log("=== 📖 다이어리 상세 정보 로드 시작 ===")
                console.log("Diary ID:", id)

                const data = await getDiary(Number(id))
                console.log("✅ 다이어리 데이터 로드 성공:", data)
                setDiary(data)

                // Use style from diary response if available
                if (data.style) {
                    console.log("🎨 [다이어리 응답에서 스타일 발견]")
                    console.log("스타일 상세:", {
                        galleryType: data.style.galleryType,
                        textAlignment: data.style.textAlignment,
                        fontSize: data.style.fontSize,
                        backgroundColor: data.style.backgroundColor,
                        sizeOption: data.style.sizeOption,
                        themeStyle: data.style.themeStyle,
                        preset: data.style.preset
                    })
                    setStyleSettings(data.style)
                } else if (user?.id && data.petId) {
                    console.log("⚠️ 다이어리 응답에 스타일 없음 → 펫 기본 스타일 조회 시도")
                    console.log("User ID:", user.id, "Pet ID:", data.petId)
                    try {
                        const styleData = await getMyStyleApi(Number(user.id), data.petId)
                        console.log("✅ 펫 기본 스타일 로드 성공:", styleData)
                        setStyleSettings(styleData)
                    } catch (styleError) {
                        console.warn("❌ 스타일 로드 실패 - 기본값 사용:", styleError)
                    }
                } else {
                    console.log("ℹ️ 스타일 정보 없음 - 기본 스타일 적용")
                }

                console.log("=== 다이어리 로드 완료 ===")
            } catch (error) {
                console.error('❌ Failed to fetch diary:', error)
                alert('다이어리를 불러오는데 실패했습니다.')
                navigate(-1)
            } finally {
                setIsLoading(false)
            }
        }

        fetchDiaryDetail()
    }, [id, navigate, user])

    const handleDelete = async () => {
        if (!diary || !window.confirm('이 다이어리를 정말 삭제하시겠습니까?\\n삭제된 다이어리는 복구할 수 없습니다.')) {
            return
        }

        try {
            await deleteDiary(diary.diaryId, user?.id ? Number(user.id) : undefined)
            alert('다이어리가 삭제되었습니다.')
            navigate(-1)
        } catch (error) {
            console.error('삭제 실패:', error)
            alert('다이어리 삭제 중 오류가 발생했습니다.')
        }
    }

    const handleShare = (platform: string) => {
        const shareUrl = window.location.href
        const shareText = `${diary.title} - ${diary.content.substring(0, 100)}...`

        switch (platform) {
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
                break
            case 'instagram':
                // Instagram doesn't have direct web share, just copy link
                navigator.clipboard.writeText(shareUrl)
                alert('링크가 복사되었습니다! Instagram 앱에서 붙여넣기 해주세요.')
                break
            case 'message':
                // SMS share (mobile only)
                if (navigator.share) {
                    navigator.share({
                        title: diary.title,
                        text: shareText,
                        url: shareUrl
                    }).catch(err => console.log('Share failed', err))
                } else {
                    navigator.clipboard.writeText(shareUrl)
                    alert('링크가 복사되었습니다!')
                }
                break
            case 'link':
                navigator.clipboard.writeText(shareUrl)
                alert('링크가 복사되었습니다!')
                break
        }
        setShowShareModal(false)
    }

    const handleDownload = async (format: 'pdf' | 'image') => {
        setIsDownloading(true)
        try {
            const element = document.getElementById('diary-preview')
            if (!element) {
                alert('다이어리를 찾을 수 없습니다.')
                return
            }

            // Capture the element as canvas
            const canvas = await html2canvas(element, {
                scale: 2, // Higher quality
                useCORS: true, // Allow cross-origin images
                logging: false,
                backgroundColor: '#ffffff',
                onclone: (clonedDoc) => {
                    // 1. 지도 요소 대체 (CORS 방지)
                    const mapElement = clonedDoc.getElementById('map')
                    if (mapElement) {
                        const container = mapElement.parentElement
                        if (container) {
                            container.innerHTML = `
                                <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; background: #f3f4f6; color: #6b7280; font-weight: bold; font-family: sans-serif;">
                                    📍 ${diary.locationName || '위치 정보'}
                                </div>
                            `
                        }
                    }

                    // 2. S3 이미지 URL을 프록시 URL로 변경 (CORS 방지)
                    const images = clonedDoc.getElementsByTagName('img')
                    const s3Url = 'https://petlog-images-bucket.s3.ap-northeast-2.amazonaws.com'

                    Array.from(images).forEach((img) => {
                        if (img.src.includes(s3Url)) {
                            // S3 URL을 로컬 프록시 URL로 변경
                            img.src = img.src.replace(s3Url, '/s3-images')
                            img.crossOrigin = 'anonymous' // CORS 요청 허용
                        }
                    })
                }
            })

            if (format === 'pdf') {
                // Create PDF
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                })

                const imgWidth = 210 // A4 width in mm
                const imgHeight = (canvas.height * imgWidth) / canvas.width

                const imgData = canvas.toDataURL('image/png')
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
                pdf.save(`diary-${diary.title || 'untitled'}.pdf`)
            } else {
                // Create Image
                const link = document.createElement('a')
                link.download = `diary-${diary.title || 'untitled'}.png`
                link.href = canvas.toDataURL('image/png')
                link.click()
            }

            setShowDownloadModal(false)
            alert(`${format === 'pdf' ? 'PDF' : '이미지'} 다운로드가 완료되었습니다!`)
        } catch (error) {
            console.error('다운로드 실패:', error)
            alert('다운로드 중 오류가 발생했습니다.')
        } finally {
            setIsDownloading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">로딩 중...</p>
                </div>
            </div>
        )
    }

    if (!diary) {
        return null
    }

    // Prepare images for preview
    const selectedImages = diary.images || diary.imageUrls?.map((url: string) => ({ imageUrl: url })) || []

    return (
        <div className="min-h-screen bg-background">
            {/* Header with Back Button */}
            <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                <div className="container flex h-16 items-center justify-between px-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        뒤로가기
                    </Button>
                    <Badge className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        <Sparkles className="h-3 w-3" />
                        AI 다이어리
                    </Badge>
                </div>
            </div>

            {/* Content with DiaryPreview Component */}
            <div className="container max-w-4xl mx-auto px-4 py-8">
                <div id="diary-preview">
                    <DiaryPreview
                        title={diary.title || "무제"}
                        selectedImages={selectedImages}
                        editedDiary={diary.content}
                        weather={diary.weather}
                        mood={diary.mood}
                        locationName={diary.locationName}
                        locationCoords={diary.latitude && diary.longitude ? { lat: diary.latitude, lng: diary.longitude } : null}
                        selectedDate={diary.date}
                        layoutStyle={styleSettings?.galleryType || "grid"}
                        textAlign={styleSettings?.textAlignment || "left"}
                        fontSize={styleSettings?.fontSize || 16}
                        backgroundColor={styleSettings?.backgroundColor || "#ffffff"}
                        sizeOption={styleSettings?.sizeOption || "medium"}
                        themeStyle={styleSettings?.themeStyle || "basic"}
                        preset={styleSettings?.preset || null}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 border-t pt-6">
                    <Button
                        variant="outline"
                        className="text-base h-12"
                        onClick={() => navigate(`/diary/${id}/style`)}
                    >
                        <Palette className="mr-2 h-5 w-5" />
                        스타일 편집
                    </Button>
                    <Button
                        variant="destructive"
                        className="text-base h-12"
                        onClick={handleDelete}
                    >
                        <Trash2 className="mr-2 h-5 w-5" />
                        삭제
                    </Button>
                    <Button
                        className="flex-1 text-base h-12"
                        onClick={() => setShowDownloadModal(true)}
                        disabled={isDownloading}
                    >
                        <Download className="mr-2 h-5 w-5" />
                        {isDownloading ? '다운로드 중...' : '다운로드'}
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 text-base h-12"
                        onClick={() => setShowShareModal(true)}
                    >
                        <Share2 className="mr-2 h-5 w-5" />
                        공유하기
                    </Button>
                </div>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in"
                    onClick={() => setShowShareModal(false)}
                >
                    <div
                        className="bg-white rounded-3xl w-full max-w-md p-6 mx-4 animate-in zoom-in-95 duration-300 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800">공유하기</h3>
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="flex justify-around gap-4">
                            <button
                                onClick={() => handleShare('facebook')}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Facebook className="w-8 h-8 text-white fill-current" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Facebook</span>
                            </button>

                            <button
                                onClick={() => handleShare('message')}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <svg
                                        className="w-8 h-8 text-gray-800"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M12 2C6.48 2 2 5.58 2 10c0 2.76 1.56 5.18 4 6.65V22l5.5-3.5c.5.08 1 .12 1.5.12 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-600">KakaoTalk</span>
                            </button>

                            <button
                                onClick={() => handleShare('instagram')}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Instagram className="w-8 h-8 text-white" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Instagram</span>
                            </button>

                            <button
                                onClick={() => handleShare('link')}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <LinkIcon className="w-8 h-8 text-white" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Copy Link</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Download Format Selection Modal */}
            {showDownloadModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity animate-in fade-in duration-200"
                    onClick={() => setShowDownloadModal(false)}
                >
                    <div
                        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowDownloadModal(false)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>

                        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">다운로드 형식 선택</h3>

                        <div className="space-y-4">
                            <button
                                onClick={() => handleDownload('pdf')}
                                disabled={isDownloading}
                                className="w-full flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gray-200 hover:border-red-400 hover:bg-red-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <FileText className="w-8 h-8 text-white" />
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-semibold text-gray-800">PDF로 저장</div>
                                    <div className="text-sm text-gray-500 mt-1">인쇄 및 배포에 최적화</div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleDownload('image')}
                                disabled={isDownloading}
                                className="w-full flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <ImageIcon className="w-8 h-8 text-white" />
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-semibold text-gray-800">이미지로 저장</div>
                                    <div className="text-sm text-gray-500 mt-1">SNS 공유 및 보관용</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
