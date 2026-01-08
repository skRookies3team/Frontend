import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Scan, AlertTriangle, FileText, MapPin, X } from 'lucide-react';
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import HealthReport from './HealthReport';
import MapContainer from '../../chatbot/components/MapContainer';
import { chatbotApi } from '../../chatbot/api/chatbotApi';
import { analyzeSkinDiseaseApi, SkinDiseaseResponse } from '../api/healthcareApi';

export default function AiDiagnosis() {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [showReport, setShowReport] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file); // 실제 파일 저장
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async () => {
    if (!imageFile) return;
    
    setIsScanning(true);
    setProgress(0);
    
    // 진행 상태 표시 (UI 피드백)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90; // API 응답까지 90%에서 대기
        }
        return prev + 5;
      });
    }, 200);

    try {
      // 실제 백엔드 API 호출
      const token = localStorage.getItem('accessToken');
      const userId = localStorage.getItem('userId') || '0';
      const petId = localStorage.getItem('selectedPetId') || '0';
      
      const response: SkinDiseaseResponse = await analyzeSkinDiseaseApi(
        imageFile, userId, petId, token
      );
      
      clearInterval(interval);
      setProgress(100);
      setIsScanning(false);
      
      if (response.success) {
        setResult({
          diagnosis: response.result.possibleDiseases.join(', ') || '분석 완료',
          score: response.result.severity === '심각' ? 90 : response.result.severity === '주의' ? 70 : 40,
          severity: response.result.severity,
          description: response.result.symptoms.join(', '),
          recommendation: response.result.recommendation,
          notes: response.result.notes,
        });
      } else {
        setResult({
          diagnosis: '분석 실패',
          score: 0,
          severity: '오류',
          description: response.message,
          recommendation: '다시 시도하거나 수의사와 상담하세요.',
        });
      }
    } catch (error) {
      clearInterval(interval);
      setIsScanning(false);
      setResult({
        diagnosis: '분석 오류',
        score: 0,
        severity: '오류',
        description: '서버 연결에 실패했습니다.',
        recommendation: '네트워크 상태를 확인하고 다시 시도해주세요.',
      });
    }
  };

  const openMap = async () => {
     const data = await chatbotApi.getNearbyHospitals(37.5665, 126.9780);
     setHospitals(data);
     setShowMap(true);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 min-h-[600px] flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
         <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
               <Scan className="text-blue-400" /> AI 피부/질환 분석
            </h2>
            <p className="text-slate-400 text-sm">반려동물의 환부 사진을 업로드하면 AI가 분석합니다.</p>
         </div>
      </div>

      <div className="flex-1 p-8 flex flex-col items-center justify-center relative bg-slate-50">
         <AnimatePresence mode="wait">
            {!image ? (
               <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center w-full max-w-md"
               >
                  <div 
                     onClick={() => fileInputRef.current?.click()}
                     className="border-2 border-dashed border-slate-300 rounded-3xl p-12 bg-white cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group"
                  >
                     <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500 group-hover:scale-110 transition-transform">
                        <Upload className="w-10 h-10" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-700 mb-2">사진 업로드</h3>
                     <p className="text-slate-400 text-sm">또는 파일을 여기로 드래그하세요</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
               </motion.div>
            ) : !result ? (
               <motion.div className="w-full max-w-lg relative">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white mb-8 group">
                     <img src={image} alt="Upload" className="w-full h-80 object-cover" />
                     {/* Scanning Line */}
                     {isScanning && (
                        <div className="absolute inset-0 z-20 overflow-hidden rounded-lg pointer-events-none">
                           <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)]" 
                                style={{ animation: 'scan 2s linear infinite' }} />
                           <div className="absolute inset-0 bg-emerald-400/10" />
                           <style>{`
                              @keyframes scan {
                                 0% { top: 0%; opacity: 0; }
                                 10% { opacity: 1; }
                                 90% { opacity: 1; }
                                 100% { top: 100%; opacity: 0; }
                              }
                           `}</style>
                        </div>
                     )}
                     {!isScanning && (
                        <button onClick={() => setImage(null)} className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70">
                           <X className="w-5 h-5" />
                        </button>
                     )}
                  </div>

                  {isScanning ? (
                     <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium text-slate-600">
                           <span>AI 분석중...</span>
                           <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-3" />
                        <p className="text-center text-xs text-slate-400 mt-2">이미지의 픽셀 단위 정밀 분석을 진행하고 있습니다.</p>
                     </div>
                  ) : (
                     <Button onClick={startAnalysis} size="lg" className="w-full text-lg h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl rounded-2xl">
                        <Scan className="w-5 h-5 mr-2" /> 분석 시작하기
                     </Button>
                  )}
               </motion.div>
            ) : (
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-4xl"
               >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* Result Card */}
                     <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 h-full">
                        <div className="flex items-center gap-3 mb-6">
                           <div className="p-3 bg-red-100 text-red-500 rounded-full">
                              <AlertTriangle className="w-6 h-6" />
                           </div>
                           <div>
                              <p className="text-sm text-slate-400">분석 결과</p>
                              <h3 className="text-2xl font-bold text-slate-800">{result.diagnosis}</h3>
                           </div>
                        </div>
                        
                        <div className="space-y-6">
                           <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                              <span className="font-medium text-slate-600">심각도</span>
                              <span className="font-bold text-orange-500 px-3 py-1 bg-orange-100 rounded-full text-sm">{result.severity}</span>
                           </div>
                           
                           <div>
                              <p className="font-medium text-slate-700 mb-2">상세 소견</p>
                              <p className="text-slate-500 text-sm leading-relaxed">{result.description}</p>
                           </div>

                           <div className="pt-4 border-t border-slate-100">
                              <p className="font-medium text-slate-700 mb-2">AI 제안</p>
                              <p className="text-blue-600 font-medium text-sm">{result.recommendation}</p>
                           </div>
                        </div>
                     </div>

                     {/* Actions */}
                     <div className="flex flex-col gap-4 justify-center">
                        <div className="bg-blue-50 rounded-3xl p-8 text-center">
                           <h4 className="font-bold text-slate-800 mb-2 text-lg">상세 리포트 발급</h4>
                           <p className="text-slate-500 text-sm mb-6">분석된 데이터를 바탕으로<br/>정밀 건강 보고서를 생성합니다.</p>
                           <Button onClick={() => setShowReport(true)} variant="outline" className="w-full h-12 border-blue-200 text-blue-600 hover:bg-blue-100 bg-white">
                              <FileText className="w-5 h-5 mr-2" /> 리포트 보기
                           </Button>
                        </div>

                        <div className="bg-emerald-50 rounded-3xl p-8 text-center">
                           <h4 className="font-bold text-slate-800 mb-2 text-lg">가까운 병원 찾기</h4>
                           <p className="text-slate-500 text-sm mb-6">현재 위치 기반으로<br/>진료 가능한 병원을 검색합니다.</p>
                           <Button onClick={openMap} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 shadow-lg">
                              <MapPin className="w-5 h-5 mr-2" /> 병원 검색
                           </Button>
                        </div>
                        
                        <Button onClick={() => setImage(null)} variant="ghost" className="text-slate-400">
                           다시 분석하기
                        </Button>
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>

      {/* Overlays */}
      {showReport && (
         <HealthReport 
            analysisResult={result} 
            onClose={() => setShowReport(false)} 
         />
      )}
      
      {showMap && (
         <MapContainer 
            onClose={() => setShowMap(false)} 
            hospitals={hospitals}
            center={{ lat: 37.5665, lng: 126.9780 }}
            onCenterChange={async (lat, lng) => {
                const data = await chatbotApi.getNearbyHospitals(lat, lng);
                setHospitals(data);
            }}
         />
      )}
    </div>
  );
}
