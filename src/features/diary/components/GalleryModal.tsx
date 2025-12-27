import React from 'react';
import { X, Check } from 'lucide-react';

interface GalleryModalProps {
    showGallery: boolean;
    setShowGallery: (show: boolean) => void;
    selectedImages: any[];
    handleSelectFromGallery: (imageUrl: string) => void;
    archiveImages: string[];
}

const GalleryModal = ({ showGallery, setShowGallery, selectedImages, handleSelectFromGallery, archiveImages }: GalleryModalProps) => {
    if (!showGallery) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl">
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-xl font-bold">사진 보관함</h3>
                    <button onClick={() => setShowGallery(false)}><X className="text-gray-500" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-3 gap-4">
                    {archiveImages.map((img, idx) => {
                        const isSelected = selectedImages.some((si: any) => si.imageUrl === img);
                        return (
                            <div key={idx} onClick={() => handleSelectFromGallery(img)} className={`aspect-square rounded-xl overflow-hidden cursor-pointer relative ${isSelected ? 'ring-4 ring-pink-500' : ''}`}>
                                <img src={img} className="w-full h-full object-cover" />
                                {isSelected && <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center"><Check className="text-white" /></div>}
                            </div>
                        );
                    })}
                </div>
                <div className="p-6 border-t flex justify-end">
                    <button onClick={() => setShowGallery(false)} className="px-6 py-2 bg-gray-800 text-white rounded-xl">선택 완료</button>
                </div>
            </div>
        </div>
    );
};

export default GalleryModal;