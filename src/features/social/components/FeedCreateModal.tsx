import { useState } from "react"
import { Button } from "@/shared/ui/button"
import { Textarea } from "@/shared/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog"
import { X, ImageIcon, Loader2 } from "lucide-react"
import { useAuth } from "@/features/auth/context/auth-context"
import { feedApi } from "../api/feed-api"
import { imageApi } from "../api/image-api"

interface FeedCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedCreateModal({ isOpen, onClose }: FeedCreateModalProps) {
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

      // 1. 이미지가 있다면 업로드
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

      // 2. 피드 작성 요청
      await feedApi.createFeed({
        userId: Number(user.id),
        content: content,
        imageUrl: uploadedImageUrl || undefined,
      });
      
      // 초기화 및 닫기
      setContent("");
      setSelectedImage(null);
      setPreviewUrl(null);
      onClose();
      // 필요하다면 여기서 쿼리 무효화(invalidateQueries)를 호출하여 피드 새로고침
      window.location.reload(); 
    } catch (error) {
      console.error("Failed to create feed:", error);
      alert("게시물 작성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] p-0 gap-0 overflow-hidden bg-white rounded-xl h-[600px] flex flex-col md:flex-row">
        <DialogTitle className="sr-only">새 게시물 만들기</DialogTitle>
        
        {/* 모바일/헤더 영역 */}
        <div className="md:hidden flex items-center justify-between p-4 border-b">
           <span className="font-semibold">새 게시물 만들기</span>
           <Button variant="ghost" size="sm" onClick={handlePost} disabled={isSubmitting}>
             공유
           </Button>
        </div>

        {/* 1. 이미지 미리보기 영역 (좌측/상단) */}
        <div className="bg-neutral-100 flex items-center justify-center w-full md:w-[60%] h-[300px] md:h-full relative overflow-hidden">
             {previewUrl ? (
               <>
                 <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                 <button
                   onClick={() => { setSelectedImage(null); setPreviewUrl(null); }}
                   className="absolute right-4 top-4 bg-black/50 p-1 rounded-full text-white hover:bg-black/70 transition-colors"
                 >
                   <X className="h-5 w-5" />
                 </button>
               </>
             ) : (
               <div className="flex flex-col items-center gap-4">
                  <ImageIcon className="h-16 w-16 text-gray-300" />
                  <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-blue-600 transition-colors">
                      컴퓨터에서 선택
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
               </div>
             )}
        </div>

        {/* 2. 글쓰기 영역 (우측/하단) */}
        <div className="flex flex-col w-full md:w-[40%] h-full bg-white border-l border-gray-100">
           {/* PC 헤더 */}
           <div className="hidden md:flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                    <img src={user?.avatar || "/placeholder-user.jpg"} alt="Me" className="w-full h-full object-cover" />
                 </div>
                 <span className="font-semibold text-sm">{user?.username}</span>
              </div>
              <Button 
                onClick={handlePost} 
                disabled={(!content.trim() && !selectedImage) || isSubmitting}
                className="text-blue-500 font-bold hover:text-blue-700 hover:bg-transparent p-0 h-auto"
                variant="ghost"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "공유하기"}
              </Button>
           </div>
           
           <div className="p-4 flex-1">
              <Textarea
                 placeholder="문구를 입력하세요..."
                 value={content}
                 onChange={(e) => setContent(e.target.value)}
                 className="w-full h-full resize-none border-none focus-visible:ring-0 p-0 text-base"
              />
           </div>

           <div className="p-4 border-t border-gray-100">
              <div className="flex justify-between items-center text-gray-400">
                  <span className="text-xs">위치 추가</span>
                  <span className="text-xs">접근성</span>
                  <span className="text-xs">고급 설정</span>
              </div>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}