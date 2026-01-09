
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import {
    Download,
    Share2,
    Trash2,
    ArrowLeft,
    Palette,
    Facebook,
    Instagram,
    Link as LinkIcon,
    X,
    Sparkles
} from "lucide-react"

import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { getDiary, deleteDiary, getMyStyleApi, getDiaryStyleApi } from "@/features/diary/api/diary-api"
import { useAuth } from "@/features/auth/context/auth-context"
import DiaryPreview from "@/features/diary/components/DiaryPreview"

declare global {
    interface Window {
        Kakao: any
    }
}

export default function DiaryDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [diary, setDiary] = useState<any | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showShareModal, setShowShareModal] = useState(false)
    const [showDownloadModal, setShowDownloadModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)

    // Style settings
    const [styleSettings, setStyleSettings] = useState<any>(null)

    useEffect(() => {
        const fetchDiaryDetail = async () => {
            if (!id) return

            try {
                setIsLoading(true)
                const data = await getDiary(Number(id))
                console.log("📄 Diary Detail Loaded:", data); // [DEBUG]
                setDiary(data)

                // 1. Always attempt to fetch specifically saved style for this diary first (To ensure freshness after edit)
                console.log("ℹ️ Fetching Diary Specific Style (Priority)...");
                const specificStyle = await getDiaryStyleApi(Number(id));

                if (specificStyle) {
                    console.log("🎨 Diary Specific Style Loaded (Fresh):", specificStyle);
                    setStyleSettings(specificStyle);
                } else if (data.style && data.style.diaryId === Number(id)) {
                    // 2. Fallback to style included in Diary Response (if specific)
                    console.log("🎨 Using Embedded Diary Style:", data.style);
                    setStyleSettings(data.style);
                } else if (data.style) {
                    // 3. Fallback to generic style from response
                    console.log("⚠️ Using Generic/Pet Style from Response:", data.style);
                    setStyleSettings(data.style)
                } else if (user?.id && data.petId) {
                    console.log("⚠️ No Style in Response, fetching Pet Style..."); // [DEBUG]
                    try {
                        const styleData = await getMyStyleApi(Number(user.id), data.petId)
                        setStyleSettings(styleData)
                    } catch (styleError) {
                        console.warn("스타일 로드 실패:", styleError)
                    }
                } else if (user?.id) {
                    console.log("⚠️ Fetching User Default Style..."); // [DEBUG]
                    const settings = await getMyStyleApi(Number(user.id))
                    if (settings) {
                        setStyleSettings(settings)
                    }
                }
            } catch (error) {
                console.error("다이어리 로드 실패:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchDiaryDetail()
    }, [id, user])

    // Kakao SDK 초기화 (Dynamic Loading)
    useEffect(() => {
        const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY

        const initKakao = () => {
            if (window.Kakao && !window.Kakao.isInitialized() && kakaoKey) {
                try {
                    window.Kakao.init(kakaoKey)
                    console.log("✅ Kakao SDK Initialized")
                } catch (e) {
                    console.error("❌ Kakao Init Error:", e)
                }
            }
        }

        if (!window.Kakao) {
            console.log("⏳ Kakao SDK not found, loading script dynamically...")
            const script = document.createElement("script")
            script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.0/kakao.min.js"
            script.async = true
            script.onload = () => {
                console.log("📦 Kakao SDK Script Loaded")
                initKakao()
            }
            document.head.appendChild(script)
        } else {
            initKakao()
        }
    }, [])



    const handleDelete = async () => {
        if (!id) return
        setShowDeleteModal(true)
    }

    const confirmDelete = async () => {
        if (!id) return

        try {
            await deleteDiary(Number(id))
            setShowDeleteModal(false)
            // Show cute success message
            alert('다이어리가 삭제되었습니다.')
            navigate(-1)
        } catch (error) {
            console.error('삭제 실패:', error)
            alert('다이어리 삭제 중 오류가 발생했습니다.')
            setShowDeleteModal(false)
        }
    }

    const shareToKakao = () => {
        if (!window.Kakao || !window.Kakao.isInitialized()) {
            alert('카카오톡 공유를 위한 설정이 필요합니다 (앱 키 미설정).')
            return
        }

        // 아이템 리스트 생성 (날짜, 날씨, 기분, 위치)
        const items = []
        // 날짜 추가
        if (diary.date) {
            items.push({
                item: '날짜',
                itemOp: new Date(diary.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
            })
        }
        if (diary.weather) items.push({ item: '날씨', itemOp: diary.weather })
        if (diary.mood) items.push({ item: '기분', itemOp: diary.mood })
        if (diary.locationName) items.push({ item: '위치', itemOp: diary.locationName })

        // 사진 개수 표시
        const imageCount = diary.images?.length || 0
        const titleText = diary.title
            ? `${diary.title}${imageCount > 1 ? ` (사진 ${imageCount}장)` : ''}`
            : 'PetLog 다이어리'

        window.Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: titleText,
                description: diary.content.substring(0, 100) + (diary.content.length > 100 ? '...' : ''),
                imageUrl: diary.images?.[0]?.imageUrl || 'https://via.placeholder.com/300',
                link: {
                    mobileWebUrl: window.location.href,
                    webUrl: window.location.href,
                },
            },
            itemContent: {
                items: items.length > 0 ? items : undefined
            },
            buttons: [
                {
                    title: '일기 전체 보기',
                    link: {
                        mobileWebUrl: window.location.href,
                        webUrl: window.location.href,
                    },
                },
            ],
        })
    }

    const handleShare = async (platform: string) => {
        const shareUrl = window.location.href
        const shareText = `${diary.title} - PetLog에서 작성된 일기입니다.`

        switch (platform) {
            case 'native':
                if (navigator.share) {
                    try {
                        await navigator.share({
                            title: diary.title,
                            text: shareText,
                            url: shareUrl,
                        })
                        setShowShareModal(false)
                    } catch (err) {
                        console.log('Share failed', err)
                    }
                } else {
                    alert('이 브라우저에서는 기본 공유 기능을 지원하지 않습니다.')
                }
                break
            case 'kakao':
                shareToKakao()
                setShowShareModal(false)
                break
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
                setShowShareModal(false)
                break
            case 'instagram':
                navigator.clipboard.writeText(shareUrl)
                alert('링크가 복사되었습니다! 인스타그램 앱을 열어 붙여넣기 해주세요.')
                setShowShareModal(false)
                break
            case 'copy':
                try {
                    await navigator.clipboard.writeText(shareUrl)
                    alert('링크가 복사되었습니다!')
                    setShowShareModal(false)
                } catch (err) {
                    console.error('Clipboard failed', err)
                    alert('링크 복사에 실패했습니다.')
                }
                break
        }
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

                    // 2. S3 images: use proxy in dev, direct URL in production
                    const images = clonedDoc.getElementsByTagName('img')
                    const s3Url = 'https://petlog-images-bucket.s3.ap-northeast-2.amazonaws.com'

                    Array.from(images).forEach((img) => {
                        if (img.src.includes(s3Url) && import.meta.env.DEV) {
                            // Development: use proxy to bypass CORS
                            img.src = img.src.replace(s3Url, '/s3-images')
                        }
                        img.crossOrigin = 'anonymous' // CORS 요청 허용
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

    if (!diary) return null

    // Prepare images for preview
    const selectedImages = diary.images || diary.imageUrls?.map((url: string) => ({ imageUrl: url })) || []

    return (
        <div className="min-h-screen bg-[#FFF5F6]" style={{
            backgroundImage: `linear-gradient(90deg, transparent 50%, rgba(255,255,255,0.5) 50%),
                              linear-gradient(0deg, transparent 50%, rgba(255,255,255,0.5) 50%)`,
            backgroundSize: '40px 40px'
        }}>
            {/* Header with Back Button */}
            <div className="sticky top-0 z-30 bg-white/60 backdrop-blur-md border-b border-pink-100 shadow-sm">
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
                        fontFamily={styleSettings?.fontFamily || "Noto Sans KR"} // [NEW] Pass saved font family
                    />
                </div>

                {/* Action Buttons */}
                {/* Action Buttons - Cute Sticker Style */}
                <div className="mt-12 relative pb-24">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
                        {/* Style Edit - Yellow Note */}
                        <button
                            onClick={() => navigate(`/diary/${id}/style`)}
                            className="bg-[#FEF9C3] aspect-[4/3] rounded-[2rem] shadow-[4px_4px_0px_rgba(0,0,0,0.05)] transform -rotate-2 hover:rotate-0 hover:scale-105 transition-all flex flex-col items-center justify-center gap-2 group border-4 border-white"
                        >
                            <Palette className="w-8 h-8 text-yellow-600 group-hover:scale-110 transition-transform" />
                            <span className="font-['Jua'] text-xl text-yellow-800">꾸미기</span>
                        </button>

                        {/* Download - Green Note */}
                        <button
                            onClick={() => setShowDownloadModal(true)}
                            disabled={isDownloading}
                            className="bg-[#DCFCE7] aspect-[4/3] rounded-[2rem] shadow-[4px_4px_0px_rgba(0,0,0,0.05)] transform rotate-1 hover:rotate-0 hover:scale-105 transition-all flex flex-col items-center justify-center gap-2 group border-4 border-white"
                        >
                            <Download className="w-8 h-8 text-green-600 group-hover:scale-110 transition-transform" />
                            <span className="font-['Jua'] text-xl text-green-800">
                                {isDownloading ? '저장 중...' : '저장'}
                            </span>
                        </button>

                        {/* Share - Blue Note */}
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="bg-[#E0F2FE] aspect-[4/3] rounded-[2rem] shadow-[4px_4px_0px_rgba(0,0,0,0.05)] transform -rotate-1 hover:rotate-0 hover:scale-105 transition-all flex flex-col items-center justify-center gap-2 group border-4 border-white"
                        >
                            <Share2 className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
                            <span className="font-['Jua'] text-xl text-blue-800">공유</span>
                        </button>

                        {/* Delete - Pink Note */}
                        <button
                            onClick={handleDelete}
                            className="bg-[#FFEDD5] aspect-[4/3] rounded-[2rem] shadow-[4px_4px_0px_rgba(0,0,0,0.05)] transform rotate-2 hover:rotate-0 hover:scale-105 transition-all flex flex-col items-center justify-center gap-2 group border-4 border-white"
                        >
                            <Trash2 className="w-8 h-8 text-orange-600 group-hover:scale-110 transition-transform" />
                            <span className="font-['Jua'] text-xl text-orange-800">삭제</span>
                        </button>
                    </div>


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
                            <h3 className="text-xl font-bold text-gray-800">공유하기</h3>
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Main Native Share */}
                            <button
                                onClick={() => handleShare('native')}
                                className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white transition-all shadow-lg hover:-translate-y-0.5 font-bold"
                            >
                                <Share2 className="w-5 h-5" />
                                앱으로 공유
                            </button>

                            <div className="grid grid-cols-4 gap-2">
                                <button
                                    onClick={() => handleShare('kakao')}
                                    className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-yellow-50 transition-colors group"
                                >
                                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6 text-gray-900 fill-current" viewBox="0 0 24 24"><path d="M12 3c5.52 0 10 3.48 10 7.78 0 2.45-1.47 4.64-3.76 6.07.13.48.5 1.84.55 2.05s.12.56-.2.74c-.32.19-.68-.07-.76-.12-.32-.19-3.87-2.65-4.48-3.08-.43.06-.88.1-1.35.1-5.52 0-10-3.48-10-7.78S6.48 3 12 3z" /></svg>
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">카카오톡</span>
                                </button>

                                <button
                                    onClick={() => handleShare('facebook')}
                                    className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-blue-50 transition-colors group"
                                >
                                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                        <Facebook className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">페이스북</span>
                                </button>

                                <button
                                    onClick={() => handleShare('instagram')}
                                    className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-pink-50 transition-colors group"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                        <Instagram className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">인스타그램</span>
                                </button>

                                <button
                                    onClick={() => handleShare('copy')}
                                    className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-gray-100 transition-colors group"
                                >
                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                        <LinkIcon className="w-6 h-6 text-gray-600" />
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">링크 복사</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Download Modal - could be separate component but keeping here for context access */}
            {showDownloadModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in"
                    onClick={() => setShowDownloadModal(false)}
                >
                    <div
                        className="bg-white rounded-3xl w-full max-w-sm p-6 mx-4 animate-in zoom-in-95 duration-300 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">다운로드</h3>
                            <button
                                onClick={() => setShowDownloadModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={() => handleDownload('pdf')}
                                className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-purple-50 transition-colors group"
                            >
                                <span className="font-medium text-gray-700 group-hover:text-purple-700">PDF로 저장</span>
                                <FileText className="w-5 h-5 text-gray-400 group-hover:text-purple-500" />
                            </button>
                            <button
                                onClick={() => handleDownload('image')}
                                className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors group"
                            >
                                <span className="font-medium text-gray-700 group-hover:text-blue-700">이미지로 저장</span>
                                <ImageIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal - Cute Style! */}
            {showDeleteModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in"
                    onClick={() => setShowDeleteModal(false)}
                >
                    <div
                        className="bg-gradient-to-br from-pink-50 to-white rounded-3xl w-full max-w-sm p-8 mx-4 animate-in zoom-in-95 duration-300 shadow-2xl border-4 border-white"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Cute Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="relative">
                                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center animate-bounce">
                                    <Trash2 className="w-10 h-10 text-orange-500" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs animate-pulse">
                                    !
                                </div>
                            </div>
                        </div>

                        {/* Message */}
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2 font-['Jua']">
                                정말 삭제할까요?
                            </h3>
                            <p className="text-gray-500 font-medium">
                                이 다이어리를 삭제하시겠습니까?
                            </p>
                            <p className="text-sm text-orange-400 mt-2 font-['Jua']">
                                삭제하면 되돌릴 수 없어요
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-100 to-purple-100 hover:from-pink-200 hover:to-purple-200 text-pink-600 font-bold text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all font-['Jua']"
                            >
                                취소
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white font-bold text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all font-['Jua']"
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function FileText({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" x2="8" y1="13" y2="13" />
            <line x1="16" x2="8" y1="17" y2="17" />
            <line x1="10" x2="8" y1="9" y2="9" />
        </svg>
    )
}

function ImageIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
    )
}
