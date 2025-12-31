import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Input } from "@/shared/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { ImagePlus, MapPin, X, ChevronLeft, ChevronRight, Loader2, Hash } from "lucide-react";
import { useAuth } from "@/features/auth/context/auth-context";
import { feedApi } from "../api/feed-api";
import { FeedDto } from "../types/feed";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FEED_KEYS } from "../hooks/use-feed-query";

interface FeedCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  initialData?: FeedDto;
}

export function FeedCreateModal({ isOpen, onClose, mode = "create", initialData }: FeedCreateModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [content, setContent] = useState(initialData?.content || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>(initialData?.imageUrls || []);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [extractedTags, setExtractedTags] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && mode === 'create') {
      setContent("");
      setLocation("");
      setSelectedImages([]);
      setPreviewUrls([]);
      setCurrentImageIdx(0);
      setExtractedTags([]);
    }
  }, [isOpen, mode]);

  useEffect(() => {
    const tags = content.match(/#[^\s#]+/g) || [];
    const uniqueTags = Array.from(new Set(tags));
    setExtractedTags(uniqueTags);
  }, [content]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    if (currentImageIdx >= previewUrls.length - 1) {
      setCurrentImageIdx(Math.max(0, previewUrls.length - 2));
    }
  };

  const createFeedMutation = useMutation({
    mutationFn: async () => {
      setIsSubmitting(true);
      let finalImageUrls = initialData?.imageUrls || [];

      if (selectedImages.length > 0) {
        const uploadedUrls = await feedApi.uploadImages(selectedImages);
        finalImageUrls = mode === 'create' ? uploadedUrls : [...finalImageUrls, ...uploadedUrls];
      }

      if (mode === 'create') {
        await feedApi.createFeed({
          userId: Number(user?.id),
          content,
          location,
          imageUrls: finalImageUrls,
        });
      } else if (mode === 'edit' && initialData) {
        await feedApi.updateFeed(initialData.feedId, {
          userId: Number(user?.id),
          content,
          location,
          imageUrls: finalImageUrls,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEED_KEYS.all });
      onClose();
    },
    onError: (err) => {
      console.error(err);
      alert("게시물 업로드에 실패했습니다.");
    },
    onSettled: () => setIsSubmitting(false),
  });

  const handleSubmit = () => {
    if (!content.trim() && previewUrls.length === 0) return;
    createFeedMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-full md:max-w-[1200px] w-full p-0 gap-0 bg-white rounded-none sm:rounded-[2.5rem] overflow-hidden h-full md:h-[90vh] flex flex-col md:flex-row border-none shadow-2xl transition-all"
        showCloseButton={false} // [수정] 기본 닫기 버튼 숨김 (중복 방지)
      >
        <DialogTitle className="sr-only">새 게시물 만들기</DialogTitle>
        <DialogDescription className="sr-only">
          사진을 업로드하고 내용을 작성하여 새로운 게시물을 등록하는 팝업창입니다.
        </DialogDescription>
        
        {/* 왼쪽 이미지 영역 */}
        <div className="relative w-full md:flex-[1.5] h-[45vh] md:h-full bg-black flex flex-col items-center justify-center border-r border-gray-100 group">
          {previewUrls.length > 0 ? (
            <>
              <img src={previewUrls[currentImageIdx]} alt="Preview" className="w-full h-full object-contain" />
              {previewUrls.length > 1 && (
                <>
                  <button onClick={() => setCurrentImageIdx(prev => prev === 0 ? previewUrls.length - 1 : prev - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-all backdrop-blur-sm z-10">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button onClick={() => setCurrentImageIdx(prev => prev === previewUrls.length - 1 ? 0 : prev + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-all backdrop-blur-sm z-10">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-6 flex gap-1.5 z-10 p-2 rounded-full bg-black/20 backdrop-blur-sm">
                    {previewUrls.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImageIdx ? 'bg-white w-4' : 'bg-white/50 w-1.5 hover:bg-white/80'}`} />
                    ))}
                  </div>
                </>
              )}
              <button onClick={() => removeImage(currentImageIdx)} className="absolute top-4 right-4 p-2 bg-black/40 rounded-full text-white hover:bg-red-500/80 transition-colors z-10 backdrop-blur-sm">
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="text-center p-10 bg-slate-50 w-full h-full flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                <ImagePlus className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">사진을 끌어다 놓으세요</h3>
              <Button onClick={() => fileInputRef.current?.click()} className="bg-[#FF69B4] hover:bg-[#FF1493] text-white rounded-xl px-8 py-6 text-base font-bold mt-4 shadow-lg shadow-[#FF69B4]/20">
                컴퓨터에서 선택
              </Button>
            </div>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleImageSelect} />
        </div>

        {/* 오른쪽 입력 영역 */}
        <div className="flex-1 flex flex-col h-[55vh] md:h-full bg-white relative">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
            <h2 className="font-bold text-lg text-gray-900">{mode === 'edit' ? '정보 수정' : '새 게시물'}</h2>
            
            <div className="flex items-center gap-3">
                <Button variant="ghost" className="text-[#FF69B4] font-bold hover:text-[#FF1493] hover:bg-transparent p-0 h-auto text-base" onClick={handleSubmit} disabled={isSubmitting || (previewUrls.length === 0 && !content)}>
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : '공유하기'}
                </Button>
                {/* 닫기 버튼 */}
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-gray-100 rounded-full text-gray-400">
                    <X className="h-5 w-5" />
                </Button>
            </div>
          </div>
          
          <div className="px-6 py-4 flex items-center gap-3 shrink-0">
            <Avatar className="w-10 h-10 ring-2 ring-transparent">
              <AvatarImage src={user?.avatar || "/placeholder-user.jpg"} />
              <AvatarFallback className="bg-[#FFF0F5] text-[#FF69B4] font-bold">{user?.username?.[0]}</AvatarFallback>
            </Avatar>
            <span className="font-bold text-base text-gray-900">{user?.username}</span>
          </div>
          
          <div className="flex-1 px-6 py-2 flex flex-col">
            <Textarea 
              placeholder="문구를 입력하세요... (#태그입력)" 
              className="w-full flex-1 resize-none border-none p-0 text-[16px] focus-visible:ring-0 placeholder:text-gray-400 leading-relaxed custom-scrollbar" 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
            />
            
            {extractedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 mb-2">
                {extractedTags.map((tag, idx) => (
                  <Badge 
                    key={idx} 
                    variant="secondary" 
                    className="bg-[#FFF0F5] text-[#FF69B4] hover:bg-[#FFE4E1] text-xs px-2 py-1 font-medium"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="px-6 pb-4 text-right shrink-0 border-b border-gray-50">
              <span className="text-xs text-gray-400 font-medium">{content.length}/2,200</span>
          </div>
          
          <div className="mt-auto shrink-0">
            {/* 해시태그 안내 문구 */}
            <div className="px-6 py-3 border-b border-gray-100 flex items-center text-sm text-gray-400">
               <Hash className="w-4 h-4 mr-2" />
               <span className="text-xs">내용에 #태그를 입력하면 자동으로 추가됩니다.</span>
            </div>

            <div className="px-6 py-4 flex items-center group cursor-pointer hover:bg-gray-50 transition-colors">
              <MapPin className="w-6 h-6 text-gray-400 mr-4 group-hover:text-[#FF69B4] transition-colors" />
              <Input placeholder="위치 추가" className="flex-1 border-none p-0 h-auto focus-visible:ring-0 text-base bg-transparent placeholder:text-gray-500" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}