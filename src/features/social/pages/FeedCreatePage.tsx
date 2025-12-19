import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/shared/ui/button"
import { Textarea } from "@/shared/ui/textarea"
import { Card, CardContent } from "@/shared/ui/card"
import { X, ImageIcon, ChevronLeft, Loader2 } from "lucide-react"
import { useAuth } from "@/features/auth/context/auth-context"
import { feedApi } from "../api/feed-api"
import { imageApi } from "../api/image-api" // [추가] 이미지 API 임포트

export default function FeedCreatePage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [content, setContent] = useState("")
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    }

    const handlePost = async () => {
        if (!user || !content.trim()) return;
        setIsSubmitting(true);
        try {
            let uploadedImageUrl = "";

            // 1. 이미지가 있다면 먼저 업로드 (User Service)
            if (selectedImage) {
                try {
                    uploadedImageUrl = await imageApi.uploadImage(selectedImage);
                } catch (imgError) {
                    console.error("Image upload failed:", imgError);
                    alert("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
                    setIsSubmitting(false);
                    return;
                }
            }

            // 2. 피드 작성 요청 (Social Service) - JSON 전송
            await feedApi.createFeed({
                userId: Number(user.id),
                content: content,
                imageUrls: uploadedImageUrl ? [uploadedImageUrl] : [], // URL이 있으면 담아서 보냄
                petId: 1,
            });

            navigate("/feed");
        } catch (error) {
            console.error("Failed to create feed:", error);
            alert("게시물 작성에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pb-20">
            <header className="sticky top-0 z-40 border-0 bg-white/80 backdrop-blur-md shadow-sm">
                <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
                    <Link to="/create" className="text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="h-6 w-6" />
                    </Link>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">새 게시물</h1>
                    <Button
                        onClick={handlePost}
                        disabled={(!content.trim() && !selectedImage) || isSubmitting}
                        className="h-9 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 px-6 text-sm font-bold text-white hover:scale-105 transition-all"
                    >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "공유"}
                    </Button>
                </div>
            </header>

            <main className="mx-auto max-w-lg p-4">
                <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm rounded-3xl">
                    <CardContent className="space-y-4 p-6">
                        <div className="flex gap-3">
                            <div className="h-10 w-10 overflow-hidden rounded-full bg-muted">
                                <img src={user?.avatar || "/diverse-woman-avatar.png"} alt="Profile" className="h-full w-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <Textarea
                                    placeholder="반려동물과 함께한 특별한 순간을 기록해보세요..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="min-h-[150px] resize-none border-0 p-0 text-base focus-visible:ring-0 bg-transparent"
                                />
                            </div>
                        </div>

                        {previewUrl && (
                            <div className="relative aspect-square overflow-hidden rounded-2xl">
                                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                <button
                                    onClick={() => { setSelectedImage(null); setPreviewUrl(null); }}
                                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}

                        <div className="border-t border-pink-100 pt-4">
                            <label className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-pink-50 px-4 py-2 text-sm font-medium text-pink-600 hover:bg-pink-100 transition-colors">
                                <ImageIcon className="h-4 w-4" />
                                사진/동영상 추가
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}