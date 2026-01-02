import { X, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface GalleryModalProps {
    showGallery: boolean;
    setShowGallery: (show: boolean) => void;
    selectedImages: any[];
    handleSelectFromGallery: (image: { archiveId: number, url: string }) => void;
    archiveImages: { archiveId: number, url: string }[];
}

const GalleryModal = ({ showGallery, setShowGallery, selectedImages, handleSelectFromGallery, archiveImages }: GalleryModalProps) => {
    const [currentPage, setCurrentPage] = useState(0);
    const imagesPerPage = 12; // 3 rows x 4 columns
    const totalPages = Math.ceil(archiveImages.length / imagesPerPage);

    if (!showGallery) return null;

    const startIndex = currentPage * imagesPerPage;
    const currentImages = archiveImages.slice(startIndex, startIndex + imagesPerPage);

    const handlePrevPage = () => {
        if (currentPage > 0) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-4xl flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-pink-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-pink-600">보관함에서 선택 (Source: ARCHIVE)</h3>
                        <p className="text-sm text-gray-500 mt-1">선택된 사진: {selectedImages.filter(img => img.source === 'ARCHIVE').length}/10</p>
                    </div>
                    <button
                        onClick={() => setShowGallery(false)}
                        className="text-gray-500 hover:text-gray-700 transition-colors p-2"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Gallery Grid */}
                <div className="p-6">
                    <div className="grid grid-cols-4 gap-3 min-h-[480px]">
                        {currentImages.map((img: any, idx) => {
                            const isSelected = selectedImages.some((si: any) => si.imageUrl === img.url);
                            return (
                                <div
                                    key={idx}
                                    onClick={() => handleSelectFromGallery(img)}
                                    className={`
                                        aspect-square rounded-xl overflow-hidden cursor-pointer relative 
                                        transform transition-all duration-200 hover:scale-105
                                        ${isSelected
                                            ? 'ring-4 ring-pink-500 shadow-lg'
                                            : 'ring-1 ring-gray-200 hover:ring-pink-300'
                                        }
                                    `}
                                >
                                    <img
                                        src={img.url}
                                        className="w-full h-full object-cover"
                                        alt={`Archive ${startIndex + idx + 1}`}
                                    />
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-pink-500/30 flex items-center justify-center backdrop-blur-[1px]">
                                            <div className="bg-pink-600 rounded-full p-2 shadow-lg">
                                                <Check className="text-white w-6 h-6" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Pagination Controls - Only show if more than 12 images */}
                {totalPages > 1 && (
                    <div className="px-6 pb-4 flex items-center justify-center gap-4">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 0}
                            className={`
                                p-2 rounded-full transition-all
                                ${currentPage === 0
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-pink-600 hover:bg-pink-50 hover:scale-110'
                                }
                            `}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i)}
                                    className={`
                                        w-2 h-2 rounded-full transition-all duration-200
                                        ${currentPage === i
                                            ? 'bg-pink-600 w-6'
                                            : 'bg-gray-300 hover:bg-pink-400'
                                        }
                                    `}
                                />
                            ))}
                        </div>

                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages - 1}
                            className={`
                                p-2 rounded-full transition-all
                                ${currentPage === totalPages - 1
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-pink-600 hover:bg-pink-50 hover:scale-110'
                                }
                            `}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                )}

                {/* Footer */}
                <div className="p-6 border-t border-pink-100 flex justify-end gap-3">
                    <button
                        onClick={() => setShowGallery(false)}
                        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all"
                    >
                        선택 완료
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GalleryModal;