import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Loader2, Check, AlertTriangle, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import { useAuth } from '@/features/auth/context/auth-context';
import axios from 'axios';

interface Pet3DModelUploadProps {
  petId?: string;
  onModelGenerated?: (modelUrl: string) => void;
}

type GenerationStatus = 'idle' | 'uploading' | 'generating' | 'succeeded' | 'failed';

interface GenerationResult {
  taskId: string;
  status: string;
  progress: number;
  modelUrl?: string;
  renderedImageUrl?: string;
  message?: string;
}

/**
 * 펫 3D 모델 업로드 및 생성 컴포넌트
 * 
 * WHY: 사용자가 직접 이미지를 업로드하여 3D 모델 생성
 * - 파일 업로드 → S3 저장 → Meshy.ai 3D 생성 → 텍스처 적용
 * - 생성 중 로딩 스피너 및 진행률 표시
 * 
 * @author healthcare-team
 * @since 2026-01-09
 */
export function Pet3DModelUpload({ petId, onModelGenerated }: Pet3DModelUploadProps) {
  const { token } = useAuth();
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 미리보기 이미지 설정
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // 3D 모델 생성 시작
      startGeneration(file);
    }
  };

  // 3D 모델 생성 시작
  const startGeneration = async (file: File) => {
    setStatus('uploading');
    setProgress(0);
    setErrorMessage('');

    // 업로드 진행률 시뮬레이션 (실제로는 axios 진행률 사용 가능)
    const uploadProgressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 15) {
          clearInterval(uploadProgressInterval);
          return 15;
        }
        return prev + 3;
      });
    }, 100);

    try {
      // FormData 준비
      const formData = new FormData();
      formData.append('file', file);
      if (petId) {
        formData.append('petId', petId);
      }

      clearInterval(uploadProgressInterval);
      setProgress(20);
      setStatus('generating');

      // 생성 중 진행률 표시 (5-10분 소요되므로 천천히 증가)
      const generationProgressInterval = setInterval(() => {
        setProgress(prev => {
          // 90%까지만 증가 (완료 시 100%로 점프)
          if (prev >= 90) {
            clearInterval(generationProgressInterval);
            return 90;
          }
          // 매우 천천히 증가 (5분 = 300초 동안 70% 증가)
          return prev + 0.5;
        });
      }, 2000); // 2초마다 0.5% 증가

      // ⭐ API 호출 (동기식, 5-10분 소요)
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.post<GenerationResult>(
        '/api/model/generate-from-file',
        formData,
        {
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 600000, // 10분 타임아웃
        }
      );

      clearInterval(generationProgressInterval);

      if (response.data.status === 'SUCCEEDED' || response.data.modelUrl) {
        setProgress(100);
        setStatus('succeeded');
        setResult(response.data);
        
        if (response.data.modelUrl && onModelGenerated) {
          onModelGenerated(response.data.modelUrl);
        }
      } else {
        setStatus('failed');
        setErrorMessage(response.data.message || '3D 모델 생성에 실패했습니다.');
      }

    } catch (error: any) {
      console.error('3D 모델 생성 실패:', error);
      setStatus('failed');
      setErrorMessage(
        error.response?.data?.message || 
        error.message || 
        '네트워크 오류가 발생했습니다. 다시 시도해주세요.'
      );
    }
  };

  // 다시 시도
  const handleRetry = () => {
    setStatus('idle');
    setProgress(0);
    setPreviewImage(null);
    setResult(null);
    setErrorMessage('');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {/* 대기 상태 - 파일 업로드 UI */}
        {status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-pink-300 rounded-2xl p-8 bg-pink-50/50 cursor-pointer hover:border-pink-400 hover:bg-pink-100/50 transition-all group text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white group-hover:scale-110 transition-transform shadow-lg">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">반려동물 사진 업로드</h3>
              <p className="text-sm text-gray-500">
                사진을 업로드하면 AI가 3D 모델을 생성합니다
              </p>
              <p className="text-xs text-gray-400 mt-2">
                JPG, PNG (최대 10MB)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </motion.div>
        )}

        {/* 생성 중 - 로딩 스피너 */}
        {(status === 'uploading' || status === 'generating') && (
          <motion.div
            key="generating"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-8 text-center border border-pink-200 shadow-lg"
          >
            {/* 미리보기 이미지 */}
            {previewImage && (
              <div className="relative w-32 h-32 mx-auto mb-6 rounded-xl overflow-hidden shadow-lg">
                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            )}

            {/* 로딩 애니메이션 */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              {/* 외부 회전 링 */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-4 border-pink-200 border-t-pink-500"
              />
              {/* 내부 회전 링 */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 rounded-full border-4 border-rose-200 border-t-rose-500"
              />
              {/* 중앙 아이콘 */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white animate-pulse" />
              </div>
            </div>

            {/* 상태 텍스트 */}
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {status === 'uploading' ? '이미지 업로드 중...' : '3D 모델 생성 중...'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {status === 'generating' && '고품질 3D 모델을 만들고 있어요. 약 5-10분 소요됩니다.'}
            </p>

            {/* 진행률 바 */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">진행률</span>
                <span className="font-medium text-pink-600">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3 bg-pink-100" />
            </div>

            {/* 단계 표시 */}
            <div className="mt-6 space-y-2 text-left">
              <div className={`flex items-center gap-2 text-sm ${progress >= 15 ? 'text-green-600' : 'text-gray-400'}`}>
                {progress >= 15 ? <Check className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                이미지 업로드
              </div>
              <div className={`flex items-center gap-2 text-sm ${progress >= 50 ? 'text-green-600' : progress >= 20 ? 'text-pink-600' : 'text-gray-400'}`}>
                {progress >= 50 ? <Check className="w-4 h-4" /> : progress >= 20 ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="w-4 h-4" />}
                3D 형태 생성 (Preview)
              </div>
              <div className={`flex items-center gap-2 text-sm ${progress >= 90 ? 'text-green-600' : progress >= 50 ? 'text-pink-600' : 'text-gray-400'}`}>
                {progress >= 90 ? <Check className="w-4 h-4" /> : progress >= 50 ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="w-4 h-4" />}
                텍스처 & 색상 적용 (Refine)
              </div>
              <div className={`flex items-center gap-2 text-sm ${progress >= 100 ? 'text-green-600' : 'text-gray-400'}`}>
                {progress >= 100 ? <Check className="w-4 h-4" /> : <div className="w-4 h-4" />}
                완료
              </div>
            </div>
          </motion.div>
        )}

        {/* 성공 */}
        {status === 'succeeded' && result && (
          <motion.div
            key="succeeded"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 text-center border border-green-200 shadow-lg"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">3D 모델 생성 완료! 🎉</h3>
            <p className="text-sm text-gray-500 mb-4">
              반려동물의 3D 모델이 성공적으로 생성되었습니다.
            </p>
            
            {/* 결과 미리보기 */}
            {result.renderedImageUrl && (
              <img 
                src={result.renderedImageUrl} 
                alt="3D Model Preview" 
                className="w-48 h-48 mx-auto rounded-xl object-cover mb-4 shadow-lg"
              />
            )}

            <div className="flex gap-2 justify-center">
              <Button 
                onClick={handleRetry}
                variant="outline"
                className="border-green-200"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                다시 생성
              </Button>
              {result.modelUrl && (
                <Button 
                  asChild
                  className="bg-gradient-to-r from-green-500 to-emerald-500"
                >
                  <a href={result.modelUrl} target="_blank" rel="noopener noreferrer">
                    모델 다운로드
                  </a>
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {/* 실패 */}
        {status === 'failed' && (
          <motion.div
            key="failed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-8 text-center border border-red-200 shadow-lg"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">생성 실패</h3>
            <p className="text-sm text-red-600 mb-4">
              {errorMessage}
            </p>
            <Button 
              onClick={handleRetry}
              className="bg-gradient-to-r from-red-500 to-rose-500"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              다시 시도
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Pet3DModelUpload;
