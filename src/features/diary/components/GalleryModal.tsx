import React from 'react';
import { SelectedImage, ImageType, GALLERY_IMAGES } from '../../diary/types/diary.ts';

interface GalleryModalProps {
    showGallery: boolean;
    setShowGallery: React.Dispatch<React.SetStateAction<boolean>>;
    selectedImages: SelectedImage[];
    handleSelectFromGallery: (imageUrl: string) => void;
}

const Icon: React.FC<{ className?: string }> = ({ children, className }) => <span className={`inline-flex items-center justify-center ${className}`}>{children}</span>;

export default function GalleryModal({
    showGallery,
    setShowGallery,
    selectedImages,
    handleSelectFromGallery,
}: GalleryModalProps) {
    if (!showGallery) return null;
    
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setShowGallery(false)}
        >
            <div className="max-h-[80vh] w-full max-w-4xl overflow-y-auto bg-white rounded-xl" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-pink-600">보관함에서 선택 (Source: ARCHIVE)</h3>
                        <button className="p-2 rounded-full hover:bg-slate-100" onClick={() => setShowGallery(false)}>
                            <Icon className="h-5 w-5">{'✕'}</Icon>
                        </button>
                    </div>
                    <p className="mb-4 text-sm text-slate-500">선택된 사진: {selectedImages.length}/10</p>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {GALLERY_IMAGES.map((image, index) => {
                            const isSelected = selectedImages.some(img => img.imageUrl === image);
                            return (
                                <button
                                    key={index}
                                    onClick={() => handleSelectFromGallery(image)}
                                    disabled={selectedImages.length >= 10 && !isSelected}
                                    className={`relative aspect-square overflow-hidden rounded-xl transition-all ${
                                        isSelected
                                            ? "ring-4 ring-pink-500"
                                            : selectedImages.length >= 10
                                                ? "opacity-50 cursor-not-allowed"
                                                : "hover:scale-105 hover:shadow-lg border border-slate-200"
                                        }`}
                                >
                                    <img
                                        src={image || "https://placehold.co/200x200/CCCCCC/000000?text=IMG"}
                                        alt={`Gallery ${index + 1}`}
                                        className="h-full w-full object-cover"
                                    />
                                    {isSelected && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-pink-500/50">
                                            <Icon className="h-10 w-10 text-white">{'✓'}</Icon>
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                    <button
                        onClick={() => setShowGallery(false)}
                        className="mt-6 w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition"
                    >
                        선택 완료
                    </button>
                </div>
            </div>
        </div>
    );
}