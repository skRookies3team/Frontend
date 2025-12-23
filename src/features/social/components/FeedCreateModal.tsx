import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { ImagePlus, X, Loader2, MapPin } from "lucide-react";
import { useAuth } from "@/features/auth/context/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { feedApi } from "../api/feed-api";
import { FEED_KEYS } from "../hooks/use-feed-query";
import { FeedDto } from "../types/feed";

interface FeedCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "create" | "edit"; // [추가] 모드 구분
  initialData?: FeedDto;    // [추가] 수정 시 초기 데이터
}

export function FeedCreateModal({ isOpen, onClose, mode = "create", initialData }: FeedCreateModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  
  // [수정] 이미지 관리: 기존 이미지(URL) + 새 파일(File)
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]); // 새 파일 프리뷰
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // [추가] 초기 데이터 로드 (수정 모드일 때)
  useEffect(() => {
    if (isOpen && mode === "edit" && initialData) {
      setContent(initialData.content);
      setLocation(initialData.location || "");
      // 펫 ID는 number -> string 변환 필요
      setSelectedPetId(initialData.petId ? String(initialData.petId) : "");
      setExistingImageUrls(initialData.imageUrls || []);
    } else if (isOpen && mode === "create") {
      // 초기화
      setContent("");
      setLocation("");
      setSelectedPetId("");
      setExistingImageUrls([]);
      setSelectedFiles([]);
      setPreviewUrls([]);
    }
  }, [isOpen, mode, initialData]);

  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      // 용량 체크 생략 (필요 시 추가)
      const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));

      setSelectedFiles((prev) => [...prev, ...newFiles]);
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    }
  };

  // 기존 이미지 삭제
  const removeExistingImage = (index: number) => {
    setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  // 새 이미지 삭제
  const removeNewImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim()) return alert("내용을 입력해주세요.");
    
    setIsSubmitting(true);
    try {
      // 1. 새 이미지가 있다면 업로드
      let newUploadedUrls: string[] = [];
      if (selectedFiles.length > 0) {
        newUploadedUrls = await feedApi.uploadImages(selectedFiles);
      }

      // 2. 최종 이미지 리스트 (기존 것 + 새로 올린 것)
      const finalImageUrls = [...existingImageUrls, ...newUploadedUrls];

      if (mode === "create") {
        await feedApi.createFeed({
            userId: Number(user?.id),
            content,
            location,
            petId: Number(selectedPetId),
            imageUrls: finalImageUrls
        });
        alert("게시물이 등록되었습니다!");
      } else {
        // [수정 모드]
        if (!initialData) return;
        await feedApi.updateFeed(initialData.feedId, {
            userId: Number(user?.id),
            content,
            location,
            imageUrls: finalImageUrls
        });
        alert("게시물이 수정되었습니다!");
      }

      queryClient.invalidateQueries({ queryKey: FEED_KEYS.all });
      handleClose();
    } catch (error) {
      console.error(error);
      alert("작업 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] bg-white rounded-[2rem] border-none shadow-xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 border-b border-gray-50">
          <DialogTitle className="text-xl font-black text-center text-[#FF69B4]">
            {mode === "create" ? "새 게시물 만들기" : "게시물 수정"}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* 이미지 프리뷰 영역 */}
          <div className="space-y-3">
             <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                 {/* 1. 기존 이미지 */}
                 {existingImageUrls.map((url, idx) => (
                    <div key={`exist-${idx}`} className="relative shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-gray-100 group">
                        <img src={url} alt="existing" className="w-full h-full object-cover" />
                        <button onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-[#FF69B4] transition-colors">
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                 ))}
                 
                 {/* 2. 새 이미지 */}
                 {previewUrls.map((url, idx) => (
                    <div key={`new-${idx}`} className="relative shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-gray-100 group">
                        <img src={url} alt="new" className="w-full h-full object-cover" />
                        <button onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-[#FF69B4] transition-colors">
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
             <input type="file" accept="image/*" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          </div>

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
              placeholder="내용을 입력하세요..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none border-gray-200 bg-gray-50/50 rounded-xl focus-visible:ring-[#FF69B4]"
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
            className="w-full h-12 rounded-xl bg-[#FF69B4] hover:bg-[#FF1493] text-white font-bold text-lg shadow-md"
          >
            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : (mode === "create" ? "공유하기" : "수정 완료")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}