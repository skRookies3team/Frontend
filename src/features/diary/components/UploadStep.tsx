import React from 'react';
import { Camera, Upload, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { SelectedImage, ImageType } from '../types/diary';

interface UploadStepProps {
  selectedImages: SelectedImage[];
  isSubmitting: boolean;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGenerate: () => void;
  setSelectedImages: React.Dispatch<React.SetStateAction<SelectedImage[]>>;
  setShowGallery: (show: boolean) => void;
}

const Icon: React.FC<{ className?: string, children: React.ReactNode }> = ({ children, className }) => <span className={`inline-flex items-center justify-center ${className}`}>{children}</span>;

const UploadStep: React.FC<UploadStepProps> = ({
  selectedImages, isSubmitting, handleImageUpload, handleGenerate, setSelectedImages, setShowGallery
}) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-lg text-center">
        <div className="mb-6 flex justify-center">
          <div className="bg-pink-100 p-4 rounded-full">
            <Camera className="w-10 h-10 text-pink-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">오늘의 추억을 선택해주세요</h2>
        <p className="text-gray-500 mb-8">사진을 분석하여 AI가 특별한 일기를 써드려요.</p>
        
        <div className="space-y-4">
          <label className="block w-full cursor-pointer">
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isSubmitting} />
            <div className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform active:scale-95">
              <Upload className="w-5 h-5" />
              <span>사진 업로드하기</span>
            </div>
          </label>
          
          <button 
            onClick={() => setShowGallery(true)}
            className="w-full bg-white border-2 border-pink-200 text-pink-500 hover:bg-pink-50 font-medium py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <ImageIcon className="w-5 h-5" />
            <span>보관함에서 선택</span>
          </button>
        </div>
      </div>

      {selectedImages.length > 0 && (
        <div className="w-full max-w-3xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">선택된 사진 ({selectedImages.length})</h3>
            <button onClick={() => setSelectedImages([])} className="text-gray-400 hover:text-red-500 text-sm flex items-center gap-1">
              <Trash2 className="w-4 h-4" /> 전체 삭제
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {selectedImages.map((img, idx) => (
              <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <img src={img.imageUrl} alt="selected" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
                {img.source === ImageType.ARCHIVE && (
                  <span className="absolute bottom-1 right-1 bg-blue-500/80 text-[10px] text-white px-1.5 py-0.5 rounded-full">Archive</span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <button 
              onClick={handleGenerate}
              className="bg-gray-800 hover:bg-gray-900 text-white text-lg font-bold py-4 px-12 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center gap-2"
            >
              <Icon className="w-5 h-5"><ImageIcon /></Icon>
              AI 일기 생성하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadStep;