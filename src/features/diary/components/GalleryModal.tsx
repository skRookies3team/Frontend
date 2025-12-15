import React from 'react';
import { BookOpen, X, Check } from 'lucide-react';
import { SelectedImage } from '../types/diary';

interface GalleryModalProps {
  showGallery: boolean;
  setShowGallery: (show: boolean) => void;
  selectedImages: SelectedImage[];
  handleSelectFromGallery: (url: string) => void;
}

const GalleryModal: React.FC<GalleryModalProps> = ({ 
  showGallery, setShowGallery, selectedImages, handleSelectFromGallery 
}) => {
  if (!showGallery) return null;

  // Mock Archive Images
  const archiveImages = Array.from({ length: 8 }).map((_, i) => 
    `https://picsum.photos/seed/${i + 100}/200/200`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl animate-scale-up">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-pink-500" /> 사진 보관함
          </h3>
          <button onClick={() => setShowGallery(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {archiveImages.map((img, idx) => {
              const isSelected = selectedImages.some(si => si.imageUrl === img);
              return (
                <div 
                  key={idx} 
                  onClick={() => handleSelectFromGallery(img)}
                  className={`aspect-square rounded-xl overflow-hidden cursor-pointer relative group transition-all duration-200 ${
                    isSelected ? 'ring-4 ring-pink-500 ring-offset-2' : 'hover:opacity-90'
                  }`}
                >
                  <img src={img} alt="archive" className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center">
                      <div className="bg-pink-500 text-white rounded-full p-1 shadow-sm">
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end">
          <button 
            onClick={() => setShowGallery(false)}
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-medium transition-colors"
          >
            선택 완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default GalleryModal;