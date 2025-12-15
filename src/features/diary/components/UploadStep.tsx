import React from 'react';
import { Camera, Upload, Trash2, X, Image as ImageIcon, Edit } from 'lucide-react';
import { SelectedImage, ImageType } from '../types/diary';

interface UploadStepProps {
    selectedImages: SelectedImage[];
    isSubmitting: boolean;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleGenerate: () => void;
    setSelectedImages: React.Dispatch<React.SetStateAction<SelectedImage[]>>;
    setShowGallery: (show: boolean) => void;
}

const Icon: React.FC<{ className?: string, children: React.ReactNode }> = ({ children, className }) => (
    <span className={`inline-flex items-center justify-center ${className}`}>{children}</span>
);

const UploadStep: React.FC<UploadStepProps> = ({
    selectedImages, isSubmitting, handleImageUpload, handleGenerate, setSelectedImages, setShowGallery
}) => {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-xl md:h-24 md:w-24">
                    <Icon className="h-10 w-10 text-white md:h-12 md:w-12"><Camera className="w-full h-full" /></Icon>
                </div>
                <h2 className="text-2xl font-bold text-pink-600 md:text-3xl">AI 다이어리 작성하기</h2>
                <p className="mt-2 text-slate-500 md:text-lg">
                    반려동물의 하루를 담은 사진 1-10장을 업로드하면 AI가 아름다운 일기를 작성해드려요
                </p>
            </div>

            <div className="border border-pink-100 shadow-xl rounded-xl bg-white">
                <div className="p-6 md:p-8">
                    {selectedImages.length === 0 ? (
                        <div className="space-y-4">
                            <label className="flex w-full cursor-pointer flex-col items-center gap-6 rounded-3xl border-2 border-dashed border-pink-300 bg-gradient-to-br from-pink-50 to-rose-50 p-16 transition-all hover:border-pink-500 hover:from-white hover:to-pink-50 md:p-24">
                                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isSubmitting} />
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg">
                                    <Icon className="h-10 w-10 text-white"><Upload /></Icon>
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-bold text-pink-600">{isSubmitting ? '업로드 중...' : '로컬 사진 선택 (Source: GALLERY)'}</p>
                                    <p className="mt-2 text-slate-500">최대 10장까지 업로드 가능 • JPG, PNG</p>
                                </div>
                            </label>

                            <button
                                onClick={() => setShowGallery(true)}
                                className="w-full border-2 border-pink-300 text-pink-600 hover:bg-pink-50 bg-transparent py-3 px-4 rounded-full font-bold transition flex items-center justify-center gap-2"
                                disabled={isSubmitting}
                            >
                                <Icon className="w-5 h-5"><ImageIcon /></Icon>
                                보관함에서 선택하기 (Source: ARCHIVE)
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="font-semibold text-pink-600">선택된 사진 {selectedImages.length}/10</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowGallery(true)}
                                            className="border border-pink-200 text-pink-600 hover:bg-pink-50 bg-transparent py-2 px-3 text-sm rounded-lg font-medium flex items-center gap-1"
                                        >
                                            <Icon className="w-4 h-4"><ImageIcon /></Icon>
                                            보관함
                                        </button>
                                        <label className="cursor-pointer">
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                disabled={isSubmitting || selectedImages.length >= 10}
                                            />
                                            <span className="border border-pink-200 text-pink-600 hover:bg-pink-50 bg-transparent py-2 px-3 text-sm rounded-lg font-medium flex items-center cursor-pointer h-full gap-1">
                                                <Icon className="w-4 h-4"><Upload /></Icon>
                                                추가
                                            </span>
                                        </label>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
                                    {selectedImages.map((image, index) => (
                                        <div
                                            key={index}
                                            className="group relative aspect-square overflow-hidden rounded-xl shadow-md transition-transform"
                                        >
                                            <img
                                                src={image.imageUrl}
                                                alt={`Upload ${index + 1}`}
                                                className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                            />
                                            <div className={`absolute bottom-0 left-0 px-2 py-1 text-xs font-bold text-white rounded-tr-lg ${image.source === ImageType.GALLERY ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                                                {image.source}
                                            </div>
                                            <button
                                                onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
                                                className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white opacity-0 transition-opacity hover:bg-black group-hover:opacity-100"
                                            >
                                                <Icon className="h-4 w-4"><X /></Icon>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={isSubmitting || selectedImages.length === 0}
                                className="w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-lg font-bold shadow-xl py-3 transition-all hover:scale-[1.01] hover:from-pink-600 hover:to-rose-600 md:text-xl text-white disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Icon className="h-6 w-6"><Edit /></Icon>
                                AI 다이어리 생성하기
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UploadStep;