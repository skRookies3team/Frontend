import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import { Button } from "@/shared/ui/button"
import { Textarea } from "@/shared/ui/textarea"
import { Card, CardContent } from "@/shared/ui/card"
import { X, ImageIcon, ChevronLeft } from "lucide-react"

export default function FeedCreatePage() {
    const navigate = useNavigate()
    const [content, setContent] = useState("")
    const [selectedImages, setSelectedImages] = useState<string[]>([])

    const handlePost = () => {
        // Handle post creation logic here (e.g., API call)
        // For now, just redirect to feed
        navigate("/feed")
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-40 border-0 bg-white/80 backdrop-blur-md shadow-sm">
                <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
                    <Link to="/create" className="text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="h-6 w-6" />
                    </Link>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">✨ 새 게시물</h1>
                    <Button
                        onClick={handlePost}
                        disabled={!content.trim() && selectedImages.length === 0}
                        className="h-9 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 px-6 text-sm font-bold hover:scale-110 hover:shadow-lg transition-all disabled:opacity-50 disabled:hover:scale-100"
                    >
                        공유
                    </Button>
                </div>
            </header>

            <main className="mx-auto max-w-lg p-4">
                <div className="space-y-4">
                    {/* Post Form */}
                    <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm rounded-3xl">
                        <CardContent className="space-y-4 p-6">
                            <div className="flex gap-3">
                                <div className="h-10 w-10 overflow-hidden rounded-full bg-muted">
                                    {/* Current User Avatar Placeholder */}
                                    <img src="/diverse-woman-avatar.png" alt="Profile" className="h-full w-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <Textarea
                                        placeholder="🐾 반려동물과 함께한 특별한 순간을 기록해보세요..."
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="min-h-[200px] resize-none border-0 p-0 text-base focus-visible:ring-0 placeholder:text-muted-foreground/60 bg-transparent"
                                    />
                                </div>
                            </div>

                            {/* Image Preview */}
                            {selectedImages.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 pt-2">
                                    {selectedImages.map((image, index) => (
                                        <div key={index} className="relative aspect-square overflow-hidden rounded-2xl">
                                            <img
                                                src={image || "/placeholder.svg"}
                                                alt={`Selected ${index + 1}`}
                                                className="h-full w-full object-cover"
                                            />
                                            <button
                                                onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
                                                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="border-t border-pink-100 pt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full border-0 text-pink-600 bg-gradient-to-r from-pink-100 to-purple-100 hover:from-pink-200 hover:to-purple-200 hover:scale-110 transition-all shadow-md font-bold"
                                    onClick={() => {
                                        // Mock image selection
                                        const mockImages = [
                                            "/golden-retriever-playing-park.jpg",
                                            "/cat-in-box.jpg",
                                            "/pomeranian.jpg"
                                        ]
                                        const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)]
                                        setSelectedImages([...selectedImages, randomImage])
                                    }}
                                >
                                    <ImageIcon className="mr-2 h-4 w-4" />
                                    사진/동영상 추가
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
