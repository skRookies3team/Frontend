import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { ImagePlus, X, Loader2, MapPin } from "lucide-react";
import { useAuth } from "@/features/auth/context/auth-context";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { feedApi } from "../api/feed-api";
import { FEED_KEYS } from "../hooks/use-feed-query";

interface FeedCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedCreateModal({ isOpen, onClose }: FeedCreateModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  
  // [수정] 파일 배열 상태 관리
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createFeedMutation = useMutation({
    mutationFn: feedApi.createFeed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEED_KEYS.all });
      handleClose();
    },
    onError: (error) => {
      console.error("피드 생성 실패:", error);
      alert("피드 생성 중 오류가 발생했습니다.");
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  // [수정] 파일 선택 핸들러 (여러 개)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // 기존 파일에 새로 선택한 파일들을 추가
      const newFiles = Array.from(e.target.files);
      
      // 용량 체크 (각 파일 10MB)
      const validFiles = newFiles.filter(file => {
          if(file.size > 10 * 1024 * 1024) {
              alert(`'${file.name}' 파일이 10MB를 초과하여 제외됩니다.`);
              return false;
          }
          return true;
      });

      const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file));

      setSelectedFiles((prev) => [...prev, ...validFiles]);
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    }
  };

  // [추가] 개별 이미지 삭제 핸들러
  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() || !selectedPetId) {
      alert("내용과 반려동물을 선택해주세요!");
      return;
    }

    setIsSubmitting(true);

    try {
      let uploadedImageUrls: string[] = [];

      // [Step 1] 이미지가 있다면 User Service에 업로드 (리스트 반환)
      if (selectedFiles.length > 0) {
        try {
          uploadedImageUrls = await feedApi.uploadImages(selectedFiles);
        } catch (uploadError) {
          console.error("이미지 업로드 실패:", uploadError);
          alert("이미지 업로드에 실패했습니다.");
          setIsSubmitting(false);
          return;
        }
      }

      // [Step 2] Social Service에 전송
      // ⚠️ 주의: 백엔드 Social Service의 CreateFeedRequest DTO가 
      // imageUrl 필드를 String 하나만 받는지, List<String>인지 확인해야 합니다.
      // 일단 여기서는 첫 번째 이미지만 보내거나, 콤마로 합쳐서 보내는 방식을 예시로 둡니다.
      
      const feedPayload = {
        userId: Number(user?.id),
        content: content,
        location: location,
        petId: Number(selectedPetId),
        
        // [중요] 백엔드가 단일 String만 받는다면 -> uploadedImageUrls[0] || ""
        // 백엔드가 List를 받는다면 DTO 수정 후 -> imageUrls: uploadedImageUrls 
        imageUrl: uploadedImageUrls[0] || "", 
      };

      // @ts-ignore (타입 에러 임시 무시: 백엔드 스펙에 맞춰 수정 필요)
      createFeedMutation.mutate(feedPayload);

    } catch (error) {
      console.error("처리 중 오류 발생", error);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setContent("");
    setLocation("");
    setSelectedPetId("");
    setSelectedFiles([]);
    setPreviewUrls([]);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] bg-white rounded-[2rem] border-none shadow-xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 border-b border-gray-50">
          <DialogTitle className="text-xl font-black text-center text-[#FF69B4]">새 게시물 만들기</DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* 이미지 프리뷰 영역 (가로 스크롤) */}
          <div className="space-y-3">
             {previewUrls.length > 0 ? (
                 <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                     {previewUrls.map((url, idx) => (
                         <div key={idx} className="relative shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-gray-100 group">
                             <img src={url} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                             <button 
                                 onClick={() => removeImage(idx)}
                                 className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-[#FF69B4] transition-colors"
                             >
                                 <X className="h-3 w-3" />
                             </button>
                         </div>
                     ))}
                     {/* 추가 버튼 */}
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="shrink-0 w-24 h-24 rounded-xl border-2 border-dashed border-[#FF69B4]/30 flex flex-col items-center justify-center text-[#FF69B4] hover:bg-[#FFF0F5] transition-colors"
                     >
                         <ImagePlus className="h-6 w-6 mb-1" />
                         <span className="text-[10px] font-bold">추가</span>
                     </button>
                 </div>
             ) : (
                 // 이미지가 없을 때 크게 보이는 영역
                 <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center aspect-video w-full rounded-2xl border-2 border-dashed border-[#FF69B4]/30 bg-[#FFF0F5]/30 hover:bg-[#FFF0F5] hover:border-[#FF69B4] transition-all cursor-pointer"
                 >
                    <div className="p-4 bg-white rounded-full shadow-sm mb-3 text-[#FF69B4]">
                        <ImagePlus className="h-8 w-8" />
                    </div>
                    <span className="text-sm font-bold text-gray-500">사진을 추가해주세요 (여러 장 가능)</span>
                 </div>
             )}
             
             {/* 숨겨진 Input (Multiple 속성 추가) */}
             <input 
                 type="file" 
                 accept="image/*" 
                 multiple 
                 className="hidden" 
                 ref={fileInputRef}
                 onChange={handleFileChange} 
             />
          </div>

          {/* 입력 폼 영역 */}
          <div className="space-y-4">
            <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 ml-1">함께한 반려동물</Label>
                <Select value={selectedPetId} onValueChange={setSelectedPetId}>
                <SelectTrigger className="w-full rounded-xl border-gray-200 bg-gray-50/50 focus:ring-[#FF69B4]">
                    <SelectValue placeholder="누구와 함께했나요?" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="1">구름이</SelectItem>
                    <SelectItem value="2">루나</SelectItem>
                </SelectContent>
                </Select>
            </div>

            <Textarea 
              placeholder="오늘 어떤 일이 있었나요?" 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none border-gray-200 bg-gray-50/50 rounded-xl focus-visible:ring-[#FF69B4] placeholder:text-gray-400"
            />

            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                    placeholder="위치 추가" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-9 border-gray-200 bg-gray-50/50 rounded-xl focus-visible:ring-[#FF69B4]"
                />
            </div>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-[#FF69B4] hover:bg-[#FF1493] text-white font-bold text-lg shadow-md shadow-[#FF69B4]/20 transition-all"
          >
            {isSubmitting ? (
                <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    업로드 중...
                </>
            ) : (
                "공유하기"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}