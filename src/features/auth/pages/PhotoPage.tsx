import { useState, useRef, ChangeEvent } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Plus, X } from "lucide-react"
import { Button } from "@/shared/ui/button"

import { createArchiveApi } from "@/features/auth/api/auth-api"

export default function PhotoPage() {
    const navigate = useNavigate()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedPhotos, setSelectedPhotos] = useState<{ id: string; url: string; file: File }[]>([])

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newPhotos = Array.from(e.target.files).map((file) => ({
                id: Math.random().toString(36).substr(2, 9),
                url: URL.createObjectURL(file),
                file,
            }))
            setSelectedPhotos((prev) => [...prev, ...newPhotos])
        }
    }

    const handleRemovePhoto = (id: string) => {
        setSelectedPhotos((prev) => prev.filter((photo) => photo.id !== id))
    }

    const handleUpload = async () => {
        try {
            const files = selectedPhotos.map(p => p.file)
            await createArchiveApi(files)
            navigate("/profile")
        } catch (error) {
            console.error("Failed to upload photos:", error)
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                    <Button variant="ghost" size="icon" className="mr-2" onClick={() => navigate("/profile")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-bold">사진 올리기</h1>
                </div>
            </header>

            <main className="container max-w-lg p-4 pb-20">
                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:bg-muted"
                    >
                        <Plus className="h-8 w-8 text-muted-foreground" />
                        <span className="mt-1 text-xs text-muted-foreground">사진 추가</span>
                    </button>

                    {selectedPhotos.map((photo) => (
                        <div key={photo.id} className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
                            <img
                                src={photo.url}
                                alt="Upload preview"
                                className="h-full w-full object-cover"
                            />
                            <button
                                onClick={() => handleRemovePhoto(photo.id)}
                                className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </main>

            <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4">
                <div className="container max-w-lg">
                    <Button
                        className="w-full"
                        size="lg"
                        onClick={handleUpload}
                        disabled={selectedPhotos.length === 0}
                    >
                        {selectedPhotos.length}장 업로드
                    </Button>
                </div>
            </div>
        </div>
    )
}
